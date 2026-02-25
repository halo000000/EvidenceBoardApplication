import React from 'react'
import { InteractionMode } from '../types'
import './InteractionToolbar.css'

interface InteractionToolbarProps {
    mode: InteractionMode
    onModeChange: (mode: InteractionMode) => void
}

const InteractionToolbar: React.FC<InteractionToolbarProps> = ({
    mode,
    onModeChange
}) => {
    return (
        <div className="interaction-toolbar">
            <div className="toolbar-group">
                <button
                    className={`toolbar-button ${mode === 'manipulation' ? 'active' : ''}`}
                    onClick={() => onModeChange('manipulation')}
                    title="Selection Mode"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                        <path d="M13 13l6 6" />
                    </svg>
                </button>
                <button
                    className={`toolbar-button ${mode === 'standard' ? 'active' : ''}`}
                    onClick={() => onModeChange('standard')}
                    title="Pan Mode"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default InteractionToolbar
