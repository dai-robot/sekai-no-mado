import { useEffect, useRef, useState } from 'react'
import type { NewPostInput } from '../types'
import { useI18n } from '../i18n'

type Phase = 'camera' | 'review'

export function CameraCapture({
  title,
  submitLabel,
  allowComment = true,
  onSubmit,
  onClose
}: {
  title: string
  submitLabel?: string
  /** ひとことコメント欄を出すか（漂流瓶への返信では言葉は不可なので false） */
  allowComment?: boolean
  onSubmit: (input: NewPostInput) => Promise<{ ok: boolean; reason?: string }>
  onClose: () => void
}) {
  const { t } = useI18n()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [phase, setPhase] = useState<Phase>('camera')
  const [photo, setPhoto] = useState<string>('')
  const [comment, setComment] = useState('')
  const [camError, setCamError] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [busy, setBusy] = useState(false)

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(() => {
    let cancelled = false
    async function start() {
      if (phase !== 'camera') return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
      } catch {
        setCamError(t('camera_error'))
      }
    }
    start()
    return () => {
      cancelled = true
      stopStream()
    }
  }, [phase])

  function capture() {
    const video = videoRef.current
    if (!video) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return
    const canvas = document.createElement('canvas')
    // 正方形に近い 3:4 で切り出し
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    setPhoto(canvas.toDataURL('image/jpeg', 0.85))
    stopStream()
    setPhase('review')
  }

  function retake() {
    setPhoto('')
    setError('')
    setPhase('camera')
  }

  async function submit() {
    setBusy(true)
    setError('')
    const res = await onSubmit({ imageDataUrl: photo, comment: comment.trim() })
    setBusy(false)
    if (!res.ok) {
      setError(res.reason ?? t('camera_failed'))
      return
    }
    onClose()
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2>{title}</h2>

        {phase === 'camera' && (
          <>
            <div className="camera-stage">
              {camError ? (
                <div className="camera-error">{camError}</div>
              ) : (
                <video ref={videoRef} playsInline muted />
              )}
            </div>
            {!camError && (
              <button className="shutter" aria-label={t('camera_shutter')} onClick={capture} />
            )}
            <div className="row-buttons">
              <button className="ghost-btn" onClick={onClose} style={{ margin: '0 auto' }}>
                {t('camera_close')}
              </button>
            </div>
          </>
        )}

        {phase === 'review' && (
          <>
            <div className="camera-stage">
              <img src={photo} alt="撮影した写真" />
            </div>
            {allowComment ? (
              <>
                <textarea
                  className="comment-field"
                  rows={2}
                  maxLength={50}
                  placeholder={t('camera_placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="char-count">{comment.length}/50</div>
              </>
            ) : (
              <p className="bottle-note" style={{ marginTop: 12 }}>
                {t('camera_noWords')}
              </p>
            )}
            {error && <p className="field-error">{error}</p>}
            <div className="row-buttons">
              <button className="ghost-btn" onClick={retake} disabled={busy}>
                {t('camera_retake')}
              </button>
              <button className="primary-btn" onClick={submit} disabled={busy}>
                {busy ? t('camera_sending') : submitLabel ?? t('camera_submitPost')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
