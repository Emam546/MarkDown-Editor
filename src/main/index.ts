import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  getHomeDir,
  getInfoFileName,
  getMarkNotes as getMarkNotes,
  getNoteData,
  createNoteData,
  writeNoteData,
  deleteNoteData,
  OpenFolder,
  OpenFile,
  SaveState
} from './lib'
import { NotesState } from '@shared/models'

// Create the browser window.
let mainWindow: BrowserWindow | undefined
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    title: 'NotePad',
    // titleBarStyle: 'hidden',

    // vibrancy: 'under-window',
    // visualEffectState: 'active',
    // trafficLightPosition: { x: 15, y: 10 },

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.webContents.on('did-finish-load', () => {
    sendArgs(process.argv)
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.handle('readFolder', (_, homeDir: string) => getMarkNotes(homeDir))
  ipcMain.handle('readNote', (_, fileName: string) => getInfoFileName(fileName))
  ipcMain.handle('getNoteData', (_, path: string) => getNoteData(path))
  ipcMain.handle(
    'createNoteData',
    async (_, path: string, data: string) => await createNoteData(path, data)
  )
  ipcMain.handle('writeNoteData', (_, path: string, data: string) => writeNoteData(path, data))
  ipcMain.handle('deleteNoteData', (_, path: string) => deleteNoteData(path))
  ipcMain.handle('getHomeDir', () => getHomeDir())
  ipcMain.handle('openDirectory', (_, defaultPath: string) => OpenFolder(defaultPath))
  ipcMain.handle('openFile', (_, defaultPath: string) => OpenFile(defaultPath))
  ipcMain.on('saveState', (_, state: NotesState) => SaveState(state))
  ipcMain.on('log', (_, ...args) => console.log(...args))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// Behaviour on the second instance for the parent process
const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) app.quit()
else
  app.on('second-instance', (_, argv) => {
    //User requested a second instance of the app.
    //argv has the process.argv arguments of the second instance.
    if (app.hasSingleInstanceLock() && argv.length >= 2) {
      sendArgs(argv)
      if (mainWindow?.isMinimized()) mainWindow.restore()
      mainWindow?.focus()
    }
  })

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
function sendArgs(argv: string[]): void {
  if (process.platform.startsWith('win') && argv.length >= 2) {
    const path = argv.find((path) => path.includes('.md'))
    if (path) mainWindow?.webContents.send('open-file', path)
  }
}
app.on('ready', () => {
  sendArgs(process.argv)
})
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
