import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  HashRouter,
} from 'react-router-dom'

import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'

import App from './App.jsx'

import {
  AuthProvider,
} from './auth/AuthContext.jsx'

import theme from './theme/theme.js'

import './index.css'

createRoot(
  document.getElementById('root')
).render(
  <StrictMode>
    <ThemeProvider
      theme={theme}
    >
      <CssBaseline />

      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>

    </ThemeProvider>
  </StrictMode>,
)