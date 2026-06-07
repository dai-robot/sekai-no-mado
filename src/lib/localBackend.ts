import type {
  AppUser,
  BottleMatch,
  BottleReply,
  IncomingBottle,
  NewPostInput,
  Post,
  Report,
  SentReply
} from '../types'
import type { Backend } from './backend'
import { moderate } from './moderation'
import { detectCountry } from './country'
import { currentLocalTime, isToday } from './time'

const K = {
  user: 'mado.user',
  posts: 'mado.posts',
  matches: 'mado.matches',
  reports: 'mado.reports',
  seeded: 'mado.seeded.v1'
}

function uid(): string {
  return crypto.randomUUID()
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/** オフラインでも動く、手描き風グラデーションの景色プレースホルダ画像 */
function sceneDataUrl(top: string, bottom: string, label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='${top}'/><stop offset='1' stop-color='${bottom}'/>
    </linearGradient></defs>
    <rect width='800' height='800' fill='url(#g)'/>
    <circle cx='620' cy='180' r='70' fill='#ffffff' opacity='0.65'/>
    <path d='M0 620 Q200 540 400 600 T800 580 V800 H0 Z' fill='#000000' opacity='0.12'/>
    <path d='M0 700 Q260 640 520 690 T800 670 V800 H0 Z' fill='#000000' opacity='0.16'/>
    <text x='40' y='760' font-family='serif' font-size='34' fill='#ffffff' opacity='0.85'>${label}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

interface SeedSpec {
  country: string
  comment: string
  localTime: string
  colors: [string, string]
  label: string
}

const SEEDS: SeedSpec[] = [
  { country: 'JP', comment: '朝の通勤風景', localTime: '07:15', colors: ['#aac4d8', '#dfe7ec'], label: 'Morning' },
  { country: 'FI', comment: '森の散歩道', localTime: '00:13', colors: ['#9fc1a8', '#d7e4cf'], label: 'Forest' },
  { country: 'IT', comment: '家族の夕食', localTime: '19:13', colors: ['#e6b98f', '#f3dcc0'], label: 'Dinner' },
  { country: 'TH', comment: '屋台のラーメン', localTime: '17:13', colors: ['#e9a17c', '#f6d6b8'], label: 'Street' },
  { country: 'KR', comment: '学校帰りの道', localTime: '14:42', colors: ['#c9b6d6', '#e8dcef'], label: 'On my way' }
]

/** 漂流プールに残す日数（これより古い投稿は配信対象から外す） */
const POOL_DAYS = 14

function withinDays(iso: string, days: number): boolean {
  return Date.now() - new Date(iso).getTime() <= days * 24 * 60 * 60 * 1000
}

/** 漂流瓶への「写真返信」として使われた投稿IDの集合（世界の窓・プールから除外用） */
function replyPostIds(matches: BottleMatch[]): Set<string> {
  return new Set(
    matches.map((m) => m.reply_post_id).filter((id): id is string => !!id)
  )
}

function ensureSeed(meId: string): void {
  if (localStorage.getItem(K.seeded)) return

  const posts = read<Post[]>(K.posts, [])
  const now = Date.now()
  SEEDS.forEach((s, i) => {
    const senderId = `seed-user-${i}`
    posts.push({
      id: `seed-post-${i}`,
      user_id: senderId,
      image_url: sceneDataUrl(s.colors[0], s.colors[1], s.label),
      comment: s.comment,
      country: s.country,
      local_time: s.localTime,
      // 今日扱いになるよう、現在時刻から少しずらした時刻にする
      created_at: new Date(now - (i + 1) * 60_000).toISOString(),
      is_visible: true,
      moderation_status: 'approved'
    })
  })
  write(K.posts, posts)
  localStorage.setItem(K.seeded, '1')
  void meId
}

function getUser(): AppUser {
  let user = read<AppUser | null>(K.user, null)
  if (!user) {
    user = {
      id: uid(),
      anonymous_id: `mado-${Math.random().toString(36).slice(2, 8)}`,
      country: detectCountry(),
      created_at: new Date().toISOString()
    }
    write(K.user, user)
  }
  return user
}

/**
 * 漂流ボトル・プール方式での「1日ひとつ」受信。
 * 今日まだ受け取っていなければ、まだ誰にも届いていない他人の投稿を
 * プールから1枚引き当てて配信する（当日縛りはなく直近 POOL_DAYS 日が対象）。
 */
function pullBottle(meId: string): void {
  const matches = read<BottleMatch[]>(K.matches, [])
  const todayOne = matches.find(
    (m) => m.receiver_user_id === meId && isToday(m.created_at)
  )
  if (todayOne) return

  // すでに誰かに配信済みの投稿、および写真返信は除外（1つの瓶は1人にだけ届く）
  const delivered = new Set(matches.map((m) => m.post_id))
  const replies = replyPostIds(matches)

  const posts = read<Post[]>(K.posts, [])
  const pool = posts.filter(
    (p) =>
      p.user_id !== meId &&
      p.is_visible &&
      !replies.has(p.id) &&
      p.moderation_status === 'approved' &&
      withinDays(p.created_at, POOL_DAYS) &&
      !delivered.has(p.id)
  )
  if (pool.length === 0) return

  const chosen = pool[Math.floor(Math.random() * pool.length)]
  matches.push({
    id: uid(),
    sender_user_id: chosen.user_id,
    receiver_user_id: meId,
    post_id: chosen.id,
    reply_post_id: null,
    reply_reaction: null,
    status: 'delivered',
    created_at: new Date().toISOString()
  })
  write(K.matches, matches)
}

export function createLocalBackend(): Backend {
  const me = getUser()
  ensureSeed(me.id)

  async function savePost(input: NewPostInput): Promise<Post | { error: string }> {
    const mod = await moderate({ imageDataUrl: input.imageDataUrl, comment: input.comment })
    if (mod.status === 'rejected') {
      return { error: mod.reason ?? '投稿できませんでした' }
    }
    const post: Post = {
      id: uid(),
      user_id: me.id,
      image_url: input.imageDataUrl,
      comment: input.comment.slice(0, 50),
      country: me.country,
      local_time: currentLocalTime(),
      created_at: new Date().toISOString(),
      is_visible: true,
      moderation_status: mod.status
    }
    const posts = read<Post[]>(K.posts, [])
    posts.push(post)
    write(K.posts, posts)
    return post
  }

  return {
    mode: 'local',

    async getCurrentUser() {
      return me
    },

    async hasPostedToday() {
      const posts = read<Post[]>(K.posts, [])
      const replies = replyPostIds(read<BottleMatch[]>(K.matches, []))
      return posts.some(
        (p) =>
          p.user_id === me.id && !replies.has(p.id) && isToday(p.created_at)
      )
    },

    async getTodayPosts() {
      const posts = read<Post[]>(K.posts, [])
      const replies = replyPostIds(read<BottleMatch[]>(K.matches, []))
      return posts
        .filter(
          (p) =>
            p.is_visible &&
            !replies.has(p.id) &&
            p.moderation_status === 'approved' &&
            isToday(p.created_at)
        )
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    },

    async createPost(input) {
      // 受信者は決めず、投稿はそのまま「漂流プール」に流す。
      const result = await savePost(input)
      if ('error' in result) return { ok: false, reason: result.error }

      // 自分にも、プールから1枚引き当てて届ける
      pullBottle(me.id)

      return { ok: true, post: result, delivered: true }
    },

    async getIncomingBottle(): Promise<IncomingBottle | null> {
      pullBottle(me.id)
      const matches = read<BottleMatch[]>(K.matches, [])
      const match = matches.find(
        (m) => m.receiver_user_id === me.id && isToday(m.created_at)
      )
      if (!match) return null
      const posts = read<Post[]>(K.posts, [])
      const post = posts.find((p) => p.id === match.post_id)
      if (!post) return null
      const reply = match.reply_post_id
        ? posts.find((p) => p.id === match.reply_post_id) ?? null
        : null
      return { match, post, reply, replyReaction: match.reply_reaction }
    },

    async getSentReplies(): Promise<SentReply[]> {
      const matches = read<BottleMatch[]>(K.matches, [])
      const posts = read<Post[]>(K.posts, [])
      return matches
        .filter(
          (m) =>
            m.sender_user_id === me.id &&
            (m.reply_post_id || m.reply_reaction) &&
            withinDays(m.created_at, POOL_DAYS)
        )
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .map((m) => {
          const post = posts.find((p) => p.id === m.post_id) ?? null
          const reply = m.reply_post_id
            ? posts.find((p) => p.id === m.reply_post_id) ?? null
            : null
          return post
            ? { match: m, post, reply, replyReaction: m.reply_reaction }
            : null
        })
        .filter((x): x is SentReply => x !== null)
    },

    async replyToBottle(matchId, reply: BottleReply) {
      const matches = read<BottleMatch[]>(K.matches, [])
      const match = matches.find((m) => m.id === matchId)
      if (!match) return { ok: false, reason: '漂流瓶が見つかりません' }
      if (match.status !== 'delivered') {
        return { ok: false, reason: 'この漂流瓶にはもう返信できません（1往復のみ）' }
      }

      if (reply.kind === 'reaction') {
        match.reply_reaction = reply.reaction
        match.status = 'replied'
        write(K.matches, matches)
        return { ok: true }
      }

      // 写真で返信（言葉は不可なのでコメントは空。reply_post_id 経由でプール/一覧から除外）
      const result = await savePost({ imageDataUrl: reply.imageDataUrl, comment: '' })
      if ('error' in result) return { ok: false, reason: result.error }
      match.reply_post_id = result.id
      match.status = 'replied'
      write(K.matches, matches)
      return { ok: true, post: result }
    },

    async reportPost(postId, reason) {
      const reports = read<Report[]>(K.reports, [])
      reports.push({
        id: uid(),
        post_id: postId,
        reporter_user_id: me.id,
        reason,
        created_at: new Date().toISOString()
      })
      write(K.reports, reports)

      // 通報された投稿はすぐ非表示にする（MVP）
      const posts = read<Post[]>(K.posts, [])
      const target = posts.find((p) => p.id === postId)
      if (target) {
        target.is_visible = false
        write(K.posts, posts)
      }
    }
  }
}
