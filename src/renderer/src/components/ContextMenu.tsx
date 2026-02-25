import './ContextMenu.css'

interface ContextMenuItem {
  id: string
  label: string
  className?: string
}

interface ContextMenuProps {
  x: number
  y: number
  items?: ContextMenuItem[]
  onAction: (action: string) => void
  onClose: () => void
}

function ContextMenu({ x, y, items, onAction, onClose }: ContextMenuProps): React.JSX.Element {
  const defaultItems: ContextMenuItem[] = [
    { id: 'add-image', label: 'Add Image' },
    { id: 'add-text', label: 'Add Text' },
    { id: 'add-person', label: 'Add Person' },
    { id: 'add-location', label: 'Add Location' }
  ]

  const menuItems = items || defaultItems

  return (
    <>
      <div className="context-menu-overlay" onClick={onClose} />
      <div
        className="context-menu"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`context-menu-item ${item.className || ''}`}
            onClick={() => {
              onAction(item.id)
              onClose()
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </>
  )
}

export default ContextMenu
