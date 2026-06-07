import { useState } from 'react'
import type { IncomingBottle } from '../types'
import { REACTIONS, findReaction } from '../types'
import { PostCard } from './PostCard'

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
  loading,
  onShoot,
  onReplyPhoto,
  onReact,
  onReport
}: {
  incoming: IncomingBottle | null
  loading: boolean
  onShoot: () => void
  onReplyPhoto: (matchId: string) => void
  onReact: (matchId: string, reactionKey: string) => void
  onReport: (postId: string, reason: string) => void
}) {
  const [picking, setPicking] = useState(false)
  if (loading) {
    return (
      <div className="empty">
        <span className="emoji">🌊</span>
        漂流瓶をさがしています…
      </div>
    )
  }

  return (
    <div>
      {!incoming ? (
        <div className="bottle-hero">
          <BottleIllust />
          <p className="bottle-lead">
            写真を送ると、
            <br />
            世界の誰かに届きます。
            <br />
            あなたにも1枚届きます。
          </p>
          <div className="center-block">
            <button className="primary-btn" onClick={onShoot}>
              撮影して流す
            </button>
          </div>
          <p className="bottle-note">
            一度きりのやり取りです。相手を知ることはできません。
            <br />
            でも、世界のどこかで同じ時間を生きている誰かを感じられます。
          </p>
        </div>
      ) : (
        <div>
          <div className="section-title">
            <span>届きました</span>
          </div>
          <PostCard post={incoming.post} onReport={onReport} />

          {incoming.reply || incoming.replyReaction ? (
            <>
              <div className="bottle-section-label">あなたの返事</div>
              {incoming.reply ? (
                <PostCard post={incoming.reply} />
              ) : (
                <div className="reaction-sent">
                  <span className="reaction-emoji">
                    {findReaction(incoming.replyReaction)?.emoji ?? '✨'}
                  </span>
                  <span>{findReaction(incoming.replyReaction)?.label ?? 'リアクション'}</span>
                </div>
              )}
              <p className="bottle-note">
                この漂流瓶のやり取りは、これで終わりです。
                <br />
                またいつか、別の誰かと。
              </p>
            </>
          ) : (
            <div className="reply-area">
              <p className="bottle-note" style={{ marginBottom: 10 }}>
                1往復だけ返事ができます。写真か、気持ちのリアクションか、どちらか一つ。
                <br />
                言葉は添えられません。
              </p>

              {!picking ? (
                <div className="reply-choice">
                  <button className="primary-btn" onClick={() => onReplyPhoto(incoming.match.id)}>
                    写真で返す
                  </button>
                  <button className="ghost-btn" onClick={() => setPicking(true)}>
                    リアクションで返す
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
                      <span>{r.label}</span>
                    </button>
                  ))}
                  <button className="ghost-btn reaction-cancel" onClick={() => setPicking(false)}>
                    もどる
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
