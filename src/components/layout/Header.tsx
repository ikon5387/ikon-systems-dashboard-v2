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
import { Logo } from '@/components/ui/Logo'
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
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="lg:hidden hover:bg-muted"
            >
              <FiMenu className="w-5 h-5" />
            </Button>

            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDesktopToggle}
              className="hidden lg:flex hover:bg-muted"
            >
              <FiMenu className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <Logo size="md" className="hidden sm:flex" />

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search clients, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-enterprise pl-10 w-64"
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
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {theme === 'light' && <FiSun className="w-4 h-4" />}
                {theme === 'dark' && <FiMoon className="w-4 h-4" />}
                {theme === 'system' && <FiMonitor className="w-4 h-4" />}
              </Button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg py-1 z-50">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value as any)
                        setShowThemeMenu(false)
                      }}
                      className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-muted rounded-lg mx-1 ${
                        theme === option.value
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground'
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
              className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <FiBell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-destructive text-destructive-foreground">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-foreground hover:bg-muted"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/90 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {profile?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {profile?.role || 'user'}
                  </p>
                </div>
                <FiChevronDown className="w-4 h-4" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge className="mt-1 text-xs">
                      {profile?.role || 'user'}
                    </Badge>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg mx-1"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiUser className="w-4 h-4 mr-3" />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg mx-1"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiSettings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>

                  <div className="border-t border-border mt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg mx-1"
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