'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Save, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile Settings
  const [profileData, setProfileData] = useState({
    email: '',
    phone: '',
    bio: '',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailRecipeApproval: true,
    emailRecipeRejection: true,
    emailWeeklyStats: true,
    emailNewFollower: false,
    emailRecipeComment: true,
    emailMarketingUpdates: false,
  });

  // Payment Settings
  const [paymentData, setPaymentData] = useState({
    paypalEmail: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
  });

  // Privacy Settings
  const [privacyData, setPrivacyData] = useState({
    profileVisibility: 'public',
    allowMessages: true,
    showRecipeStats: true,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    timeFormat: '12h',
    measurementUnit: 'metric',
    language: 'en',
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Delete Account
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSettings();
    }
  }, [user, authLoading]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Fetch user data
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user?.user_id)
        .single();

      if (data) {
        setProfileData({
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });

        setPaymentData({
          paypalEmail: data.paypal_email || '',
          bankAccountName: data.bank_account_name || '',
          bankAccountNumber: data.bank_account_number || '',
          bankRoutingNumber: data.bank_routing_number || '',
        });
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('sellers')
        .update({
          email: profileData.email,
          phone: profileData.phone,
          bio: profileData.bio,
        })
        .eq('user_id', user?.user_id);

      if (error) throw error;
      setSuccessMessage('Profile settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('sellers')
        .update({
          paypal_email: paymentData.paypalEmail,
          bank_account_name: paymentData.bankAccountName,
          bank_account_number: paymentData.bankAccountNumber,
          bank_routing_number: paymentData.bankRoutingNumber,
        })
        .eq('user_id', user?.user_id);

      if (error) throw error;
      setSuccessMessage('Payment settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setErrorMessage('Please type DELETE to confirm');
      return;
    }

    try {
      setSaving(true);
      // Delete user data
      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('user_id', user?.user_id);

      if (error) throw error;
      
      setSuccessMessage('Account deleted successfully!');
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 bg-[#f8fafb] min-h-screen">
        <h1 className="text-3xl font-bold text-[#1a2632] mb-8">Settings</h1>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            ✓ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} /> {errorMessage}
          </div>
        )}

        {/* Profile Settings Section */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2632] mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
                placeholder="Tell us about yourself..."
              />
            </div>
            <button
              onClick={saveProfileSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-[#0d9488] text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:bg-gray-400 transition"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2632] mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { key: 'emailRecipeApproval', label: 'Recipe Approval Notifications' },
              { key: 'emailRecipeRejection', label: 'Recipe Rejection Alerts' },
              { key: 'emailWeeklyStats', label: 'Weekly Stats Summary' },
              { key: 'emailNewFollower', label: 'New Follower Notifications' },
              { key: 'emailRecipeComment', label: 'Recipe Comments & Reviews' },
              { key: 'emailMarketingUpdates', label: 'Marketing & Promotional Emails' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [key]: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-[#e5e7eb]"
                />
                <span className="text-[#1a2632]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Settings Section */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2632] mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">PayPal Email</label>
              <input
                type="email"
                value={paymentData.paypalEmail}
                onChange={(e) => setPaymentData({ ...paymentData, paypalEmail: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
                placeholder="paypal@email.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1a2632] mb-2">Bank Account Name</label>
                <input
                  type="text"
                  value={paymentData.bankAccountName}
                  onChange={(e) => setPaymentData({ ...paymentData, bankAccountName: e.target.value })}
                  className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
                  placeholder="Your Bank Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2632] mb-2">Routing Number</label>
                <input
                  type="text"
                  value={paymentData.bankRoutingNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, bankRoutingNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
                  placeholder="Routing Number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Account Number</label>
              <input
                type="password"
                value={paymentData.bankAccountNumber}
                onChange={(e) => setPaymentData({ ...paymentData, bankAccountNumber: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
                placeholder="Account Number (Hidden)"
              />
            </div>
            <button
              onClick={savePaymentSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-[#0d9488] text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:bg-gray-400 transition"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Payment Info'}
            </button>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2632] mb-4">Privacy & Security</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Profile Visibility</label>
              <select
                value={privacyData.profileVisibility}
                onChange={(e) => setPrivacyData({ ...privacyData, profileVisibility: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
              >
                <option value="public">Public (Visible to everyone)</option>
                <option value="private">Private (Only visible to followers)</option>
                <option value="followers">Followers Only</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyData.allowMessages}
                onChange={(e) => setPrivacyData({ ...privacyData, allowMessages: e.target.checked })}
                className="w-4 h-4 rounded border-[#e5e7eb]"
              />
              <span className="text-[#1a2632]">Allow direct messages from other chefs</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyData.showRecipeStats}
                onChange={(e) => setPrivacyData({ ...privacyData, showRecipeStats: e.target.checked })}
                className="w-4 h-4 rounded border-[#e5e7eb]"
              />
              <span className="text-[#1a2632]">Show recipe statistics publicly</span>
            </label>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a2632] mb-4">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Measurement Unit</label>
              <select
                value={preferences.measurementUnit}
                onChange={(e) => setPreferences({ ...preferences, measurementUnit: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
              >
                <option value="metric">Metric (kg, ml)</option>
                <option value="imperial">Imperial (lbs, cups)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Time Format</label>
              <select
                value={preferences.timeFormat}
                onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
              >
                <option value="12h">12-Hour (AM/PM)</option>
                <option value="24h">24-Hour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2632] mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#0d9488]"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertCircle size={24} /> Danger Zone
          </h2>
          <p className="text-red-700 mb-4">Deleting your account is permanent and cannot be undone.</p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Account Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-red-600 mb-3">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. All your recipes and data will be permanently deleted.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-3">Type <strong>DELETE</strong> to confirm:</p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-4 py-2 border border-red-300 rounded-lg mb-4 focus:outline-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirm('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition"
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}