'use client';

import { useState, useEffect } from 'react';

interface RevenueStats {
  total_revenue: number;
  creator_payouts: number;
  platform_revenue: number;
  burns_today: number;
  top_creator: {
    creator_id: string;
    username: string;
    daily_earnings: number;
  } | null;
}

export default function RevenueMonitor() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtime, setRealtime] = useState(false);

  useEffect(() => {
    fetchRevenueStats();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRevenueStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRevenueStats = async () => {
    try {
      const response = await fetch('/api/admin/revenue-monitor');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setRealtime(true);
        setTimeout(() => setRealtime(false), 2000); // Show "live" indicator for 2 seconds
      }
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="revenue-monitor-loading bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4">
                <div className="h-8 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-400">
        Unable to load revenue data
      </div>
    );
  }

  return (
    <div className="revenue-monitor bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <h2 className="text-xl font-bold text-white">Live Revenue Engine</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${realtime ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
              {realtime ? 'Live Update' : 'Auto-refreshing every 30s'}
            </div>
          </div>
        </div>
        <button
          onClick={fetchRevenueStats}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Revenue</span>
            <span className="text-green-400">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats.total_revenue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">Today's burns</div>
        </div>

        <div className="stat-card bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Creator Payouts</span>
            <span className="text-blue-400">👥</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${stats.creator_payouts.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">Paid to creators</div>
        </div>

        <div className="stat-card bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Platform Revenue</span>
            <span className="text-purple-400">🏢</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            ${stats.platform_revenue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">Company earnings</div>
        </div>

        <div className="stat-card bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Burns Today</span>
            <span className="text-orange-400">🔥</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {stats.burns_today}
          </div>
          <div className="text-xs text-gray-500">Template usages</div>
        </div>
      </div>

      {stats.top_creator && (
        <div className="top-creator-alert bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-bounce">🔥</div>
            <div className="flex-1">
              <div className="text-yellow-400 font-semibold">
                Top Creator Today
              </div>
              <div className="text-white">
                <strong>{stats.top_creator.username}</strong> is on fire!
              </div>
              <div className="text-gray-300 text-sm">
                Earned ${stats.top_creator.daily_earnings.toFixed(2)} from template burns
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                ${stats.top_creator.daily_earnings.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">today</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>💡 Creators earn 10% • Platform keeps 5% • Users burn 85%</span>
          <span>📊 Data updates every 30 seconds</span>
        </div>
      </div>
    </div>
  );
}