import type { ModerationStatus } from '../types'

export interface ModerationResult {
  status: ModerationStatus
  reason?: string
}

/**
 * 仮の画像／テキストモデレーション（MVP用ダミー）。
 *
 * 本番では、ここで Supabase Edge Function 等を経由して
 * 画像をビジョンAI（不適切コンテンツ検出）に渡す想定。
 * 現在は常に approved を返すが、テスト用に NG ワードだけ弾く。
 */
const BANNED_WORDS = ['__test_block__', 'violence', '暴力']

export async function moderate(input: {
  imageDataUrl: string
  comment: string
}): Promise<ModerationResult> {
  // 将来的な非同期API呼び出しを模した待機
  await new Promise((r) => setTimeout(r, 350))

  const lowered = input.comment.toLowerCase()
  const hit = BANNED_WORDS.find((w) => lowered.includes(w))
  if (hit) {
    return { status: 'rejected', reason: `不適切な表現が含まれています（${hit}）` }
  }

  // 画像チェックのプレースホルダ。data URL の最低限の妥当性のみ確認。
  if (!input.imageDataUrl.startsWith('data:image/')) {
    return { status: 'rejected', reason: '画像の形式が不正です' }
  }

  return { status: 'approved' }
}
