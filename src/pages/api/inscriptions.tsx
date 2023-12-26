import { writeFileSync, readFileSync, existsSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { hiroOrdinalsApiRequest, md5 } from './helpers.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
	const {mime_type = '', rarity = '', order = 'newest', ...remainingQueryParams} = req.query;
	
	let queryString = '';
	let cacheFileName = 'inscriptions-list';
	
	
	if (Array.isArray(mime_type)){
	  mime_type.map((mimeType) => {
	    queryString += queryString ? '&mime_type=' + encodeURIComponent(mimeType) : 'mime_type=' + encodeURIComponent(mimeType);
		cacheFileName += cacheFileName ? '-mime_type-' + encodeURIComponent(mimeType) : 'mime_type-' + encodeURIComponent(mimeType);
	  });
	} else if (mime_type) {
	  queryString += queryString ? '&mime_type=' + encodeURIComponent(mime_type) : 'mime_type=' + encodeURIComponent(mime_type);
	  cacheFileName += cacheFileName ? '-mime_type-' + encodeURIComponent(mime_type) : 'mime_type-' + encodeURIComponent(mime_type);
	}
	
    if (Array.isArray(rarity)){
	  rarity.map((rarityType) => {
	    queryString += queryString ? '&rarity=' + encodeURIComponent(rarityType) : 'rarity=' + encodeURIComponent(rarityType);
		cacheFileName += cacheFileName ? '-rarity-' + encodeURIComponent(rarityType) : 'rarity-' + encodeURIComponent(rarityType);
	  });
	} else if (rarity) {
	  queryString += queryString ? '&rarity=' + encodeURIComponent(rarity) : 'rarity=' + encodeURIComponent(rarity);
	  cacheFileName += cacheFileName ? '-rarity-' + encodeURIComponent(rarity) : 'rarity-' + encodeURIComponent(rarity);
	}
	
	if (order != 'newest'){
	  if (order == 'oldest'){
	    queryString += queryString ? '&order=asc' : 'order=asc';
	  } else if(order == 'rarest'){
	    queryString += queryString ? '&order=desc&order_by=rarity' : 'order=desc&order_by=rarity';
	  } else if(order == 'commonest'){
	    queryString += queryString ? '&order=asc&order_by=rarity' : 'order=asc&order_by=rarity';
	  }
	  
	  if (typeof order === 'string')
	    cacheFileName += cacheFileName ? '-order-' + encodeURIComponent(order) : 'order-' + encodeURIComponent(order);
	}
	
	Object.keys(remainingQueryParams).map((parameterName, i) => {
    
	  if (queryString != undefined && typeof queryString === 'string' && parameterName != undefined && typeof parameterName === 'string' && remainingQueryParams[parameterName] != undefined && typeof remainingQueryParams[parameterName] === 'string')
	    queryString += queryString ? '&' + (parameterName as string) + "=" + encodeURIComponent(remainingQueryParams.parameterName as string) : (parameterName as string) + "=" + encodeURIComponent(remainingQueryParams.parameterName as string);
	
	  cacheFileName += cacheFileName ? '-' + parameterName + "-" + encodeURIComponent(remainingQueryParams[parameterName]) : parameterName + "-" + encodeURIComponent(remainingQueryParams[parameterName]);

    });
	
	
	const cachePath = 'tmp/inscriptions-list/' + md5(cacheFileName);
	
	let cacheAlive = false;
	
	if(existsSync(cachePath)){
		
	  const fs = require('fs');
	  
	  const stats = fs.statSync(cachePath);
      let seconds = (new Date().getTime() - new Date(stats.mtime).getTime()) / 1000;
      cacheAlive = seconds < 300; //5 min caching
	  
	}
		
    if (cacheAlive) {
	
	  const cachedData = readFileSync(cachePath);
		  //console.log("cachedData: " + cachedData);
		  
	    if (cachedData){
		  res.json(JSON.parse(cachedData));
		}
		
    } else {
		console.log("sent to hiro:" + queryString);
		hiroOrdinalsApiRequest('inscriptions', queryString).then(response => {
			
		  res.json(response.data);
		  console.log('response from hiro: ' + JSON.stringify(response.data));
	      writeFileSync(cachePath, JSON.stringify(response.data));
		     
        }).catch((error) => {
          console.log(error);
		  res.status(400).json({ error: error });
       }); 
	   
    }
}