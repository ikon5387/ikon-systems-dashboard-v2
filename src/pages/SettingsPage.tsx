import { useState } from 'react'
import { FiUser, FiMail, FiLock, FiBell, FiGlobe, FiSave, FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { notifications } from '@/lib/notifications'

export function SettingsPage() {
  const { user, profile, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    role: profile?.role || 'admin',
  })

  const handleSave = async () => {
    try {
      await updateProfile({
        role: formData.role,
      })
      setIsEditing(false)
      notifications.success('Profile updated successfully!')
    } catch (error) {
      notifications.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      role: profile?.role || 'admin',
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-hover glass-effect">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="gradient-text flex items-center">
                    <FiUser className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Update your personal information</p>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="hover-lift"
                  >
                    <FiEdit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <FiMail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800"
                    placeholder="Email address"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>


                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role
                  </label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="capitalize">
                      {formData.role}
                    </Badge>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Role is managed by administrators
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex items-center space-x-2"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="card-hover glass-effect">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700">
              <CardTitle className="gradient-text flex items-center">
                <FiLock className="w-5 h-5 mr-2" />
                Security
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage your password and security settings</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>

                <Button className="w-full">
                  <FiLock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences Sidebar */}
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card className="card-hover glass-effect">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700">
              <CardTitle className="gradient-text flex items-center">
                <FiGlobe className="w-5 h-5 mr-2" />
                Appearance
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">Customize your interface</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', label: 'Light', icon: '☀️' },
                      { value: 'dark', label: 'Dark', icon: '🌙' },
                      { value: 'system', label: 'System', icon: '💻' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          theme === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div className="text-xs font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Current theme: <span className="font-medium capitalize">{theme}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="card-hover glass-effect">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700">
              <CardTitle className="gradient-text flex items-center">
                <FiBell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage your notification preferences</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { label: 'Email notifications', description: 'Receive updates via email' },
                  { label: 'Push notifications', description: 'Get notified in real-time' },
                  { label: 'SMS alerts', description: 'Important updates via SMS' },
                  { label: 'Weekly reports', description: 'Summary of your activity' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="card-hover glass-effect">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700">
              <CardTitle className="gradient-text">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">User ID</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    {user?.id?.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Member since</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Last login</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
