import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  AppUser,
  BottleMatch,
  BottleReply,
  IncomingBottle,
  NewPostInput,
  Post,
  SentReply
} from '../types'
import type { Backend, PostResult } from './backend'
import { moderate } from './moderation'
import { detectCountry } from './country'
import { currentLocalTime, localDateKey } from './time'

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) ?? 'photos'
const ANON_KEY_STORAGE = 'mado.anonymous_id'
/** 漂流プールに残す日数（これより古い投稿は配信対象から外す） */
const POOL_DAYS = 14

export function hasSupabaseConfig(): boolean {
  return Boolean(URL && KEY)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',')
  const mime = head.match(/data:(.*?);/)?.[1] ?? 'image/jpeg'
  const bin = atob(body)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export function createSupabaseBackend(): Backend {
  const sb: SupabaseClient = createClient(URL!, KEY!)
  let cachedUser: AppUser | null = null

  function getAnonymousId(): string {
    let id = localStorage.getItem(ANON_KEY_STORAGE)
    if (!id) {
      id = `mado-${crypto.randomUUID()}`
      localStorage.setItem(ANON_KEY_STORAGE, id)
    }
    return id
  }

  async function getCurrentUser(): Promise<AppUser> {
    if (cachedUser) return cachedUser
    const anonId = getAnonymousId()

    const { data: existing } = await sb
      .from('users')
      .select('*')
      .eq('anonymous_id', anonId)
      .maybeSingle()

    if (existing) {
      cachedUser = existing as AppUser
      return cachedUser
    }

    const { data: created, error } = await sb
      .from('users')
      .insert({ anonymous_id: anonId, country: detectCountry() })
      .select('*')
      .single()
    if (error) throw error
    cachedUser = created as AppUser
    return cachedUser
  }

  async function uploadImage(userId: string, dataUrl: string): Promise<string> {
    const blob = dataUrlToBlob(dataUrl)
    const path = `${userId}/${crypto.randomUUID()}.jpg`
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false
    })
    if (error) throw error
    const { data } = sb.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async function savePost(input: NewPostInput): Promise<Post | { error: string }> {
    const mod = await moderate({ imageDataUrl: input.imageDataUrl, comment: input.comment })
    if (mod.status === 'rejected') return { error: mod.reason ?? '投稿できませんでした' }

    const user = await getCurrentUser()
    const imageUrl = await uploadImage(user.id, input.imageDataUrl)

    const { data, error } = await sb
      .from('posts')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        comment: input.comment.slice(0, 50),
        country: user.country,
        local_time: currentLocalTime(),
        is_visible: true,
        moderation_status: mod.status
      })
      .select('*')
      .single()
    if (error) return { error: error.message }
    return data as Post
  }

  /** 写真返信として使われた投稿IDの集合（世界の窓・漂流プールから除外用） */
  async function fetchReplyPostIds(): Promise<Set<string>> {
    const { data } = await sb
      .from('bottle_matches')
      .select('reply_post_id')
      .not('reply_post_id', 'is', null)
    return new Set((data ?? []).map((d) => d.reply_post_id as string))
  }

  /**
   * 漂流ボトル・プール方式での受信。今日まだ受け取っていなければ、
   * まだ誰にも届いていない他人の投稿（直近 POOL_DAYS 日・返信でない）を
   * 1枚引き当てて配信する。
   */
  async function pullBottleIfNeeded(userId: string): Promise<void> {
    const todayStart = `${localDateKey()}T00:00:00.000Z`
    const { data: existing } = await sb
      .from('bottle_matches')
      .select('id')
      .eq('receiver_user_id', userId)
      .gte('created_at', todayStart)
      .limit(1)
    if (existing && existing.length > 0) return

    const since = new Date(Date.now() - POOL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data: candidates } = await sb
      .from('posts')
      .select('id, user_id')
      .neq('user_id', userId)
      .eq('is_visible', true)
      .eq('moderation_status', 'approved')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200)
    if (!candidates || candidates.length === 0) return

    // すでに配信済みの投稿・写真返信を除外（1つの瓶は1人にだけ届く）
    const { data: matches } = await sb
      .from('bottle_matches')
      .select('post_id, reply_post_id')
    const taken = new Set<string>()
    for (const m of matches ?? []) {
      if (m.post_id) taken.add(m.post_id as string)
      if (m.reply_post_id) taken.add(m.reply_post_id as string)
    }
    const pool = candidates.filter((c) => !taken.has(c.id))
    if (pool.length === 0) return

    const chosen = pool[Math.floor(Math.random() * pool.length)]
    await sb.from('bottle_matches').insert({
      sender_user_id: chosen.user_id,
      receiver_user_id: userId,
      post_id: chosen.id,
      status: 'delivered'
    })
  }

  return {
    mode: 'supabase',

    getCurrentUser,

    async hasPostedToday() {
      const user = await getCurrentUser()
      const start = `${localDateKey()}T00:00:00.000Z`
      const { data } = await sb
        .from('posts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', start)
      if (!data || data.length === 0) return false
      // 写真返信は「今日の投稿」に数えない
      const replies = await fetchReplyPostIds()
      return data.some((p) => !replies.has(p.id as string))
    },

    async getTodayPosts() {
      const start = `${localDateKey()}T00:00:00.000Z`
      const { data, error } = await sb
        .from('posts')
        .select('*')
        .eq('is_visible', true)
        .eq('moderation_status', 'approved')
        .gte('created_at', start)
        .order('created_at', { ascending: false })
      if (error) throw error
      const replies = await fetchReplyPostIds()
      return ((data ?? []) as Post[]).filter((p) => !replies.has(p.id))
    },

    async createPost(input): Promise<PostResult> {
      // 受信者は決めず、投稿はそのまま「漂流プール」に流す。
      const saved = await savePost(input)
      if ('error' in saved) return { ok: false, reason: saved.error }
      const user = await getCurrentUser()

      // 自分にも、プールから1枚引き当てて届ける
      await pullBottleIfNeeded(user.id)

      return { ok: true, post: saved, delivered: true }
    },

    async getIncomingBottle(): Promise<IncomingBottle | null> {
      const user = await getCurrentUser()
      await pullBottleIfNeeded(user.id)

      const start = `${localDateKey()}T00:00:00.000Z`
      // 1日ひとつ: 今日届いた最新の漂流瓶のみ
      const { data: match } = await sb
        .from('bottle_matches')
        .select('*')
        .eq('receiver_user_id', user.id)
        .gte('created_at', start)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!match) return null
      const m = match as BottleMatch

      const { data: post } = await sb
        .from('posts')
        .select('*')
        .eq('id', m.post_id)
        .maybeSingle()
      if (!post) return null

      let reply: Post | null = null
      if (m.reply_post_id) {
        const { data: r } = await sb
          .from('posts')
          .select('*')
          .eq('id', m.reply_post_id)
          .maybeSingle()
        reply = (r as Post) ?? null
      }
      return { match: m, post: post as Post, reply, replyReaction: m.reply_reaction }
    },

    async getSentReplies(): Promise<SentReply[]> {
      const user = await getCurrentUser()
      const since = new Date(Date.now() - POOL_DAYS * 24 * 60 * 60 * 1000).toISOString()
      const { data: matches } = await sb
        .from('bottle_matches')
        .select('*')
        .eq('sender_user_id', user.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false })

      const replied = ((matches ?? []) as BottleMatch[]).filter(
        (m) => m.reply_post_id || m.reply_reaction
      )
      if (replied.length === 0) return []

      // 関係する投稿（自分の元投稿 + 相手の写真返信）をまとめて取得
      const ids = new Set<string>()
      for (const m of replied) {
        ids.add(m.post_id)
        if (m.reply_post_id) ids.add(m.reply_post_id)
      }
      const { data: posts } = await sb
        .from('posts')
        .select('*')
        .in('id', Array.from(ids))
      const byId = new Map<string, Post>()
      for (const p of (posts ?? []) as Post[]) byId.set(p.id, p)

      const out: SentReply[] = []
      for (const m of replied) {
        const post = byId.get(m.post_id)
        if (!post) continue
        const reply = m.reply_post_id ? byId.get(m.reply_post_id) ?? null : null
        out.push({ match: m, post, reply, replyReaction: m.reply_reaction })
      }
      return out
    },

    async replyToBottle(matchId, reply: BottleReply): Promise<PostResult> {
      const { data: match } = await sb
        .from('bottle_matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle()
      if (!match) return { ok: false, reason: '漂流瓶が見つかりません' }
      if ((match as BottleMatch).status !== 'delivered') {
        return { ok: false, reason: 'この漂流瓶にはもう返信できません（1往復のみ）' }
      }

      if (reply.kind === 'reaction') {
        await sb
          .from('bottle_matches')
          .update({ reply_reaction: reply.reaction, status: 'replied' })
          .eq('id', matchId)
        return { ok: true }
      }

      // 写真で返信（言葉は不可なのでコメントは空。reply_post_id 経由でプール/一覧から除外）
      const saved = await savePost({ imageDataUrl: reply.imageDataUrl, comment: '' })
      if ('error' in saved) return { ok: false, reason: saved.error }
      await sb
        .from('bottle_matches')
        .update({ reply_post_id: saved.id, status: 'replied' })
        .eq('id', matchId)
      return { ok: true, post: saved }
    },

    async reportPost(postId, reason) {
      const user = await getCurrentUser()
      await sb.from('reports').insert({
        post_id: postId,
        reporter_user_id: user.id,
        reason
      })
      // MVP: 通報された投稿をすぐ非表示に（本番はサーバ側で判定するのが望ましい）
      await sb.from('posts').update({ is_visible: false }).eq('id', postId)
    }
  }
}
