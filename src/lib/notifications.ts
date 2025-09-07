import toast from 'react-hot-toast'

export const notifications = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#10B981',
        color: 'white',
      },
    })
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#EF4444',
        color: 'white',
      },
    })
  },

  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: '#F59E0B',
        color: 'white',
      },
    })
  },

  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      style: {
        background: '#3B82F6',
        color: 'white',
      },
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#6B7280',
        color: 'white',
      },
    })
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}
