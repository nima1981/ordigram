import { writeFileSync, readFileSync, existsSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import {hiroOrdinalsApiRequest} from './helpers.js';
import { tmpdir } from 'os';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
	const {id = null, mimetype = '', download = null} = req.query;
	const responseType = download ? 'document' : 'arraybuffer';
	const tmp = tmpdir();
	let queryString = '';
	
    if (!(id && mimetype)) {
        res.status(400).json({ name: 'no id or mimetype provided' })
    } else {
		
		let extension = 'txt';
			
		if (mimetype != undefined && typeof mimetype === 'string')
		  extension = mimetype?.split('/').pop()?.replace('plain','txt').replace('svg xml','svg') || 'txt';

		//if (existsSync( tmp + '/inscriptions-content/' + id)) {
		if (existsSync( tmp + '/' + id)) {
			
		  //const cachedData = readFileSync( tmp + '/inscriptions-content/' + id );
		  const cachedData = readFileSync( tmp + '/' + id );
		  //console.log("cachedData: " + cachedData);
		  
		  if (cachedData){
			 // somehow the file response for dowload scenario makes it so the file can't be displayed, so seems to break it, needs to be fixed:
			 // ... update: seems fixed now, keeping an eye on it for a little while
			
			if (download)
		    {
			  res
		      .status(200)
			  .setHeader('content-type', 'application/octet-stream')
			  .setHeader(
			    'content-disposition', 
				'attachment; filename="' 
				  + id 
				  + '.' 
				  + extension 
				  + '"'
			  )
			  .send(cachedData);
		    }
		    else
		      res.json(cachedData);
		  }
		
		} else {
		  
		  console.log('responseType in inscriptions-content.tsx: ' + responseType);
		  
		  hiroOrdinalsApiRequest('inscriptions/' + id + '/content', '', responseType).then(response => {
	      
		    //writeFileSync(tmp + `/inscriptions-content/${id}`, response.data);
			writeFileSync(tmp + `/${id}`, response.data);
		  
		    //console.log("response that is sent back from hiscriptions-content.tsx for id " + id + ": " + response);
			// somehow the file response for dowload scenario makes it so the file can't be displayed, so seems to break it, needs to be fixed:
			if (download)
			  res.status(200).setHeader('content-type', 'application/octet-stream').setHeader('content-disposition', 'attachment; filename="' + id + '.' + extension + '"').send(response.data);
		    else
			  res.json(response.data);
	         
          }).catch((error) => {
            console.log(error);
		    res.status(400).json({ error: error });
		  });
		}
    }
}