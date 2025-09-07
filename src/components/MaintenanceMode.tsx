import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { config } from '@/lib/env'

interface MaintenanceModeProps {
  message?: string
  estimatedTime?: string
}

export function MaintenanceMode({ 
  message = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime = "We'll be back online shortly."
}: MaintenanceModeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl text-slate-900">
            {config.app.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-800">
              Under Maintenance
            </h2>
            <p className="text-slate-600">
              {message}
            </p>
            <p className="text-sm text-slate-500">
              {estimatedTime}
            </p>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-400">
              Version {config.app.version} • {config.app.environment}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
