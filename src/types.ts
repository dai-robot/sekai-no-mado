export type ModerationStatus = 'approved' | 'pending' | 'rejected'

export interface AppUser {
  id: string
  anonymous_id: string
  country: string // ISO 3166-1 alpha-2 (例: "JP")
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  image_url: string // ローカルモックでは data URL
  comment: string
  country: string // ISO alpha-2
  local_time: string // 投稿者の現地時刻 "HH:mm"
  created_at: string // ISO datetime (UTC)
  is_visible: boolean
  moderation_status: ModerationStatus
}

export type BottleStatus = 'delivered' | 'replied' | 'closed'

export interface BottleMatch {
  id: string
  sender_user_id: string
  receiver_user_id: string
  post_id: string
  reply_post_id: string | null
  /** リアクションで返した場合の絵文字キー（写真返信の場合は null） */
  reply_reaction: string | null
  status: BottleStatus
  created_at: string
}

export interface Report {
  id: string
  post_id: string
  reporter_user_id: string
  reason: string
  created_at: string
}

/** 漂流瓶タブに表示する、自分宛に届いた1枚 */
export interface IncomingBottle {
  match: BottleMatch
  post: Post
  /** 自分が写真で返した場合の返信投稿 */
  reply: Post | null
  /** 自分がリアクションで返した場合の絵文字キー */
  replyReaction: string | null
}

/** 投稿に必要な入力（世界の窓への通常投稿。ひとことコメントあり） */
export interface NewPostInput {
  imageDataUrl: string
  comment: string
}

/**
 * 漂流瓶への返信。写真かリアクションの「どちらか一方」のみ。
 * 言葉（テキスト）は使えない。
 */
export type BottleReply =
  | { kind: 'photo'; imageDataUrl: string }
  | { kind: 'reaction'; reaction: string }

/** リアクションの選択肢（言葉ではなく気持ちだけを返す）。表示ラベルはi18nで解決する。 */
export const REACTIONS: { key: string; emoji: string }[] = [
  { key: 'thanks', emoji: '🙏' },
  { key: 'lovely', emoji: '✨' },
  { key: 'smile', emoji: '🙂' },
  { key: 'genki', emoji: '🌱' }
]

export function findReaction(key: string | null | undefined) {
  return REACTIONS.find((r) => r.key === key)
}
