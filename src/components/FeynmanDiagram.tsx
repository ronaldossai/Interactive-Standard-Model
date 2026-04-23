/**
 * FeynmanDiagram.tsx
 *
 * SVG tree-level t-channel diagram:
 *
 *   p1_in ────────●──────── p1_out     (top fermion line)
 *                 |
 *               boson                  (propagator — style varies by force)
 *                 |
 *   p2_in ────────●──────── p2_out     (bottom fermion line)
 *
 * Time flows left → right (standard HEP convention).
 *
 * Boson line styles:
 *   photon  → sine wave  (oscillating EM field)
 *   gluon   → spring     (reused from CompositeHint — colour field)
 *   W / Z   → zigzag     (massive, short-range — heavier feel)
 *   Higgs   → dashed     (scalar, not a gauge boson)
 */

import type { ParticleData } from '../types/particle'
import type { Mediator, LineStyle } from '../data/feynmanRules'

// ── SVG path generators ───────────────────────────────────────────────────────

/** Sinusoidal wave — photon propagator */
function sinePath(
  x1: number, y1: number,
  x2: number, y2: number,
  cycles = 5,
): string {
  const steps = cycles * 16
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = x1 + (x2 - x1) * t
    // Perpendicular direction (vertical for a horizontal propagator)
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy)
    const px = -dy / len
    const py = dx / len
    const amp = 5
    const y = y1 + (y2 - y1) * t + amp * Math.sin(t * cycles * Math.PI * 2) * px
    const xOff = amp * Math.sin(t * cycles * Math.PI * 2) * (-py)
    pts.push(`${i === 0 ? 'M' : 'L'} ${(x + xOff).toFixed(2)} ${(y).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** Spring/coil — gluon propagator (reused logic from CompositeHint) */
function springPath(
  x1: number, y1: number,
  x2: number, y2: number,
  coils = 7,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len === 0) return `M ${x1} ${y1}`
  const px = -dy / len
  const py = dx / len
  const amp = 5
  const segments = coils * 2
  const pts = [`M ${x1.toFixed(1)} ${y1.toFixed(1)}`]
  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    const mx = x1 + dx * t
    const my = y1 + dy * t
    const offset = amp * (i % 2 === 1 ? 1 : -1)
    pts.push(`L ${(mx + px * offset).toFixed(1)} ${(my + py * offset).toFixed(1)}`)
  }
  pts.push(`L ${x2.toFixed(1)} ${y2.toFixed(1)}`)
  return pts.join(' ')
}

/** Zigzag — W/Z propagator */
function zigzagPath(
  x1: number, y1: number,
  x2: number, y2: number,
  zigs = 6,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len === 0) return `M ${x1} ${y1}`
  const px = -dy / len
  const py = dx / len
  const amp = 5
  const segments = zigs * 2
  const pts = [`M ${x1.toFixed(1)} ${y1.toFixed(1)}`]
  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    const mx = x1 + dx * t
    const my = y1 + dy * t
    const offset = amp * (i % 2 === 1 ? 1 : -1)
    pts.push(`L ${(mx + px * offset).toFixed(1)} ${(my + py * offset).toFixed(1)}`)
  }
  pts.push(`L ${x2.toFixed(1)} ${y2.toFixed(1)}`)
  return pts.join(' ')
}

/** Dashed straight line — Higgs propagator */
function dashedLine(
  x1: number, y1: number,
  x2: number, y2: number,
): { d: string; dash: string } {
  return {
    d: `M ${x1} ${y1} L ${x2} ${y2}`,
    dash: '6 4',
  }
}

// ── Propagator component ──────────────────────────────────────────────────────

function Propagator({
  x1, y1, x2, y2,
  style, color,
}: {
  x1: number; y1: number; x2: number; y2: number
  style: LineStyle
  color: string
}) {
  const commonProps = {
    stroke: color,
    strokeWidth: 1.8,
    fill: 'none',
    strokeLinecap: 'round' as const,
  }

  if (style === 'sine') {
    return <path d={sinePath(x1, y1, x2, y2)} {...commonProps} />
  }
  if (style === 'spring') {
    return <path d={springPath(x1, y1, x2, y2)} {...commonProps} />
  }
  if (style === 'zigzag') {
    return <path d={zigzagPath(x1, y1, x2, y2)} {...commonProps} />
  }
  // dashed / straight
  const { d, dash } = dashedLine(x1, y1, x2, y2)
  return (
    <path
      d={d}
      {...commonProps}
      strokeDasharray={style === 'dashed' ? dash : undefined}
    />
  )
}

// ── Arrow marker ──────────────────────────────────────────────────────────────

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <marker
        id={id}
        markerWidth="6"
        markerHeight="6"
        refX="5"
        refY="3"
        orient="auto"
      >
        <path d="M0,0 L0,6 L6,3 z" fill={color} />
      </marker>
    </defs>
  )
}

// ── Particle label ────────────────────────────────────────────────────────────

function ParticleLabel({
  x, y, symbol, color, anchor = 'middle',
}: {
  x: number; y: number; symbol: string; color: string; anchor?: 'start' | 'middle' | 'end'
}) {
  return (
    <text
      x={x} y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="700"
      fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      fill={color}
    >
      {symbol}
    </text>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface FeynmanDiagramProps {
  particle1: ParticleData
  particle2: ParticleData
  mediator: Mediator
}

export default function FeynmanDiagram({
  particle1,
  particle2,
  mediator,
}: FeynmanDiagramProps) {
  const W = 260
  const H = 130

  // Layout constants
  const leftX  = 28   // incoming fermion label x
  const vtxX   = 90   // left vertex x
  const vtxRX  = W - 90  // right vertex x
  const rightX = W - 28  // outgoing fermion label x
  const topY   = 30
  const botY   = H - 30

  // Propagator runs vertically between the two vertices' midpoints
  const propX  = (vtxX + vtxRX) / 2
  const midTopY = topY
  const midBotY = botY

  const p1Color = particle1.color ?? '#aaaaaa'
  const p2Color = particle2.color ?? '#aaaaaa'
  const bColor  = mediator.color

  const markerId1 = `arrow-p1-${particle1.id}`
  const markerId2 = `arrow-p2-${particle2.id}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-label={`Feynman diagram: ${particle1.name} and ${particle2.name} via ${mediator.symbol}`}
    >
      {/* Arrow markers */}
      <ArrowMarker id={markerId1} color={p1Color} />
      <ArrowMarker id={markerId2} color={p2Color} />

      {/* ── Top fermion line (particle 1) ── */}
      {/* Incoming */}
      <line
        x1={leftX} y1={topY} x2={vtxX} y2={topY}
        stroke={p1Color} strokeWidth={2}
        markerEnd={`url(#${markerId1})`}
      />
      {/* Outgoing */}
      <line
        x1={vtxX} y1={topY} x2={vtxRX} y2={topY}
        stroke={p1Color} strokeWidth={2}
        markerEnd={`url(#${markerId1})`}
      />

      {/* ── Bottom fermion line (particle 2) ── */}
      {/* Incoming */}
      <line
        x1={leftX} y1={botY} x2={vtxX} y2={botY}
        stroke={p2Color} strokeWidth={2}
        markerEnd={`url(#${markerId2})`}
      />
      {/* Outgoing */}
      <line
        x1={vtxX} y1={botY} x2={vtxRX} y2={botY}
        stroke={p2Color} strokeWidth={2}
        markerEnd={`url(#${markerId2})`}
      />

      {/* ── Boson propagator (vertical, between vertices) ── */}
      <Propagator
        x1={propX} y1={midTopY}
        x2={propX} y2={midBotY}
        style={mediator.style}
        color={bColor}
      />

      {/* ── Vertex dots ── */}
      <circle cx={vtxX}  cy={topY} r={3} fill="#ffffff" opacity={0.7} />
      <circle cx={vtxX}  cy={botY} r={3} fill="#ffffff" opacity={0.7} />
      <circle cx={vtxRX} cy={topY} r={3} fill="#ffffff" opacity={0.7} />
      <circle cx={vtxRX} cy={botY} r={3} fill="#ffffff" opacity={0.7} />

      {/* ── Labels ── */}
      {/* Incoming particle labels (left) */}
      <ParticleLabel x={leftX - 4} y={topY} symbol={particle1.symbol} color={p1Color} anchor="end" />
      <ParticleLabel x={leftX - 4} y={botY} symbol={particle2.symbol} color={p2Color} anchor="end" />

      {/* Outgoing particle labels (right) */}
      <ParticleLabel x={rightX + 4} y={topY} symbol={particle1.symbol} color={p1Color} anchor="start" />
      <ParticleLabel x={rightX + 4} y={botY} symbol={particle2.symbol} color={p2Color} anchor="start" />

      {/* Boson label (right of propagator midpoint) */}
      <text
        x={propX + 10}
        y={(midTopY + midBotY) / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill={bColor}
      >
        {mediator.symbol}
      </text>

      {/* Time arrow axis label */}
      <text
        x={W / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize={8}
        fill="#444"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="0.08em"
      >
        TIME →
      </text>
    </svg>
  )
}
