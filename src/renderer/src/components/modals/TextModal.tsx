import React from 'react'
import './TextModal.css'

interface TextModalProps {
  text: string
  onClose: () => void
}

function TextModal({ text, onClose }: TextModalProps): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content text-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Text Note</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div
            className="text-content"
            onDoubleClick={(e) => {
              const selection = window.getSelection()
              const range = document.createRange()
              range.selectNodeContents(e.currentTarget)
              selection?.removeAllRanges()
              selection?.addRange(range)
            }}
          >
            {text}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default TextModal
