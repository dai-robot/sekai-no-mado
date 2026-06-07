import type { Post } from '../types'
import { PostCard } from './PostCard'
import { todayHeading } from '../lib/time'

export function WorldWindow({
  posts,
  loading,
  onReport
}: {
  posts: Post[]
  loading: boolean
  onReport: (postId: string, reason: string) => void
}) {
  return (
    <div>
      <div className="section-title">
        <span>今日の世界</span>
        <span className="date">{todayHeading()}</span>
      </div>

      {loading ? (
        <div className="empty">
          <span className="emoji">🪟</span>
          今日の景色を読み込んでいます…
        </div>
      ) : posts.length === 0 ? (
        <div className="empty">
          <span className="emoji">🌫️</span>
          まだ今日の投稿はありません。
          <br />
          世界のどこかで、最初の1枚を待っています。
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} onReport={onReport} />)
      )}
    </div>
  )
}
