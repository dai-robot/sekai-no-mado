import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  AppUser,
  BottleMatch,
  BottleReply,
  IncomingBottle,
  NewPostInput,
  Post
} from '../types'
import type { Backend, PostResult } from './backend'
import { moderate } from './moderation'
import { detectCountry } from './country'
import { currentLocalTime, localDateKey } from './time'

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) ?? 'photos'
const ANON_KEY_STORAGE = 'mado.anonymous_id'

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
        .limit(1)
      return Boolean(data && data.length > 0)
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
      return (data ?? []) as Post[]
    },

    async createPost(input): Promise<PostResult> {
      const saved = await savePost(input)
      if ('error' in saved) return { ok: false, reason: saved.error }
      const user = await getCurrentUser()

      // ランダムな受信者を選ぶ
      const { data: others } = await sb
        .from('users')
        .select('id')
        .neq('id', user.id)
        .limit(200)
      let delivered = false
      if (others && others.length > 0) {
        const receiver = others[Math.floor(Math.random() * others.length)]
        await sb.from('bottle_matches').insert({
          sender_user_id: user.id,
          receiver_user_id: receiver.id,
          post_id: saved.id,
          status: 'delivered'
        })
        delivered = true
      }
      return { ok: true, post: saved, delivered }
    },

    async getIncomingBottle(): Promise<IncomingBottle | null> {
      const user = await getCurrentUser()
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

      // 写真で返信（言葉は不可なのでコメントは空）
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
