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
  title: 'Sentirix — Enterprise AI Customer Support & Copilot',
  description:
    'Autonomous customer triage and real-time copilot platform powered by Google Gemini 2.5 Flash.',
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
