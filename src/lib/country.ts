/**
 * 端末のロケール／タイムゾーンから、おおまかな国コード(ISO alpha-2)を推定する。
 * MVPでは外部APIを使わず、navigator.language / Intl のみで判定する。
 */

const TZ_TO_COUNTRY: Record<string, string> = {
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN',
  'Asia/Taipei': 'TW',
  'Asia/Bangkok': 'TH',
  'Asia/Singapore': 'SG',
  'Asia/Kolkata': 'IN',
  'Asia/Jakarta': 'ID',
  'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Dubai': 'AE',
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Europe/Stockholm': 'SE',
  'Europe/Moscow': 'RU',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Mexico_City': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Argentina/Buenos_Aires': 'AR',
  'Australia/Sydney': 'AU',
  'Pacific/Auckland': 'NZ',
  'Africa/Cairo': 'EG',
  'Africa/Johannesburg': 'ZA'
}

export function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz]
  } catch {
    /* ignore */
  }

  // navigator.language の地域サブタグ ("ja-JP" -> "JP")
  const lang = (navigator.languages && navigator.languages[0]) || navigator.language || ''
  const region = lang.split('-')[1]
  if (region && region.length === 2) return region.toUpperCase()

  return 'UN' // 不明
}

/** ISO alpha-2 国コードを絵文字の国旗に変換する */
export function countryToFlag(code: string): string {
  if (!code || code.length !== 2 || code === 'UN') return '🏳️'
  const base = 0x1f1e6
  const A = 'A'.charCodeAt(0)
  const chars = code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(base + (c.charCodeAt(0) - A)))
  return chars.join('')
}
