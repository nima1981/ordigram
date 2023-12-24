import { writeFileSync, readFileSync, existsSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { hiroOrdinalsApiRequest, md5 } from './helpers.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
	const {id = ''} = req.query;
	
	let queryString = '';
	let cacheFileName = 'inscription-' + id;
	
	const cachePath = 'tmp/inscription/' + cacheFileName;
	
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
		  res.json(JSON.parse(cachedData.toString()));
		}
		
    } else {
		console.log("sent to hiro:" + queryString);
		hiroOrdinalsApiRequest('inscriptions/' + id, queryString).then(response => {
			
		  res.json(response.data);
		  console.log('response from hiro: ' + JSON.stringify(response.data));
	      writeFileSync(cachePath, JSON.stringify(response.data));
		     
        }).catch((error) => {
          console.log(error);
		  res.status(400).json({ error: error });
       }); 
	   
    }
}