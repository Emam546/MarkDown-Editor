import { ComponentProps } from 'react'
import classNames from 'classnames'
import DeleteNoteButton from './Buttons/DeleteNoteButton'
import NewNoteButton from './Buttons/NewNote'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { NotesAction } from '@/store/notes'
import path from 'path-browserify'
import ActionButton from './Buttons/ActionButton'
import { faFileImport, faFolderOpen, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
export interface Props extends ComponentProps<'aside'> {}

const dateFormatter = new Intl.DateTimeFormat(window.context.locale, {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'UTC'
})
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function SideBar({ className, ...props }: Props) {
  const notes = useAppSelector((state) => state.notes.notes)
  const activeNoteId = useAppSelector((state) => state.notes.active)
  const dispatch = useAppDispatch()
  return (
    <aside className={classNames(className, 'w-[250px] p-3 overflow-y-auto')} {...props}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-x-2">
          <NewNoteButton
            onClick={() => {
              window.api
                .createNoteData(path.join(window.context.homeDir, 'New Note.md'), '')
                .then((note) => {
                  if (note) dispatch(NotesAction.add(note))
                })
            }}
          />
          <ActionButton
            onClick={() => {
              window.api.openFile(window.context.homeDir).then((path) => {
                if (!path) return
                window.api.readNote(path[0]).then((note) => {
                  dispatch(NotesAction.add(note))
                })
              })
            }}
          >
            <FontAwesomeIcon className="text-zinc-300" icon={faFileImport} />
          </ActionButton>
          <ActionButton
            onClick={() => {
              window.api.openDirectory(window.context.homeDir).then((path) => {
                if (!path) return
                window.api.readFolder(path[0]).then((notes) => {
                  dispatch(NotesAction.setNotes(notes))
                  window.context.homeDir = path[0]
                })
              })
            }}
          >
            <FontAwesomeIcon className="text-zinc-300" icon={faFolderOpen} />
          </ActionButton>
        </div>
        <DeleteNoteButton
          onClick={() => {
            const activeNote = notes.find((note) => note.id == activeNoteId)
            if (!activeNote) return
            window.api.deleteNoteData(activeNote.path).then(() => {
              dispatch(NotesAction.remove({ id: activeNote.id }))
            })
          }}
        />
      </div>
      <ul>
        {notes.length == 0 && (
          <div className="mt-2 text-center">
            <span>No Notes Yet</span>
          </div>
        )}
        {notes.map(({ id, title, lastModified }) => {
          const isActive = id == activeNoteId
          return (
            <li
              aria-selected={isActive}
              key={id}
              className={classNames(
                'cursor-pointer px-2.5 rounded-md transition-colors duration-75 flex items-stretch',
                {
                  'bg-zinc-400/50': isActive,
                  'hover:bg-zinc-500/50': !isActive
                }
              )}
            >
              <div
                className="flex-1 py-2"
                onClick={() => {
                  dispatch(NotesAction.setActive({ id }))
                }}
              >
                <h4 className="truncate font-bold">{title}</h4>
                <span className="inline-block mb-2 w-full text-xs font-light text-left">
                  {dateFormatter.format(lastModified)}
                </span>
              </div>
              <div className="flex items-center">
                <button
                  className="bg-transparent px-2 py-1 opacity-45 hover:opacity-90 transition-colors duration-100"
                  onClick={() => {
                    dispatch(NotesAction.remove({ id }))
                  }}
                >
                  <FontAwesomeIcon className="text-zinc-300 text-lg" icon={faXmark} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
