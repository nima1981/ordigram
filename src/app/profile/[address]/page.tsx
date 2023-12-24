import Inscriptions from '../../inscriptions.js';

export default function Profile({ params }: { params: { address: string } }) {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24 profile">
      <Inscriptions
        limit={60} 
        address={params.address} 
        initialGridView={true} 
        initialFileTypes={{
          images: false,
          videos: false,
	      audio: false,
	      text: false,
	      binary: false,
	      model: false,
        }}/>
    </main>
  )
}