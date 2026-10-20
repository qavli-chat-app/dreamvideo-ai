import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'DreamVideo AI — Imagine it. See it move.',
  description: 'A cinematic workspace for planning AI video creations.'
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}