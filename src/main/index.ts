import { app, shell, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFileSync, writeFileSync } from 'fs'
import JSZip from 'jszip'
import icon from '../../resources/icon.png?asset'

let launcherWindow: BrowserWindow | null = null
let workspaceWindow: BrowserWindow | null = null

// Store board data for windows that are being created
const windowDataMap = new Map<number, unknown>()

function createLauncherWindow(): void {
  launcherWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  launcherWindow.on('ready-to-show', () => {
    launcherWindow?.show()
  })

  launcherWindow.on('closed', () => {
    launcherWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    launcherWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#launcher`)
  } else {
    launcherWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'launcher' })
  }
}

function createWorkspaceWindow(boardData?: unknown): void {
  workspaceWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const webContentsId = workspaceWindow.webContents.id

  // Store data immediately if provided
  if (boardData) {
    windowDataMap.set(webContentsId, boardData)
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            workspaceWindow?.webContents.send('save-board')
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            workspaceWindow?.webContents.send('save-board-as')
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            workspaceWindow?.webContents.send('open-board')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  workspaceWindow.on('ready-to-show', () => {
    workspaceWindow?.show()
    if (launcherWindow) {
      launcherWindow.close()
    }
  })

  workspaceWindow.on('closed', () => {
    // Clean up stored data using captured ID
    windowDataMap.delete(webContentsId)
    workspaceWindow = null
  })

  workspaceWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = `${process.env['ELECTRON_RENDERER_URL']}#workspace`
    workspaceWindow.loadURL(url)
  } else {
    workspaceWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'workspace' })
  }
}

// IPC handlers
ipcMain.on('create-new-board', () => {
  createWorkspaceWindow()
})

ipcMain.on('open-board-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Evidence Board', extensions: ['zip'] }]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    try {
      const zipBuffer = readFileSync(filePath)
      const zip = await JSZip.loadAsync(zipBuffer)
      const boardDataJson = await zip.file('board.json')?.async('string')
      const images: Record<string, string> = {}

      if (boardDataJson) {
        const boardData = JSON.parse(boardDataJson)

        // Extract images from zip
        for (const [filename, file] of Object.entries(zip.files)) {
          if (filename.startsWith('images/') && !file.dir) {
            const imageBuffer = await file.async('nodebuffer')
            images[filename] = `data:image/png;base64,${imageBuffer.toString('base64')}`
          }
        }

        // Pass both data and filePath
        createWorkspaceWindow({ data: { ...boardData, images }, filePath })
      }
    } catch (error) {
      dialog.showErrorBox('Error', `Failed to load board: ${error}`)
    }
  }
})

ipcMain.on('save-board-file-dialog', async (_, { data, filePath }: { data: any; filePath?: string }) => {
  let savePath = filePath

  if (!savePath) {
    const result = await dialog.showSaveDialog({
      filters: [{ name: 'Evidence Board', extensions: ['zip'] }],
      defaultPath: 'board.zip'
    })
    
    if (result.canceled || !result.filePath) return
    savePath = result.filePath
  }

  try {
    const zip = new JSZip()
    const { images, ...dataToSave } = data

    zip.file('board.json', JSON.stringify(dataToSave, null, 2))

    // Save images to zip
    if (images) {
      for (const [id, imageData] of Object.entries(images as Record<string, string>)) {
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
          const base64Data = imageData.split(',')[1]
          const imageBuffer = Buffer.from(base64Data, 'base64')
          zip.file(`images/${id}.png`, imageBuffer)
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    writeFileSync(savePath, zipBuffer)
    
    // Notify renderer that save was successful, passing back the path
    if (workspaceWindow && !workspaceWindow.isDestroyed()) {
      workspaceWindow.webContents.send('board-saved', savePath)
    }
  } catch (error) {
    dialog.showErrorBox('Error', `Failed to save board: ${error}`)
  }
})

ipcMain.handle('select-image-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const imagePath = result.filePaths[0]
    const imageBuffer = readFileSync(imagePath)
    return `data:image/png;base64,${imageBuffer.toString('base64')}`
  }
  return null
})

ipcMain.on('open-external', (_, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle('get-current-board-data', (event) => {
  const windowId = event.sender.id
  if (windowDataMap.has(windowId)) {
    return windowDataMap.get(windowId)
  }
  return null
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createLauncherWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createLauncherWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
