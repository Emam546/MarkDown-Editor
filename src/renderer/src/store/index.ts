/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  configureStore,
  EnhancedStore,
  StoreEnhancer,
  ThunkDispatch,
  Tuple,
  UnknownAction
} from '@reduxjs/toolkit'
import NotesSlice from './notes'
import { NotesState } from '@shared/models'

const store = configureStore({
  reducer: {
    [NotesSlice.name]: NotesSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(afterEachReducerMiddleware as any)
})
// Get the type of our store variable
export type AppStore = typeof store
function afterEachReducerMiddleware(
  store: EnhancedStore<
    {
      notes: NotesState
    },
    UnknownAction,
    Tuple<
      [
        StoreEnhancer<{
          dispatch: ThunkDispatch<
            {
              notes: NotesState
            },
            undefined,
            UnknownAction
          >
        }>,
        StoreEnhancer
      ]
    >
  >
) {
  return (next) =>
    (action): unknown => {
      const result = next(action) // Call the next reducer in the chain

      // Check if the action is relevant to the target slice
      if (action.type.startsWith(NotesSlice.name + '/')) {
        window.api.saveState(store.getState().notes)
      }

      return result
    }
}
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch']

export default store
