import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext'
import { HashRouter } from 'react-router-dom'

import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { initTelemetry } from './utils/telemetry'

// Initialize Sentry & PostHog
initTelemetry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PostHogProvider client={posthog}>
        <HashRouter>
          <AuthProvider>
            <App />
            <Analytics />
          </AuthProvider>
        </HashRouter>
      </PostHogProvider>
    </QueryClientProvider>
  </StrictMode>,
)
