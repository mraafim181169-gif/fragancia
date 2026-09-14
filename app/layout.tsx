import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fragancia — Fest & Programme Management System',
  description: 'Fragancia Arts & Cultural Fest Management System with live leaderboard, blind judging, 80 categorized programmes, schedule, and reports.',
  openGraph: {
    title: 'Fragancia — Fest & Programme Management System',
    description: 'Fragancia Arts & Cultural Fest Management System with live leaderboard, blind judging, 80 categorized programmes, schedule, and reports.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fragancia — Fest & Programme Management System',
    description: 'Fragancia Arts & Cultural Fest Management System with live leaderboard, blind judging, 80 categorized programmes, schedule, and reports.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
      <body suppressHydrationWarning className="min-h-screen antialiased bg-[#0A0A0A] text-white selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}

