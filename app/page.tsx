import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[var(--background)] to-[var(--background2)]">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Eye Select
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Intelligent communication that learns and adapts to you
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          <Link
            href="/communicate"
            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold mb-2">Start Communicating</h2>
            <p className="text-gray-600">Begin using the adaptive interface with AI-powered predictions</p>
          </Link>

          <Link
            href="/calibrate"
            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 hover:border-purple-400"
          >
            <div className="text-6xl mb-4">👁️</div>
            <h2 className="text-2xl font-semibold mb-2">Eye Tracking Setup</h2>
            <p className="text-gray-600">Calibrate eye tracking for hands-free communication</p>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500 space-y-2">
          <p>✨ AI-powered word predictions with Claude Haiku</p>
          <p>🖼️ 60 visual symbols for common AAC vocabulary</p>
          <p>👁️ Hands-free eye tracking with automatic calibration</p>
        </div>
      </div>
    </main>
  );
}
