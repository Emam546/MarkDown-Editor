import { createSlice } from '@reduxjs/toolkit'
import { NotesState, NoteType } from '@shared/models'

export const NotesSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: []
  } as NotesState,
  reducers: {
    add(state, { payload: note }: { payload: NoteType }) {
      if (!state.notes.some((cNote) => cNote.id == note.id)) state.notes.push(note)
      state.active = note.id
    },
    setNotes(state, action: { payload: NotesState['notes'] }) {
      state.notes = [...action.payload]
      if (state.notes.length > 0) state.active = action.payload[0].id
    },
    remove(state, action: { payload: { id: NoteType['id'] } }) {
      state.notes = state.notes.filter((val) => {
        return val.id != action.payload.id
      })
      if (state.active == action.payload.id) state.active = undefined
    },
    setActive(state, action: { payload: { id: NoteType['id'] } }) {
      state.active = action.payload.id
    }
  }
})

// Action creators are generated for each case reducer function
export const NotesAction = NotesSlice.actions

export default NotesSlice
