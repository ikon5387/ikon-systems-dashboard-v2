import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-slate-200 border-t-primary',
        sizes[size]
      )} />
      {text && (
        <p className="text-sm text-slate-600">{text}</p>
      )}
    </div>
  )
}

interface LoadingPageProps {
  text?: string
}

export function LoadingPage({ text = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loading size="lg" text={text} />
    </div>
  )
}
