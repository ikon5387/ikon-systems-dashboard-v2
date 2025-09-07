import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'text'
  className?: string
  showText?: boolean
}

export function Logo({ 
  size = 'md', 
  variant = 'full', 
  className,
  showText = true 
}: LogoProps) {
  const sizeClasses = {
    sm: {
      text: 'text-sm',
      icon: 'w-6 h-6',
      spacing: 'gap-2'
    },
    md: {
      text: 'text-lg',
      icon: 'w-8 h-8',
      spacing: 'gap-3'
    },
    lg: {
      text: 'text-xl',
      icon: 'w-10 h-10',
      spacing: 'gap-4'
    },
    xl: {
      text: 'text-2xl',
      icon: 'w-12 h-12',
      spacing: 'gap-4'
    }
  }

  const currentSize = sizeClasses[size]

  const LogoIcon = () => (
    <div className={cn(
      "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg",
      currentSize.icon
    )}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3/4 h-3/4"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <path d="M9 9h6v6H9z"/>
        <path d="M9 3v6"/>
        <path d="M15 3v6"/>
        <path d="M9 15v6"/>
        <path d="M15 15v6"/>
        <path d="M3 9h6"/>
        <path d="M15 9h6"/>
        <path d="M3 15h6"/>
        <path d="M15 15h6"/>
      </svg>
    </div>
  )

  const LogoText = () => (
    <div className="flex flex-col">
      <span className={cn(
        "font-bold text-foreground tracking-tight",
        currentSize.text
      )}>
        IKON
      </span>
      <span className={cn(
        "text-muted-foreground font-medium -mt-1 tracking-wide",
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        SYSTEMS
      </span>
    </div>
  )

  if (variant === 'icon') {
    return <LogoIcon />
  }

  if (variant === 'text') {
    return <LogoText />
  }

  return (
    <div className={cn(
      "flex items-center",
      currentSize.spacing,
      className
    )}>
      <LogoIcon />
      {showText && <LogoText />}
    </div>
  )
}

export function LogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center shadow-sm">
        <span className="text-primary-foreground text-xs font-bold">I</span>
      </div>
      <span className="text-sm font-semibold text-foreground">IKON</span>
    </div>
  )
}

export function LogoLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
      <div className="space-y-1">
        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}