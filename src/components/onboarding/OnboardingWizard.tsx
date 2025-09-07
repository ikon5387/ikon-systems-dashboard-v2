import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/ui/Logo'
import { 
  FiCheck, 
  FiArrowRight, 
  FiArrowLeft, 
  FiUser, 
  FiCreditCard, 
  FiCalendar,
  FiPhone,
  FiGlobe,
  FiSettings
} from 'react-icons/fi'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface ContractorData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Business Information
  businessName: string
  businessType: string
  website: string
  address: string
  
  // Services
  services: string[]
  
  // Billing
  billingEmail: string
  paymentMethod: string
  
  // Integrations
  googleCalendar: boolean
  stripe: boolean
  twilio: boolean
  vapi: boolean
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [contractorData, setContractorData] = useState<ContractorData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    website: '',
    address: '',
    services: [],
    billingEmail: '',
    paymentMethod: '',
    googleCalendar: false,
    stripe: false,
    twilio: false,
    vapi: false,
  })

  const steps: OnboardingStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      icon: <FiUser className="w-5 h-5" />,
      completed: !!(contractorData.firstName && contractorData.lastName && contractorData.email)
    },
    {
      id: 'business',
      title: 'Business Details',
      description: 'Your business information',
      icon: <FiUser className="w-5 h-5" />,
      completed: !!(contractorData.businessName && contractorData.businessType)
    },
    {
      id: 'services',
      title: 'Services',
      description: 'What services do you offer?',
      icon: <FiSettings className="w-5 h-5" />,
      completed: contractorData.services.length > 0
    },
    {
      id: 'billing',
      title: 'Billing Setup',
      description: 'Payment and billing preferences',
      icon: <FiCreditCard className="w-5 h-5" />,
      completed: !!(contractorData.billingEmail && contractorData.paymentMethod)
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect your tools',
      icon: <FiGlobe className="w-5 h-5" />,
      completed: contractorData.googleCalendar || contractorData.stripe || contractorData.twilio || contractorData.vapi
    }
  ]

  const updateData = (field: keyof ContractorData, value: any) => {
    setContractorData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    // Here you would typically send the data to your backend
    console.log('Onboarding completed:', contractorData)
    // Show success message and redirect
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={contractorData.firstName}
                onChange={(e) => updateData('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
              <Input
                label="Last Name"
                value={contractorData.lastName}
                onChange={(e) => updateData('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={contractorData.email}
              onChange={(e) => updateData('email', e.target.value)}
              placeholder="your@email.com"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={contractorData.phone}
              onChange={(e) => updateData('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        )

      case 1: // Business Details
        return (
          <div className="space-y-6">
            <Input
              label="Business Name"
              value={contractorData.businessName}
              onChange={(e) => updateData('businessName', e.target.value)}
              placeholder="Your Business Name"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Type
                </label>
                <select
                  value={contractorData.businessType}
                  onChange={(e) => updateData('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500/20"
                >
                  <option value="">Select business type</option>
                  <option value="consulting">Consulting</option>
                  <option value="agency">Agency</option>
                  <option value="freelance">Freelance</option>
                  <option value="contractor">Contractor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Website"
                value={contractorData.website}
                onChange={(e) => updateData('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <Input
              label="Business Address"
              value={contractorData.address}
              onChange={(e) => updateData('address', e.target.value)}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
        )

      case 2: // Services
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What services do you offer? (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Web Development',
                  'Mobile App Development',
                  'UI/UX Design',
                  'Digital Marketing',
                  'SEO Services',
                  'Content Creation',
                  'Consulting',
                  'Project Management',
                  'Data Analysis',
                  'Other'
                ].map((service) => (
                  <label key={service} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contractorData.services.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateData('services', [...contractorData.services, service])
                        } else {
                          updateData('services', contractorData.services.filter(s => s !== service))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3: // Billing
        return (
          <div className="space-y-6">
            <Input
              label="Billing Email"
              type="email"
              value={contractorData.billingEmail}
              onChange={(e) => updateData('billingEmail', e.target.value)}
              placeholder="billing@yourbusiness.com"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preferred Payment Method
              </label>
              <div className="space-y-3">
                {[
                  { value: 'stripe', label: 'Credit Card (Stripe)', icon: <FiCreditCard className="w-5 h-5" /> },
                  { value: 'paypal', label: 'PayPal', icon: <FiCreditCard className="w-5 h-5" /> },
                  { value: 'bank', label: 'Bank Transfer', icon: <FiCreditCard className="w-5 h-5" /> }
                ].map((method) => (
                  <label key={method.value} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={contractorData.paymentMethod === method.value}
                      onChange={(e) => updateData('paymentMethod', e.target.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    {method.icon}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 4: // Integrations
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Connect your tools (Optional - you can set these up later)
              </label>
              <div className="space-y-4">
                {[
                  { key: 'googleCalendar', label: 'Google Calendar', icon: <FiCalendar className="w-5 h-5" />, description: 'Sync appointments and events' },
                  { key: 'stripe', label: 'Stripe', icon: <FiCreditCard className="w-5 h-5" />, description: 'Process payments and invoices' },
                  { key: 'twilio', label: 'Twilio', icon: <FiPhone className="w-5 h-5" />, description: 'Send SMS notifications' },
                  { key: 'vapi', label: 'VAPI', icon: <FiPhone className="w-5 h-5" />, description: 'AI voice agents and calls' }
                ].map((integration) => (
                  <label key={integration.key} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contractorData[integration.key as keyof ContractorData] as boolean}
                      onChange={(e) => updateData(integration.key as keyof ContractorData, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-3">
                      {integration.icon}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{integration.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Ikon Systems
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's get your contractor account set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${index === currentStep 
                    ? 'border-primary-500 bg-primary-500 text-white' 
                    : step.completed 
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400'
                  }
                `}>
                  {step.completed ? <FiCheck className="w-5 h-5" /> : step.icon}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${index === currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {steps[currentStep].icon}
              <span>{steps[currentStep].title}</span>
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={completeOnboarding}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
            >
              <span>Complete Setup</span>
              <FiCheck className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!steps[currentStep].completed}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
            >
              <span>Next</span>
              <FiArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
