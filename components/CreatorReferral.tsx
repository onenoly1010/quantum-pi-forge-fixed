'use client';

import { useState, useEffect } from 'react';

interface ReferralStats {
  referral_code: string | null;
  referred_creators: number;
  total_earnings: number;
  referral_link: string | null;
}

export default function CreatorReferral({ creatorId }: { creatorId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, [creatorId]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`/api/creator/referral-stats?creator_id=${creatorId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    }
  };

  const createReferralLink = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/creator/create-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId })
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => prev ? {
          ...prev,
          referral_code: data.referral_code,
          referral_link: data.referral_link
        } : {
          referral_code: data.referral_code,
          referred_creators: 0,
          total_earnings: 0,
          referral_link: data.referral_link
        });
      } else {
        alert('Failed to create referral link');
      }
    } catch (error) {
      console.error('Error creating referral:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!stats?.referral_link) return;

    try {
      await navigator.clipboard.writeText(stats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = stats.referral_link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="referral-card bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👥</span>
        <h3 className="text-lg font-semibold">Invite Other Creators</h3>
      </div>

      <p className="text-gray-600 mb-4">
        Earn <strong className="text-purple-600">5% of their earnings forever</strong> when creators join with your referral link!
      </p>

      {!stats?.referral_code ? (
        <button
          onClick={createReferralLink}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mb-4"
        >
          {loading ? 'Creating Link...' : '🎯 Create Referral Link'}
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={stats.referral_link || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {stats.referred_creators}
              </div>
              <div className="text-sm text-gray-600">Referred Creators</div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                ${stats.total_earnings.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Earned from Referrals</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <span>💡</span>
              <span className="text-sm font-medium">Pro Tip</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Share your link in Discord, Twitter, or creator communities. Every creator who joins earns you passive income!
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-purple-200">
        <div className="text-xs text-gray-500">
          📈 Referral earnings are paid automatically • 🔗 Link never expires • 💰 5% commission on all their template earnings
        </div>
      </div>
    </div>
  );
}