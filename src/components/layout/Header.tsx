import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FiMenu, 
  FiSearch, 
  FiBell, 
  FiSettings, 
  FiLogOut, 
  FiUser,
  FiSun,
  FiMoon,
  FiMonitor,
  FiChevronDown
} from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  onSidebarToggle: () => void
  onDesktopToggle?: () => void
  isDesktopCollapsed?: boolean
}

export function Header({ onSidebarToggle, onDesktopToggle }: HeaderProps) {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/clients?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: FiSun },
    { value: 'dark', label: 'Dark', icon: FiMoon },
    { value: 'system', label: 'System', icon: FiMonitor },
  ]

  return (
    <header className="bg-background border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="lg:hidden"
            >
              <FiMenu className="w-5 h-5" />
            </Button>
            
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDesktopToggle}
              className="hidden lg:flex"
            >
              <FiMenu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search clients, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 dark-input"
                />
              </div>
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="relative" ref={themeMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {theme === 'light' && <FiSun className="w-4 h-4" />}
                {theme === 'dark' && <FiMoon className="w-4 h-4" />}
                {theme === 'system' && <FiMonitor className="w-4 h-4" />}
              </Button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 dark-modal rounded-lg shadow-lg py-1 z-50">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value as any)
                        setShowThemeMenu(false)
                      }}
                      className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        theme === option.value
                          ? 'text-primary bg-primary/10'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <option.icon className="w-4 h-4 mr-3" />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <FiBell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {profile?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {profile?.role || 'user'}
                  </p>
                </div>
                <FiChevronDown className="w-4 h-4" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 dark-modal rounded-lg shadow-lg py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {profile?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                    <Badge className="mt-1 text-xs">
                      {profile?.role || 'user'}
                    </Badge>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiUser className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiSettings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>

                  <div className="border-t border-slate-200 dark:border-slate-700 mt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}