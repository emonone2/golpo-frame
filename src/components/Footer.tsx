import { useLang } from '../context/LangContext'
import { useCT } from '../lib/communityI18n'
import { cloudConfigured } from '../lib/supabase'

export default function Footer() {
  const { t } = useLang()
  const tc = useCT()
  return (
    <footer className="mt-16 border-t border-white/10 px-4 py-8 text-center text-xs text-slate-500">
      <p>{cloudConfigured ? tc('footer_cloud') : t('footer')}</p>
      <p className="mt-2 text-xs font-medium tracking-wide text-slate-400">
        made by{' '}
        <a
          href="https://www.facebook.com/share/1PDzrKMTko/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-amber-400 transition-colors hover:text-amber-300 hover:underline"
        >
          AR EMON
        </a>
      </p>
    </footer>
  )
}
