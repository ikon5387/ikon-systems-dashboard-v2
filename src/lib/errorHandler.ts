import { notifications } from './notifications'

export interface ErrorInfo {
  message: string
  code?: string
  details?: any
  timestamp: Date
  userAgent?: string
  url?: string
}

export class AppError extends Error {
  public readonly code?: string
  public readonly details?: any
  public readonly timestamp: Date

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', details?: any) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'AUTH_ERROR', details)
    this.name = 'AuthenticationError'
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'Permission denied', details?: any) {
    super(message, 'PERMISSION_ERROR', details)
    this.name = 'PermissionError'
  }
}

class ErrorHandlerClass {
  private errorQueue: ErrorInfo[] = []
  private maxQueueSize = 100

  logError(error: Error | AppError, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      code: error instanceof AppError ? error.code : undefined,
      details: error instanceof AppError ? error.details : undefined,
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }

    // Add context if provided
    if (context) {
      errorInfo.details = { ...errorInfo.details, context }
    }

    // Add to error queue
    this.errorQueue.push(errorInfo)
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift() // Remove oldest error
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${context || 'App'}] ${error.message}`, error)
    }

    // Send to error tracking service in production
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
      this.sendToSentry(errorInfo)
    }
  }

  handleError(error: Error | AppError, context?: string, showNotification: boolean = true): void {
    this.logError(error, context)

    if (showNotification) {
      if (error instanceof NetworkError) {
        notifications.error('Network error. Please check your connection.')
      } else if (error instanceof AuthenticationError) {
        notifications.error('Authentication failed. Please sign in again.')
      } else if (error instanceof PermissionError) {
        notifications.error('You do not have permission to perform this action.')
      } else if (error instanceof ValidationError) {
        notifications.error(error.message)
      } else {
        notifications.error(error.message || 'An unexpected error occurred.')
      }
    }
  }

  async handleAsyncError<T>(
    operation: () => Promise<T>,
    context?: string,
    showNotification: boolean = true
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      const appError = error instanceof Error ? error : new AppError('Unknown error occurred')
      this.handleError(appError, context, showNotification)
      return null
    }
  }

  private async sendToSentry(errorInfo: ErrorInfo): Promise<void> {
    try {
      // In a real implementation, you would send to Sentry
      // For now, we'll just log that it would be sent
      console.warn('Error would be sent to Sentry:', errorInfo)
    } catch (error) {
      console.error('Failed to send error to Sentry:', error)
    }
  }

  getRecentErrors(limit: number = 10): ErrorInfo[] {
    return this.errorQueue.slice(-limit).reverse()
  }

  clearErrors(): void {
    this.errorQueue = []
  }

  // Utility methods for common error patterns
  networkError(message?: string, details?: any): NetworkError {
    return new NetworkError(message, details)
  }

  validationError(message?: string, details?: any): ValidationError {
    return new ValidationError(message, details)
  }

  authError(message?: string, details?: any): AuthenticationError {
    return new AuthenticationError(message, details)
  }

  permissionError(message?: string, details?: any): PermissionError {
    return new PermissionError(message, details)
  }
}

export const ErrorHandler = new ErrorHandlerClass()

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.logError(
      new AppError(event.reason?.message || 'Unhandled promise rejection', 'UNHANDLED_REJECTION', event.reason),
      'Global'
    )
  })

  window.addEventListener('error', (event) => {
    ErrorHandler.logError(
      new AppError(event.message || 'Global error', 'GLOBAL_ERROR', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }),
      'Global'
    )
  })
}
