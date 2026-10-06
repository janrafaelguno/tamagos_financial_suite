import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tamagos Financial CMS | Enterprise Accounting & Tax Suite',
  description: 'Comprehensive Financial Management & CMS for Tamagos Automotive, Logistics, and Services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
