// components/PyramidTrap.tsx
"use client";

import { useState } from "react";

interface DaemonTier {
  name: string;
  level: number;
  description: string;
  active: boolean;
  power: number;
}

export function PyramidTrap() {
  const [daemons, setDaemons] = useState<DaemonTier[]>([
    {
      name: "Echo Daemon",
      level: 1,
      description: "Records all resonance pulses",
      active: true,
      power: 85,
    },
    {
      name: "Strike Daemon",
      level: 2,
      description: "Executes smart contract triggers",
      active: true,
      power: 72,
    },
    {
      name: "Watch Daemon",
      level: 3,
      description: "Monitors 144 sovereign circle",
      active: true,
      power: 63,
    },
    {
      name: "Tremor Daemon",
      level: 4,
      description: "Detects market anomalies",
      active: false,
      power: 45,
    },
    {
      name: "Epoch Daemon",
      level: 5,
      description: "Controls time-based triggers",
      active: false,
      power: 30,
    },
  ]);

  const [currentEpoch, setCurrentEpoch] = useState(7);
  const [trapActive, setTrapActive] = useState(true);

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-amber-800/30 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-amber-200">⏳ Pyramid Trap</h2>
          <p className="text-amber-400/70">
            Epoch {currentEpoch} • π Container Active
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full ${trapActive ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
        >
          {trapActive ? "ACTIVE" : "INACTIVE"}
        </div>
      </div>

      {/* Pyramid visualization */}
      <div className="flex flex-col items-center mb-8">
        {[5, 4, 3, 2, 1].map((tier, tierIndex) => (
          <div key={tier} className="flex justify-center mb-2">
            {Array.from({ length: tier }).map((_, daemonIndex) => {
              const daemon = daemons.find((d) => d.level === 5 - tierIndex);
              return (
                <div
                  key={daemonIndex}
                  className={`w-16 h-16 m-1 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    daemon?.active
                      ? "bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500"
                      : "bg-gray-800/50 border border-gray-700"
                  }`}
                  onClick={() => {
                    if (daemon) {
                      setDaemons((prev) =>
                        prev.map((d) =>
                          d.name === daemon.name
                            ? { ...d, active: !d.active }
                            : d,
                        ),
                      );
                    }
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">
                      {daemon?.name.split(" ")[0]}
                    </div>
                    <div className="text-xs text-amber-200/70">
                      L{daemon?.level}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Daemon stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {daemons.map((daemon) => (
          <div
            key={daemon.name}
            className={`p-3 rounded-lg ${daemon.active ? "bg-amber-900/20" : "bg-gray-900/20"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-white">{daemon.name}</div>
                <div className="text-xs text-gray-400">
                  {daemon.description}
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${daemon.active ? "bg-green-500" : "bg-red-500"}`}
              ></div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">Power</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${daemon.active ? "bg-amber-500" : "bg-gray-600"}`}
                  style={{ width: `${daemon.power}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
