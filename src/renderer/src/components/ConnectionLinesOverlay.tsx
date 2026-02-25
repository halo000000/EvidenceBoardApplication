import React from 'react'
import { Connection, EvidenceObject, Position } from '../types'

interface ConnectionLinesOverlayProps {
  connections: Connection[]
  objects: EvidenceObject[]
  zoom: number
  pan: Position
  linkingState: { fromObjectId: string; fromPointId: string } | null
  previewLineEnd: Position | null
  getConnectionPointPosition: (object: EvidenceObject, pointId: string) => Position
}

function ConnectionLinesOverlay({
  connections,
  objects,
  zoom,
  pan,
  linkingState,
  previewLineEnd,
  getConnectionPointPosition
}: ConnectionLinesOverlayProps): React.JSX.Element {
  const w = window.innerWidth
  const h = window.innerHeight
  const strokeW = Math.max(2.5, 4 / zoom)

  const renderConnectionPath = (conn: Connection): React.ReactNode => {
    const fromObj = objects.find((o) => o.id === conn.fromObjectId)
    const toObj = objects.find((o) => o.id === conn.toObjectId)
    if (!fromObj || !toObj) return null

    const fromPos = getConnectionPointPosition(fromObj, conn.fromPointId)
    const toPos = getConnectionPointPosition(toObj, conn.toPointId)

    const midX = (fromPos.x + toPos.x) / 2
    const midY = (fromPos.y + toPos.y) / 2
    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const len = Math.hypot(dx, dy) || 1
    const perpX = -dy / len
    const perpY = dx / len
    const bulge = Math.min(len * 0.25, 40)
    const ctrlX = midX + perpX * bulge
    const ctrlY = midY + perpY * bulge

    const d = `M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`

    return (
      <g key={conn.id}>
        <path
          d={d}
          fill="none"
          stroke="rgba(74, 158, 255, 0.4)"
          strokeWidth={strokeW + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={d}
          fill="none"
          stroke="#5eb0ff"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    )
  }

  const previewLine =
    linkingState && previewLineEnd
      ? (() => {
          const fromObj = objects.find((o) => o.id === linkingState.fromObjectId)
          if (!fromObj) return null
          const fromPos = getConnectionPointPosition(fromObj, linkingState.fromPointId)
          const strokeWPreview = Math.max(2, 4 / zoom)
          return (
            <g>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={previewLineEnd.x}
                y2={previewLineEnd.y}
                stroke="rgba(74, 158, 255, 0.5)"
                strokeWidth={strokeWPreview + 4}
                strokeLinecap="round"
              />
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={previewLineEnd.x}
                y2={previewLineEnd.y}
                stroke="#4a9eff"
                strokeWidth={strokeWPreview}
                strokeLinecap="round"
              />
            </g>
          )
        })()
      : null

  return (
    <svg
      className="connection-lines-overlay"
      width={w}
      height={h}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: w,
        height: h,
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {connections.map(renderConnectionPath)}
        {previewLine}
      </g>
    </svg>
  )
}

export default ConnectionLinesOverlay
