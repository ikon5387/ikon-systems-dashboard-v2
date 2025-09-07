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

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center">
            <pre className="text-xs font-mono text-primary leading-tight">
{`╔╦╗╔═╗╔╗╔╔═╗╔═╗╔═╗╦═╗
 ║ ║╣ ║║║║  ║╣ ║ ║╠╦╝
 ╩ ╚═╝╝╚╝╚═╝╚═╝╚═╝╩╚═`}
            </pre>
            <div className="text-sm font-semibold text-foreground mt-1">
              IKON SYSTEMS
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                      ? 'bg-primary text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <item.icon
                    className={`mr-3 w-5 h-5 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                  />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs">
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
          {/* ASCII Logo */}
          <div className={`flex items-center justify-center h-20 px-6 border-b border-border ${isCollapsed ? 'px-2' : ''}`}>
            {isCollapsed ? (
              <div className="text-center">
                <div className="text-lg font-bold text-primary">I</div>
              </div>
            ) : (
              <div className="text-center">
                <pre className="text-xs font-mono text-primary leading-tight">
{`╔╦╗╔═╗╔╗╔╔═╗╔═╗╔═╗╦═╗
 ║ ║╣ ║║║║  ║╣ ║ ║╠╦╝
 ╩ ╚═╝╝╚╝╚═╝╚═╝╚═╝╩╚═`}
                </pre>
                <div className="text-sm font-semibold text-foreground mt-1">
                  IKON SYSTEMS
                </div>
              </div>
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
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isCollapsed ? '' : 'mr-3'
                    } ${
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      {item.name}
                      {item.badge && (
                        <Badge className={`ml-auto text-xs ${
                          isActive 
                            ? 'bg-white/20 text-white' 
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