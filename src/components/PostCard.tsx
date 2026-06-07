import { useState } from 'react'
import type { Post } from '../types'
import { countryToFlag } from '../lib/country'

export function PostCard({
  post,
  onReport
}: {
  post: Post
  onReport?: (postId: string, reason: string) => void
}) {
  const [reporting, setReporting] = useState(false)

  function handleReport() {
    const reason = window.prompt(
      'この投稿を通報します。理由を選んでください。\n（例: 不適切な画像 / 嫌がらせ / その他）',
      '不適切な画像'
    )
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
              {reporting ? '通報しました' : '通報する'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
