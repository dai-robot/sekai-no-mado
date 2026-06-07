import { useCallback, useEffect, useState } from 'react'
import { TabBar, type TabKey } from './components/TabBar'
import { WorldWindow } from './components/WorldWindow'
import { BottleTab } from './components/BottleTab'
import { CameraCapture } from './components/CameraCapture'
import { CameraIcon } from './components/icons'
import { getBackend } from './lib/backend'
import type { IncomingBottle, NewPostInput, Post } from './types'

type CaptureMode = { kind: 'post' } | { kind: 'replyPhoto'; matchId: string } | null

export default function App() {
  const backend = getBackend()

  const [tab, setTab] = useState<TabKey>('window')
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [incoming, setIncoming] = useState<IncomingBottle | null>(null)
  const [incomingLoading, setIncomingLoading] = useState(true)
  const [hasPosted, setHasPosted] = useState(false)
  const [capture, setCapture] = useState<CaptureMode>(null)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2600)
  }, [])

  const refreshPosts = useCallback(async () => {
    setPostsLoading(true)
    try {
      setPosts(await backend.getTodayPosts())
      setHasPosted(await backend.hasPostedToday())
    } catch (e) {
      console.error(e)
      showToast('読み込みに失敗しました')
    } finally {
      setPostsLoading(false)
    }
  }, [backend, showToast])

  const refreshIncoming = useCallback(async () => {
    setIncomingLoading(true)
    try {
      setIncoming(await backend.getIncomingBottle())
    } catch (e) {
      console.error(e)
    } finally {
      setIncomingLoading(false)
    }
  }, [backend])

  useEffect(() => {
    refreshPosts()
    refreshIncoming()
  }, [refreshPosts, refreshIncoming])

  function openPostCamera() {
    if (hasPosted) {
      showToast('今日はもう投稿しました。また明日。')
      return
    }
    setCapture({ kind: 'post' })
  }

  async function handleSubmit(input: NewPostInput) {
    if (capture?.kind === 'replyPhoto') {
      const res = await backend.replyToBottle(capture.matchId, {
        kind: 'photo',
        imageDataUrl: input.imageDataUrl
      })
      if (res.ok) {
        await refreshIncoming()
        showToast('写真で返事を届けました')
      }
      return res
    }
    // 通常投稿
    const res = await backend.createPost(input)
    if (res.ok) {
      await Promise.all([refreshPosts(), refreshIncoming()])
      showToast(
        res.delivered ? '世界に届きました。誰かにも届いています。' : '世界に届きました。'
      )
    }
    return res
  }

  async function handleReact(matchId: string, reactionKey: string) {
    const res = await backend.replyToBottle(matchId, { kind: 'reaction', reaction: reactionKey })
    if (res.ok) {
      await refreshIncoming()
      showToast('気持ちを届けました')
    } else {
      showToast(res.reason ?? '返事できませんでした')
    }
  }

  async function handleReport(postId: string, reason: string) {
    await backend.reportPost(postId, reason)
    await Promise.all([refreshPosts(), refreshIncoming()])
    showToast('通報を受け付けました。表示を停止します。')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>世界の窓</h1>
        <p className="sub">今日の地球を、そっと覗くアプリ</p>
        {backend.mode === 'local' && (
          <span className="mode-pill">ローカル・デモモード</span>
        )}
      </header>

      <main className="content">
        {tab === 'window' ? (
          <WorldWindow posts={posts} loading={postsLoading} onReport={handleReport} />
        ) : (
          <BottleTab
            incoming={incoming}
            loading={incomingLoading}
            onShoot={openPostCamera}
            onReplyPhoto={(matchId) => setCapture({ kind: 'replyPhoto', matchId })}
            onReact={handleReact}
            onReport={handleReport}
          />
        )}
      </main>

      {tab === 'window' && (
        <button
          className={`fab${hasPosted ? ' done' : ''}`}
          onClick={openPostCamera}
          aria-label="撮影する"
        >
          <CameraIcon />
        </button>
      )}

      <TabBar active={tab} onChange={setTab} />

      {capture && (
        <CameraCapture
          title={capture.kind === 'replyPhoto' ? '写真で返事する' : '今この瞬間を撮る'}
          submitLabel={capture.kind === 'replyPhoto' ? '返事を流す' : '世界に流す'}
          allowComment={capture.kind !== 'replyPhoto'}
          onSubmit={handleSubmit}
          onClose={() => setCapture(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
