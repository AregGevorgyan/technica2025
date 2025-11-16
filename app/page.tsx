import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--tile-bg)] text-[var(--tile-text)]">
      <div
        className="p-8 bg-[var(--tile-bg)] rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-[var(--tile-border)] hover:border-[var(--tile-border)]"
      >
        <h1 className="text-5xl font-bold text-[var(--tile-text)] mb-4">
          Eye Select
        </h1>
        <p className="text-xl text-[var(--tile-text)] mb-8">
          An AAC Website Which Grows With Your Needs
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/communicate"
            className="p-8 bg-[var(--tile-bg)] rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-[var(--tile-border)] hover:border-blue-400"
          >
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold mb-2">Start Communicating</h2>
            <p className="text-[var(--tile-text)]">Begin using the adaptive interface</p>
          </Link>

          <Link
            href="/calibrate"
            className="p-8 bg-[var(--tile-bg)] rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-[var(--tile-border)] hover:border-purple-400"
          >
            <div className="text-6xl mb-4">👁️</div>
            <h2 className="text-2xl font-semibold mb-2">Eye Tracking Setup</h2>
            <p className="text-[var(--tile-text)]">Calibrate eye tracking for hands-free use</p>
          </Link>

          <Link
            href="/memories"
            className="p-8 bg-[var(--tile-bg)] rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-[var(--tile-border)] hover:border-[var(--tile-border)]"
          >
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-semibold mb-2">Your Memories</h2>
            <p className="text-[var(--tile-text)]">View and manage what the system has learned</p>
          </Link>

          <Link
            href="/settings"
            className="p-8 bg-[var(--tile-bg)] rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-[var(--tile-border)] hover:border-[var(--tile-border)]"
          >
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-semibold mb-2">Settings</h2>
            <p className="text-[var(--tile-text)]">Customize your experience</p>
          </Link>
        </div>

        <div className="mt-12 text-sm text-[var(--tile-text)]">
          <p>New user? The system will learn your preferences as you use it.</p>
        </div>
      </div>
    </main>
  );
}
