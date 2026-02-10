"use client";

import { useState, useEffect } from "react";

interface LaunchBonusData {
  bonus_active: boolean;
  bonus_remaining: number;
  bonus_multiplier: number;
  total_bonuses_used: number;
}

export default function LaunchBonus() {
  const [bonus, setBonus] = useState<LaunchBonusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBonusStatus();
  }, []);

  const fetchBonusStatus = async () => {
    try {
      const response = await fetch("/api/creator/launch-bonus");
      if (response.ok) {
        const data = await response.json();
        setBonus(data);
      }
    } catch (error) {
      console.error("Failed to fetch bonus status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="launch-bonus-skeleton bg-gray-100 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!bonus?.bonus_active) {
    return (
      <div className="launch-bonus-ended bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎉</span>
          <h3 className="text-lg font-semibold text-gray-700">
            Launch Bonus Complete!
          </h3>
        </div>
        <p className="text-gray-600 text-sm">
          The launch bonus period has ended. All{" "}
          {bonus?.total_bonuses_used || 0} bonuses have been claimed by early
          creators.
        </p>
      </div>
    );
  }

  const progressPercentage = ((100 - bonus.bonus_remaining) / 100) * 100;

  return (
    <div className="launch-bonus-active bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200 rounded-full -mr-10 -mt-10 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-200 rounded-full -ml-8 -mb-8 opacity-20"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-bounce">🚀</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                LAUNCH BONUS ACTIVE
              </h3>
              <div className="text-sm text-yellow-700 font-medium">
                Limited Time Only!
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600">
              {bonus.bonus_remaining}
            </div>
            <div className="text-xs text-gray-600">bonuses left</div>
          </div>
        </div>

        <p className="text-gray-700 mb-4">
          Earn{" "}
          <strong className="text-yellow-600 text-lg">
            {bonus.bonus_multiplier}x more
          </strong>{" "}
          on your first{" "}
          <strong className="text-yellow-600">100 template burns</strong>!
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Bonus Progress</span>
            <span>{100 - bonus.bonus_remaining}/100 used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-yellow-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800 mb-1">
              🔥 {bonus.bonus_multiplier}x Earnings Multiplier
            </div>
            <div className="text-sm text-gray-600">
              Next {Math.min(10, bonus.bonus_remaining)} burns get bonus
              earnings!
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <span>⏰ Limited time offer</span>
          <span>💰 Earn {bonus.bonus_multiplier}x more on template usage</span>
        </div>
      </div>

      {/* Fire animation effect */}
      <div className="absolute bottom-2 right-2 text-yellow-500 animate-pulse">
        🔥
      </div>
    </div>
  );
}
