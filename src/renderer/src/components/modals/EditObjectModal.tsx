import React, { useState } from 'react'
import { EvidenceObject, ImageObject, TextObject, PersonObject, LocationObject } from '../../types'
import './EditObjectModal.css'

interface EditObjectModalProps {
  object: EvidenceObject
  onSave: (object: EvidenceObject) => void
  onClose: () => void
}

function EditObjectModal({ object, onSave, onClose }: EditObjectModalProps): React.JSX.Element {
  const [editedObject, setEditedObject] = useState<EvidenceObject>(object)

  const handleSelectImage = async (): Promise<void> => {
    const imageData = await window.api.selectImageFile()
    if (imageData) {
      if (editedObject.type === 'image') {
        setEditedObject({ ...editedObject, imageData } as ImageObject)
      } else if (editedObject.type === 'person') {
        setEditedObject({ ...editedObject, profilePhoto: imageData } as PersonObject)
      }
    }
  }

  const handleSave = (): void => {
    onSave(editedObject)
    onClose()
  }

  const renderForm = (): React.JSX.Element | null => {
    switch (editedObject.type) {
      case 'image': {
        const imgObj = editedObject as ImageObject
        return (
          <>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={imgObj.title || ''}
                onChange={(e) => setEditedObject({ ...imgObj, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              {imgObj.imageData && (
                <img src={imgObj.imageData} alt="Preview" className="image-preview" />
              )}
              <button type="button" onClick={handleSelectImage}>
                Select Image
              </button>
            </div>
          </>
        )
      }

      case 'text': {
        const textObj = editedObject as TextObject
        return (
          <div className="form-group">
            <label>Text</label>
            <textarea
              value={textObj.text}
              onChange={(e) => setEditedObject({ ...textObj, text: e.target.value })}
              rows={6}
            />
          </div>
        )
      }

      case 'person': {
        const personObj = editedObject as PersonObject
        return (
          <div className="edit-modal-person-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={personObj.name}
                onChange={(e) => setEditedObject({ ...personObj, name: e.target.value })}
              />
            </div>
            <div className="form-group form-group-full">
              <label>Profile Photo</label>
              {personObj.profilePhoto && (
                <img src={personObj.profilePhoto} alt="Preview" className="image-preview" />
              )}
              <button type="button" onClick={handleSelectImage}>
                Select Photo
              </button>
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={personObj.age || ''}
                onChange={(e) =>
                  setEditedObject({ ...personObj, age: parseInt(e.target.value) || undefined })
                }
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={personObj.gender || ''}
                onChange={(e) => {
                  const val = e.target.value
                  setEditedObject({ ...personObj, gender: val || undefined })
                }}
              >
                <option value="">— Select —</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div className="form-group">
              <label>Marital Status</label>
              <select
                value={personObj.maritalStatus || ''}
                onChange={(e) => {
                  const val = e.target.value
                  setEditedObject({ ...personObj, maritalStatus: val || undefined })
                }}
              >
                <option value="">— Select —</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="In a relationship">In a relationship</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Type</label>
              <select
                value={personObj.bloodType || ''}
                onChange={(e) => {
                  const val = e.target.value
                  setEditedObject({ ...personObj, bloodType: val || undefined })
                }}
              >
                <option value="">— Select —</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={personObj.jobTitle || ''}
                onChange={(e) =>
                  setEditedObject({ ...personObj, jobTitle: e.target.value || undefined })
                }
              />
            </div>
            <div className="form-group">
              <label>Height</label>
              <input
                type="text"
                value={personObj.physicalHeight || ''}
                onChange={(e) =>
                  setEditedObject({ ...personObj, physicalHeight: e.target.value || undefined })
                }
              />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input
                type="text"
                value={personObj.physicalWeight || ''}
                onChange={(e) =>
                  setEditedObject({ ...personObj, physicalWeight: e.target.value || undefined })
                }
              />
            </div>
            <div className="form-group form-group-full">
              <label>Notes</label>
              <textarea
                value={personObj.notes || ''}
                onChange={(e) =>
                  setEditedObject({ ...personObj, notes: e.target.value || undefined })
                }
                rows={3}
              />
            </div>
          </div>
        )
      }

      case 'location': {
        const locationObj = editedObject as LocationObject
        return (
          <>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={locationObj.address}
                onChange={(e) => setEditedObject({ ...locationObj, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Google Maps URL (optional)</label>
              <input
                type="text"
                value={locationObj.googleMapsUrl || ''}
                onChange={(e) =>
                  setEditedObject({ ...locationObj, googleMapsUrl: e.target.value || undefined })
                }
              />
            </div>
          </>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit {object.type.charAt(0).toUpperCase() + object.type.slice(1)}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{renderForm()}</div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditObjectModal
