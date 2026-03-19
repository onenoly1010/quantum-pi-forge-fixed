// components/SovereignCircleDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { SovereignCircle, Sovereign } from "@/lib/sovereignCircle";

export function SovereignCircleDisplay() {
  const [sovereigns, setSovereigns] = useState<Sovereign[]>([]);
  const [selectedSovereign, setSelectedSovereign] = useState<number>(0);

  useEffect(() => {
    SovereignCircle.init144Sovereigns().then(setSovereigns);
  }, []);

  return (
    <div className="relative w-full h-[500px]">
      {/* Fractal circle visualization */}
      {sovereigns.map((sovereign, index) => {
        const angle = (index * 2 * Math.PI) / 144;
        const radius = 200;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <div
            key={sovereign.id}
            className="absolute w-8 h-8 rounded-full cursor-pointer transform transition-all duration-300 hover:scale-150 hover:z-50"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              backgroundColor: sovereign.color,
              transform: `translate(-50%, -50%)`,
              boxShadow: `0 0 20px ${sovereign.color}`,
            }}
            onClick={() => setSelectedSovereign(index)}
          >
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: sovereign.color }}
            />
          </div>
        );
      })}

      {/* Center emblem: <O> with sword */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-cyan-400">O</span>
            <div className="absolute w-1 h-40 bg-gradient-to-b from-yellow-500 to-yellow-300 transform rotate-45 -translate-y-8"></div>
          </div>
        </div>
      </div>

      {/* Selected sovereign info */}
      {sovereigns[selectedSovereign] && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="text-white font-semibold">
            Sovereign #{selectedSovereign}
          </div>
          <div className="text-gray-300 text-sm">
            Hash: {sovereigns[selectedSovereign].hash.slice(0, 16)}...
          </div>
          <div className="text-gray-300 text-sm">
            Resonance: {sovereigns[selectedSovereign].resonance.toFixed(1)}%
          </div>
          <div className="text-gray-300 text-sm">
            Status: {sovereigns[selectedSovereign].status}
          </div>
        </div>
      )}
    </div>
  );
}
