// Billing and Usage Tracking Service
export interface UsageMetric {
  id: string
  contractorId: string
  metric: string
  value: number
  unit: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface BillingCycle {
  id: string
  contractorId: string
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'cancelled'
  totalUsage: number
  totalCost: number
  currency: string
  invoiceId?: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
}

export interface PricingTier {
  id: string
  name: string
  description: string
  basePrice: number
  currency: string
  billingInterval: 'monthly' | 'yearly'
  includedUsage: Record<string, number> // metric -> limit
  overageRates: Record<string, number> // metric -> rate per unit
  features: string[]
}

export interface ContractorSubscription {
  id: string
  contractorId: string
  pricingTierId: string
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  metadata?: Record<string, any>
}

class BillingServiceClass {
  private usageMetrics: UsageMetric[] = []
  private billingCycles: BillingCycle[] = []
  private subscriptions: ContractorSubscription[] = []
  
  // Default pricing tiers
  private pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small contractors',
      basePrice: 29,
      currency: 'USD',
      billingInterval: 'monthly',
      includedUsage: {
        clients: 50,
        projects: 10,
        appointments: 100,
        voice_agent_calls: 500,
        sms_messages: 200
      },
      overageRates: {
        clients: 0.50,
        projects: 2.00,
        appointments: 0.25,
        voice_agent_calls: 0.10,
        sms_messages: 0.05
      },
      features: [
        'Basic CRM',
        'Appointment scheduling',
        'Email notifications',
        'Basic reporting'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing businesses',
      basePrice: 79,
      currency: 'USD',
      billingInterval: 'monthly',
      includedUsage: {
        clients: 200,
        projects: 50,
        appointments: 500,
        voice_agent_calls: 2000,
        sms_messages: 1000
      },
      overageRates: {
        clients: 0.40,
        projects: 1.50,
        appointments: 0.20,
        voice_agent_calls: 0.08,
        sms_messages: 0.04
      },
      features: [
        'Advanced CRM',
        'Project management',
        'Voice agents',
        'SMS notifications',
        'Advanced reporting',
        'API access'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      basePrice: 199,
      currency: 'USD',
      billingInterval: 'monthly',
      includedUsage: {
        clients: 1000,
        projects: 200,
        appointments: 2000,
        voice_agent_calls: 10000,
        sms_messages: 5000
      },
      overageRates: {
        clients: 0.30,
        projects: 1.00,
        appointments: 0.15,
        voice_agent_calls: 0.06,
        sms_messages: 0.03
      },
      features: [
        'Unlimited everything',
        'Custom integrations',
        'Priority support',
        'White-label options',
        'Advanced analytics',
        'Dedicated account manager'
      ]
    }
  ]

  // Usage Tracking
  recordUsage(contractorId: string, metric: string, value: number, unit: string, metadata?: Record<string, any>): void {
    const usageMetric: UsageMetric = {
      id: this.generateId(),
      contractorId,
      metric,
      value,
      unit,
      timestamp: new Date(),
      metadata
    }

    this.usageMetrics.push(usageMetric)
    this.checkUsageThresholds(contractorId, metric, value)
  }

  getUsageForPeriod(contractorId: string, startDate: Date, endDate: Date): Record<string, number> {
    const usage = this.usageMetrics.filter(metric => 
      metric.contractorId === contractorId &&
      metric.timestamp >= startDate &&
      metric.timestamp <= endDate
    )

    const aggregated: Record<string, number> = {}
    usage.forEach(metric => {
      aggregated[metric.metric] = (aggregated[metric.metric] || 0) + metric.value
    })

    return aggregated
  }

  // Billing Cycle Management
  createBillingCycle(contractorId: string, startDate: Date, endDate: Date): BillingCycle {
    const billingCycle: BillingCycle = {
      id: this.generateId(),
      contractorId,
      startDate,
      endDate,
      status: 'active',
      totalUsage: 0,
      totalCost: 0,
      currency: 'USD',
      paymentStatus: 'pending'
    }

    this.billingCycles.push(billingCycle)
    return billingCycle
  }

  calculateBillingCycleCost(billingCycleId: string): number {
    const billingCycle = this.billingCycles.find(bc => bc.id === billingCycleId)
    if (!billingCycle) return 0

    const subscription = this.subscriptions.find(sub => 
      sub.contractorId === billingCycle.contractorId && 
      sub.status === 'active'
    )
    if (!subscription) return 0

    const pricingTier = this.pricingTiers.find(tier => tier.id === subscription.pricingTierId)
    if (!pricingTier) return 0

    const usage = this.getUsageForPeriod(
      billingCycle.contractorId,
      billingCycle.startDate,
      billingCycle.endDate
    )

    let totalCost = pricingTier.basePrice

    // Calculate overage costs
    Object.entries(usage).forEach(([metric, value]) => {
      const included = pricingTier.includedUsage[metric] || 0
      const overage = Math.max(0, value - included)
      const rate = pricingTier.overageRates[metric] || 0
      
      if (overage > 0) {
        totalCost += overage * rate
      }
    })

    billingCycle.totalCost = totalCost
    billingCycle.totalUsage = Object.values(usage).reduce((sum, val) => sum + val, 0)

    return totalCost
  }

  // Subscription Management
  createSubscription(contractorId: string, pricingTierId: string, trialDays?: number): ContractorSubscription {
    const now = new Date()
    const trialEnd = trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : undefined
    const periodStart = trialEnd || now
    const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const subscription: ContractorSubscription = {
      id: this.generateId(),
      contractorId,
      pricingTierId,
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      trialEnd
    }

    this.subscriptions.push(subscription)
    return subscription
  }

  updateSubscriptionStatus(subscriptionId: string, status: ContractorSubscription['status']): void {
    const subscription = this.subscriptions.find(sub => sub.id === subscriptionId)
    if (subscription) {
      subscription.status = status
    }
  }

  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): void {
    const subscription = this.subscriptions.find(sub => sub.id === subscriptionId)
    if (subscription) {
      subscription.cancelAtPeriodEnd = cancelAtPeriodEnd
      if (!cancelAtPeriodEnd) {
        subscription.status = 'cancelled'
      }
    }
  }

  // Automated Billing
  async processMonthlyBilling(): Promise<void> {
    const now = new Date()
    const activeSubscriptions = this.subscriptions.filter(sub => 
      sub.status === 'active' && 
      sub.currentPeriodEnd <= now
    )

    for (const subscription of activeSubscriptions) {
      try {
        await this.processBillingForSubscription(subscription)
      } catch (error) {
        console.error(`Failed to process billing for subscription ${subscription.id}:`, error)
        subscription.status = 'past_due'
      }
    }
  }

  private async processBillingForSubscription(subscription: ContractorSubscription): Promise<void> {
    // Create new billing cycle
    const newBillingCycle = this.createBillingCycle(
      subscription.contractorId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    )

    // Calculate cost
    const cost = this.calculateBillingCycleCost(newBillingCycle.id)

    // Create Stripe invoice
    const invoice = await this.createStripeInvoice(subscription.contractorId, cost, newBillingCycle.id)
    
    if (invoice) {
      newBillingCycle.invoiceId = invoice.id
      newBillingCycle.paymentStatus = 'paid'
      newBillingCycle.status = 'completed'

      // Extend subscription period
      subscription.currentPeriodStart = subscription.currentPeriodEnd
      subscription.currentPeriodEnd = new Date(subscription.currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000)
    } else {
      newBillingCycle.paymentStatus = 'failed'
      subscription.status = 'past_due'
    }
  }

  private async createStripeInvoice(_contractorId: string, amount: number, _billingCycleId: string): Promise<any> {
    // This would integrate with Stripe API
    // For now, we'll simulate a successful payment
    return {
      id: `inv_${this.generateId()}`,
      amount,
      status: 'paid'
    }
  }

  // Usage Thresholds and Alerts
  private checkUsageThresholds(contractorId: string, metric: string, _value: number): void {
    const subscription = this.subscriptions.find(sub => 
      sub.contractorId === contractorId && 
      sub.status === 'active'
    )
    if (!subscription) return

    const pricingTier = this.pricingTiers.find(tier => tier.id === subscription.pricingTierId)
    if (!pricingTier) return

    const included = pricingTier.includedUsage[metric] || 0
    const currentUsage = this.getCurrentPeriodUsage(contractorId, metric)
    
    // Alert at 80% of included usage
    if (currentUsage >= included * 0.8 && currentUsage < included) {
      this.sendUsageAlert(contractorId, metric, currentUsage, included, 'warning')
    }
    
    // Alert when over limit
    if (currentUsage > included) {
      this.sendUsageAlert(contractorId, metric, currentUsage, included, 'critical')
    }
  }

  private getCurrentPeriodUsage(contractorId: string, metric: string): number {
    const subscription = this.subscriptions.find(sub => 
      sub.contractorId === contractorId && 
      sub.status === 'active'
    )
    if (!subscription) return 0

    const usage = this.getUsageForPeriod(
      contractorId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    )

    return usage[metric] || 0
  }

  private sendUsageAlert(contractorId: string, metric: string, current: number, limit: number, severity: 'warning' | 'critical'): void {
    // This would integrate with the monitoring service
    console.log(`Usage alert for ${contractorId}: ${metric} usage is ${current}/${limit} (${severity})`)
  }

  // Data Retrieval
  getPricingTiers(): PricingTier[] {
    return this.pricingTiers
  }

  getSubscription(contractorId: string): ContractorSubscription | undefined {
    return this.subscriptions.find(sub => 
      sub.contractorId === contractorId && 
      sub.status === 'active'
    )
  }

  getBillingHistory(contractorId: string): BillingCycle[] {
    return this.billingCycles
      .filter(bc => bc.contractorId === contractorId)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  }

  getUsageHistory(contractorId: string, days: number = 30): UsageMetric[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return this.usageMetrics
      .filter(metric => 
        metric.contractorId === contractorId && 
        metric.timestamp > cutoff
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Utility Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Initialize billing for new contractor
  initializeContractorBilling(contractorId: string, pricingTierId: string = 'starter'): ContractorSubscription {
    return this.createSubscription(contractorId, pricingTierId, 14) // 14-day trial
  }
}

export const BillingService = new BillingServiceClass()
