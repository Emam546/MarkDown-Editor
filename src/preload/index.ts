import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { getHomeDir, ReadSaveState } from '@lib/index'

// Custom APIs for renderer
const api: Api = {
  readNote: (fileName: string) => ipcRenderer.invoke('readNote', fileName),
  readFolder: (fileName: string) => ipcRenderer.invoke('readFolder', fileName),
  getHomeDir: () => ipcRenderer.invoke('getHomeDir'),
  deleteNoteData: (path: string) => ipcRenderer.invoke('deleteNoteData', path),
  getNoteData: (path: string) => ipcRenderer.invoke('getNoteData', path),
  log(...args) {
    ipcRenderer.send('log', ...args)
  },
  async createNoteData(path, content) {
    return await ipcRenderer.invoke('createNoteData', path, content)
  },
  async writeNoteData(path, content) {
    return await ipcRenderer.invoke('writeNoteData', path, content)
  },
  async openDirectory(defaultPath) {
    return await ipcRenderer.invoke('openDirectory', defaultPath)
  },
  async openFile(defaultPath) {
    return await ipcRenderer.invoke('openFile', defaultPath)
  },
  saveState(state) {
    return ipcRenderer.send('saveState', state)
  },
  on(channel, listener) {
    return ipcRenderer.on(channel, (_, ...args) =>
      (listener as unknown as (...args: unknown[]) => unknown)(...args)
    )
  }
}
const context: Window['context'] = {
  locale: navigator.language,
  homeDir: getHomeDir(),
  state: ReadSaveState()
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('context', context)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.context = context
}
