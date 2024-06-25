import { useEffect } from 'react'
import MarkDownEditor from './components/MarkDownEditor'
import SideBar from './components/sideBar'
import { useAppDispatch } from './hooks/store'
import { NotesAction } from './store/notes'
// import { ipcRenderer } from 'electron'

function App(): JSX.Element {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const state = window.context.state
    dispatch(NotesAction.setNotes(state.notes))
    if (state.active) dispatch(NotesAction.setActive({ id: state.active }))

    window.api.on('open-file', (path) => {
      window.api.readNote(path).then((note) => dispatch(NotesAction.add(note)))
    })
  }, [])
  return (
    <>
      {/* <DraggableTopBar /> */}
      <div className="flex h-screen items-stretch bg-black/85">
        <SideBar />
        <main className="flex-1 overflow-auto bg-zinc-900/50 border-l-white/50 border-l-1 border-solid">
          <MarkDownEditor className="w-full max-h-full" />
        </main>
      </div>
    </>
  )
}

export default App
