import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-black tracking-tight mb-2">404</h2>
      <p className="text-zinc-400 mb-6 max-w-md">The page or festival resource you are looking for could not be found.</p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
