"use client"

import React from 'react'
import { PiAuthButton } from '@/components/PiAuthButton'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Quantum Pi Forge
          </h1>
          <PiAuthButton />
        </header>

        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
              Welcome to Quantum Pi Forge
            </h2>
            <p className="text-gray-300 mb-4">
              Connect your Pi Network account to access the OINIO sovereign economy on Polygon.
            </p>
          </section>

          <ProtectedRoute 
            fallback={
              <div className="bg-gray-800 rounded-lg p-8 border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">
                  🔒 Protected Content
                </h3>
                <p className="text-gray-400">
                  Connect with Pi Network to access exclusive features and content.
                </p>
              </div>
            }
          >
            <div className="bg-gray-800 rounded-lg p-8 border border-green-500/20">
              <h3 className="text-xl font-semibold mb-4 text-green-300">
                ✅ Authenticated Content
              </h3>
              <p className="text-gray-300">
                You are now authenticated with Pi Network! You can access all features.
              </p>
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </main>
  )
}