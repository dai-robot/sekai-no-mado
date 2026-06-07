import type { Post } from '../types'
import { PostCard } from './PostCard'
import { todayHeading } from '../lib/time'
import { useI18n } from '../i18n'

export function WorldWindow({
  posts,
  loading,
  onReport
}: {
  posts: Post[]
  loading: boolean
  onReport: (postId: string, reason: string) => void
}) {
  const { t, locale } = useI18n()
  return (
    <div>
      <div className="section-title">
        <span>{t('window_today')}</span>
        <span className="date">{todayHeading(locale)}</span>
      </div>

      {loading ? (
        <div className="empty">
          <span className="emoji">🪟</span>
          {t('window_loading')}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty">
          <span className="emoji">🌫️</span>
          {t('window_empty1')}
          <br />
          {t('window_empty2')}
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} onReport={onReport} />)
      )}
    </div>
  )
}
