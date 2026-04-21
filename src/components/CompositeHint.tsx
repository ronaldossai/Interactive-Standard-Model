/**
 * CompositeHint
 *
 * Renders a bottom-left floating card whenever a quark is selected.
 * It lists the hadrons that quark participates in as clickable pills.
 * Clicking a pill expands an inline SVG diagram showing the quark
 * arrangement with gluon-spring connector lines.
 *
 * Design choices:
 *   • Local state only — this is a pure UI concern, no context pollution
 *   • SVG not mini-canvas — lighter, no extra Three.js overhead
 *   • Baryon = equilateral triangle, Meson = horizontal pair — most intuitive
 *   • Quark colours from compositeData which mirrors particleData values,
 *     so the diagram stays visually consistent with the 3-D scene
 *   • max-width 300px so it never crowds the centre viewport
 */

import { useState } from 'react'
import { useParticle } from '../context/ParticleContext'
import { COMPOSITE_DATA, type CompositeData } from '../data/compositeData'

// ── SVG helpers ──────────────────────────────────────────────────────────────

/** Draws a "spring" path between two points to evoke a gluon propagator */
function springPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  coils = 6,
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len === 0) return `M ${x1} ${y1}`

  // Unit perpendicular
  const px = -dy / len
  const py = dx / len
  const amp = 5 // pixel amplitude of the wiggle

  const pts: string[] = [`M ${x1.toFixed(1)} ${y1.toFixed(1)}`]
  const segments = coils * 2
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

/** Quark node circle + symbol label */
function QuarkNode({
  cx,
  cy,
  r,
  color,
  symbol,
}: {
  cx: number
  cy: number
  r: number
  color: string
  symbol: string
}) {
  return (
    <g>
      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={r + 4} fill={color} opacity={0.15} />
      {/* Main filled circle */}
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="#ffffff22" strokeWidth={1} />
      {/* Symbol — slightly smaller font for two-char antiquark labels */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={symbol.length > 1 ? 9 : 11}
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#fff"
      >
        {symbol}
      </text>
    </g>
  )
}

/** SVG diagram for a baryon (3-quark triangle) */
function BaryonDiagram({ composite }: { composite: CompositeData }) {
  const W = 116
  const H = 98
  // Equilateral triangle vertices (apex top-centre)
  const nodes = [
   // { x: W / 2, y: 12 },  
    { x: W / 2, y: 16 },      // top
  // { x: 12,    y: H - 12 },    // bottom-left
    { x: 16,    y: H - 16 },    // bottom-left
    { x: W - 16, y: H - 16 },   // bottom-right
  ]
  const R = 12
  const pairs = [
    [0, 1],
    [1, 2],
    [0, 2],
  ] as [number, number][]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-label={composite.name}>
      {/* Gluon springs */}
      {pairs.map(([a, b]) => (
        <path
          key={`${a}-${b}`}
          d={springPath(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y)}
          stroke="#ffffff40"
          strokeWidth={1.5}
          fill="none"
        />
      ))}
      {/* Quark nodes */}
      {nodes.map((n, i) => (
        <QuarkNode
          key={i}
          cx={n.x}
          cy={n.y}
          r={R}
          color={composite.quarkColors[i]}
          symbol={composite.quarkSymbols[i]}
        />
      ))}
    </svg>
  )
}

/** SVG diagram for a meson (quark–antiquark pair) */
function MesonDiagram({ composite }: { composite: CompositeData }) {
  const W = 130
  const H = 52
  const leftX = 22
  const rightX = W - 22
  const midY = H / 2
  const R = 15

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-label={composite.name}>
      {/* Gluon spring between the two quarks */}
      <path
        d={springPath(leftX, midY, rightX, midY, 5)}
        stroke="#ffffff40"
        strokeWidth={1.5}
        fill="none"
      />
      <QuarkNode cx={leftX}  cy={midY} r={R} color={composite.quarkColors[0]} symbol={composite.quarkSymbols[0]} />
      <QuarkNode cx={rightX} cy={midY} r={R} color={composite.quarkColors[1]} symbol={composite.quarkSymbols[1]} />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CompositeHint() {
  const { selectedParticle } = useParticle()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Only relevant for quarks
  if (!selectedParticle || selectedParticle.type !== 'quark') return null

  const matches = COMPOSITE_DATA.filter(c =>
    c.quarks.includes(selectedParticle.id),
  )
  if (matches.length === 0) return null

  const expanded = matches.find(c => c.id === expandedId) ?? null

  const handlePill = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="composite-hint" role="complementary" aria-label="Composite particles">
      {/* Header row */}
      <div className="composite-hint-header">
        <span className="composite-hint-title">COMPOSITE PARTICLES</span>
        <span className="composite-hint-subtitle">
          {selectedParticle.symbol} appears in
        </span>
      </div>

      {/* Pill row */}
      <div className="composite-pills">
        {matches.map(c => (
          <button
            key={c.id}
            className={`composite-pill${expandedId === c.id ? ' active' : ''}`}
            onClick={() => handlePill(c.id)}
            title={c.description}
          >
            <span className="composite-pill-symbol">{c.symbol}</span>
            <span className="composite-pill-name">{c.name}</span>
            <span className="composite-pill-category">{c.category}</span>
          </button>
        ))}
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="composite-detail">
          <div className="composite-diagram">
            {expanded.category === 'baryon' ? (
              <BaryonDiagram composite={expanded} />
            ) : (
              <MesonDiagram composite={expanded} />
            )}
          </div>

          <div className="composite-detail-info">
            <div className="composite-detail-row">
              <span className="composite-detail-label">Quarks</span>
              <span className="composite-detail-value">
                {expanded.quarkSymbols.join(' ')}
              </span>
            </div>
            <div className="composite-detail-row">
              <span className="composite-detail-label">Mass</span>
              <span className="composite-detail-value">{expanded.mass}</span>
            </div>
            <div className="composite-detail-row">
              <span className="composite-detail-label">Charge</span>
              <span className="composite-detail-value">{expanded.charge}</span>
            </div>
            <div className="composite-detail-row">
              <span className="composite-detail-label">Type</span>
              <span className="composite-detail-value" style={{ textTransform: 'capitalize' }}>
                {expanded.category}
              </span>
            </div>
          </div>

          <p className="composite-description">{expanded.description}</p>
        </div>
      )}
    </div>
  )
}
