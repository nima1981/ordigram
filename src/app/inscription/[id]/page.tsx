import {InscriptionDetails, InscriptionsFilter, PageTitle} from '../../inscriptions.js';
import {useState, useEffect} from 'react';
import { Puff } from 'react-loading-icons';
import {ordigramApiRequest} from '../../helpers.js';

export default function Inscription({ params }: { params: { id: string } }) {
  	
  return (
    <main className="flex min-h-screen flex-col justify-between p-24 inscription-details">
	  <InscriptionsFilter back={true} />
	  <div id="inscription-details-container">
	    <PageTitle id={params.id} />
	    <InscriptionDetails 
		  id={params.id}
		  currentUrl={encodeURIComponent('/inscription/' + params.id)}
	    />
	  </div>
    </main>
  )
}