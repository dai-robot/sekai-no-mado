import { BottleIcon, WindowIcon } from './icons'
import { useI18n } from '../i18n'

export type TabKey = 'bottle' | 'window'

export function TabBar({
  active,
  onChange
}: {
  active: TabKey
  onChange: (t: TabKey) => void
}) {
  const { t } = useI18n()
  return (
    <nav className="tabbar">
      <button
        className={active === 'bottle' ? 'active' : ''}
        onClick={() => onChange('bottle')}
        aria-label={t('tab_bottle')}
      >
        <BottleIcon />
        {t('tab_bottle')}
      </button>
      <button
        className={active === 'window' ? 'active' : ''}
        onClick={() => onChange('window')}
        aria-label={t('tab_window')}
      >
        <WindowIcon />
        {t('tab_window')}
      </button>
    </nav>
  )
}
