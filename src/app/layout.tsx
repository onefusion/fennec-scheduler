import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fennec Scheduler - Schedule Time With Me',
  description: 'Open-source, mobile-friendly personal scheduling web application powered by Friendly Fennec.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
