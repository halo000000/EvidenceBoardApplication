import React from 'react'
import BaseEvidenceObject from './BaseEvidenceObject'
import { PersonObject as PersonObjectType, EvidenceObject } from '../../types'
import './PersonObject.css'

interface PersonObjectProps {
  object: PersonObjectType
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

function PersonObject(props: PersonObjectProps): React.JSX.Element {
  const { object, onClick } = props

  return (
    <BaseEvidenceObject {...props}>
      <div className="person-object" onClick={onClick}>
        <div className="person-object-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Person
        </div>
        <div className="person-photo">
          {object.profilePhoto ? (
            <img src={object.profilePhoto} alt={object.name} />
          ) : (
            <div className="person-placeholder">{object.name.charAt(0).toUpperCase()}</div>
          )}
        </div>
        <div className="person-info">
          <div className="person-name">{object.name}</div>
          <div className="person-meta">
            {object.age != null && <div className="person-age">{object.age} years old</div>}
            {object.jobTitle && <div className="person-job">{object.jobTitle}</div>}
          </div>
        </div>
      </div>
    </BaseEvidenceObject>
  )
}

export default PersonObject
