/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { ElectronAPI } from '@electron-toolkit/preload'
export interface NoteType {
  id: string
  title: string
  lastModified: number
  path: string
}
export type NoteContent = string
export interface NotesState {
  active?: NoteType['id']
  notes: Array<NoteType>
}
declare global {
  namespace Api {
    interface Events {
      ['open-file']: (path: string) => unknown
    }
  }
  interface Api {
    readNote: (fileName: string) => Promise<NoteType>
    getNoteData: (path: string) => Promise<string>
    readFolder: (fileName: string) => Promise<NoteType[]>
    getHomeDir: () => Promise<string>
    createNoteData: (path: string, content: string) => Promise<NoteType | null>
    writeNoteData: (path: string, content: string) => Promise<void>
    deleteNoteData: (path: string) => Promise<void>
    openDirectory: (defaultPath: string) => Promise<string[] | null>
    openFile: (defaultPath: string) => Promise<string[] | null>
    log: (...args: unknown[]) => void
    saveState: (state: NotesState) => void
    on: <Key extends keyof Api.Events>(channel: Key, listener: Api.Events[Key]) => void
  }
  interface Window {
    electron: ElectronAPI
    api: Api
    context: {
      locale: string
      homeDir: string
      openFile?: string
      state: NotesState
    }
  }
}
