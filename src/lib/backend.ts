import type { AppUser, BottleReply, IncomingBottle, NewPostInput, Post } from '../types'
import { createLocalBackend } from './localBackend'
import { createSupabaseBackend, hasSupabaseConfig } from './supabaseBackend'

export interface PostResult {
  ok: boolean
  post?: Post
  /** 漂流瓶として誰かに届いたか */
  delivered?: boolean
  reason?: string
}

/**
 * フロントエンドが使うバックエンド抽象。
 * Supabase 設定があれば Supabase、なければ localStorage モックを使う。
 */
export interface Backend {
  readonly mode: 'supabase' | 'local'
  getCurrentUser(): Promise<AppUser>
  /** 今日すでに投稿済みか */
  hasPostedToday(): Promise<boolean>
  /** 世界の窓: 今日・表示可能な投稿のみ */
  getTodayPosts(): Promise<Post[]>
  /** 撮影した1枚を投稿（モデレーション通過後に保存し、漂流瓶を1人へ届ける） */
  createPost(input: NewPostInput): Promise<PostResult>
  /** 自分宛に届いた漂流瓶（今日の1枚） */
  getIncomingBottle(): Promise<IncomingBottle | null>
  /** 漂流瓶へ1往復だけ返信（写真 or リアクションのいずれか。言葉は不可） */
  replyToBottle(matchId: string, reply: BottleReply): Promise<PostResult>
  /** 投稿を通報 */
  reportPost(postId: string, reason: string): Promise<void>
}

let instance: Backend | null = null

export function getBackend(): Backend {
  if (instance) return instance
  instance = hasSupabaseConfig() ? createSupabaseBackend() : createLocalBackend()
  return instance
}
