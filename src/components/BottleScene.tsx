import { useId } from 'react'

export type BottleSceneMode = 'idle' | 'wobble' | 'drift' | 'arrive' | 'waiting'

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

  return (
    <div
      className={`bottle-scene bottle-scene--${mode} bottle-scene--${size}${className ? ` ${className}` : ''}`}
      aria-hidden
    >
      <svg className="bottle-scene-svg" viewBox="0 0 240 240" fill="none">
        {/* 素朴な背景 */}
        <rect x="0" y="0" width="240" height="240" fill="#f7f4ee" />

        {/* 手描き風 — 点線の水平線と波 */}
        <g className="bottle-sketch-waves" stroke="#7fa8a0" strokeLinecap="round" fill="none">
          <path
            className="bottle-sketch-wave bottle-sketch-wave-1"
            d="M8 182 Q40 176 72 182 T136 182 T200 182 T232 182"
            strokeWidth="2"
            strokeDasharray="8 7"
          />
          <path
            className="bottle-sketch-wave bottle-sketch-wave-2"
            d="M0 192 Q32 186 64 192 T128 192 T192 192 T240 192"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            opacity="0.65"
          />
          <path
            className="bottle-sketch-wave bottle-sketch-wave-3"
            d="M16 200 Q48 196 80 200 T144 200 T208 200"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            opacity="0.45"
          />
        </g>

        {/* 瓶本体 */}
        <g className="bottle-float">
          <ellipse
            className="bottle-sketch-shadow"
            cx="120"
            cy="172"
            rx="20"
            ry="4"
            stroke="#9fc7c0"
            strokeWidth="1.2"
            strokeDasharray="5 4"
            fill="none"
            opacity="0.5"
          />
          <g className="bottle-glass" transform="rotate(12 120 118)">
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
            <path d="M156 76l3 3M164 70l1 4M150 66l2 3" />
          </g>
        </g>

        {/* 岸のヒント（着岸・待機） */}
        <path
          id={`shore-${uid}`}
          className="bottle-sketch-shore"
          d="M0 210 Q30 204 60 210 T120 210 T180 210 T240 210"
          stroke="#b9966e"
          strokeWidth="1.5"
          strokeDasharray="10 8"
          opacity="0.35"
        />
      </svg>
    </div>
  )
}
