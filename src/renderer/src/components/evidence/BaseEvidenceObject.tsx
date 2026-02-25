import React from 'react'
import { Group, Circle, Rect } from 'react-konva'
import { Html } from 'react-konva-utils'
import { EvidenceObject, Position, ConnectionPoint } from '../../types'
import './BaseEvidenceObject.css'

interface BaseEvidenceObjectProps {
  object: EvidenceObject
  zoom: number
  onPositionChange: (id: string, position: Position) => void
  onConnectionPointClick: (objectId: string, pointId: string, canvasPosition: Position) => void
  isLinking: boolean
  linkingObjectId: string | null
  children: React.ReactNode
  onRightClick: (e: React.MouseEvent | any, object: EvidenceObject) => void
  isSelected?: boolean
  interactionMode?: string
  onClick?: (e: any) => void
  onResize?: (id: string, width: number, height: number) => void
}

function BaseEvidenceObject({
  object,
  zoom,
  onPositionChange,
  onConnectionPointClick,
  isLinking,
  linkingObjectId,
  children,
  onRightClick,
  isSelected,
  interactionMode,
  onClick,
  onResize
}: BaseEvidenceObjectProps): React.JSX.Element {
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (!contentRef.current || !onResize) return

    const measure = () => {
      const element = contentRef.current
      if (!element) return

      // Measure the actual content dimensions.
      const newWidth = element.scrollWidth
      const newHeight = element.scrollHeight
      const currentWidth = object.width
      const currentHeight = object.height

      if (Math.abs(newHeight - currentHeight) > 1 || Math.abs(newWidth - currentWidth) > 1) {
        onResize(object.id, newWidth, newHeight)
      }
    }

    // Initial measurement
    measure()

    // We can also use ResizeObserver for more robust updates
    const observer = new ResizeObserver(() => {
      measure()
    })

    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [object.id, object.width, object.height, onResize])

  const getConnectionPoints = (): ConnectionPoint[] => {
    const w = object.width || 0
    const h = object.height || 0
    return [
      { id: 'top', x: w / 2, y: 0 },
      { id: 'right', x: w, y: h / 2 },
      { id: 'bottom', x: w / 2, y: h },
      { id: 'left', x: 0, y: h / 2 }
    ]
  }

  const handleContextMenu = (e: any): void => {
    if (e.evt) {
      e.evt.preventDefault()
      e.evt.stopPropagation()
    } else {
      e.preventDefault()
      e.stopPropagation()
    }
    onRightClick(e, object)
  }

  const handleConnectionPointMouseDown = (
    e: any,
    pointId: string,
    point: ConnectionPoint
  ): void => {
    e.cancelBubble = true // Stop propagation in Konva
    const canvasPosition: Position = {
      x: object.position.x + point.x,
      y: object.position.y + point.y
    }
    onConnectionPointClick(object.id, pointId, canvasPosition)
  }

  const connectionPoints = getConnectionPoints()
  const isHighlighted = linkingObjectId === object.id

  return (
    <Group
      x={object.position.x}
      y={object.position.y}
      draggable
      onDragMove={(e) => {
        onPositionChange(object.id, { x: e.target.x(), y: e.target.y() })
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={object.width}
          height={object.height}
          stroke="#7c3aed"
          strokeWidth={3 / zoom}
          dash={[5, 5]}
          cornerRadius={4}
        />
      )}

      {/* HTML Content */}
      <Html
        divProps={{
          className: `evidence-object-container ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`,
          style: {
            width: 'fit-content',
            height: 'fit-content',
            minWidth: `${object.width}px`,
            minHeight: `${object.height}px`,
            pointerEvents: 'none',
            userSelect: 'none'
          }
        }}
      >
        <div
          ref={contentRef}
          className="evidence-object-html-inner"
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRightClick?.(e, object)
          }}
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: interactionMode === 'manipulation' ? 'none' : 'auto'
          }}
        >
          {children}
        </div>
      </Html>

      {/* Hit area for selection and dragging. 
          In manipulation mode, we put this on top to catch events. */}
      <Rect
        width={object.width}
        height={object.height}
        fill="rgba(0,0,0,0)"
        onContextMenu={handleContextMenu}
        onClick={onClick}
        // If in manipulation mode, it will naturally be on top of the Html since it's declared after
        // We only enable it for clicking/dragging if it's on top.
        // Konva's 'draggable' on the Group will work if this Rect receives the mousedown.
        listening={true}
      />

      {/* Connection Points */}
      {connectionPoints.map((point) => (
        <Circle
          key={point.id}
          x={point.x}
          y={point.y}
          radius={5 / zoom}
          fill={isLinking ? '#ff4a4a' : '#4a9eff'}
          stroke="white"
          strokeWidth={1 / zoom}
          className="connection-point-konva"
          onMouseDown={(e) => handleConnectionPointMouseDown(e, point.id, point)}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) container.style.cursor = 'crosshair'
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) container.style.cursor = 'default'
          }}
        />
      ))}
    </Group>
  )
}

export default BaseEvidenceObject
