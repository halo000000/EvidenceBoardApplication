import React from 'react'
import './Launcher.css'

function Launcher(): React.JSX.Element {
  const handleCreateNew = (): void => {
    window.api.createNewBoard()
  }

  const handleOpenBoard = (): void => {
    window.api.openBoardFileDialog()
  }

  return (
    <div className="launcher">
      <div className="launcher-content">
        <h1 className="launcher-title">Evidence Board</h1>
        <p className="launcher-subtitle">Create visual connections between evidence</p>
        <div className="launcher-actions">
          <button className="launcher-button primary" onClick={handleCreateNew}>
            Create New Board
          </button>
          <button className="launcher-button secondary" onClick={handleOpenBoard}>
            Open Board
          </button>
        </div>
      </div>
    </div>
  )
}

export default Launcher
