import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { AuthGate } from './routes/AuthGate'
import { AppRoutes } from './routes/AppRoutes'

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthGate>
          <AppRoutes />
        </AuthGate>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'text-sm font-semibold !bg-white !text-navy-950 !border !border-navy-100',
            style: {
              borderRadius: '10px',
              boxShadow: '0 10px 40px -12px rgb(15 31 54 / 0.18)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  )
}
