import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Quantum Pi Forge
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A constellation of autonomous services for creators, contributors, and communities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Enter the Forge
            </Link>
            <Link
              href="/for-humans"
              className="border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* What Is the Quantum Pi Forge? Section */}
        <section className="mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              What Is the Quantum Pi Forge?
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-300 mb-4">
                The Quantum Pi Forge is a constellation of autonomous services designed to empower creators, contributors, and communities.
              </p>
              <p className="text-lg text-gray-300 mb-4">
                It's an open, sovereign system that anyone can join, shape, and build with.
              </p>
              <p className="text-lg text-gray-300">
                You don't need technical expertise — just curiosity and the desire to participate.
              </p>
            </div>
          </div>
        </section>

        {/* Why This Matters Section */}
        <section className="mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Why This Matters
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-300 mb-4">
                The Forge gives people a way to collaborate without hierarchy, gatekeeping, or barriers.
              </p>
              <p className="text-lg text-gray-300 mb-4">
                It's a new model for building together — open, autonomous, and built to outlast any single creator.
              </p>
              <p className="text-lg text-gray-300">
                Your contribution becomes part of a living system.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What You Can Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Build Together</h3>
              <p className="text-gray-300">
                Create and share digital artifacts, collaborate on projects without hierarchy, access shared resources.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-white mb-3">Express Yourself</h3>
              <p className="text-gray-300">
                Mint NFTs that tell your story, participate in governance decisions, contribute to system evolution.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-3">Connect with Others</h3>
              <p className="text-gray-300">
                Join communities of creators, discover contribution opportunities, build relationships through shared purpose.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Step into the Forge
            </h2>
            <p className="text-xl text-purple-100 mb-6">
              Explore it. Shape it. Add your piece. The system grows through those who show up.
            </p>
            <Link
              href="/dashboard"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Here →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}