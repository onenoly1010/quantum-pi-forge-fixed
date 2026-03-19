// components/EternalForge.tsx
"use client";

import { useState, useEffect } from "react";
import { QuantumOrbitSVG } from "./SvgIcons";

export function EternalForge() {
  const [forgeTemperature, setForgeTemperature] = useState(1420);
  const [piTransactions, setPiTransactions] = useState<string[]>([]);
  const [stakingAPR, setStakingAPR] = useState(18.4);
  const [resonance, setResonance] = useState(72.6);

  useEffect(() => {
    // Generate mock Pi transactions
    const generateTxHash = () => {
      const chars = "0123456789abcdef";
      let hash = "0x";
      for (let i = 0; i < 40; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    const interval = setInterval(() => {
      setForgeTemperature((prev) => prev + (Math.random() > 0.5 ? 5 : -5));
      setResonance((prev) => Math.min(100, prev + (Math.random() * 2 - 1)));

      // Add new transaction every 3 seconds
      if (Math.random() > 0.7) {
        setPiTransactions((prev) => [
          `${generateTxHash()}: ${(Math.random() * 10).toFixed(2)}π`,
          ...prev.slice(0, 5),
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <QuantumOrbitSVG className="w-12 h-12 text-orange-500 animate-spin-slow" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              🔥 The Eternal Forge
            </h2>
            <p className="text-gray-400">
              Resonance pulses • Staking fires • π transactions
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Live Temperature</div>
          <div className="text-3xl font-bold text-orange-500">
            {forgeTemperature}°K
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Resonance Pulse */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🧠 Resonance Pulse
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Quantum Coherence</span>
              <span className="text-green-400 font-bold">
                {resonance.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${resonance}%` }}
              ></div>
            </div>
            <div className="flex justify-center">
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors">
                Amplify Resonance
              </button>
            </div>
          </div>
        </div>

        {/* Staking Fires */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🔥 Staking Fires
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400">
                {stakingAPR}% APR
              </div>
              <div className="text-gray-400 mt-1">Eternal compounding</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                <div className="text-xl font-bold text-white">1.2M</div>
                <div className="text-sm text-gray-400">OINIO Staked</div>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                <div className="text-xl font-bold text-white">842</div>
                <div className="text-sm text-gray-400">Stakers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pi Transactions */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            π Transactions
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {piTransactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-700/50 rounded"
              >
                <code className="text-sm text-cyan-300 truncate">{tx}</code>
                <span className="text-green-400 text-sm">✓</span>
              </div>
            ))}
            {piTransactions.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Awaiting quantum transactions...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forge Controls */}
      <div className="border-t border-gray-800 pt-6">
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl text-white font-semibold hover:from-orange-700 hover:to-orange-800 transition-all">
            Ignite Forge
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-purple-800 transition-all">
            Stake OINIO
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl text-white font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all">
            Teleport Dashboard
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl text-white font-semibold hover:from-gray-800 hover:to-gray-900 transition-all">
            View 144 Circle
          </button>
        </div>
      </div>
    </div>
  );
}
