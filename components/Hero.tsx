'use client'

import { useState, useEffect } from 'react'
import { QuantumOrbitSVG, PiSymbolSVG } from '@/components/SvgIcons'
import { PiCalculator } from '@/lib/piCalculator'

export default function Hero() {
  const [piDigits, setPiDigits] = useState('3.14159265358979323846')
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    let mounted = true

    const calculatePi = async () => {
      if (isCalculating || !mounted) return

      setIsCalculating(true)
      try {
        // Using BBP formula with precision
        const digits = await PiCalculator.computeDigits(50)
        if (mounted) {
          setPiDigits(digits)
        }
      } catch (error) {
        console.error('Error calculating Pi:', error)
      } finally {
        if (mounted) {
          setIsCalculating(false)
        }
      }
    }

    calculatePi()
    const interval = setInterval(calculatePi, 15000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const handleConnectWallet = () => {
    // This will be connected to WalletConnect component
    console.log('Connect wallet clicked')
    // Scroll to wallet section
    document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Hero text */}
          <div className="text-left lg:text-left">
            <div className="inline-flex items-center gap-3 mb-8 bg-gradient-to-r from-orange-100 to-purple-100 rounded-full px-4 py-2">
              <QuantumOrbitSVG className="w-6 h-6" />
              <span className="text-sm font-semibold text-gray-700">Quantum-Powered</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Forge <span className="gradient-text">Quantum Pi</span> in Real-Time
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Compute Pi digits with quantum-inspired algorithms.
              Stake tokens at <span className="font-bold text-orange-600">5.5% APY</span>.
              Zero gas fees on Polygon. Join the sovereign economy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleConnectWallet}
                className="btn-primary text-lg py-3 px-8 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 16h-1v-4h1m0-4h-1v2h1m5-7H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                </svg>
                Connect Wallet & Start Mining
              </button>
              <button className="btn-secondary text-lg py-3 px-8">
                Watch Demo (60s)
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No installation needed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Zero gas fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Instant start</span>
              </div>
            </div>
          </div>

          {/* Right column - Pi visualization */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-500 opacity-10 rounded-3xl transform rotate-3 blur-xl"></div>

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                    <PiSymbolSVG className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Live Quantum Computation</h3>
                    <p className="text-sm text-gray-500">{isCalculating ? 'Calculating...' : 'Updated every 15s'}</p>
                  </div>
                </div>
                <QuantumOrbitSVG className="w-8 h-8 text-orange-500" />
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">π =</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isCalculating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                      <span className="text-gray-400 text-sm">
                        {isCalculating ? 'Quantum computing...' : 'Quantum-ready'}
                      </span>
                    </div>
                  </div>
                  <div className="pi-display text-green-400 text-lg md:text-xl font-medium overflow-x-auto pb-2">
                    {piDigits}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Digits Computed</div>
                    <div className="text-2xl font-bold text-gray-800">1,247,892</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Global Rank</div>
                    <div className="text-2xl font-bold text-orange-600">#842</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Quantum Mining Progress</span>
                    <span className="text-orange-600 font-semibold">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: '42%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}