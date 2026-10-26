// Supabase Edge Function: Send SMS Hook for Bangladesh SMS Gateways
// Supports: Alpha SMS (api.sms.net.bd), Greenweb BD, BulkSMS BD
// Follows Supabase Auth Send SMS Hook specifications.
// Deploy command: supabase functions deploy send-sms-otp --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

interface SupabaseSmsHookPayload {
  user: {
    id: string
    phone?: string
  }
  sms: {
    otp: string
  }
}

/**
 * Validate Bangladesh mobile format (+8801[3-9]XXXXXXXX)
 */
function isValidBdPhone(phone: string): boolean {
  return /^\+8801[3-9]\d{8}$/.test(phone)
}

/**
 * Formats recipient for local SMS gateways (removes '+' prefix, returns 88017...)
 */
function toLocalBdFormat(phone: string): string {
  return phone.startsWith('+') ? phone.slice(1) : phone
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify Webhook Secret (if configured in Supabase secrets)
    const expectedSecret = Deno.env.get('AUTH_HOOK_SECRET')
    if (expectedSecret) {
      const incomingSecret =
        req.headers.get('x-webhook-secret') ||
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
      if (incomingSecret !== expectedSecret) {
        return new Response(JSON.stringify({ error: 'Unauthorized webhook call' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // 2. Parse and Validate Supabase Hook Payload
    const payload = (await req.json()) as SupabaseSmsHookPayload
    const phone = payload?.user?.phone
    const otp = payload?.sms?.otp

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Missing phone number or OTP in webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!isValidBdPhone(phone)) {
      return new Response(
        JSON.stringify({ error: `Invalid Bangladesh phone number format: ${phone}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const provider = Deno.env.get('SMS_GATEWAY_PROVIDER') || 'alpha_sms'
    const recipient = toLocalBdFormat(phone) // '8801XXXXXXXXX'
    const message = `Your GolpoFrame verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`

    // 3. Dispatch to Configured Bangladesh SMS Gateway
    if (provider === 'alpha_sms') {
      const apiKey = Deno.env.get('ALPHA_SMS_API_KEY')
      if (!apiKey) {
        // Dev fallback if key is not yet set in Supabase Dashboard
        console.warn(`[Alpha SMS DEV MODE] API key not configured. Mocking SMS dispatch to ${phone.slice(0, 7)}****`)
        return new Response(JSON.stringify({ success: true, mode: 'mock' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const params = new URLSearchParams()
      params.append('api_key', apiKey)
      params.append('msg', message)
      params.append('to', recipient)

      const res = await fetch('https://api.sms.net.bd/sendsms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`[Alpha SMS] Gateway responded with HTTP ${res.status}: ${errText}`)
        return new Response(JSON.stringify({ error: 'SMS gateway delivery failure' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else if (provider === 'greenweb') {
      const token = Deno.env.get('GREENWEB_SMS_TOKEN')
      if (!token) {
        console.warn(`[Greenweb DEV MODE] Token not configured. Mocking SMS dispatch to ${phone.slice(0, 7)}****`)
        return new Response(JSON.stringify({ success: true, mode: 'mock' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const params = new URLSearchParams()
      params.append('token', token)
      params.append('to', recipient)
      params.append('message', message)

      const res = await fetch('https://api.greenweb.com.bd/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'Greenweb delivery failure' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else if (provider === 'bulksmsbd') {
      const apiKey = Deno.env.get('BULKSMSBD_API_KEY')
      const senderId = Deno.env.get('BULKSMSBD_SENDER_ID') || '8809612443880'
      if (!apiKey) {
        console.warn(`[BulkSMSBD DEV MODE] Key not configured. Mocking SMS dispatch to ${phone.slice(0, 7)}****`)
        return new Response(JSON.stringify({ success: true, mode: 'mock' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const url = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${encodeURIComponent(recipient)}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(message)}`
      const res = await fetch(url)
      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'BulkSMSBD delivery failure' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else {
      // Mock / Generic custom webhook
      console.log(`[SMS Hook] Simulated dispatch to ${recipient}`)
    }

    // Supabase Auth expects 200 OK
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Send SMS Hook unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal hook error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
