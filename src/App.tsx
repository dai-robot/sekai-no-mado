import { useCallback, useEffect, useState } from 'react'
import { TabBar, type TabKey } from './components/TabBar'
import { WorldWindow } from './components/WorldWindow'
import { BottleTab } from './components/BottleTab'
import { CameraCapture } from './components/CameraCapture'
import { CameraIcon } from './components/icons'
import { getBackend } from './lib/backend'
import { useI18n } from './i18n'
import { LANGS, LANG_LABELS, type Lang } from './i18n/translations'
import type { IncomingBottle, NewPostInput, Post } from './types'

type CaptureMode = { kind: 'post' } | { kind: 'replyPhoto'; matchId: string } | null

export default function App() {
  const backend = getBackend()
  const { t, lang, setLang } = useI18n()

  const [tab, setTab] = useState<TabKey>('bottle')
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
      showToast(t('toast_loadError'))
    } finally {
      setPostsLoading(false)
    }
  }, [backend, showToast, t])

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
      showToast(t('toast_alreadyPosted'))
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
        showToast(t('toast_replyPhoto'))
      }
      return res
    }
    // 通常投稿
    const res = await backend.createPost(input)
    if (res.ok) {
      await Promise.all([refreshPosts(), refreshIncoming()])
      showToast(res.delivered ? t('toast_postedDelivered') : t('toast_posted'))
    }
    return res
  }

  async function handleReact(matchId: string, reactionKey: string) {
    const res = await backend.replyToBottle(matchId, { kind: 'reaction', reaction: reactionKey })
    if (res.ok) {
      await refreshIncoming()
      showToast(t('toast_reaction'))
    } else {
      showToast(res.reason ?? t('toast_replyFail'))
    }
  }

  async function handleReport(postId: string, reason: string) {
    await backend.reportPost(postId, reason)
    await Promise.all([refreshPosts(), refreshIncoming()])
    showToast(t('toast_reportDone'))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="lang-switch">
          <select
            aria-label={t('language')}
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {LANG_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
        <h1>{t('appName')}</h1>
        <p className="sub">{t('tagline')}</p>
        {backend.mode === 'local' && <span className="mode-pill">{t('modeLocal')}</span>}
      </header>

      <main className="content">
        {tab === 'window' ? (
          <WorldWindow posts={posts} loading={postsLoading} onReport={handleReport} />
        ) : (
          <BottleTab
            incoming={incoming}
            loading={incomingLoading}
            hasPosted={hasPosted}
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
          aria-label={t('fab_aria')}
        >
          <CameraIcon />
        </button>
      )}

      <TabBar active={tab} onChange={setTab} />

      {capture && (
        <CameraCapture
          title={capture.kind === 'replyPhoto' ? t('camera_titleReply') : t('camera_titlePost')}
          submitLabel={
            capture.kind === 'replyPhoto' ? t('camera_submitReply') : t('camera_submitPost')
          }
          allowComment={capture.kind !== 'replyPhoto'}
          onSubmit={handleSubmit}
          onClose={() => setCapture(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
