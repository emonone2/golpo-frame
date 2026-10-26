// Supabase Edge Function: Story Management & Admin API
// Deploy with: supabase functions deploy manage-story
//
// This backend function uses the secret service-role key on the server.
// Never expose the secret key in client-side code!

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Server-side privileged client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { action, storyId } = await req.json()

    if (action === 'feature_story') {
      // Example admin action: Mark story as featured/public
      const { data, error } = await supabaseAdmin
        .from('stories')
        .update({ is_public: true })
        .eq('id', storyId)
        .select()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ message: 'GolpoFrame backend function ready' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
