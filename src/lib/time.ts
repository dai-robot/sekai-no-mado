/** 端末の現地時刻を "HH:mm" で返す */
export function currentLocalTime(): string {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/** ローカル基準の YYYY-MM-DD（「今日」の判定に使用） */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** ISO日時文字列が「今日（ローカル基準）」かどうか */
export function isToday(iso: string): boolean {
  return localDateKey(new Date(iso)) === localDateKey()
}

/** 「6月7日(土)」のような見出し用文字列（ロケール対応） */
export function todayHeading(locale = 'ja-JP'): string {
  return new Date().toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}
