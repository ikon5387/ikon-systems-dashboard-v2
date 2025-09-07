import { supabase } from '@/lib/supabase'
import { notifications } from '@/lib/notifications'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Tables } from '@/lib/supabase'

export type UserProfile = Tables<'users'>

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface UpdateProfileData {
  email?: string
  firstName?: string
  lastName?: string
  role?: 'admin' | 'sales' | 'support'
}

class AuthServiceClass {
  private currentUser: User | null = null
  private currentSession: Session | null = null
  private userProfile: UserProfile | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      console.log('🔐 AuthService: Initializing...')
      
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('🔐 AuthService: Error getting session:', error)
        this.initialized = true
        return
      }

      if (session) {
        this.currentSession = session
        this.currentUser = session.user
        await this.loadUserProfile()
      }

      this.initialized = true
      console.log('🔐 AuthService: Initialized successfully')
    } catch (error) {
      console.error('🔐 AuthService: Initialization failed:', error)
      this.initialized = true
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.currentUser) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', this.currentUser.id)
        .single()

      if (error) {
        console.warn('🔐 AuthService: Failed to load user profile:', error)
        return
      }

      this.userProfile = data
    } catch (error) {
      console.warn('🔐 AuthService: Error loading user profile:', error)
    }
  }

  async signIn({ email, password, rememberMe = false }: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService: Signing in...')

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('🔐 AuthService: Sign in error:', error)
        notifications.error(error.message || 'Failed to sign in')
        return { user: null, session: null, error }
      }

      if (data.user && data.session) {
        this.currentUser = data.user
        this.currentSession = data.session
        await this.loadUserProfile()

        if (rememberMe) {
          localStorage.setItem('ikon_remember_me', 'true')
        }

        notifications.success('Welcome back!')
        console.log('🔐 AuthService: Sign in successful')
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error('🔐 AuthService: Sign in catch error:', error)
      const authError = error as AuthError
      notifications.error('Failed to sign in: ' + ((error as Error).message || 'Unknown error'))
      return { user: null, session: null, error: authError }
    }
  }

  async signUp({ email, password, firstName, lastName }: SignUpCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService: Signing up...')

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      })

      if (error) {
        console.error('🔐 AuthService: Sign up error:', error)
        notifications.error(error.message || 'Failed to create account')
        return { user: null, session: null, error }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            role: 'admin', // First user is admin
          })

        if (profileError) {
          console.warn('🔐 AuthService: Failed to create user profile:', profileError)
        }

        notifications.success('Account created successfully! Please check your email to confirm your account.')
        console.log('🔐 AuthService: Sign up successful')
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error('🔐 AuthService: Sign up catch error:', error)
      const authError = error as AuthError
      notifications.error('Failed to create account: ' + ((error as Error).message || 'Unknown error'))
      return { user: null, session: null, error: authError }
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('🔐 AuthService: Signing out...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('🔐 AuthService: Sign out error:', error)
        notifications.error('Failed to sign out')
        return
      }

      this.currentUser = null
      this.currentSession = null
      this.userProfile = null
      localStorage.removeItem('ikon_remember_me')
      
      notifications.success('Signed out successfully')
      console.log('🔐 AuthService: Sign out successful')
    } catch (error) {
      console.error('🔐 AuthService: Sign out catch error:', error)
      notifications.error('Failed to sign out')
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService: Signing in with Google...')

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('🔐 AuthService: Google sign in error:', error)
        notifications.error(error.message || 'Failed to sign in with Google')
        return { user: null, session: null, error }
      }

      return { user: null, session: null, error: null }
    } catch (error) {
      console.error('🔐 AuthService: Google sign in catch error:', error)
      const authError = error as AuthError
      notifications.error('Failed to sign in with Google')
      return { user: null, session: null, error: authError }
    }
  }

  async resetPassword({ email }: { email: string }): Promise<{ error: AuthError | null }> {
    try {
      console.log('🔐 AuthService: Resetting password...')

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        console.error('🔐 AuthService: Reset password error:', error)
        notifications.error(error.message || 'Failed to send reset email')
        return { error }
      }

      notifications.success('Password reset email sent!')
      console.log('🔐 AuthService: Reset password email sent')
      return { error: null }
    } catch (error) {
      console.error('🔐 AuthService: Reset password catch error:', error)
      const authError = error as AuthError
      notifications.error('Failed to send reset email')
      return { error: authError }
    }
  }

  async updatePassword({ newPassword }: { currentPassword: string; newPassword: string }): Promise<{ error: AuthError | null }> {
    try {
      console.log('🔐 AuthService: Updating password...')

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('🔐 AuthService: Update password error:', error)
        notifications.error(error.message || 'Failed to update password')
        return { error }
      }

      notifications.success('Password updated successfully!')
      console.log('🔐 AuthService: Password updated')
      return { error: null }
    } catch (error) {
      console.error('🔐 AuthService: Update password catch error:', error)
      const authError = error as AuthError
      notifications.error('Failed to update password')
      return { error: authError }
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<{ error: AuthError | null }> {
    try {
      console.log('🔐 AuthService: Updating profile...')

      if (!this.currentUser) {
        return { error: { message: 'No user logged in' } as AuthError }
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', this.currentUser.id)

      if (error) {
        console.error('🔐 AuthService: Update profile error:', error)
        notifications.error(error.message || 'Failed to update profile')
        return { error: { message: error.message } as AuthError }
      }

      await this.loadUserProfile()
      notifications.success('Profile updated successfully!')
      console.log('🔐 AuthService: Profile updated')
      return { error: null }
    } catch (error) {
      console.error('🔐 AuthService: Update profile catch error:', error)
      const authError = error as AuthError
      notifications.error('Failed to update profile')
      return { error: authError }
    }
  }

  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthService: Auth state changed:', event)
      
      this.currentSession = session
      this.currentUser = session?.user || null
      
      if (session?.user) {
        await this.loadUserProfile()
      } else {
        this.userProfile = null
      }

      callback(this.currentUser, this.currentSession)
    })
  }

  // Getters
  get user(): User | null {
    return this.currentUser
  }

  get session(): Session | null {
    return this.currentSession
  }

  get profile(): UserProfile | null {
    return this.userProfile
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentSession
  }

  get isAdmin(): boolean {
    return this.userProfile?.role === 'admin'
  }

  get isSales(): boolean {
    return this.userProfile?.role === 'sales'
  }

  get isSupport(): boolean {
    return this.userProfile?.role === 'support'
  }

  get isInitialized(): boolean {
    return this.initialized
  }
}

export const AuthService = new AuthServiceClass()
