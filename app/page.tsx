// app/page.tsx - Final integration
'use client'

import Hero from '@/components/Hero'
import Features from '@/components/Features'
import { EternalForge } from '@/components/EternalForge'
import { SovereignCircleDisplay } from '@/components/SovereignCircleDisplay'
import { LiquidityNet } from '@/components/LiquidityNet'
import { PyramidTrap } from '@/components/PyramidTrap'
import { PiNetworkIntegration } from '@/components/PiNetworkIntegration'
import { GeminiMinting } from '@/components/GeminiMinting'

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

      {/* Phase 4.5: Pi Network & Gemini Integration */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-900 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              🌐 Multi-Chain Integration
            </h2>
            <p className="text-gray-400">
              Connect across ecosystems - Pi Network, Gemini AI, and Polygon
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PiNetworkIntegration />
            <GeminiMinting />
          </div>
        </div>
      </section>

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
        <div className="mt-6 space-x-4">
          <a href="/dashboard" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold hover:shadow-2xl hover:shadow-purple-500/30 transition-all inline-block">
            Enter The Forge • Stake OINIO
          </a>
          <a href="/creator" className="px-8 py-3 border border-gray-600 rounded-full text-gray-300 font-bold hover:bg-gray-800 transition-all inline-block">
            Creator Portal
          </a>
        </div>
      </div>
    </div>
  )
}