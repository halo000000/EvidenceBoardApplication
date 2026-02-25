import { useState } from 'react'
import React from 'react'
import './ImageLightbox.css'

interface ImageLightboxProps {
  image: string
  onClose: () => void
}

function ImageLightbox({ image, onClose }: ImageLightboxProps): React.JSX.Element {
  const [zoom, setZoom] = useState(1)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.5, Math.min(5, prev * delta)))
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          ×
        </button>
        <div className="lightbox-image-container" onWheel={handleWheel}>
          <img
            src={image}
            alt="Evidence"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s' }}
          />
        </div>
        <div className="lightbox-controls">
          <button onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.25))}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((prev) => Math.min(5, prev + 0.25))}>+</button>
          <button onClick={() => setZoom(1)}>Reset</button>
        </div>
      </div>
    </div>
  )
}

export default ImageLightbox
