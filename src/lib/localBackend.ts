import type {
  AppUser,
  BottleMatch,
  BottleReply,
  IncomingBottle,
  NewPostInput,
  Post,
  Report
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
  // meId は将来の拡張用（受信瓶の初期化などに使える）
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

/** 受信用の漂流瓶を「1日ひとつ」用意する（今日まだ届いていなければ1枚届ける） */
function ensureIncoming(meId: string): void {
  const matches = read<BottleMatch[]>(K.matches, [])
  const todayOne = matches.find(
    (m) => m.receiver_user_id === meId && isToday(m.created_at)
  )
  if (todayOne) return

  const posts = read<Post[]>(K.posts, [])
  const candidates = posts.filter(
    (p) => p.user_id !== meId && p.is_visible && isToday(p.created_at)
  )
  if (candidates.length === 0) return

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]
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

function replyPostIds(): Set<string> {
  const matches = read<BottleMatch[]>(K.matches, [])
  return new Set(
    matches.map((m) => m.reply_post_id).filter((x): x is string => Boolean(x))
  )
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
      const replies = replyPostIds()
      const posts = read<Post[]>(K.posts, [])
      return posts.some(
        (p) => p.user_id === me.id && isToday(p.created_at) && !replies.has(p.id)
      )
    },

    async getTodayPosts() {
      const replies = replyPostIds()
      const posts = read<Post[]>(K.posts, [])
      return posts
        .filter(
          (p) =>
            p.is_visible &&
            p.moderation_status === 'approved' &&
            isToday(p.created_at) &&
            !replies.has(p.id)
        )
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    },

    async createPost(input) {
      const result = await savePost(input)
      if ('error' in result) return { ok: false, reason: result.error }

      // 自分の投稿を、世界の誰か1人(ランダム)へ届ける
      const posts = read<Post[]>(K.posts, [])
      const others = Array.from(
        new Set(posts.filter((p) => p.user_id !== me.id).map((p) => p.user_id))
      )
      const matches = read<BottleMatch[]>(K.matches, [])
      let delivered = false
      if (others.length > 0) {
        const receiver = others[Math.floor(Math.random() * others.length)]
        matches.push({
          id: uid(),
          sender_user_id: me.id,
          receiver_user_id: receiver,
          post_id: result.id,
          reply_post_id: null,
          reply_reaction: null,
          status: 'delivered',
          created_at: new Date().toISOString()
        })
        write(K.matches, matches)
        delivered = true
      }

      // 自分にも1枚届ける
      ensureIncoming(me.id)

      return { ok: true, post: result, delivered }
    },

    async getIncomingBottle(): Promise<IncomingBottle | null> {
      ensureIncoming(me.id)
      const matches = read<BottleMatch[]>(K.matches, [])
      const match = matches.find((m) => m.receiver_user_id === me.id)
      if (!match) return null
      const posts = read<Post[]>(K.posts, [])
      const post = posts.find((p) => p.id === match.post_id)
      if (!post) return null
      const reply = match.reply_post_id
        ? posts.find((p) => p.id === match.reply_post_id) ?? null
        : null
      return { match, post, reply, replyReaction: match.reply_reaction }
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

      // 写真で返信（言葉は不可なのでコメントは空）
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
