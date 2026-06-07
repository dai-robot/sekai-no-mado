import { BottleIcon, WindowIcon } from './icons'

export type TabKey = 'bottle' | 'window'

export function TabBar({
  active,
  onChange
}: {
  active: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <nav className="tabbar">
      <button
        className={active === 'bottle' ? 'active' : ''}
        onClick={() => onChange('bottle')}
        aria-label="漂流瓶"
      >
        <BottleIcon />
        漂流瓶
      </button>
      <button
        className={active === 'window' ? 'active' : ''}
        onClick={() => onChange('window')}
        aria-label="世界の窓"
      >
        <WindowIcon />
        世界の窓
      </button>
    </nav>
  )
}
