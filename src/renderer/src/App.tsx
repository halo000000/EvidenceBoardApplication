import React, { useEffect, useState } from 'react'
import Launcher from './components/Launcher'
import Workspace from './components/Workspace'

function App(): React.JSX.Element {
  const [view, setView] = useState<'launcher' | 'workspace'>(() => {
    const hash = window.location.hash.replace('#', '')
    return hash === 'workspace' ? 'workspace' : 'launcher'
  })

  useEffect(() => {
    const handleHashChange = (): void => {
      const newHash = window.location.hash.replace('#', '')
      setView(newHash === 'workspace' ? 'workspace' : 'launcher')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (view === 'workspace') {
    return <Workspace />
  }

  return <Launcher />
}

export default App
