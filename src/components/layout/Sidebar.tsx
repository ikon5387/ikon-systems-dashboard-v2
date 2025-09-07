import { Link, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiUsers, 
  FiCalendar, 
  FiDollarSign, 
  FiSettings, 
  FiX,
  FiPhone,
  FiBarChart,
  FiFileText,
  FiZap
} from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Logo } from '@/components/ui/Logo'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: FiHome,
    current: false,
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: FiUsers,
    current: false,
    badge: '12'
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: FiCalendar,
    current: false,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FiFileText,
    current: false,
  },
  {
    name: 'Voice Agents',
    href: '/voice-agents',
    icon: FiPhone,
    current: false,
  },
  {
    name: 'Financials',
    href: '/financials',
    icon: FiDollarSign,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: FiBarChart,
    current: false,
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: FiZap,
    current: false,
  },
  {
    name: 'Phone Numbers',
    href: '/phone-numbers',
    icon: FiPhone,
    current: false,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: FiSettings,
    current: false,
  },
]

export function Sidebar({ isOpen, onClose, isCollapsed = false }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <FiX className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon
                    className={`mr-3 w-5 h-5 ${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          {/* Logo */}
          <div className={`flex items-center justify-center h-20 px-6 border-b border-border ${isCollapsed ? 'px-2' : ''}`}>
            {isCollapsed ? (
              <Logo variant="icon" size="md" />
            ) : (
              <Logo size="md" />
            )}
          </div>

          {/* Navigation */}
          <nav className={`mt-6 flex-1 pb-4 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center text-sm font-medium rounded-lg transition-all duration-200 ${
                    isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-foreground hover:bg-muted hover:shadow-sm'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isCollapsed ? '' : 'mr-3'
                    } ${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      {item.name}
                      {item.badge && (
                        <Badge className={`ml-auto text-xs ${
                          isActive 
                            ? 'bg-primary-foreground/20 text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-border ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {isCollapsed ? (
              <div className="text-xs text-muted-foreground text-center">
                <div className="font-bold">I</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center">
                <p>Ikon Systems Dashboard</p>
                <p className="mt-1">v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}