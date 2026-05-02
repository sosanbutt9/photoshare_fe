import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadStoredTokens } from '../lib/authStorage'
import * as authService from '../services/authService'

function buildInitialAuthState() {
  const t = loadStoredTokens()
  const hasTokens = Boolean(t?.access)
  return {
    access: t?.access ?? null,
    refresh: t?.refresh ?? null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    /** False while validating stored tokens; true immediately when there is nothing to restore. */
    sessionReady: !hasTokens,
  }
}

export const authInitialState = buildInitialAuthState()

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.message ||
        err.message ||
        'Login failed'
      return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.register(payload)
    } catch (err) {
      const data = err.response?.data
      const msg =
        data?.detail ||
        (data && typeof data === 'object' && Object.values(data).flat().find(Boolean)) ||
        err.message ||
        'Registration failed'
      return rejectWithValue(typeof msg === 'string' ? msg : 'Registration failed')
    }
  }
)

export const getLoggedInUser = createAsyncThunk(
  'auth/getLoggedInUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Could not load profile'
      return rejectWithValue(typeof msg === 'string' ? msg : 'Could not load profile')
    }
  },
  {
    condition: (_, { getState }) => Boolean(getState().auth.access),
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(payload)
    } catch (err) {
      const data = err.response?.data
      let msg =
        data?.detail ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null)
      if (!msg && data && typeof data === 'object') {
        const pair = Object.entries(data).find(([, v]) =>
          Array.isArray(v) ? v.length : typeof v === 'string'
        )
        if (pair) {
          const [, v] = pair
          msg = Array.isArray(v) ? v[0] : v
        }
      }
      return rejectWithValue(typeof msg === 'string' ? msg : 'Could not update profile')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    logout: (state) => {
      state.access = null
      state.refresh = null
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      state.sessionReady = true
    },
    setTokens: (state, action) => {
      state.access = action.payload.access ?? state.access
      state.refresh = action.payload.refresh ?? state.refresh
      state.isAuthenticated = Boolean(state.access && state.user)
    },
    clearAuthError: (state) => {
      state.error = null
    },
    setSessionReady: (state, action) => {
      state.sessionReady = Boolean(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.access = action.payload.access
        state.refresh = action.payload.refresh
        state.user = action.payload.user ?? null
        state.isAuthenticated = Boolean(state.access && state.user)
        state.error = null
        state.sessionReady = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        const p = action.payload
        if (p?.access) {
          state.access = p.access
          state.refresh = p.refresh ?? null
          state.user = p.user ?? null
          state.isAuthenticated = Boolean(state.access && state.user)
        }
        state.error = null
        state.sessionReady = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })
      .addCase(getLoggedInUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLoggedInUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = Boolean(state.access && state.user)
        state.error = null
      })
      .addCase(getLoggedInUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || null
        state.access = null
        state.refresh = null
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = Boolean(state.access && state.user)
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Could not update profile'
      })
  },
})

export const { logout, setTokens, clearAuthError, setSessionReady, setUser } = authSlice.actions
export default authSlice.reducer
