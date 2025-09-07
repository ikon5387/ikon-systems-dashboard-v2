import { config } from '@/lib/env'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled'
  clientSecret: string
  description?: string
  metadata: Record<string, string>
}

export interface Invoice {
  id: string
  customerId: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  description: string
  dueDate: string
  hostedInvoiceUrl?: string
  invoicePdf?: string
}

export interface Customer {
  id: string
  email: string
  name?: string
  phone?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
}

export interface CreatePaymentIntentData {
  amount: number // in cents
  currency?: string
  description?: string
  customerId?: string
  metadata?: Record<string, string>
  paymentMethodTypes?: string[]
  captureMethod?: 'automatic' | 'manual'
  confirmationMethod?: 'automatic' | 'manual'
  setupFutureUsage?: 'off_session' | 'on_session'
}

export interface CreateInvoiceData {
  customerId: string
  amount: number // in cents
  currency?: string
  description: string
  dueDate?: Date
  metadata?: Record<string, string>
  lineItems?: Array<{
    description: string
    amount: number
    quantity?: number
  }>
  taxRate?: number
  autoAdvance?: boolean
}

export interface CreateCustomerData {
  email: string
  name?: string
  phone?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  metadata?: Record<string, string>
  description?: string
  preferredLocale?: string
}

export interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  billingDetails: {
    name?: string
    email?: string
    phone?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
  }
}

export interface Subscription {
  id: string
  customerId: string
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  items: Array<{
    id: string
    priceId: string
    quantity: number
  }>
}

export interface Price {
  id: string
  productId: string
  unitAmount: number
  currency: string
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount: number
  }
  metadata?: Record<string, string>
}

export interface StripeResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

class StripeServiceClass {
  private readonly publishableKey: string | undefined
  private readonly enabled: boolean
  private stripe: any = null

  constructor() {
    this.publishableKey = config.integrations.stripe.publishableKey
    this.enabled = !!this.publishableKey
    this.initializeStripe()
  }

  private async initializeStripe() {
    if (!this.enabled) return

    try {
      const { loadStripe } = await import('@stripe/stripe-js')
      this.stripe = await loadStripe(this.publishableKey!)
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
    }
  }

  private async makeBackendRequest<T>(
    endpoint: string,
    data: any
  ): Promise<StripeResponse<T>> {
    try {
      const response = await fetch(`/api/stripe${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        data: result.data,
        error: result.error,
        success: result.success
      }
    } catch (error) {
      console.error('Stripe API request failed:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
    }
  }

  async createPaymentIntent(data: CreatePaymentIntentData): Promise<StripeResponse<PaymentIntent>> {
    return this.makeBackendRequest<PaymentIntent>('/payment-intent', data)
  }

  async confirmPayment(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<StripeResponse<PaymentIntent>> {
    if (!this.stripe) {
      return {
        data: null,
        error: 'Stripe not initialized',
        success: false
      }
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      })

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: paymentIntent,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
        success: false
      }
    }
  }

  async createCustomer(data: CreateCustomerData): Promise<StripeResponse<Customer>> {
    return this.makeBackendRequest<Customer>('/customer', data)
  }

  async getCustomer(customerId: string): Promise<StripeResponse<Customer>> {
    return this.makeBackendRequest<Customer>(`/customer/${customerId}`, {})
  }

  async getCustomers(): Promise<StripeResponse<Customer[]>> {
    return this.makeBackendRequest<Customer[]>('/customers', {})
  }

  async getPaymentHistory(customerId: string, limit: number = 10): Promise<StripeResponse<PaymentIntent[]>> {
    return this.makeBackendRequest<PaymentIntent[]>(`/customers/${customerId}/payment-intents?limit=${limit}`, {})
  }

  async updateCustomer(
    customerId: string, 
    data: Partial<CreateCustomerData>
  ): Promise<StripeResponse<Customer>> {
    return this.makeBackendRequest<Customer>(`/customer/${customerId}`, data)
  }

  async createInvoice(data: CreateInvoiceData): Promise<StripeResponse<Invoice>> {
    return this.makeBackendRequest<Invoice>('/invoice', data)
  }

  async getInvoice(invoiceId: string): Promise<StripeResponse<Invoice>> {
    return this.makeBackendRequest<Invoice>(`/invoice/${invoiceId}`, {})
  }

  async sendInvoice(invoiceId: string): Promise<StripeResponse<Invoice>> {
    return this.makeBackendRequest<Invoice>(`/invoice/${invoiceId}/send`, {})
  }

  async voidInvoice(invoiceId: string): Promise<StripeResponse<Invoice>> {
    return this.makeBackendRequest<Invoice>(`/invoice/${invoiceId}/void`, {})
  }

  async getPaymentMethods(customerId: string): Promise<StripeResponse<any[]>> {
    return this.makeBackendRequest<any[]>(`/customers/${customerId}/payment-methods`, {})
  }

  async createSetupIntent(customerId: string): Promise<StripeResponse<{ clientSecret: string }>> {
    return this.makeBackendRequest<{ clientSecret: string }>('/setup-intents', {
      customer: customerId,
      usage: 'off_session'
    })
  }

  // Utility methods
  formatAmount(amountInCents: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amountInCents / 100)
  }

  convertDollarsToCents(dollars: number): number {
    return Math.round(dollars * 100)
  }

  convertCentsToDollars(cents: number): number {
    return cents / 100
  }

  // Project-specific methods
  async createProjectInvoice(
    customerId: string,
    projectName: string,
    amount: number,
    description: string,
    dueDate?: Date
  ): Promise<StripeResponse<Invoice>> {
    const invoiceData: CreateInvoiceData = {
      customerId,
      amount: this.convertDollarsToCents(amount),
      description: `${projectName}: ${description}`,
      dueDate,
      metadata: {
        project: projectName,
        type: 'project_invoice'
      }
    }

    return this.createInvoice(invoiceData)
  }

  async processProjectPayment(
    customerId: string,
    projectName: string,
    amount: number,
    description: string
  ): Promise<StripeResponse<PaymentIntent>> {
    const paymentData: CreatePaymentIntentData = {
      amount: this.convertDollarsToCents(amount),
      description: `${projectName}: ${description}`,
      customerId,
      metadata: {
        project: projectName,
        type: 'project_payment'
      }
    }

    return this.createPaymentIntent(paymentData)
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  get hasPublishableKey(): boolean {
    return !!this.publishableKey
  }

  get stripeInstance(): any {
    return this.stripe
  }
}

export const StripeService = new StripeServiceClass()