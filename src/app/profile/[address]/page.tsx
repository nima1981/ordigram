import Inscriptions from '../../inscriptions.js';
import type { Metadata, ResolvingMetadata } from 'next';
 
type Props = {
  params: { address: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
	
  const address = params.address;
  
  return{
    title: "Bitcoin Address " + address,
	description: "Inscriptions Portfolio for Bitcoin Address " + address
  }
  
}

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