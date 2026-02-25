import React from 'react'
import { Line } from 'react-konva'
import { Connection, EvidenceObject, Position } from '../types'

interface ConnectionLineProps {
  connection: Connection
  objects: EvidenceObject[]
  zoom: number
}

function ConnectionLine({ connection, objects, zoom }: ConnectionLineProps): React.JSX.Element | null {
  const fromObject = objects.find((o) => o.id === connection.fromObjectId)
  const toObject = objects.find((o) => o.id === connection.toObjectId)

  if (!fromObject || !toObject) return null

  const getPointPosition = (object: EvidenceObject, pointId: string): Position => {
    let x = 0
    let y = 0
    const width = object.width || 0
    const height = object.height || 0

    switch (pointId) {
      case 'top':
        x = width / 2
        y = 0
        break
      case 'right':
        x = width
        y = height / 2
        break
      case 'bottom':
        x = width / 2
        y = height
        break
      case 'left':
        x = 0
        y = height / 2
        break
      default:
        x = width / 2
        y = height / 2
    }

    return {
      x: object.position.x + x,
      y: object.position.y + y
    }
  }

  const fromPos = getPointPosition(fromObject, connection.fromPointId)
  const toPos = getPointPosition(toObject, connection.toPointId)

  // Control point: midpoint offset perpendicular for a smooth bulge
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

  const strokeW = Math.max(2.5, 4 / zoom)

  return (
    <>
      {/* Glow behind line for visibility */}
      <Line
        points={[fromPos.x, fromPos.y, ctrlX, ctrlY, toPos.x, toPos.y]}
        stroke="rgba(74, 158, 255, 0.4)"
        strokeWidth={strokeW + 6}
        lineCap="round"
        lineJoin="round"
        bezier={true}
        listening={false}
      />
      <Line
        points={[fromPos.x, fromPos.y, ctrlX, ctrlY, toPos.x, toPos.y]}
        stroke="#5eb0ff"
        strokeWidth={strokeW}
        lineCap="round"
        lineJoin="round"
        bezier={true}
        listening={false}
      />
    </>
  )
}

export default ConnectionLine
