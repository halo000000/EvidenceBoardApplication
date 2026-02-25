import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import { BoardState, EvidenceObject, Connection, Position, EvidenceObjectType, InteractionMode } from '../types'
import ImageObject from './evidence/ImageObject'
import TextObject from './evidence/TextObject'
import PersonObject from './evidence/PersonObject'
import LocationObject from './evidence/LocationObject'
import ConnectionLinesOverlay from './ConnectionLinesOverlay'
import ContextMenu from './ContextMenu'
import ZoomSlider from './ZoomSlider'
import ImageLightbox from './modals/ImageLightbox'
import TextModal from './modals/TextModal'
import PersonModal from './modals/PersonModal'
import EditObjectModal from './modals/EditObjectModal'
import InteractionToolbar from './InteractionToolbar'
import './Workspace.css'

function Workspace(): React.JSX.Element {
  const [boardState, setBoardState] = useState<BoardState>({
    objects: [],
    connections: [],
    images: {}
  })

  const [pan, setPan] = useState<Position>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    items?: { id: string; label: string; className?: string }[]
    data?: any
  } | null>(null)
  const [linkingState, setLinkingState] = useState<{
    fromObjectId: string
    fromPointId: string
  } | null>(null)
  const [previewLineEnd, setPreviewLineEnd] = useState<Position | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [textModal, setTextModal] = useState<string | null>(null)
  const [personModal, setPersonModal] = useState<string | null>(null)
  const [editingObject, setEditingObject] = useState<EvidenceObject | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)

  const [interactionMode, setInteractionMode] = useState<InteractionMode>('standard')
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([])
  const [selectionBox, setSelectionBox] = useState<{ start: Position; end: Position } | null>(null)

  const boardStateRef = useRef(boardState)
  const currentFilePathRef = useRef(currentFilePath)

  useEffect(() => {
    boardStateRef.current = boardState
  }, [boardState])

  useEffect(() => {
    currentFilePathRef.current = currentFilePath
  }, [currentFilePath])

  useEffect(() => {
    console.log('Workspace mounted', window.api)

    if (!window.api) {
      console.error('window.api is not defined!')
      return
    }

    const handleSaveBoard = () => {
      window.api.saveBoardFileDialog(boardStateRef.current, currentFilePathRef.current || undefined)
    }

    const handleSaveBoardAs = () => {
      window.api.saveBoardFileDialog(boardStateRef.current)
    }

    const handleBoardSaved = (path: string) => {
      setCurrentFilePath(path)
    }

    const handleOpenBoard = () => {
      window.api.openBoardFileDialog()
    }

    window.api.onSaveBoard(handleSaveBoard)

    if (window.api.onSaveBoardAs) {
      window.api.onSaveBoardAs(handleSaveBoardAs)
    }

    if (window.api.onBoardSaved) {
      window.api.onBoardSaved(handleBoardSaved)
    }

    window.api.onOpenBoard(handleOpenBoard)

    window.api.getBoardData().then((result: any) => {
      if (result) {
        const data = result.data || result
        const filePath = result.filePath

        setBoardState(data as BoardState)
        if (filePath) {
          setCurrentFilePath(filePath)
        }
      }
    })

    return () => {
      window.api.removeAllListeners('save-board')
      window.api.removeAllListeners('save-board-as')
      window.api.removeAllListeners('board-saved')
      window.api.removeAllListeners('open-board')
    }
  }, [])

  const stageRef = useRef<any>(null)

  const getConnectionPointPosition = useCallback((object: EvidenceObject, pointId: string): Position => {
    const w = object.width || 0
    const h = object.height || 0
    let x = w / 2
    let y = h / 2
    switch (pointId) {
      case 'top': x = w / 2; y = 0; break
      case 'right': x = w; y = h / 2; break
      case 'bottom': x = w / 2; y = h; break
      case 'left': x = 0; y = h / 2; break
    }
    return { x: object.position.x + x, y: object.position.y + y }
  }, [])

  const getRelativePointerPosition = (stage: any): Position => {
    const transform = stage.getAbsoluteTransform().copy()
    transform.invert()
    const pos = stage.getPointerPosition()
    return transform.point(pos)
  }

  const handleMouseDown = useCallback(
    (e: any) => {
      if (interactionMode === 'manipulation' && e.target === e.target.getStage()) {
        const stage = e.target.getStage()
        const pos = getRelativePointerPosition(stage)
        setSelectionBox({ start: pos, end: pos })
        setSelectedObjectIds([])
      }
    },
    [interactionMode]
  )

  const handleMouseMove = useCallback(
    (e: any) => {
      const stage = e.target.getStage()
      const pos = getRelativePointerPosition(stage)
      if (linkingState) {
        setPreviewLineEnd(pos)
      }
      if (selectionBox) {
        setSelectionBox((prev) => (prev ? { ...prev, end: pos } : null))
      }
    },
    [linkingState, selectionBox, getRelativePointerPosition]
  )

  const handleMouseUp = useCallback(() => {
    if (selectionBox) {
      const x1 = Math.min(selectionBox.start.x, selectionBox.end.x)
      const y1 = Math.min(selectionBox.start.y, selectionBox.end.y)
      const x2 = Math.max(selectionBox.start.x, selectionBox.end.x)
      const y2 = Math.max(selectionBox.start.y, selectionBox.end.y)

      const selected = boardState.objects
        .filter((obj) => {
          return (
            obj.position.x >= x1 &&
            obj.position.x + obj.width <= x2 &&
            obj.position.y >= y1 &&
            obj.position.y + obj.height <= y2
          )
        })
        .map((o) => o.id)

      setSelectedObjectIds(selected)
      setSelectionBox(null)
    }
  }, [selectionBox, boardState.objects])

  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedObjectIds([])
    }
  }, [])

  const handleContextMenu = useCallback(
    (e: any) => {
      const originalEvent = e.evt || e
      originalEvent.preventDefault()
      originalEvent.stopPropagation()

      const stage = stageRef.current
      if (!stage) return

      const pointer = stage.getPointerPosition()

      if (pointer) {
        // Convert screen coordinates to world coordinates
        const x = (pointer.x - stage.x()) / zoom
        const y = (pointer.y - stage.y()) / zoom

        setContextMenu({
          x,
          y,
          items: [
            { id: 'add-text', label: 'Add Text Note' },
            { id: 'add-person', label: 'Add Person' },
            { id: 'add-location', label: 'Add Location' },
            { id: 'add-image', label: 'Add Image' }
          ]
        })
      }
    },
    [zoom]
  )

  const handleObjectContextMenu = useCallback(
    (e: any, object: EvidenceObject) => {
      const originalEvent = e.evt || e
      originalEvent.preventDefault()
      originalEvent.stopPropagation()

      const stage = stageRef.current
      if (!stage) return

      const pointer = stage.getPointerPosition()

      if (pointer) {
        const x = (pointer.x - stage.x()) / zoom
        const y = (pointer.y - stage.y()) / zoom

        setContextMenu({
          x,
          y,
          items: [
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete', className: 'danger' }
          ],
          data: object
        })
      }
    },
    [zoom]
  )

  const handleWheel = useCallback(
    (e: any) => {
      e.evt.preventDefault()
      const scaleBy = 1.05
      const stage = e.target.getStage()
      const oldScale = zoom
      const pointer = stage.getPointerPosition()

      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale
      }

      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
      const clampedScale = Math.max(0.25, Math.min(3, newScale))

      setZoom(clampedScale)

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale
      }
      setPan(newPos)
    },
    [zoom]
  )

  const addObject = useCallback(async (type: EvidenceObjectType, position: Position) => {
    const id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    let newObject: EvidenceObject | null = null

    switch (type) {
      case 'image': {
        const imageData = await window.api.selectImageFile()
        if (imageData) {
          newObject = {
            id,
            type: 'image',
            position,
            width: 200,
            height: 200,
            imageData
          }
          setBoardState((prev) => ({
            ...prev,
            objects: [...prev.objects, newObject!],
            images: { ...prev.images, [id]: imageData }
          }))
        }
        return
      }
      case 'text':
        newObject = {
          id,
          type: 'text',
          position,
          width: 200,
          height: 100,
          text: 'New Note'
        }
        break
      case 'person':
        newObject = {
          id,
          type: 'person',
          position,
          width: 250,
          height: 300,
          name: 'New Person'
        }
        break
      case 'location':
        newObject = {
          id,
          type: 'location',
          position,
          width: 250,
          height: 100,
          address: 'New Location'
        }
        break
    }

    if (newObject) {
      setBoardState((prev) => ({
        ...prev,
        objects: [...prev.objects, newObject!]
      }))
      setEditingObject(newObject)
    }
  }, [setBoardState, setEditingObject])

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu) return

    if (action === 'edit' && contextMenu.data) {
      setEditingObject(contextMenu.data)
    } else if (action === 'delete' && contextMenu.data) {
      deleteObject(contextMenu.data.id)
    } else if (action.startsWith('add-')) {
      const type = action.replace('add-', '') as EvidenceObjectType
      addObject(type, { x: contextMenu.x, y: contextMenu.y })
    }
    setContextMenu(null)
  }

  const updateObjectPosition = useCallback(
    (id: string, newPos: Position) => {
      setBoardState((prev) => {
        const movedObj = prev.objects.find((o) => o.id === id)
        if (!movedObj) return prev

        const dx = newPos.x - movedObj.position.x
        const dy = newPos.y - movedObj.position.y

        if (selectedObjectIds.includes(id) && selectedObjectIds.length > 1) {
          return {
            ...prev,
            objects: prev.objects.map((obj) =>
              selectedObjectIds.includes(obj.id)
                ? { ...obj, position: { x: obj.position.x + dx, y: obj.position.y + dy } }
                : obj
            )
          }
        }

        return {
          ...prev,
          objects: prev.objects.map((obj) => (obj.id === id ? { ...obj, position: newPos } : obj))
        }
      })
    },
    [selectedObjectIds, setBoardState]
  )

  const updateObjectDimensions = useCallback(
    (id: string, width: number, height: number) => {
      setBoardState((prev) => ({
        ...prev,
        objects: prev.objects.map((obj) => (obj.id === id ? { ...obj, width, height } : obj))
      }))
    },
    [setBoardState]
  )

  const deleteObject = useCallback(
    (id: string) => {
      setBoardState((prev) => ({
        ...prev,
        objects: prev.objects.filter((obj) => obj.id !== id),
        connections: prev.connections.filter(
          (conn) => conn.fromObjectId !== id && conn.toObjectId !== id
        )
      }))
    },
    [setBoardState]
  )

  const handleConnectionPointClick = useCallback(
    (objectId: string, pointId: string, _: Position) => {
      if (linkingState) {
        if (linkingState.fromObjectId !== objectId || linkingState.fromPointId !== pointId) {
          const connId = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          const newConnection: Connection = {
            id: connId,
            fromObjectId: linkingState.fromObjectId,
            fromPointId: linkingState.fromPointId,
            toObjectId: objectId,
            toPointId: pointId
          }
          setBoardState((prev) => ({
            ...prev,
            connections: [...prev.connections, newConnection]
          }))
        }
        setLinkingState(null)
        setPreviewLineEnd(null)
      } else {
        setLinkingState({ fromObjectId: objectId, fromPointId: pointId })
      }
    },
    [linkingState, setBoardState, setLinkingState]
  )

  useEffect(() => {
    if (!linkingState) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'Space') {
        e.preventDefault()
        setLinkingState(null)
        setPreviewLineEnd(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [linkingState])

  const renderObject = (obj: EvidenceObject) => {
    const commonProps = {
      object: obj,
      zoom,
      onPositionChange: updateObjectPosition,
      onConnectionPointClick: handleConnectionPointClick,
      isLinking: !!linkingState,
      linkingObjectId: linkingState?.fromObjectId || null,
      onRightClick: (e: any) => handleObjectContextMenu(e, obj),
      isSelected: selectedObjectIds.includes(obj.id),
      interactionMode,
      onResize: (id: string, w: number, h: number) => updateObjectDimensions(id, w, h),
      onClick: (e: any) => {
        if (interactionMode === 'manipulation') {
          if (e.evt && e.evt.shiftKey) {
            setSelectedObjectIds((prev) =>
              prev.includes(obj.id) ? prev.filter((id) => id !== obj.id) : [...prev, obj.id]
            )
          } else {
            setSelectedObjectIds([obj.id])
          }
        }
      }
    }

    switch (obj.type) {
      case 'image':
        return (
          <ImageObject
            key={obj.id}
            {...commonProps}
            object={obj}
            onClick={(e: any) => {
              if (interactionMode === 'standard') setLightboxImage(obj.imageData)
              else commonProps.onClick(e)
            }}
          />
        )
      case 'text':
        return (
          <TextObject
            key={obj.id}
            {...commonProps}
            object={obj}
            onClick={(e: any) => {
              if (interactionMode === 'standard') setTextModal(obj.text)
              else commonProps.onClick(e)
            }}
          />
        )
      case 'person':
        return (
          <PersonObject
            key={obj.id}
            {...commonProps}
            object={obj}
            onClick={(e: any) => {
              if (interactionMode === 'standard') setPersonModal(obj.id)
              else commonProps.onClick(e)
            }}
          />
        )
      case 'location':
        return (
          <LocationObject
            key={obj.id}
            {...commonProps}
            object={obj}
            onClick={(e: any) => {
              if (interactionMode === 'manipulation') commonProps.onClick(e)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="workspace" ref={containerRef}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable={interactionMode === 'standard'}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setPan({ x: e.target.x(), y: e.target.y() })
          }
        }}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
        className="workspace-canvas"
        style={{
          cursor: linkingState ? 'crosshair' : interactionMode === 'standard' ? 'grab' : 'default'
        }}
      >
        <Layer>
          {boardState.objects.map(renderObject)}
          {selectionBox && (
            <Rect
              x={Math.min(selectionBox.start.x, selectionBox.end.x)}
              y={Math.min(selectionBox.start.y, selectionBox.end.y)}
              width={Math.abs(selectionBox.end.x - selectionBox.start.x)}
              height={Math.abs(selectionBox.end.y - selectionBox.start.y)}
              fill="rgba(124, 58, 237, 0.1)"
              stroke="#7c3aed"
              strokeWidth={1 / zoom}
            />
          )}
        </Layer>
      </Stage>

      {/* Connection lines drawn in SVG overlay so they appear above card HTML */}
      <ConnectionLinesOverlay
        connections={boardState.connections}
        objects={boardState.objects}
        zoom={zoom}
        pan={pan}
        linkingState={linkingState}
        previewLineEnd={previewLineEnd}
        getConnectionPointPosition={getConnectionPointPosition}
      />

      <InteractionToolbar mode={interactionMode} onModeChange={setInteractionMode} />

      {linkingState && (
        <div className="workspace-linking-hint">
          Click another connection point to link · <kbd>Esc</kbd> or <kbd>Space</kbd> to cancel
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x * zoom + pan.x}
          y={contextMenu.y * zoom + pan.y}
          items={contextMenu.items}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ZoomSlider value={zoom} onChange={(z) => {
        setZoom(z)
      }} />

      {lightboxImage && (
        <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
      {textModal !== null && <TextModal text={textModal} onClose={() => setTextModal(null)} />}
      {personModal && (
        (() => {
          const person = boardState.objects.find((o) => o.id === personModal)
          return person ? (
            <PersonModal person={person as any} onClose={() => setPersonModal(null)} />
          ) : null
        })()
      )}
      {editingObject && (
        <EditObjectModal
          object={editingObject}
          onSave={(updated) => {
            setBoardState((prev) => ({
              ...prev,
              objects: prev.objects.map((obj) => (obj.id === updated.id ? updated : obj))
            }))
            setEditingObject(null)
          }}
          onClose={() => setEditingObject(null)}
        />
      )}
    </div>
  )
}

export default Workspace
