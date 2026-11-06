import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import PresenceHeartbeat from '../components/PresenceHeartbeat';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sentirix — Autonomous Support Intelligence & AI Copilot',
  description:
    'Autonomous Support Intelligence with real-time AI copilot and multi-pod architecture powered by Google Gemini.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo_warna_s.png',
  },
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased notranslate`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <PresenceHeartbeat />
        {children}
      </body>
    </html>
  );
}
