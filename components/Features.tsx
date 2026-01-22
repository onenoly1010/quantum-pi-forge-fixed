'use client'

import {
  QuantumOrbitSVG,
  PiSymbolSVG,
  StakingSVG,
  VRGlassesSVG,
  TrophySVG
} from '@/components/SvgIcons'

const features = [
  {
    icon: <QuantumOrbitSVG className="w-10 h-10 text-orange-600" />,
    title: 'Quantum Mining',
    description: 'Real-time Pi digit computation with quantum-inspired processing algorithms. Zero gas fees.',
    gradient: 'from-orange-500/10 to-orange-600/5',
    color: 'orange'
  },
  {
    icon: <StakingSVG className="w-10 h-10 text-purple-600" />,
    title: 'Token Staking',
    description: 'Earn 5.5% APY • Zero fees • Instant confirmation on Polygon network.',
    gradient: 'from-purple-500/10 to-purple-600/5',
    color: 'purple'
  },
  {
    icon: <VRGlassesSVG className="w-10 h-10 text-blue-600" />,
    title: 'VR Experience',
    description: 'Immersive mining sessions and interactive quantum exploration.',
    gradient: 'from-blue-500/10 to-blue-600/5',
    color: 'blue'
  },
  {
    icon: <TrophySVG className="w-10 h-10 text-green-600" />,
    title: 'Leaderboard',
    description: 'Compete globally with real-time rankings and rewards.',
    gradient: 'from-green-500/10 to-green-600/5',
    color: 'green'
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <QuantumOrbitSVG className="w-8 h-8 text-orange-500" />
            <h2 className="text-4xl font-bold text-gray-900">
              Quantum-Powered Features
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need for sovereign digital economy participation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group"
              onClick={() => console.log(`Selected: ${feature.title}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && console.log(`Selected: ${feature.title}`)}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>

              <div className="flex items-center text-sm font-medium">
                <span className={`text-${feature.color}-600`}>Learn more</span>
                <svg className={`w-4 h-4 ml-2 text-${feature.color}-500 group-hover:translate-x-1 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Hover effect line */}
              <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 transition-all duration-300 rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-bold text-gray-900">Instant Start</h4>
            </div>
            <p className="text-gray-700">Begin mining Pi in under 60 seconds. No downloads, no installation.</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="font-bold text-gray-900">Zero Gas Fees</h4>
            </div>
            <p className="text-gray-700">Powered by Polygon gasless meta-transactions. Never pay for gas.</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h4 className="font-bold text-gray-900">Global Leaderboard</h4>
            </div>
            <p className="text-gray-700">Compete with miners worldwide. Real-time rankings and rewards.</p>
          </div>
        </div>
      </div>
    </section>
  )
}