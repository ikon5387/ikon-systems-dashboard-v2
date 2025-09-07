import { supabase } from '@/lib/supabase'
import { notifications } from '@/lib/notifications'
import { ErrorHandler, NetworkError } from '@/lib/errorHandler'

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: any
}

export abstract class BaseService {
  protected tableName: string = ''

  constructor(tableName?: string) {
    if (tableName) {
      this.tableName = tableName
    }
  }

  protected async handleRequest<T>(
    operation: () => Promise<any>
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await operation()
      
      if (result.error) {
        const errorMessage = result.error.message || 'Database operation failed'
        ErrorHandler.logError(new NetworkError(errorMessage, result.error), this.tableName)
        notifications.error(errorMessage)
        return {
          data: null,
          error: errorMessage,
          success: false
        }
      }

      return {
        data: result.data,
        error: null,
        success: true
      }
    } catch (error) {
      const appError = error instanceof Error ? error : new Error('An unexpected error occurred')
      const errorMessage = appError.message
      
      ErrorHandler.logError(appError, this.tableName)
      notifications.error(errorMessage)
      
      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }

  protected buildQuery(
    filters?: FilterParams,
    pagination?: PaginationParams
  ) {
    let query = supabase.from(this.tableName).select('*')

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string' && key.endsWith('_search')) {
            const field = key.replace('_search', '')
            query = query.ilike(field, `%${value}%`)
          } else {
            query = query.eq(key, value)
          }
        }
      })
    }

    // Apply pagination and sorting
    if (pagination) {
      const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)
    }

    return query
  }

  async findById<T>(id: string): Promise<ServiceResponse<T>> {
    return this.handleRequest(async () => {
      return await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()
    })
  }

  async findAll<T>(
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<ServiceResponse<T[]>> {
    return this.handleRequest(async () => {
      return await this.buildQuery(filters, pagination)
    })
  }

  async create<T>(data: Partial<T>): Promise<ServiceResponse<T>> {
    return this.handleRequest(async () => {
      return await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single()
    })
  }

  async update<T>(id: string, data: Partial<T>): Promise<ServiceResponse<T>> {
    return this.handleRequest(async () => {
      return await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()
    })
  }

  async delete(id: string): Promise<ServiceResponse<void>> {
    return this.handleRequest(async () => {
      return await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
    })
  }

  async count(filters?: FilterParams): Promise<ServiceResponse<number>> {
    return this.handleRequest(async () => {
      let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true })

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value)
          }
        })
      }

      return await query
    })
  }
}
