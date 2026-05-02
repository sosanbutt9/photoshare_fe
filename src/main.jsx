import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './store'
import { bindHttpStore } from './api/http'
import { setTokens, logout } from './store/authSlice'

bindHttpStore(store, {
  onTokenRefresh: (tokens) => {
    store.dispatch(setTokens(tokens))
  },
  onLogout: () => {
    store.dispatch(logout())
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
