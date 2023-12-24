import axios from 'axios';

export function ordigramApiRequest(apiUrl, queryParameters = '', responseType = null){

  const ordigramBaseUrl = '/api/';
  //const queryString = queryParameters ? Object.keys(queryParameters).map(key => key + '=' + queryParameters[key]).join('&') : null;
  const queryString = queryParameters;
  let url =  ordigramBaseUrl + apiUrl;
  
  if (queryString){
    url += '?' + queryString;
  }
  
  //console.log('ordigram api request queryString:' + queryString);
  
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
	withCredentials: false,
    url: url ,
    headers: { 
	  'Accept': 'application/json'
    }
  };
  
  if (responseType){
    config['responseType'] = responseType;
  }
  
  return axios.request(config);
  
}

export function capitalize(str){
return str.charAt(0).toUpperCase() + str.slice(1);
}