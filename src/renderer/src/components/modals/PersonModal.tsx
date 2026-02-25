import React from 'react'
import { PersonObject } from '../../types'
import './PersonModal.css'

interface PersonModalProps {
  person: PersonObject
  onClose: () => void
}

function PersonModal({ person, onClose }: PersonModalProps): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content person-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Person Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="person-detail-photo">
            {person.profilePhoto ? (
              <img src={person.profilePhoto} alt={person.name} />
            ) : (
              <div className="person-detail-placeholder">{person.name.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="person-details">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{person.name}</span>
            </div>
            {person.age && (
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{person.age}</span>
              </div>
            )}
            {person.gender && (
              <div className="detail-row">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{person.gender}</span>
              </div>
            )}
            {person.maritalStatus && (
              <div className="detail-row">
                <span className="detail-label">Marital Status:</span>
                <span className="detail-value">{person.maritalStatus}</span>
              </div>
            )}
            {person.bloodType && (
              <div className="detail-row">
                <span className="detail-label">Blood Type:</span>
                <span className="detail-value">{person.bloodType}</span>
              </div>
            )}
            {person.jobTitle && (
              <div className="detail-row">
                <span className="detail-label">Job Title:</span>
                <span className="detail-value">{person.jobTitle}</span>
              </div>
            )}
            {person.physicalHeight && (
              <div className="detail-row">
                <span className="detail-label">Height:</span>
                <span className="detail-value">{person.physicalHeight}</span>
              </div>
            )}
            {person.physicalWeight && (
              <div className="detail-row">
                <span className="detail-label">Weight:</span>
                <span className="detail-value">{person.physicalWeight}</span>
              </div>
            )}
            {person.notes && (
              <div className="detail-row full-width">
                <span className="detail-label">Notes:</span>
                <div className="detail-value notes">{person.notes}</div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default PersonModal
