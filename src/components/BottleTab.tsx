import { useEffect, useRef, useState } from 'react'
import type { IncomingBottle, SentReply } from '../types'
import { REACTIONS, findReaction } from '../types'
import { PostCard } from './PostCard'
import { BottleIcon } from './icons'
import { BottleScene, type BottleSceneMode } from './BottleScene'
import { useI18n } from '../i18n'
import type { TKey } from '../i18n/translations'

function BottleShootButton({
  label,
  onClick,
  onWobble
}: {
  label: string
  onClick: () => void
  onWobble?: () => void
}) {
  return (
    <button
      className="bottle-shoot-btn"
      onClick={() => {
        onWobble?.()
        onClick()
      }}
    >
      <BottleIcon className="bottle-shoot-icon" />
      <span>{label}</span>
    </button>
  )
}

export function BottleTab({
  incoming,
  sentReplies,
  loading,
  hasPosted,
  driftTick = 0,
  onShoot,
  onReplyPhoto,
  onReact,
  onReport
}: {
  incoming: IncomingBottle | null
  sentReplies: SentReply[]
  loading: boolean
  hasPosted: boolean
  /** 投稿成功のたびに増える — 漂流アニメーション用 */
  driftTick?: number
  onShoot: () => void
  onReplyPhoto: (matchId: string) => void
  onReact: (matchId: string, reactionKey: string) => void
  onReport: (postId: string, reason: string) => void
}) {
  const { t } = useI18n()
  const [picking, setPicking] = useState(false)
  const [sceneMode, setSceneMode] = useState<BottleSceneMode>('idle')
  const [showDriftFx, setShowDriftFx] = useState(false)
  const [showArriveFx, setShowArriveFx] = useState(false)
  const hadIncoming = useRef(false)
  const reactionLabel = (key: string | null | undefined) =>
    key ? t(`reaction_${key}` as TKey) : ''

  function triggerWobble() {
    setSceneMode('wobble')
    window.setTimeout(() => setSceneMode(hasPosted ? 'waiting' : 'idle'), 650)
  }

  // 初回ロード後に瓶が届いたとき — 岸に打ち上げる
  useEffect(() => {
    if (loading) return
    if (incoming && !hadIncoming.current) {
      setShowArriveFx(true)
      setSceneMode('arrive')
      const t1 = window.setTimeout(() => setShowArriveFx(false), 2400)
      const t2 = window.setTimeout(() => setSceneMode(hasPosted ? 'waiting' : 'idle'), 2600)
      hadIncoming.current = true
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
      }
    }
    if (!incoming) hadIncoming.current = false
  }, [incoming, loading, hasPosted])

  // 流した直後 — 海へ消えていく
  useEffect(() => {
    if (driftTick <= 0) return
    setShowDriftFx(true)
    setSceneMode('drift')
    const t1 = window.setTimeout(() => setShowDriftFx(false), 2600)
    const t2 = window.setTimeout(() => setSceneMode('waiting'), 2800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [driftTick])

  useEffect(() => {
    if (!loading && hasPosted && !incoming && sceneMode === 'idle') {
      setSceneMode('waiting')
    }
  }, [loading, hasPosted, incoming, sceneMode])

  if (loading) {
    return (
      <div className="bottle-tab-root">
        <div className="empty bottle-loading-scene">
          <BottleScene mode="waiting" size="small" />
          <p>{t('bottle_loading')}</p>
        </div>
      </div>
    )
  }

  const heroMode: BottleSceneMode =
    sceneMode === 'wobble' || sceneMode === 'drift' || sceneMode === 'arrive'
      ? sceneMode
      : hasPosted && !incoming
        ? 'waiting'
        : 'idle'

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
        <BottleScene mode={heroMode === 'wobble' ? 'wobble' : 'idle'} size="small" />
        <p className="shoot-banner-lead">{t('bottle_shootPrompt')}</p>
        <BottleShootButton label={t('bottle_shoot')} onClick={onShoot} onWobble={triggerWobble} />
      </div>
    ) : (
      <div className="bottle-hero">
        <BottleScene mode={heroMode} size="large" />
        <p className="bottle-lead">{t('bottle_lead')}</p>
        <div className="center-block">
          <BottleShootButton label={t('bottle_shoot')} onClick={onShoot} onWobble={triggerWobble} />
        </div>
        <p className="bottle-note">{t('bottle_note')}</p>
      </div>
    )
  )

  /** 投稿済みで瓶が届いていない */
  const waitingSection = hasPosted && !incoming && (
    <div className="bottle-hero">
      <BottleScene mode="waiting" size="large" />
      <p className="bottle-lead">{t('bottle_lead')}</p>
      <p className="bottle-note" style={{ marginTop: 4 }}>
        {t('bottle_waiting')}
      </p>
    </div>
  )

  const incomingSection = incoming && (
    <div className={!hasPosted ? 'incoming-block' : undefined}>
      {showArriveFx && (
        <div className="bottle-arrive-fx">
          <BottleScene mode="arrive" size="small" />
        </div>
      )}
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
    <div className="bottle-tab-root">
      {showDriftFx && (
        <div className="bottle-drift-fx">
          <BottleScene mode="drift" size="large" />
        </div>
      )}
      {shootSection}
      {waitingSection}
      {incomingSection}
      {sentRepliesBlock}
    </div>
  )
}
