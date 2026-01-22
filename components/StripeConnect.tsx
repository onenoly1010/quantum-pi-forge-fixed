'use client';

import { useState, useEffect } from 'react';

interface StripeStatus {
  connected: boolean;
  onboarding_complete: boolean;
  account_id?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}

export default function StripeConnect({ creatorId }: { creatorId: string }) {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStripeStatus();
  }, [creatorId]);

  const checkStripeStatus = async () => {
    try {
      const response = await fetch(`/api/creator/stripe-status?creator_id=${creatorId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to check Stripe status:', err);
    }
  };

  const createStripeAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/creator/create-stripe-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: creatorId,
          email: 'creator@example.com', // Replace with actual email
          country: 'US'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to onboarding
        startOnboarding();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create Stripe account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      const response = await fetch(`/api/creator/stripe-onboarding-link?creator_id=${creatorId}`);
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.onboarding_url;
      } else {
        setError('Failed to start onboarding process');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const openStripeDashboard = async () => {
    try {
      const response = await fetch(`/api/creator/stripe-dashboard-link?creator_id=${creatorId}`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.dashboard_url, '_blank');
      } else {
        setError('Failed to open Stripe dashboard');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  if (!status) {
    return <div className="text-center py-4">Loading Stripe status...</div>;
  }

  return (
    <div className="stripe-connect-card bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">💳 Stripe Connect</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status.connected && status.onboarding_complete
            ? 'bg-green-100 text-green-800'
            : status.connected
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {status.connected && status.onboarding_complete
            ? '✅ Connected'
            : status.connected
            ? '⏳ Setup Required'
            : '❌ Not Connected'
          }
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!status.connected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Connect your Stripe account to receive automatic payouts when your balance reaches $50.
          </p>
          <button
            onClick={createStripeAccount}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : '🔗 Connect Stripe Account'}
          </button>
        </div>
      ) : !status.onboarding_complete ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Complete your Stripe onboarding to start receiving payouts.
          </p>
          <button
            onClick={startOnboarding}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            🚀 Complete Setup
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            ✅ Your Stripe account is fully connected and ready to receive payouts!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={openStripeDashboard}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              📊 View Dashboard
            </button>
            <button
              onClick={checkStripeStatus}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>
      )}

      {status.connected && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">Account Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Charges: {status.charges_enabled ? '✅' : '❌'}</div>
            <div>Payouts: {status.payouts_enabled ? '✅' : '❌'}</div>
            <div>Details: {status.details_submitted ? '✅' : '❌'}</div>
            <div>Account: {status.account_id?.substring(0, 12)}...</div>
          </div>
        </div>
      )}
    </div>
  );
}