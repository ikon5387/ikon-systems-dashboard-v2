import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

// Components
import { LoadingPage } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { MaintenanceMode } from '@/components/MaintenanceMode'
import { Layout } from '@/components/layout/Layout'

// Hooks
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

// Performance monitoring and config
import { PerformanceMonitor } from '@/lib/performance'
import { config } from '@/lib/env'

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const SignUpPage = React.lazy(() => import('@/pages/auth/SignUpPage').then(m => ({ default: m.SignUpPage })))
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ClientsPage = React.lazy(() => import('@/pages/clients/ClientsPage').then(m => ({ default: m.ClientsPage })))
const ProjectsPage = React.lazy(() => import('@/pages/projects/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
const AppointmentsPage = React.lazy(() => import('@/pages/appointments/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })))
const VoiceAgentsPage = React.lazy(() => import('@/pages/voice-agents/VoiceAgentsPage').then(m => ({ default: m.VoiceAgentsPage })))
const FinancialsPage = React.lazy(() => import('@/pages/financials/FinancialsPage').then(m => ({ default: m.FinancialsPage })))
const AnalyticsPage = React.lazy(() => import('@/pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const IntegrationsPage = React.lazy(() => import('@/pages/integrations/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))
const PhoneNumbersPage = React.lazy(() => import('@/pages/phone-numbers/PhoneNumbersPage').then(m => ({ default: m.PhoneNumbersPage })))
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

// Enhanced QueryClient with better caching and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// App Routes Component
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingPage />}>
              <LoginPage />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingPage />}>
              <SignUpPage />
            </Suspense>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <DashboardPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <DashboardPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <ClientsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/new"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <ClientsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <ClientsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <ProjectsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <ProjectsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <ProjectsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <AppointmentsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/new"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <AppointmentsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <AppointmentsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/voice-agents"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <VoiceAgentsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/voice-agents/new"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <VoiceAgentsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/voice-agents/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <VoiceAgentsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financials"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <FinancialsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financials/new"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <FinancialsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financials/invoices/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <FinancialsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <AnalyticsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <IntegrationsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phone-numbers"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <PhoneNumbersPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingPage />}>
                <SettingsPage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/" : "/auth/login"} replace />
        }
      />
    </Routes>
  )
}

// Main App Component
function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { theme } = useTheme()

  // Check for maintenance mode
  if (config.app.maintenanceMode) {
    return <MaintenanceMode />
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize performance monitoring
        PerformanceMonitor.getInstance()
        
        // Set up global error handling with enhanced logging
        const handleError = (event: ErrorEvent) => {
          console.error('Global error:', event.error)
          PerformanceMonitor.getInstance().logError(event.error)
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
          console.error('Unhandled promise rejection:', event.reason)
          PerformanceMonitor.getInstance().logError(event.reason)
        }

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        // Initialize theme
        document.documentElement.classList.toggle('dark', theme === 'dark')
        
        // Preload critical resources
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            // Preload images and other resources
            const preloadLinks = document.querySelectorAll('link[rel="preload"]')
            preloadLinks.forEach(link => {
              if (link instanceof HTMLLinkElement) {
                link.rel = 'stylesheet'
              }
            })
          })
        }
        
        setIsInitialized(true)

        return () => {
          window.removeEventListener('error', handleError)
          window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
      } catch (error) {
        console.error('App initialization failed:', error)
        setIsInitialized(true) // Still show the app even if initialization fails
      }
    }

    initializeApp()
  }, [theme])

  // Show loading screen during initialization
  if (!isInitialized) {
    return <LoadingPage text="Initializing application..." />
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            <Suspense fallback={<LoadingPage />}>
              <AppRoutes />
            </Suspense>
            
            {/* Enhanced Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
                success: {
                  iconTheme: {
                    primary: 'hsl(var(--primary))',
                    secondary: 'hsl(var(--primary-foreground))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(var(--destructive))',
                    secondary: 'hsl(var(--destructive-foreground))',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: 'hsl(var(--primary))',
                    secondary: 'hsl(var(--primary-foreground))',
                  },
                },
              }}
            />
          </div>
        </Router>
        
        {/* React Query Devtools (only in development) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )} */}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App