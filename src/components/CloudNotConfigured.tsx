import { useCT } from '../lib/communityI18n'
import { EmptyState } from './States'

export default function CloudNotConfigured() {
  const tc = useCT()
  return <EmptyState emoji="🔌" title={tc('not_configured_title')} message={tc('not_configured_msg')} />
}
