import { useState, useEffect } from 'react'
import { 
  FiSearch, 
  FiPhone,
  FiMessageSquare,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEyeOff,
  FiSend,
  FiVolume2,
  FiGlobe,
  FiExternalLink
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { TwilioService, PhoneNumber } from '@/services/integrations/TwilioService'
import { notifications } from '@/lib/notifications'

export function PhoneNumbersPage() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [loading, setLoading] = useState(false)
  const [twilioConnected, setTwilioConnected] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [_deletingNumber, setDeletingNumber] = useState<PhoneNumber | null>(null)
  const [activeTab, setActiveTab] = useState<'numbers' | 'twilio'>('numbers')

  const twilioService = TwilioService

  useEffect(() => {
    checkTwilioConnection()
  }, [])

  const checkTwilioConnection = async () => {
    try {
      const response = await twilioService.getPhoneNumbers()
      setTwilioConnected(response.success)
      if (response.success) {
        loadPhoneNumbers()
      }
    } catch (error) {
      console.error('Failed to check Twilio connection:', error)
    }
  }

  const loadPhoneNumbers = async () => {
    try {
      setLoading(true)
      const response = await twilioService.getPhoneNumbers()
      if (response.success && response.data) {
        setPhoneNumbers(response.data)
      }
    } catch (error) {
      console.error('Failed to load phone numbers:', error)
      notifications.error('Failed to load phone numbers')
    } finally {
      setLoading(false)
    }
  }

  const sendTestSMS = async (phoneNumber: string) => {
    try {
      const response = await twilioService.sendSMS({ to: phoneNumber, message: 'Test message from Ikon Systems Dashboard' })
      if (response.success) {
        notifications.success('Test SMS sent successfully')
      } else {
        notifications.error('Failed to send test SMS')
      }
    } catch (error) {
      notifications.error('Failed to send test SMS')
    }
  }

  const maskKey = (key: string) => {
    if (!key) return 'Not configured'
    if (showKeys) return key
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4)
  }

  const filteredNumbers = phoneNumbers.filter(number =>
    number.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    number.friendlyName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please sign in to view phone numbers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Phone Numbers</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your Twilio phone numbers and SMS capabilities
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          {twilioConnected && (
            <Button
              onClick={loadPhoneNumbers}
              variant="outline"
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('numbers')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'numbers'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiPhone className="w-4 h-4" />
            Phone Numbers
          </button>
          <button
            onClick={() => setActiveTab('twilio')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'twilio'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            Twilio
            {twilioConnected ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs">
                Connected
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 text-xs">
                Disconnected
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'numbers' && (
        <>
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search phone numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Phone Numbers List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading phone numbers..." />
            </div>
          ) : filteredNumbers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FiPhone className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {searchQuery ? 'No phone numbers found' : 'No phone numbers'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search criteria.'
                    : 'No phone numbers found in your Twilio account.'
                  }
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" target="_blank" rel="noopener noreferrer">
                      <FiExternalLink className="w-4 h-4 mr-2" />
                      Buy Phone Numbers
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNumbers.map((number) => (
                <Card key={number.id} className="card-hover group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                          {number.phoneNumber}
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {number.friendlyName || 'No friendly name'}
                        </p>
                      </div>
                      <Badge className={`${
                        number.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      } text-xs font-medium`}>
                        {number.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Capabilities */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Capabilities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {number.capabilities.voice && (
                          <Badge variant="outline" className="text-xs">
                            <FiVolume2 className="w-3 h-3 mr-1" />
                            Voice
                          </Badge>
                        )}
                        {number.capabilities.sms && (
                          <Badge variant="outline" className="text-xs">
                            <FiMessageSquare className="w-3 h-3 mr-1" />
                            SMS
                          </Badge>
                        )}
                        {number.capabilities.mms && (
                          <Badge variant="outline" className="text-xs">
                            <FiMessageSquare className="w-3 h-3 mr-1" />
                            MMS
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <FiGlobe className="w-4 h-4" />
                      <span>{number.region}, {number.countryCode}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {number.capabilities.sms && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => sendTestSMS(number.phoneNumber)}
                        >
                          <FiSend className="w-3 h-3 mr-1" />
                          Test SMS
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <a href={`https://console.twilio.com/us1/develop/phone-numbers/manage/incoming/${number.id}`} target="_blank" rel="noopener noreferrer">
                          <FiExternalLink className="w-3 h-3 mr-1" />
                          Configure
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'twilio' && (
        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5" />
                Twilio Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {twilioConnected ? (
                  <>
                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Connected
                    </Badge>
                  </>
                ) : (
                  <>
                    <FiXCircle className="w-5 h-5 text-red-500" />
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                      Not Connected
                    </Badge>
                  </>
                )}
              </div>
              
              <p className="text-slate-600 dark:text-slate-400">
                {twilioConnected 
                  ? 'Your Twilio account is connected and ready to send SMS messages and manage phone numbers.'
                  : 'Connect your Twilio account to send SMS messages and manage phone numbers.'
                }
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Account SID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                      {maskKey('your-twilio-account-sid')}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowKeys(!showKeys)}
                    >
                      {showKeys ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Auth Token
                  </label>
                  <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                    {maskKey('your-twilio-auth-token')}
                  </code>
                </div>
              </div>

              <div className="flex gap-3">
                <Button asChild>
                  <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer">
                    <FiExternalLink className="w-4 h-4 mr-2" />
                    Twilio Console
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://www.twilio.com/docs" target="_blank" rel="noopener noreferrer">
                    <FiExternalLink className="w-4 h-4 mr-2" />
                    Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <FiPhone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Numbers</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {phoneNumbers.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <FiMessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">SMS Enabled</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {phoneNumbers.filter(n => n.capabilities.sms).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <FiVolume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Voice Enabled</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {phoneNumbers.filter(n => n.capabilities.voice).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Available Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'SMS Messaging',
                  'Phone Number Management',
                  'Message Templates',
                  'Delivery Tracking',
                  'International Support',
                  'Bulk Messaging',
                  'Webhook Integration',
                  'Message History'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          // Handle delete logic here
          setDeletingNumber(null)
          setShowConfirmDialog(false)
        }}
        title="Delete Phone Number"
        message={`Are you sure you want to delete this phone number? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

export default PhoneNumbersPage
