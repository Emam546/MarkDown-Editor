import { AppDirectoryName, FileEncoding, StateFile } from '@shared/constents'
import { homedir } from 'os'
import path from 'path'
import fs from 'fs-extra'
import { NotesState, NoteType } from '@shared/models'
import { dialog } from 'electron'
const stateFile = StateFile
export function getHomeDir(): string {
  return path.join(homedir(), AppDirectoryName)
}
export function getMarkNotes(homeDir: string): NoteType[] {
  const isExist = fs.existsSync(homeDir)
  if (!isExist) return []
  return fs
    .readdirSync(homeDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => getInfoFileName(path.join(homeDir, file)))
    .reverse()
}
export function getInfoFileName(fileName: string): NoteType {
  const file = fs.statSync(fileName)

  return {
    id: (file.dev + file.ino).toString(),
    title: path.basename(fileName, path.extname(fileName)),
    lastModified: file.mtimeMs,
    path: fileName
  }
}
export function getNoteData(path: string): string {
  const file = fs.readFileSync(path, { encoding: FileEncoding })
  return file
}
function getUniqueFileName(filePath: string): string {
  const dir = path.dirname(filePath)
  const ext = path.extname(filePath)
  const baseName = path.basename(filePath, ext)

  let newFilePath = filePath
  let counter = 1

  while (fs.pathExistsSync(newFilePath)) {
    newFilePath = path.join(dir, `${baseName} (${counter})${ext}`)
    counter++
  }

  return newFilePath
}
export async function createNoteData(filePath: string, data: string): Promise<NoteType | null> {
  const dir = path.dirname(filePath)
  fs.ensureDirSync(dir)
  const uniqueFileName = getUniqueFileName(filePath)
  const { canceled, filePath: newpath } = await dialog.showSaveDialog({
    title: 'New Note',
    defaultPath: uniqueFileName,
    buttonLabel: 'Create',
    properties: ['showOverwriteConfirmation'],
    filters: [{ name: 'MarkDown', extensions: ['md'] }],
    showsTagField: false
  })
  if (canceled || !filePath) return null
  fs.writeFileSync(newpath, data, { encoding: FileEncoding })
  return getInfoFileName(newpath)
}
export async function OpenFolder(defaultPath?: string): Promise<string[] | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Open Directory',
    defaultPath,
    properties: ['openDirectory', 'createDirectory']
  })
  if (canceled || !filePaths) return null
  return filePaths
}
export async function OpenFile(defaultPath?: string): Promise<string[] | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Open File',
    defaultPath,
    filters: [{ name: 'MarkDown', extensions: ['md'] }]
  })
  if (canceled || !filePaths) return null
  return filePaths
}
export function writeNoteData(filePath: string, data: string): void {
  const dir = path.dirname(filePath)
  fs.ensureDirSync(dir)
  fs.writeFileSync(filePath, data, { encoding: FileEncoding })
}
export function deleteNoteData(filePath: string): void {
  if (fs.pathExistsSync(filePath)) fs.unlinkSync(filePath)
}

export function SaveState(data: NotesState): void {
  return writeNoteData(stateFile, JSON.stringify(data))
}
export function ReadSaveState(): NotesState {
  try {
    return fs.readJSONSync(stateFile)
  } catch (error) {
    return {
      notes: []
    }
  }
}
