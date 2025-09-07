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
    name: 'Settings',
    href: '/settings',
    icon: FiSettings,
    current: false,
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 dark-sidebar transform transition-transform duration-200 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="ml-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              Ikon Systems
            </span>
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow dark-sidebar">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="ml-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              Ikon Systems
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-3 pb-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-sm'
                  }`}
                >
                  <item.icon
                    className={`mr-3 w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                  />
                  {item.name}
                  {item.badge && (
                    <Badge className={`ml-auto text-xs ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
              <p>Ikon Systems Dashboard</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}