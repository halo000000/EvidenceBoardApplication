import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  createNewBoard: () => ipcRenderer.send('create-new-board'),
  getBoardData: () => ipcRenderer.invoke('get-current-board-data'),
  openBoardFileDialog: () => ipcRenderer.send('open-board-file-dialog'),
  saveBoardFileDialog: (data: unknown, filePath?: string) => 
    ipcRenderer.send('save-board-file-dialog', { data, filePath }),
  selectImageFile: () => ipcRenderer.invoke('select-image-file'),
  onSaveBoard: (callback: () => void) => {
    ipcRenderer.on('save-board', () => callback())
  },
  onSaveBoardAs: (callback: () => void) => {
    ipcRenderer.on('save-board-as', () => callback())
  },
  onBoardSaved: (callback: (path: string) => void) => {
    ipcRenderer.on('board-saved', (_, path) => callback(path))
  },
  onOpenBoard: (callback: () => void) => {
    ipcRenderer.on('open-board', () => callback())
  },
  onLoadBoardData: (callback: (data: unknown) => void) => {
    ipcRenderer.on('load-board-data', (_, data) => callback(data))
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
  openExternal: (url: string) => ipcRenderer.send('open-external', url)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
