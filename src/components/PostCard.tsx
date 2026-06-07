import { useState } from 'react'
import type { Post } from '../types'
import { countryToFlag } from '../lib/country'
import { useI18n } from '../i18n'

export function PostCard({
  post,
  onReport
}: {
  post: Post
  onReport?: (postId: string, reason: string) => void
}) {
  const { t } = useI18n()
  const [reporting, setReporting] = useState(false)

  function handleReport() {
    const reason = window.prompt(t('post_reportPrompt'), t('post_reportDefault'))
    if (reason && onReport) {
      onReport(post.id, reason)
      setReporting(true)
    }
  }

  return (
    <article className="post-card">
      <img className="post-photo" src={post.image_url} alt={post.comment} loading="lazy" />
      <div className="post-meta">
        <div className="post-line">
          <span className="post-flag">{countryToFlag(post.country)}</span>
          <span className="post-dot" />
          <span>{post.local_time}</span>
        </div>
        {post.comment && <p className="post-comment">{post.comment}</p>}
        {onReport && (
          <div className="post-actions">
            <button className="report-btn" onClick={handleReport} disabled={reporting}>
              {reporting ? t('post_reported') : t('post_report')}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
