import React from 'react'
import BaseEvidenceObject from './BaseEvidenceObject'
import { ImageObject as ImageObjectType, EvidenceObject } from '../../types'
import './ImageObject.css'

interface ImageObjectProps {
  object: ImageObjectType
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

function ImageObject(props: ImageObjectProps): React.JSX.Element {
  const { object, onClick } = props

  return (
    <BaseEvidenceObject {...props}>
      <div className="image-object" onClick={onClick}>
        <div className="image-object-inner">
          <img src={object.imageData} alt={object.title || 'Evidence Image'} />
          <div className="image-object-overlay">
            <span>View</span>
          </div>
        </div>
        {object.title && <div className="image-title">{object.title}</div>}
      </div>
    </BaseEvidenceObject>
  )
}

export default ImageObject
