import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import router from './router'
import { AuthProvider } from './pages/Auth/AuthContext/AuthContext'
import { ThemeProvider } from './context/themeContext'
import { queryClient } from './api/queryClient'
import { AnnouncementProvider } from './context/announcementContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AnnouncementProvider>
            <RouterProvider router={router} />
          </AnnouncementProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
