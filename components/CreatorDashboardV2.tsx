"use client";

import { useState, useEffect } from "react";
import StripeConnect from "./StripeConnect";
import PremiumTemplateToggle from "./PremiumTemplateToggle";
import CreatorReferral from "./CreatorReferral";
import LaunchBonus from "./LaunchBonus";

interface CreatorDashboardData {
  creator_id: string;
  email: string;
  templates_created: number;
  premium_templates: number;
  total_uses: number;
  total_earnings: number;
  available_balance: number;
  platform_earnings: number;
  stripe_connected: boolean;
  stripe_onboarding_complete: boolean;
  referral_code: string | null;
  referred_creators: number;
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
  const [realtimeEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock creator ID - replace with actual auth
  const creatorId = "test-creator-123";

  // Fetch creator dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, payoutsRes] = await Promise.all([
        fetch(`/api/creator/dashboard?creator_id=${creatorId}`),
        fetch(`/api/creator/recent-payouts?creator_id=${creatorId}`),
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
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayout = async () => {
    if (!dashboard || dashboard.available_balance < 50) return;

    try {
      const response = await fetch("/api/creator/request-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_id: creatorId }),
      });

      if (response.ok) {
        alert("Payout initiated! Funds will arrive in 1-2 business days.");
        fetchDashboardData(); // Refresh data
      } else {
        alert("Failed to initiate payout. Please try again.");
      }
    } catch (error) {
      console.error("Payout request failed:", error);
      alert("Failed to initiate payout. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12 bg-black text-white min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Dashboard Unavailable</h2>
        <p>Please ensure you&apos;re logged in as a creator.</p>
      </div>
    );
  }

  return (
    <div className="creator-dashboard min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="dashboard-header mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Creator Earnings Dashboard
          </h1>
          <div className="flex items-center text-green-400 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Live Updates Active
          </div>

          {/* Launch Bonus - Always visible */}
          <LaunchBonus />
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "earnings", label: "Earnings", icon: "💰" },
              { id: "templates", label: "Templates", icon: "🎨" },
              { id: "referrals", label: "Referrals", icon: "👥" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            {/* Earnings Overview */}
            <div className="earnings-overview grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="stat-card bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-2">
                  Available Balance
                </h3>
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
                    💸 Request Payout (${dashboard.available_balance.toFixed(2)}
                    )
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
                <h3 className="text-lg font-semibold mb-2">
                  Templates Created
                </h3>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {dashboard.templates_created}
                </div>
                <div className="text-sm text-gray-400">
                  {dashboard.premium_templates} premium • {dashboard.total_uses}{" "}
                  total uses
                </div>
              </div>
            </div>

            {/* Recent Earnings */}
            <div className="recent-payouts bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-8">
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
                      <tr
                        key={payout.id}
                        className="border-t border-gray-700 hover:bg-gray-750"
                      >
                        <td className="p-4">{payout.template_name}</td>
                        <td className="p-4">
                          {payout.user_email.substring(0, 8)}...
                        </td>
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
                        <td
                          colSpan={4}
                          className="p-8 text-center text-gray-400"
                        >
                          No earnings yet. Create templates and share them to
                          start earning!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="earnings-tab">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="earnings-breakdown bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">
                  Earnings Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Burns Processed</span>
                    <span className="font-semibold">
                      ${(dashboard.total_earnings / 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Your Share (10%)</span>
                    <span className="font-semibold">
                      ${dashboard.total_earnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-purple-400">
                    <span>Platform Fee (5%)</span>
                    <span className="font-semibold">
                      ${dashboard.platform_earnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>Available to Payout</span>
                    <span className="font-semibold">
                      ${dashboard.available_balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <StripeConnect creatorId={creatorId} />
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="templates-tab">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">
                Template Management
              </h3>
              <p className="text-gray-400 mb-6">
                Convert your templates to premium to start earning money on
                every use.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mock template cards - replace with real data */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="template-card bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">Template {i + 1}</h4>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      FREE
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    A beautiful template for creating amazing things.
                  </p>
                  <PremiumTemplateToggle
                    templateId={`template-${i + 1}`}
                    isPremium={false}
                    currentPrice={9.99}
                    onToggle={(isPremium, price) => {
                      console.log(
                        `Template ${i + 1} set to ${isPremium ? "premium" : "free"} at $${price}`,
                      );
                      // Refresh dashboard data
                      fetchDashboardData();
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="referrals-tab">
            <CreatorReferral creatorId={creatorId} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-tab">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StripeConnect creatorId={creatorId} />

              <div className="account-settings bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={dashboard.email}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Creator ID
                    </label>
                    <input
                      type="text"
                      value={dashboard.creator_id}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Earnings are paid automatically when your balance reaches $50.
            Manual payouts available above that threshold.
          </p>
          <div className="text-sm text-gray-500">
            Platform takes 5% fee, you keep 10% of every burn on your templates.
          </div>
        </div>
      </div>
    </div>
  );
}
