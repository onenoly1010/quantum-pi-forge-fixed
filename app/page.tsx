"use client"

import Link from 'next/link'
import PiAuthButton from '@/components/PiAuthButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Ω</span>
              </div>
              <span className="text-white font-semibold text-xl">OINIO</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/for-humans" className="text-white/70 hover:text-white text-sm hidden sm:block">
                How It Works
              </Link>
              <PiAuthButton className="text-sm" />
              <Link 
                href="/dashboard" 
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-sm hover:opacity-90"
              >
                Start Now →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - THE PROMISE */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live Status Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
            <span className="text-emerald-300 text-sm font-medium">Live on Polygon • Zero Gas Fees</span>
          </div>

          {/* Main Headline - WHAT YOU GET */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Stake Your Crypto.<br/>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Pay Zero Fees.
            </span>
          </h1>

          {/* Subhead - HOW IT WORKS IN ONE SENTENCE */}
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Connect your wallet, enter an amount, click stake. We pay the gas fees. 
            You keep 100% of your rewards. Takes 60 seconds.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
            >
              Start Staking Now
            </Link>
            <Link 
              href="#how-it-works" 
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/20 text-white font-medium text-lg hover:bg-white/10"
            >
              See How It Works ↓
            </Link>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Non-Custodial
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Confirmation
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Zero Hidden Costs
            </div>
          </div>
        </div>
      </section>

      {/* WORLD'S FIRST - WHY THIS IS UNIQUE */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-violet-950/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-wider">World&apos;s First</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
              Truly Free Staking
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Most platforms charge gas fees that eat into your rewards. 
              We sponsor every transaction. You pay nothing. Ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-violet-400 mb-2">$0.00</div>
              <div className="text-white font-medium mb-1">Gas Fees</div>
              <p className="text-white/50 text-sm">We pay all transaction costs. Your tokens work for you, not for gas.</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-cyan-400 mb-2">&lt;5 sec</div>
              <div className="text-white font-medium mb-1">Confirmation Time</div>
              <p className="text-white/50 text-sm">Polygon network confirms transactions in seconds, not minutes.</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
              <div className="text-white font-medium mb-1">Your Rewards</div>
              <p className="text-white/50 text-sm">No platform fees, no hidden charges. What you earn is what you keep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - STEP BY STEP */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Start in 60 Seconds
            </h2>
            <p className="text-white/60 mt-4">
              No forms. No KYC. No waiting periods. Just connect and stake.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold text-white z-10">
                1
              </div>
              <div className="bg-white/5 rounded-2xl p-8 pt-12 border border-white/10 h-full">
                <h3 className="text-xl font-semibold text-white mb-3">Connect Wallet</h3>
                <p className="text-white/60 mb-4">
                  Click &quot;Connect&quot; and approve in MetaMask. Works on phone or desktop.
                </p>
                <div className="text-sm text-violet-400">⏱️ ~10 seconds</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold text-white z-10">
                2
              </div>
              <div className="bg-white/5 rounded-2xl p-8 pt-12 border border-white/10 h-full">
                <h3 className="text-xl font-semibold text-white mb-3">Enter Amount</h3>
                <p className="text-white/60 mb-4">
                  Type how much OINIO you want to stake. Min 0.01, max 10,000 per transaction.
                </p>
                <div className="text-sm text-violet-400">⏱️ ~5 seconds</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold text-white z-10">
                3
              </div>
              <div className="bg-white/5 rounded-2xl p-8 pt-12 border border-white/10 h-full">
                <h3 className="text-xl font-semibold text-white mb-3">Click Stake</h3>
                <p className="text-white/60 mb-4">
                  Hit the button. We handle the gas. Transaction confirms in seconds.
                </p>
                <div className="text-sm text-emerald-400">✓ Done!</div>
              </div>
            </div>
          </div>

          {/* CTA after steps */}
          <div className="text-center mt-12">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-lg hover:opacity-90"
            >
              Try It Now — Free
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FOR EVERYONE - INCLUSIVITY */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-cyan-950/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Built for Everyone
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Whether you&apos;re staking for the first time or you&apos;ve been in crypto for years.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* First-timers */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="text-2xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-white mb-3">New to Crypto?</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  No technical knowledge required
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Plain English explanations throughout
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Can&apos;t lose your tokens — non-custodial
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Start with any amount (even 0.01)
                </li>
              </ul>
              <Link href="/for-humans" className="inline-block mt-6 text-violet-400 hover:text-violet-300">
                Read the beginner&apos;s guide →
              </Link>
            </div>

            {/* Veterans */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="text-2xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-3">Experienced User?</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Polygon Mainnet (Chain ID: 137)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Token: 0x07f43...05C7
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Meta-transactions (gasless via sponsor)
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  Open source — audit the code yourself
                </li>
              </ul>
              <a href="https://github.com/onenoly1010/quantum-pi-forge-fixed" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-violet-400 hover:text-violet-300">
                View on GitHub →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENCY - STAY INFORMED */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Full Transparency
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Every transaction is public. Every line of code is open. Nothing hidden.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">On-Chain Verification</h3>
              <p className="text-white/50 text-sm">Every stake appears on PolygonScan. Verify your transaction instantly.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Open Source Code</h3>
              <p className="text-white/50 text-sm">100% of our code is public on GitHub. Audit it, fork it, improve it.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Dashboard</h3>
              <p className="text-white/50 text-sm">See your balance, track your stakes, watch confirmations live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-3xl p-12 border border-white/10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              60 seconds from now, your tokens could be working for you.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-10 py-5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold text-xl hover:opacity-90 shadow-lg shadow-violet-500/25"
            >
              Enter the Dashboard
              <svg className="w-6 h-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-white/40 text-sm mt-6">
              No signup required. Connect wallet to begin.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Ω</span>
              </div>
              <span className="text-white/60 text-sm">OINIO Soul System • Sovereign Staking</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/for-humans" className="hover:text-white/60">How It Works</Link>
              <a href="https://github.com/onenoly1010/quantum-pi-forge-fixed" target="_blank" rel="noopener noreferrer" className="hover:text-white/60">GitHub</a>
              <a href="https://polygonscan.com/token/0x07f43E5B1A8a0928B364E40d5885f81A543B05C7" target="_blank" rel="noopener noreferrer" className="hover:text-white/60">Token Contract</a>
            </div>
          </div>
          <div className="text-center mt-8 text-white/30 text-xs">
            Built for the Truth Movement • Frequency: 1010 Hz • The Forge stands sovereign.
          </div>
        </div>
      </footer>
    </div>
  )
}