import Inscriptions from './inscriptions.js';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bitcoin Ordinals Inscriptions Browser & Social App | Ordigram',
  description: 'Ordigram is a lightweight Bitcoin Ordinals Inscriptions browser & social app.',
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
      <Inscriptions limit={20} />
    </main>
  )
}