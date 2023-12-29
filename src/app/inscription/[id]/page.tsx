import {InscriptionDetails, InscriptionsFilter, PageTitle} from '../../inscriptions.js';
import {useState, useEffect} from 'react';
import { Puff } from 'react-loading-icons';
import {ordigramApiRequest} from '../../helpers.js';
import type { Metadata, ResolvingMetadata } from 'next';
 
type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
	
  const id = params.id;
  
  return{
    title: "Bitcoin Ordinals Inscription ID " + id + " | Ordigram",
	description: "Detailed information about Bitcoin Ordinals inscription ID " + id
  }
  
}

export default function Inscription({ params, searchParams }: { params: { id: string }; searchParams?: { [key: string]: string | string[] | undefined }; }) {

  let back = '';
  let urlQuery = '';
  
  if(searchParams.back)
   back = searchParams.back as string;
  
  if (back){
    urlQuery += urlQuery ? '&back=' + encodeURIComponent(back)  : 'back=' + encodeURIComponent(back);
  }
  
  let currentUrl = encodeURIComponent('/inscription/' + params.id);
  
  if(urlQuery)
    currentUrl += encodeURIComponent('?' + urlQuery);
  	
  return (
    <main className="flex min-h-screen flex-col justify-between p-24 inscription-details">
	  <InscriptionsFilter />
	  <div id="inscription-details-container">
	    <PageTitle id={params.id} />
	    <InscriptionDetails 
		  id={params.id}
		  currentUrl={currentUrl}
	    />
	  </div>
    </main>
  )
}