import { useId } from 'react'

export type BottleSceneMode = 'idle' | 'wobble' | 'drift' | 'arrive' | 'waiting'

function WaveLayer({ offsetX = 0 }: { offsetX?: number }) {
  return (
    <g transform={`translate(${offsetX} 0)`}>
      <path
        d="M0 178 Q30 168 60 178 T120 178 T180 178 T240 178 V240 H0 Z"
        fill="#b8d8d2"
        opacity="0.45"
      />
      <path
        d="M0 186 Q40 176 80 186 T160 186 T240 186 V240 H0 Z"
        fill="#9fc7c0"
        opacity="0.35"
      />
      <path
        d="M0 194 Q25 188 50 194 T100 194 T150 194 T200 194 T240 194"
        stroke="#7fa8a0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
  )
}

export function BottleScene({
  mode = 'idle',
  size = 'large',
  className = ''
}: {
  mode?: BottleSceneMode
  size?: 'large' | 'small'
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const skyId = `bottleSky-${uid}`
  const seaId = `bottleSea-${uid}`

  return (
    <div
      className={`bottle-scene bottle-scene--${mode} bottle-scene--${size}${className ? ` ${className}` : ''}`}
      aria-hidden
    >
      <svg className="bottle-scene-svg" viewBox="0 0 240 240" fill="none">
        <defs>
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef6f5" />
            <stop offset="1" stopColor="#f7f4ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={seaId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe4e0" />
            <stop offset="1" stopColor="#aac4d8" stopOpacity="0.55" />
          </linearGradient>
          <clipPath id={`seaClip-${uid}`}>
            <rect x="0" y="158" width="240" height="82" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width="240" height="240" fill={`url(#${skyId})`} />

        {/* 海（水平線） */}
        <ellipse cx="120" cy="188" rx="102" ry="22" fill={`url(#${seaId})`} opacity="0.85" />

        {/* 流れる波 — 2枚並べてループ */}
        <g className="bottle-sea" clipPath={`url(#seaClip-${uid})`}>
          <g className="bottle-waves-loop">
            <WaveLayer offsetX={0} />
            <WaveLayer offsetX={240} />
          </g>
        </g>

        {/* 瓶本体（波の上） */}
        <g className="bottle-float">
          <ellipse
            className="bottle-ripple"
            cx="120"
            cy="168"
            rx="22"
            ry="5"
            fill="#9fc7c0"
            opacity="0.35"
          />
          <g className="bottle-glass" transform="rotate(14 120 118)">
            <rect x="102" y="72" width="36" height="88" rx="16" fill="#dff0ec" stroke="#7fa8a0" strokeWidth="2.5" />
            <rect x="111" y="56" width="18" height="20" rx="4" fill="#e7c9a9" stroke="#b9966e" strokeWidth="2" />
            <rect x="108" y="104" width="24" height="32" rx="4" fill="#fff" stroke="#cdbfa6" strokeWidth="1.5" />
            <path d="M112 114h20M112 122h20M112 130h13" stroke="#cdbfa6" strokeWidth="1.5" strokeLinecap="round" />
            <path
              d="M108 148 Q120 152 132 148"
              stroke="#7fa8a0"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
          <g stroke="#e7c9a9" strokeWidth="2" strokeLinecap="round" className="bottle-sparkle">
            <path d="M158 78l3 3M166 72l1 4M152 68l2 3" />
          </g>
        </g>
      </svg>
    </div>
  )
}
