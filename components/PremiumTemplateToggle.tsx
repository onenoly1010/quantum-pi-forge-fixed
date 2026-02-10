"use client";

import { useState } from "react";

interface PremiumTemplateToggleProps {
  templateId: string;
  isPremium: boolean;
  currentPrice: number;
  onToggle: (isPremium: boolean, price: number) => void;
}

export default function PremiumTemplateToggle({
  templateId,
  isPremium,
  currentPrice,
  onToggle,
}: PremiumTemplateToggleProps) {
  const [price, setPrice] = useState(currentPrice || 9.99);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (isPremium) {
      // Make free
      onToggle(false, 0);
    } else {
      // Make premium
      setLoading(true);
      try {
        const response = await fetch("/api/templates/make-premium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            price: price,
            creator_id: "current-creator-id", // Replace with actual creator ID
          }),
        });

        if (response.ok) {
          onToggle(true, price);
        } else {
          alert("Failed to make template premium");
        }
      } catch (error) {
        console.error("Error making template premium:", error);
        alert("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="premium-toggle bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isPremium ? "⭐" : "✨"}</span>
          <span className="font-medium">
            {isPremium ? "Premium Template" : "Make Template Premium"}
          </span>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            isPremium
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isPremium ? "PAID" : "FREE"}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {isPremium
          ? `Users pay $${price} to use this template. You earn 10% of every purchase!`
          : "Charge users for access to this template and earn money on every use."}
      </p>

      {!isPremium && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            min="0.99"
            max="99.99"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="9.99"
          />
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
          isPremium
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
        } disabled:opacity-50`}
      >
        {loading
          ? "Processing..."
          : isPremium
            ? "Make Free"
            : `Make Premium ($${price})`}
      </button>

      <div className="mt-3 text-xs text-gray-500">
        💰 Earn 10% of every purchase • 📊 Track earnings in your dashboard
      </div>
    </div>
  );
}
