import { useEffect, useState } from 'react'
import type { Post } from '../types'
import { countryToFlag } from '../lib/country'
import { useI18n } from '../i18n'
import { baseLang, languageName, translateText } from '../lib/translate'

export function PostCard({
  post,
  onReport
}: {
  post: Post
  onReport?: (postId: string, reason: string) => void
}) {
  const { t, lang, locale } = useI18n()
  const [reporting, setReporting] = useState(false)
  const [translation, setTranslation] = useState<{ text: string; detected: string } | null>(null)

  useEffect(() => {
    let alive = true
    setTranslation(null)
    const comment = post.comment?.trim()
    if (!comment) return
    translateText(comment, lang).then((res) => {
      // 原文の言語が表示言語と同じなら併記不要
      if (alive && res && baseLang(res.detected) !== baseLang(lang)) {
        setTranslation(res)
      }
    })
    return () => {
      alive = false
    }
  }, [post.comment, lang])

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
        {post.comment && (
          <div className="post-comment-block">
            <p className="post-comment">
              {translation && (
                <span className="lang-tag">{languageName(translation.detected, locale)}</span>
              )}
              {post.comment}
            </p>
            {translation && (
              <p className="post-comment post-comment-translated">
                <span className="lang-tag">{languageName(lang, locale)}</span>
                {translation.text}
              </p>
            )}
          </div>
        )}
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
