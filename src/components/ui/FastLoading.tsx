
// Ultra-fast loading component with minimal overhead
export function FastLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Simple spinner */}
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  )
}

// Skeleton loader for content
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    </div>
  )
}

// Skeleton for client cards
export function SkeletonClientCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="w-16 h-6 bg-slate-200 rounded"></div>
      </div>
    </div>
  )
}

// Skeleton for dashboard stats
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
