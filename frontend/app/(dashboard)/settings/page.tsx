'use client'

import { useToast } from '@/lib/toast'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Shield, Bell, LogOut } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/shared/Card'

export default function SettingsPage() {
  const { addToast } = useToast()
  const { user } = useAuth()

  const handleReconnect = () => {
    addToast('Gmail reconnection flow started', 'info')
  }

  const handleDisconnect = () => {
    addToast('Gmail account disconnected', 'success')
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Email Integration */}
      <Card>
        <CardHeader border={true}>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              Email Integration
            </h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Account
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.email || 'No email connected'}
                  </p>
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    ● Connected
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Connected on:</p>
                  <p className="text-sm font-medium text-gray-900">
                    May 15, 2025
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Sync
            </label>
            <p className="text-gray-900">2 minutes ago</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Connected Permissions:</span> Read emails,
              download attachments, mark emails as read
            </p>
          </div>
        </CardContent>

        <CardFooter border={true} className="space-x-3">
          <button
            onClick={handleReconnect}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            Reconnect
          </button>
          <button
            onClick={handleDisconnect}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Disconnect
          </button>
        </CardFooter>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader border={true}>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <p className="text-gray-600 mb-3">
              Last changed 3 months ago
            </p>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Change Password
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Two-Factor Authentication
            </label>
            <p className="text-gray-600 mb-3">Not enabled</p>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Enable 2FA
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader border={true}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {[
            {
              name: 'Email Notifications',
              description: 'Receive updates about processed contracts',
              enabled: true,
            },
            {
              name: 'High Risk Alerts',
              description: 'Get notified when high-risk contracts are detected',
              enabled: true,
            },
            {
              name: 'Renewal Reminders',
              description:
                'Receive reminders for contracts expiring soon',
              enabled: false,
            },
            {
              name: 'Sync Updates',
              description: 'Get notified when inbox sync completes',
              enabled: true,
            },
          ].map((notification, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{notification.name}</p>
                <p className="text-sm text-gray-600">
                  {notification.description}
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={notification.enabled}
                  className="w-5 h-5 rounded border-gray-300 text-primary"
                />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader border={true} className="border-red-200">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Email
            </label>
            <p className="text-gray-900 font-medium">{user?.email || 'No email'}</p>
          </div>

          <div className="border-t border-red-200 pt-6">
            <p className="text-sm text-red-900 mb-3">
              Deleting your account is permanent and cannot be undone.
            </p>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Delete Account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
