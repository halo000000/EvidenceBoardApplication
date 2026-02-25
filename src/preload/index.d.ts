import { ElectronAPI } from '@electron-toolkit/preload'

export interface EvidenceBoardAPI {
  createNewBoard: () => void
  getBoardData: () => Promise<unknown>
  openBoardFileDialog: () => void
  saveBoardFileDialog: (data: unknown, filePath?: string) => void
  selectImageFile: () => Promise<string | null>
  onSaveBoard: (callback: () => void) => void
  onSaveBoardAs: (callback: () => void) => void
  onBoardSaved: (callback: (path: string) => void) => void
  onOpenBoard: (callback: () => void) => void
  onLoadBoardData: (callback: (data: unknown) => void) => void
  removeAllListeners: (channel: string) => void
  openExternal: (url: string) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: EvidenceBoardAPI
  }
}
