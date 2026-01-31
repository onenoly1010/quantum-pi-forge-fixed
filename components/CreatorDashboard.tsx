'use client';

import { useState, useEffect } from 'react';

interface CreatorDashboardData {
  creator_id: string;
  email: string;
  templates_created: number;
  total_uses: number;
  total_earnings: number;
  available_balance: number;
  platform_earnings: number;
}

interface RecentPayout {
  id: string;
  template_name: string;
  user_email: string;
  creator_share: number;
  created_at: string;
}

export default function CreatorDashboard() {
  const [dashboard, setDashboard] = useState<CreatorDashboardData | null>(null);
  const [recentPayouts, setRecentPayouts] = useState<RecentPayout[]>([]);
  const [realtimeEarnings, ] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch creator dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, payoutsRes] = await Promise.all([
        fetch('/api/creator/dashboard'),
        fetch('/api/creator/recent-payouts')
      ]);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setDashboard(dashboardData);
      }

      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setRecentPayouts(payoutsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayout = async () => {
    if (!dashboard || dashboard.available_balance < 50) return;

    try {
      const response = await fetch('/api/creator/request-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('Payout initiated! Funds will arrive in 1-2 business days.');
        fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to initiate payout. Please try again.');
      }
    } catch (error) {
      console.error('Payout request failed:', error);
      alert('Failed to initiate payout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Dashboard Unavailable</h2>
        <p>Please ensure you&apos;re logged in as a creator.</p>
      </div>
    );
  }

  return (
    <div className="creator-dashboard max-w-6xl mx-auto p-6">
      <div className="dashboard-header mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Earnings Dashboard</h1>
        <div className="flex items-center text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          Live Updates Active
        </div>
      </div>

      <div className="earnings-overview grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Available Balance</h3>
          <div className="text-3xl font-bold text-green-400 mb-1">
            ${dashboard.available_balance.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mb-4">
            +${realtimeEarnings.toFixed(2)} pending
          </div>
          {dashboard.available_balance >= 50 && (
            <button
              onClick={initiatePayout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              💸 Request Payout (${dashboard.available_balance.toFixed(2)})
            </button>
          )}
        </div>

        <div className="stat-card bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
          <div className="text-3xl font-bold text-blue-400 mb-1">
            ${dashboard.total_earnings.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">All time</div>
        </div>

        <div className="stat-card bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Templates Created</h3>
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {dashboard.templates_created}
          </div>
          <div className="text-sm text-gray-400">
            {dashboard.total_uses} total uses
          </div>
        </div>
      </div>

      <div className="recent-payouts bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold">Recent Earnings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-4">Template</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.map((payout) => (
                <tr key={payout.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="p-4">{payout.template_name}</td>
                  <td className="p-4">{payout.user_email.substring(0, 8)}...</td>
                  <td className="p-4 text-green-400 font-semibold">
                    +${payout.creator_share.toFixed(2)}
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(payout.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {recentPayouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No earnings yet. Create templates and share them to start earning!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-400 mb-4">
          Earnings are paid automatically when your balance reaches $50.
          Manual payouts available above that threshold.
        </p>
        <div className="text-sm text-gray-500">
          Platform takes 5% fee, you keep 10% of every burn on your templates.
        </div>
      </div>
    </div>
  );
}