import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiEye, FiEyeOff, FiUser } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      
      if (result.error) {
        // Error notifications are handled by AuthService
      } else {
        navigate('/auth/login')
      }
    } catch (error) {
      // Error notifications are handled by AuthService
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white font-bold text-2xl transform -rotate-3">I</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Create Admin Account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Set up your Ikon Systems administrator account
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 shadow-2xl border-0 ring-1 ring-slate-200/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-semibold text-slate-800">Administrator Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      {...register('firstName')}
                      type="text"
                      label="First Name"
                      placeholder="Enter first name"
                      error={errors.firstName?.message}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Input
                      {...register('lastName')}
                      type="text"
                      label="Last Name"
                      placeholder="Enter last name"
                      error={errors.lastName?.message}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Input
                    {...register('email')}
                    type="email"
                    label="Email address"
                    placeholder="admin@ikonsystemsai.com"
                    error={errors.email?.message}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="Create a strong password"
                      error={errors.password?.message}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      error={errors.confirmPassword?.message}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-700 font-medium">
                      This account will have full administrator privileges
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Admin Account'}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link 
                  to="/auth/login" 
                  className="font-semibold text-primary hover:text-primary-600 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
