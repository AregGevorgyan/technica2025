import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Adaptive AAC
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Intelligent communication that learns and adapts to you
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/communicate"
            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold mb-2">Start Communicating</h2>
            <p className="text-gray-600">Begin using the adaptive interface</p>
          </Link>

          <Link
            href="/calibrate"
            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 hover:border-purple-400"
          >
            <div className="text-6xl mb-4">👁️</div>
            <h2 className="text-2xl font-semibold mb-2">Eye Tracking Setup</h2>
            <p className="text-gray-600">Calibrate eye tracking for hands-free use</p>
          </Link>

          <Link
            href="/memories"
            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-green-200 hover:border-green-400"
          >
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-semibold mb-2">Your Memories</h2>
            <p className="text-gray-600">View and manage what the system has learned</p>
          </Link>

          <Link
            href="/settings"
            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-orange-200 hover:border-orange-400"
          >
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">Customize your experience</p>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>New user? The system will learn your preferences as you use it.</p>
        </div>
      </div>
    </main>
  );
}
