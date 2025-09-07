import { config } from '@/lib/env'
import { notifications } from '@/lib/notifications'

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
    this.enabled = config.integrations.stripe.enabled
    this.initializeStripe()
  }

  private async initializeStripe() {
    if (this.enabled && this.publishableKey && typeof window !== 'undefined') {
      try {
        // Dynamically import Stripe
        const { loadStripe } = await import('@stripe/stripe-js')
        this.stripe = await loadStripe(this.publishableKey)
      } catch (error) {
        console.error('Failed to load Stripe:', error)
      }
    }
  }

  private async makeBackendRequest<T>(
    endpoint: string,
    data: any
  ): Promise<StripeResponse<T>> {
    if (!this.enabled) {
      return {
        data: null,
        error: 'Stripe integration is not configured',
        success: false
      }
    }

    try {
      // In a real implementation, this would call your backend API
      // which would use the Stripe secret key to make the actual API calls
      const response = await fetch(`/api/stripe${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notifications.error(`Stripe Error: ${errorMessage}`)
      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }

  async createPaymentIntent(data: CreatePaymentIntentData): Promise<StripeResponse<PaymentIntent>> {
    const response = await this.makeBackendRequest<PaymentIntent>('/payment-intents', {
      amount: data.amount,
      currency: data.currency || 'usd',
      description: data.description,
      customer: data.customerId,
      metadata: data.metadata || {}
    })

    if (response.success) {
      notifications.success('Payment intent created successfully')
    }

    return response
  }

  async confirmPayment(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<StripeResponse<PaymentIntent>> {
    if (!this.stripe) {
      return {
        data: null,
        error: 'Stripe is not initialized',
        success: false
      }
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        clientSecret,
        payment_method: paymentMethodId,
        return_url: `${window.location.origin}/payment/success`
      })

      if (error) {
        notifications.error(error.message)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      const intent: PaymentIntent = {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata
      }

      notifications.success('Payment confirmed successfully')
      return {
        data: intent,
        error: null,
        success: true
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment confirmation failed'
      notifications.error(errorMessage)
      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }

  async createCustomer(data: CreateCustomerData): Promise<StripeResponse<Customer>> {
    const response = await this.makeBackendRequest<Customer>('/customers', {
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.address,
      metadata: data.metadata || {}
    })

    if (response.success) {
      notifications.success('Customer created successfully')
    }

    return response
  }

  async getCustomer(customerId: string): Promise<StripeResponse<Customer>> {
    return this.makeBackendRequest<Customer>(`/customers/${customerId}`, {})
  }

  async updateCustomer(
    customerId: string, 
    data: Partial<CreateCustomerData>
  ): Promise<StripeResponse<Customer>> {
    const response = await this.makeBackendRequest<Customer>(`/customers/${customerId}`, data)

    if (response.success) {
      notifications.success('Customer updated successfully')
    }

    return response
  }

  async createInvoice(data: CreateInvoiceData): Promise<StripeResponse<Invoice>> {
    const response = await this.makeBackendRequest<Invoice>('/invoices', {
      customer: data.customerId,
      amount: data.amount,
      currency: data.currency || 'usd',
      description: data.description,
      due_date: data.dueDate?.getTime() ? Math.floor(data.dueDate.getTime() / 1000) : undefined,
      metadata: data.metadata || {}
    })

    if (response.success) {
      notifications.success('Invoice created successfully')
    }

    return response
  }

  async getInvoice(invoiceId: string): Promise<StripeResponse<Invoice>> {
    return this.makeBackendRequest<Invoice>(`/invoices/${invoiceId}`, {})
  }

  async sendInvoice(invoiceId: string): Promise<StripeResponse<Invoice>> {
    const response = await this.makeBackendRequest<Invoice>(`/invoices/${invoiceId}/send`, {})

    if (response.success) {
      notifications.success('Invoice sent successfully')
    }

    return response
  }

  async voidInvoice(invoiceId: string): Promise<StripeResponse<Invoice>> {
    const response = await this.makeBackendRequest<Invoice>(`/invoices/${invoiceId}/void`, {})

    if (response.success) {
      notifications.success('Invoice voided successfully')
    }

    return response
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
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100)
  }

  convertDollarsToCents(dollars: number): number {
    return Math.round(dollars * 100)
  }

  convertCentsToDollars(cents: number): number {
    return cents / 100
  }

  // Project-specific helper methods
  async createProjectInvoice(
    customerId: string,
    projectName: string,
    amount: number,
    description: string,
    dueDate?: Date
  ): Promise<StripeResponse<Invoice>> {
    return this.createInvoice({
      customerId,
      amount: this.convertDollarsToCents(amount),
      description: `${projectName}: ${description}`,
      dueDate,
      metadata: {
        project_name: projectName,
        type: 'project_invoice'
      }
    })
  }

  async processProjectPayment(
    customerId: string,
    projectName: string,
    amount: number,
    description: string
  ): Promise<StripeResponse<PaymentIntent>> {
    return this.createPaymentIntent({
      amount: this.convertDollarsToCents(amount),
      description: `${projectName}: ${description}`,
      customerId,
      metadata: {
        project_name: projectName,
        type: 'project_payment'
      }
    })
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

  // Additional methods for enhanced functionality
  async getPaymentMethods(customerId: string): Promise<StripeResponse<PaymentMethod[]>> {
    const response = await this.makeBackendRequest<PaymentMethod[]>(`/customers/${customerId}/payment-methods`, {})
    
    if (response.success) {
      return {
        data: response.data,
        error: null,
        success: true
      }
    }
    
    return response
  }

  async createSetupIntent(customerId: string): Promise<StripeResponse<{ clientSecret: string }>> {
    const response = await this.makeBackendRequest<{ clientSecret: string }>('/setup-intents', {
      customer: customerId,
      usage: 'off_session'
    })
    
    if (response.success) {
      notifications.success('Setup intent created successfully')
    }
    
    return response
  }

  async createSubscription(customerId: string, priceId: string, quantity: number = 1): Promise<StripeResponse<Subscription>> {
    const response = await this.makeBackendRequest<Subscription>('/subscriptions', {
      customer: customerId,
      items: [{
        price: priceId,
        quantity: quantity
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })
    
    if (response.success) {
      notifications.success('Subscription created successfully')
    }
    
    return response
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true): Promise<StripeResponse<Subscription>> {
    const response = await this.makeBackendRequest<Subscription>(`/subscriptions/${subscriptionId}`, {
      cancel_at_period_end: atPeriodEnd
    })
    
    if (response.success) {
      notifications.success('Subscription canceled successfully')
    }
    
    return response
  }

  async getSubscription(subscriptionId: string): Promise<StripeResponse<Subscription>> {
    const response = await this.makeBackendRequest<Subscription>(`/subscriptions/${subscriptionId}`, {})
    return response
  }

  async getCustomerSubscriptions(customerId: string): Promise<StripeResponse<Subscription[]>> {
    const response = await this.makeBackendRequest<Subscription[]>(`/customers/${customerId}/subscriptions`, {})
    return response
  }

  async createPrice(productId: string, unitAmount: number, currency: string = 'usd', recurring?: { interval: 'day' | 'week' | 'month' | 'year', intervalCount?: number }): Promise<StripeResponse<Price>> {
    const response = await this.makeBackendRequest<Price>('/prices', {
      product: productId,
      unit_amount: unitAmount,
      currency: currency,
      recurring: recurring
    })
    
    if (response.success) {
      notifications.success('Price created successfully')
    }
    
    return response
  }

  async getPrices(productId?: string): Promise<StripeResponse<Price[]>> {
    const params = productId ? `?product=${productId}` : ''
    const response = await this.makeBackendRequest<Price[]>(`/prices${params}`, {})
    return response
  }

  async refundPayment(paymentIntentId: string, amount?: number, reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'): Promise<StripeResponse<{ id: string, status: string }>> {
    const response = await this.makeBackendRequest<{ id: string, status: string }>('/refunds', {
      payment_intent: paymentIntentId,
      amount: amount,
      reason: reason
    })
    
    if (response.success) {
      notifications.success('Refund processed successfully')
    }
    
    return response
  }

  async getPaymentHistory(customerId: string, limit: number = 10): Promise<StripeResponse<PaymentIntent[]>> {
    const response = await this.makeBackendRequest<PaymentIntent[]>(`/customers/${customerId}/payment-intents`, {
      limit: limit
    })
    return response
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

  // Business-specific methods
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
      currency: 'usd',
      description: `${projectName}: ${description}`,
      customerId,
      metadata: {
        project: projectName,
        type: 'project_payment'
      }
    }

    return this.createPaymentIntent(paymentData)
  }
}

export const StripeService = new StripeServiceClass()
