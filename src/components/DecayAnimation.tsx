/**
 * DecayAnimation.tsx
 *
 * Animated SVG decay diagram — bubble-chamber aesthetic.
 *
 * Layout:
 *   • Parent particle circle in the centre
 *   • Each decay product gets a curved track radiating outward
 *   • Tracks are drawn using stroke-dashoffset animation (the "growing line" effect)
 *   • Product circles fade in at the end of each track
 *   • The whole sequence loops every 3.5 s
 *
 * Animation phases (via CSS animation-delay):
 *   0.0 s  — parent pulses (scale + glow)
 *   0.4 s  — tracks begin drawing
 *   1.2 s  — product nodes appear
 *   2.5 s  — hold
 *   3.5 s  — loop restart
 *
 * No Three.js, no extra deps — pure SVG + CSS keyframes defined in App.css.
 */

import { useState } from 'react'
import type { DecayInfo, DecayMode } from '../data/decayData'

// ── Geometry helpers ──────────────────────────────────────────────────────────

const CX = 90   // canvas centre x
const CY = 90   // canvas centre y
const TRACK_LEN = 62  // radial track length (px)
const PARENT_R = 18
const PRODUCT_R = 13

/**
 * Given N products, spread them evenly in a half-circle above centre so
 * they fan out nicely. For 2 products: 135° and 45°. For 3: 150°, 90°, 30°.
 */
function productAngles(n: number): number[] {
  if (n === 1) return [90]
  const start = 150
  const end = 30
  const step = (start - end) / (n - 1)
  return Array.from({ length: n }, (_, i) => start - i * step)
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  }
}

/** Approximate arc-length of a quadratic bezier (used for dasharray) */
function bezierLength(
  x1: number, y1: number,
  cpx: number, cpy: number,
  x2: number, y2: number,
  steps = 20,
): number {
  let len = 0
  let px = x1, py = y1
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const nx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2
    const ny = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2
    len += Math.hypot(nx - px, ny - py)
    px = nx; py = ny
  }
  return len
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ParentNode({ color, symbol, animKey }: { color: string; symbol: string; animKey: number }) {
  return (
    <g>
      {/* Glow ring */}
      <circle
        cx={CX} cy={CY} r={PARENT_R + 8}
        fill={color}
        opacity={0.12}
        className="decay-parent-glow"
        style={{ animationDelay: '0s', animationDuration: '3.5s' } as React.CSSProperties}
        key={`glow-${animKey}`}
      />
      {/* Main circle */}
      <circle
        cx={CX} cy={CY} r={PARENT_R}
        fill={color}
        stroke="#ffffff22"
        strokeWidth={1.5}
        className="decay-parent-pulse"
        style={{ animationDelay: '0s', animationDuration: '3.5s' } as React.CSSProperties}
        key={`circle-${animKey}`}
      />
      <text
        x={CX} y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={symbol.length > 1 ? 9 : 12}
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#fff"
      >
        {symbol}
      </text>
    </g>
  )
}

function TrackAndNode({
  product,
  angle,
  index,
  animKey,
}: {
  product: { symbol: string; label: string; color: string; isAnti?: boolean }
  angle: number
  index: number
  animKey: number
}) {
  // Track start: on the edge of the parent circle
  const start = polarToCartesian(CX, CY, PARENT_R + 2, angle)
  // Track end: TRACK_LEN further out
  const end = polarToCartesian(CX, CY, PARENT_R + 2 + TRACK_LEN, angle)

  // Control point (same formula as curvedTrack)
  const mx = (start.x + end.x) / 2
  const my = (start.y + end.y) / 2
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.hypot(dx, dy)
  const curvature = index % 2 === 0 ? 16 : -16
  const cpx = mx + (-dy / len) * curvature
  const cpy = my + ( dx / len) * curvature

  const pathD = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} Q ${cpx.toFixed(2)} ${cpy.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
  const trackLen = bezierLength(start.x, start.y, cpx, cpy, end.x, end.y) + 4

  // Stagger track draw by 0.08 s per product
  const trackDelay = 0.4 + index * 0.08
  const nodeDelay  = trackDelay + 0.55

  return (
    <g key={`track-${index}-${animKey}`}>
      {/* Track line */}
      <path
        d={pathD}
        stroke={product.color}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={trackLen}
        strokeDashoffset={trackLen}
        className="decay-track"
        style={{
          animationDelay: `${trackDelay}s`,
          animationDuration: '3.5s',
        } as React.CSSProperties}
      />
      {/* Product glow */}
      <circle
        cx={end.x} cy={end.y} r={PRODUCT_R + 5}
        fill={product.color}
        opacity={0}
        className="decay-product-glow"
        style={{
          animationDelay: `${nodeDelay}s`,
          animationDuration: '3.5s',
        } as React.CSSProperties}
      />
      {/* Product circle */}
      <circle
        cx={end.x} cy={end.y} r={PRODUCT_R}
        fill={product.color}
        stroke="#ffffff22"
        strokeWidth={1}
        opacity={0}
        className="decay-product-node"
        style={{
          animationDelay: `${nodeDelay}s`,
          animationDuration: '3.5s',
        } as React.CSSProperties}
      />
      {/* Product symbol */}
      <text
        x={end.x} y={end.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={product.symbol.length > 2 ? 8 : 10}
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#fff"
        opacity={0}
        className="decay-product-node"
        style={{
          animationDelay: `${nodeDelay}s`,
          animationDuration: '3.5s',
        } as React.CSSProperties}
      >
        {product.symbol}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface DecayAnimationProps {
  decayInfo: DecayInfo
  parentSymbol: string
  parentColor: string
}

export default function DecayAnimation({
  decayInfo,
  parentSymbol,
  parentColor,
}: DecayAnimationProps) {
  const [activeModeIndex, setActiveModeIndex] = useState(0)
  // animKey forces SVG re-mount so animations restart cleanly on mode switch
  const [animKey, setAnimKey] = useState(0)

  const activeMode: DecayMode = decayInfo.modes[activeModeIndex]
  const angles = productAngles(activeMode.products.length)

  const W = 180
  const H = 180

  const switchMode = (idx: number) => {
    setActiveModeIndex(idx)
    setAnimKey(k => k + 1)
  }

  return (
    <div className="decay-animation-wrap">
      {/* Mode selector tabs (only shown when multiple modes) */}
      {decayInfo.modes.length > 1 && (
        <div className="decay-mode-tabs">
          {decayInfo.modes.map((mode, i) => (
            <button
              key={mode.id}
              className={`decay-mode-tab${i === activeModeIndex ? ' active' : ''}`}
              onClick={() => switchMode(i)}
            >
              {mode.branchingRatio}
            </button>
          ))}
        </div>
      )}

      <div className="decay-diagram-row">
        {/* SVG animation */}
        <div className="decay-svg-wrap">
          <svg
            key={animKey}
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            aria-label={`Decay animation for ${parentSymbol}`}
          >
            <ParentNode color={parentColor} symbol={parentSymbol} animKey={animKey} />
            {activeMode.products.map((product, i) => (
              <TrackAndNode
                key={`${animKey}-${i}`}
                product={product}
                angle={angles[i]}
                index={i}
                animKey={animKey}
              />
            ))}
          </svg>
        </div>

        {/* Caption */}
        <div className="decay-caption">
          <div className="decay-products-list">
            {activeMode.products.map((p, i) => (
              <span key={i} className="decay-product-chip" style={{ borderColor: p.color, color: p.color }}>
                {p.symbol}
              </span>
            ))}
          </div>
          <p className="decay-caption-text">{activeMode.caption}</p>
          {decayInfo.modes.length === 1 && (
            <p className="decay-br">Branching ratio: <strong>{activeMode.branchingRatio}</strong></p>
          )}
        </div>
      </div>

      <p className="decay-why">{decayInfo.whyItDecays}</p>
    </div>
  )
}
