import { useState } from 'react'
import type { IncomingBottle, SentReply } from '../types'
import { REACTIONS, findReaction } from '../types'
import { PostCard } from './PostCard'
import { useI18n } from '../i18n'
import type { TKey } from '../i18n/translations'

function BottleIllust() {
  return (
    <svg className="bottle-illust" viewBox="0 0 200 200" fill="none">
      <ellipse cx="100" cy="150" rx="78" ry="20" fill="#cfe4e0" />
      <path d="M40 150 q15 -10 30 0 t30 0 t30 0 t30 0" stroke="#9fc7c0" strokeWidth="2" fill="none" />
      <g transform="rotate(18 100 100)">
        <rect x="84" y="58" width="32" height="78" rx="14" fill="#dff0ec" stroke="#7fa8a0" strokeWidth="2.5" />
        <rect x="92" y="44" width="16" height="18" rx="3" fill="#e7c9a9" stroke="#b9966e" strokeWidth="2" />
        <rect x="90" y="86" width="20" height="26" rx="3" fill="#fff" stroke="#cdbfa6" strokeWidth="1.5" />
        <path d="M93 94h14M93 100h14M93 106h9" stroke="#cdbfa6" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g stroke="#e7c9a9" strokeWidth="2" strokeLinecap="round">
        <path d="M132 60l3 3M138 56l1 4M128 52l2 3" />
      </g>
    </svg>
  )
}

export function BottleTab({
  incoming,
  sentReplies,
  loading,
  hasPosted,
  onShoot,
  onReplyPhoto,
  onReact,
  onReport
}: {
  incoming: IncomingBottle | null
  sentReplies: SentReply[]
  loading: boolean
  hasPosted: boolean
  onShoot: () => void
  onReplyPhoto: (matchId: string) => void
  onReact: (matchId: string, reactionKey: string) => void
  onReport: (postId: string, reason: string) => void
}) {
  const { t } = useI18n()
  const [picking, setPicking] = useState(false)
  const reactionLabel = (key: string | null | undefined) =>
    key ? t(`reaction_${key}` as TKey) : ''

  if (loading) {
    return (
      <div className="empty">
        <span className="emoji">🌊</span>
        {t('bottle_loading')}
      </div>
    )
  }

  const sentRepliesBlock = sentReplies.length > 0 && (
    <div className="sent-replies">
      <div className="section-title">
        <span>{t('bottle_sentTitle')}</span>
      </div>
      {sentReplies.map((sr) => (
        <div className="sent-reply" key={sr.match.id}>
          <div className="bottle-section-label">{t('bottle_sentTheirReply')}</div>
          {sr.reply ? (
            <PostCard post={sr.reply} />
          ) : (
            <div className="reaction-sent">
              <span className="reaction-emoji">
                {findReaction(sr.replyReaction)?.emoji ?? '✨'}
              </span>
              <span>{reactionLabel(sr.replyReaction)}</span>
            </div>
          )}
          <div className="bottle-section-label">{t('bottle_sentYourPost')}</div>
          <PostCard post={sr.post} />
        </div>
      ))}
    </div>
  )

  /** 今日の瓶を流す — 未投稿なら瓶が届いていても常に表示 */
  const shootSection = !hasPosted && (
    incoming ? (
      <div className="shoot-banner">
        <p className="shoot-banner-lead">{t('bottle_shootPrompt')}</p>
        <button className="primary-btn" onClick={onShoot}>
          {t('bottle_shoot')}
        </button>
      </div>
    ) : (
      <div className="bottle-hero">
        <BottleIllust />
        <p className="bottle-lead">{t('bottle_lead')}</p>
        <div className="center-block">
          <button className="primary-btn" onClick={onShoot}>
            {t('bottle_shoot')}
          </button>
        </div>
        <p className="bottle-note">{t('bottle_note')}</p>
      </div>
    )
  )

  /** 投稿済みで瓶が届いていない */
  const waitingSection = hasPosted && !incoming && (
    <div className="bottle-hero">
      <BottleIllust />
      <p className="bottle-lead">{t('bottle_lead')}</p>
      <p className="bottle-note" style={{ marginTop: 4 }}>
        {t('bottle_waiting')}
      </p>
    </div>
  )

  const incomingSection = incoming && (
    <div className={!hasPosted ? 'incoming-block' : undefined}>
      <div className="section-title">
        <span>{t('bottle_arrived')}</span>
      </div>
      <PostCard post={incoming.post} onReport={onReport} />

      {incoming.reply || incoming.replyReaction ? (
        <>
          <div className="bottle-section-label">{t('bottle_yourReply')}</div>
          {incoming.reply ? (
            <PostCard post={incoming.reply} />
          ) : (
            <div className="reaction-sent">
              <span className="reaction-emoji">
                {findReaction(incoming.replyReaction)?.emoji ?? '✨'}
              </span>
              <span>{reactionLabel(incoming.replyReaction)}</span>
            </div>
          )}
          <p className="bottle-note">{t('bottle_closed')}</p>
        </>
      ) : (
        <div className="reply-area">
          <p className="bottle-note" style={{ marginBottom: 10 }}>
            {t('bottle_replyIntro')}
          </p>

          {!picking ? (
            <div className="reply-choice">
              <button className="primary-btn" onClick={() => onReplyPhoto(incoming.match.id)}>
                {t('bottle_replyPhoto')}
              </button>
              <button className="ghost-btn" onClick={() => setPicking(true)}>
                {t('bottle_replyReaction')}
              </button>
            </div>
          ) : (
            <div className="reaction-grid">
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  className="reaction-btn"
                  onClick={() => onReact(incoming.match.id, r.key)}
                >
                  <span className="reaction-emoji">{r.emoji}</span>
                  <span>{reactionLabel(r.key)}</span>
                </button>
              ))}
              <button className="ghost-btn reaction-cancel" onClick={() => setPicking(false)}>
                {t('bottle_back')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div>
      {shootSection}
      {waitingSection}
      {incomingSection}
      {sentRepliesBlock}
    </div>
  )
}
