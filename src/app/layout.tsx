import './globals.css';
import type { Metadata } from 'next';
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Documentero Builder',
  description: 'Document Automation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sarabun.className}>{children}</body>
    </html>
  );
}