import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import { clearStoredTokens, saveStoredTokens } from '../lib/authStorage'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
})

let prevAuth = store.getState().auth
store.subscribe(() => {
  const auth = store.getState().auth
  if (auth.access !== prevAuth.access || auth.refresh !== prevAuth.refresh) {
    if (auth.access) saveStoredTokens(auth.access, auth.refresh)
    else clearStoredTokens()
    prevAuth = auth
  }
})
