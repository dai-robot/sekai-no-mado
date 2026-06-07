/**
 * 軽量なクライアント翻訳ヘルパー。
 * 投稿コメントを、表示中の言語へ翻訳して「原文＋訳文」を併記するために使う。
 * サーバを持たない MVP 向けに、公開エンドポイントで翻訳＋言語自動判定を行い、
 * 同じ問い合わせは localStorage / メモリにキャッシュして無駄な通信を避ける。
 */

export interface TranslationResult {
  /** 訳文（表示言語へ翻訳したもの） */
  text: string
  /** 自動判定された原文の言語コード（例: 'ja', 'en', 'zh'） */
  detected: string
}

const CACHE_KEY = 'mado.translations'
const MAX_CACHE = 300

/** アプリ言語コード → 翻訳APIの言語コード */
function toApiLang(lang: string): string {
  if (lang === 'zh') return 'zh-CN'
  return lang
}

/** 'zh-CN' のような地域付きコードを 'zh' のような基底コードへ */
export function baseLang(code: string): string {
  return code.toLowerCase().split('-')[0]
}

type CacheMap = Record<string, TranslationResult>

function loadCache(): CacheMap {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as CacheMap
  } catch {
    return {}
  }
}

function saveCache(cache: CacheMap): void {
  const keys = Object.keys(cache)
  if (keys.length > MAX_CACHE) {
    // 古いものから間引く（順序は概ね挿入順）
    for (const k of keys.slice(0, keys.length - MAX_CACHE)) delete cache[k]
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    /* 容量超過などは無視 */
  }
}

const memory = new Map<string, TranslationResult>()

/**
 * text を targetLang へ翻訳する。失敗時は null。
 * 原文の言語が targetLang と同じだった場合も結果は返す（detected で判定可能）。
 */
export async function translateText(
  text: string,
  targetLang: string
): Promise<TranslationResult | null> {
  const trimmed = text.trim()
  if (!trimmed) return null

  const key = `${targetLang}::${trimmed}`
  if (memory.has(key)) return memory.get(key)!
  const cache = loadCache()
  if (cache[key]) {
    memory.set(key, cache[key])
    return cache[key]
  }

  try {
    const tl = toApiLang(targetLang)
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto' +
      `&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as [Array<[string]>, unknown, string]
    const segments = data[0]
    if (!Array.isArray(segments)) return null
    const translated = segments.map((s) => s[0]).join('')
    const detected = baseLang(typeof data[2] === 'string' ? data[2] : targetLang)
    const result: TranslationResult = { text: translated, detected }

    memory.set(key, result)
    cache[key] = result
    saveCache(cache)
    return result
  } catch {
    return null
  }
}

/** 言語コードを、表示中ロケールでの言語名にする（例: en ロケールで 'ja' → 'Japanese'） */
export function languageName(code: string, displayLocale: string): string {
  try {
    const dn = new Intl.DisplayNames([displayLocale], { type: 'language' })
    return dn.of(baseLang(code)) ?? code
  } catch {
    return code
  }
}
