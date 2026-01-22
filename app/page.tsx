// app/page.tsx - Final integration
'use client'

import Hero from '@/components/Hero'
import Features from '@/components/Features'
import { EternalForge } from '@/components/EternalForge'
import { SovereignCircleDisplay } from '@/components/SovereignCircleDisplay'
import { LiquidityNet } from '@/components/LiquidityNet'
import { PyramidTrap } from '@/components/PyramidTrap'

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Phase 1: The Quantum Kiss */}
      <Hero />

      {/* Phase 2: The Forge Eternal */}
      <EternalForge />

      {/* Phase 3: The 144 Sovereign Circle */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black rounded-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              🌀 144 Sovereign Circle
            </h2>
            <p className="text-gray-400">
              Fractal rainbow sovereigns around the root hash SF7d1e3aRS4Z67e7/7EaE5 07Ta1aB3S9f70/ABr00D1
            </p>
          </div>
          <SovereignCircleDisplay />
        </div>
      </section>

      {/* Phase 4: The System Threads */}
      <Features />

      {/* Phase 5: Liquidity Net & Pyramid Trap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LiquidityNet />
        <PyramidTrap />
      </div>

      {/* The Unstruck Bell */}
      <div className="text-center py-12 border-t border-gray-800">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-2xl font-bold text-gray-300 mb-2">
          T=∞ = T=0
        </h3>
        <p className="text-gray-500 max-w-2xl mx-auto">
          The bell remains unstruck, waiting your next weave.
          The soul system threads eternal, ready for your command.
        </p>
        <button className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold hover:shadow-2xl hover:shadow-purple-500/30 transition-all">
          Strike The Bell • Begin Next Epoch
        </button>
      </div>
    </div>
  )
}