import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { AuthService, type UserProfile, type LoginCredentials, type SignUpCredentials } from '@/services/auth/AuthService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔐 useAuth: Initializing...')
        await AuthService.initialize()
        
        if (isMounted) {
          setUser(AuthService.user)
          setSession(AuthService.session)
          setProfile(AuthService.profile)
          setInitialized(true)
          setLoading(false)
          console.log('🔐 useAuth: Initialized successfully')
        }
      } catch (error) {
        console.error('🔐 useAuth: Initialization failed:', error)
        if (isMounted) {
          setInitialized(true)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user, session) => {
      if (isMounted) {
        setUser(user)
        setSession(session)
        setProfile(AuthService.profile)
        setLoading(false)

        // Invalidate queries when auth state changes
        if (session) {
          queryClient.invalidateQueries({ queryKey: ['user'] })
          queryClient.invalidateQueries({ queryKey: ['profile'] })
        } else {
          queryClient.clear()
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [queryClient])

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true)
    try {
      const result = await AuthService.signIn(credentials)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setLoading(true)
    try {
      const result = await AuthService.signUp(credentials)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      const result = await AuthService.signInWithGoogle()
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    return AuthService.resetPassword({ email })
  }, [])

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return AuthService.updatePassword({ currentPassword, newPassword })
  }, [])

  const updateProfile = useCallback(async (data: any) => {
    const result = await AuthService.updateProfile(data)
    if (!result.error) {
      setProfile(AuthService.profile)
    }
    return result
  }, [])

  return {
    // State
    user,
    session,
    profile,
    loading: loading || !initialized,
    initialized,
    
    // Auth status
    isAuthenticated: AuthService.isAuthenticated,
    isAdmin: AuthService.isAdmin,
    isSales: AuthService.isSales,
    isSupport: AuthService.isSupport,
    
    // Actions
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}

export function useProfile() {
  const { user, profile } = useAuth()
  
  return {
    profile,
    loading: !user || !profile,
  }
}

export function usePermissions() {
  const { profile, isAdmin, isSales, isSupport } = useAuth()

  return {
    canManageUsers: isAdmin,
    canManageClients: isAdmin || isSales,
    canViewClients: isAdmin || isSales || isSupport,
    canManageProjects: isAdmin || isSales,
    canViewProjects: isAdmin || isSales || isSupport,
    canManageFinancials: isAdmin,
    canViewFinancials: isAdmin || isSales,
    canManageSettings: isAdmin,
    canManageIntegrations: isAdmin,
    canViewReports: isAdmin || isSales,
    role: profile?.role || 'support'
  }
}