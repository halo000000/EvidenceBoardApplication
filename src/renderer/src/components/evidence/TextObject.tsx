import React from 'react'
import BaseEvidenceObject from './BaseEvidenceObject'
import { TextObject as TextObjectType, EvidenceObject } from '../../types'
import './TextObject.css'

interface TextObjectProps {
  object: TextObjectType
  zoom: number
  onPositionChange: (id: string, position: { x: number; y: number }) => void
  onConnectionPointClick: (
    objectId: string,
    pointId: string,
    canvasPosition: { x: number; y: number }
  ) => void
  isLinking: boolean
  linkingObjectId: string | null
  onClick: (e: any) => void
  onRightClick: (e: React.MouseEvent | any, object: EvidenceObject) => void
}

function TextObject(props: TextObjectProps): React.JSX.Element {
  const { object, onClick } = props

  return (
    <BaseEvidenceObject {...props}>
      <div className="text-object" onClick={onClick}>
        <div className="text-object-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Note
        </div>
        <div className="text-content">{object.text || 'Empty note'}</div>
      </div>
    </BaseEvidenceObject>
  )
}

export default TextObject
