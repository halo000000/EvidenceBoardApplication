import React from 'react'
import BaseEvidenceObject from './BaseEvidenceObject'
import { LocationObject as LocationObjectType, EvidenceObject } from '../../types'
import './LocationObject.css'

interface LocationObjectProps {
  object: LocationObjectType
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

function LocationObject(props: LocationObjectProps): React.JSX.Element {
  const { object } = props

  const handleMapClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    const url =
      object.googleMapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(object.address)}`
    window.api.openExternal(url)
  }

  return (
    <BaseEvidenceObject {...props}>
      <div className="location-object">
        <div className="location-icon">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"
              fill="#8b49fd"
            />
          </svg>
        </div>
        <div className="location-content">
          <div className="location-label">Location</div>
          <div className="location-address">{object.address}</div>
          <div className="location-link" onClick={handleMapClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open in Google Maps
          </div>
        </div>
      </div>
    </BaseEvidenceObject>
  )
}

export default LocationObject
