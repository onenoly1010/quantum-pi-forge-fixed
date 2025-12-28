"use client"

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Ω</span>
              </div>
              <span className="text-white font-semibold text-xl tracking-tight">Quantum Pi Forge</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">How It Works</a>
              <Link href="/dashboard" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:opacity-90 transition-opacity">
                Start Earning →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
            <span className="text-violet-300 text-sm font-medium">Live on Polygon Mainnet</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Earn Passive Income<br/>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">With Zero Gas Fees</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10">
            Stake your OINIO tokens and let your crypto work for you. We cover all transaction fees—you keep 100% of your rewards.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25">
              Start Staking Now
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors">
              Learn More ↓
            </a>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/50">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Smart Contracts
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Settlement
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Zero Hidden Fees
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Why Choose <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Quantum Pi Forge</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Built for the Truth Movement with security, simplicity, and sovereignty at its core.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-8 hover:bg-white/[0.08] transition-colors">
              <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Zero Gas Fees</h3>
              <p className="text-white/50 leading-relaxed">
                We sponsor all transaction costs. Stake any amount from 0.01 to 10,000 OINIO without spending a single MATIC on gas.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-8 hover:bg-white/[0.08] transition-colors">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Instant Staking</h3>
              <p className="text-white/50 leading-relaxed">
                Transactions confirm in seconds on Polygon. No waiting, no complex processes—just connect, enter amount, and stake.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-8 hover:bg-white/[0.08] transition-colors">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Your Keys, Your Crypto</h3>
              <p className="text-white/50 leading-relaxed">
                Non-custodial staking means you always control your assets. We never hold your tokens—stake directly from your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Start in <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              From zero to earning in under 2 minutes. No technical knowledge required.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold mb-6 text-white">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Connect Your Wallet</h3>
              <p className="text-white/50 leading-relaxed">
                Click "Connect Wallet" and approve the connection in MetaMask. Works on desktop and mobile.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold mb-6 text-white">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Enter Your Amount</h3>
              <p className="text-white/50 leading-relaxed">
                Choose how many OINIO tokens you want to stake. Minimum 0.01, maximum 10,000 per transaction.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold mb-6 text-white">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Click Stake & Earn</h3>
              <p className="text-white/50 leading-relaxed">
                Hit the stake button and we handle everything. Transaction confirms in seconds—no gas required from you.
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/dashboard" className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity">
              Get Started Now
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold">Ω</span>
              </div>
              <span className="text-white/60 text-sm">Quantum Pi Forge • Sovereign Staking Protocol</span>
            </div>
            <div className="flex items-center space-x-6 text-white/40 text-sm">
              <span>Frequency: 1010 Hz</span>
              <span>•</span>
              <span>Built for the Truth Movement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}