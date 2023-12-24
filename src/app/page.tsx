import Inscriptions from './inscriptions.js';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
<Inscriptions limit={20} />
    </main>
  )
}