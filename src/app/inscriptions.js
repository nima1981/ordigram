"use client"
import {useState, useEffect, useRef} from 'react';
import {Buffer} from 'buffer';
import axios from 'axios';
import {ordigramApiRequest, capitalize} from './helpers.js';
import { useRouter } from 'next/navigation';
import { useSearchParams, usePathname } from 'next/navigation';
import { Puff } from 'react-loading-icons';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { BsCopy } from "react-icons/bs";
import { BsFilter } from "react-icons/bs";
import { BsDownload } from "react-icons/bs";
import { BiSolidGridAlt } from "react-icons/bi";
import { BsViewStacked } from "react-icons/bs";
import { CgDisplayGrid } from "react-icons/cg";
import { CgDisplayFullwidth } from "react-icons/cg";
import { Tag } from 'primereact/tag';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { AiOutlineHome } from "react-icons/ai";
import { BsArrowLeftSquare } from "react-icons/bs";

export default function Inscriptions(
  {
    limit = 20, 
	address = null, 
	initialGridView = false, 
	initialFileTypes = {
	  images: true,
      videos: true,
	  audio: true,
	  text: false,
	  binary: false,
	  model: false,
	}
  }) {
	
  const [loading, setLoading] = useState(true);
  const [inscriptions, setInscriptions] = useState([]);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [gridView, setGridView] = useState(initialGridView);
  
  function toggleNavbar(tags = false){
    
	if(tags){
	  if (!navbarOpen){
        setNavbarOpen(!navbarOpen);
	  }
	} else{
      setNavbarOpen(!navbarOpen);
	}
  }
  
  function toggleView(){
    setGridView(!gridView);
  }
  
  const initialQueryParameters = {
	page: 0,
	limit: limit,
	filetype: initialFileTypes,
	rarity: {
      common: false,
      uncommon: false,
	  rare: false,
	  epic: false,
	  legendary: false,
	  mythic: false,
    },
	order: 'newest',
  }
  
  //continue here: get page to read initial query parameters
  const searchParams = useSearchParams();
  
  const urlFileType = searchParams.get('filetype');
  const urlFileTypeArray = urlFileType ? urlFileType.split(',') : [];
  
  urlFileTypeArray.map((fileType)=>{
	  initialQueryParameters.filetype[fileType] = true;
  });  

  const urlRarity = searchParams.get('rarity');
  const urlRarityArray = urlRarity ? urlRarity.split(',') : [];
  
  urlRarityArray.map((rarityType)=>{
	  initialQueryParameters.rarity[rarityType] = true;
  });
  
  const urlPage = searchParams.get('page');
  initialQueryParameters.page = urlPage ? urlPage : 0;
    
  const [filterParameters, setFilterParameters] = 
    useState(initialQueryParameters);
  
  
  function handleClick(filterValue, filterParameter='filetype'){
	const newFilter = {
	  page: filterParameters.page,
	  limit: limit,
	  filetype: {
	    images: filterParameters.filetype.images,
	    videos: filterParameters.filetype.videos,
	    audio: filterParameters.filetype.audio,
	    text: filterParameters.filetype.text,
	    binary: filterParameters.filetype.binary,
	    model: filterParameters.filetype.model
	  },
	  rarity: {
        common: filterParameters.rarity.common,
        uncommon: filterParameters.rarity.uncommon,
	    rare: filterParameters.rarity.rare,
	    epic: filterParameters.rarity.epic,
	    legendary: filterParameters.rarity.legendary,
	    mythic: filterParameters.rarity.mythic
      },
	  order: filterParameters.order,
	}
    
    if (filterParameter == 'filetype'){	
      newFilter[filterParameter][filterValue] = !newFilter[filterParameter][filterValue];
	  newFilter['page'] = 0; //always reset page number when other filter params changed
	} 
	
	else if (filterParameter == 'page'){
	  newFilter[filterParameter] = filterValue;
	} 
	
	else if (filterParameter == 'order'){
	  newFilter[filterParameter] = filterValue;
	  newFilter['page'] = 0; //always reset page number when other filter params changed
	}
	
	else if (filterParameter == 'rarity'){
      newFilter[filterParameter][filterValue] = !newFilter[filterParameter][filterValue];
	  newFilter['page'] = 0; //always reset page number when other filter params changed
		
	}
	
	setFilterParameters(newFilter);
	setLoading(true);
  }
  
  let urlQuery = '';
  
  Object.keys(filterParameters.filetype).map((key) =>{
	if (filterParameters.filetype[key]){
	  //console.log("Key: " + key);
      urlQuery += urlQuery ? ',' + key : 'filetype=' + key;
	}
  });
  
  Object.keys(filterParameters.rarity).map((key) =>{
	if (filterParameters.rarity[key]){
	  //console.log("Key: " + key);
	  if (urlQuery.includes('rarity='))
        urlQuery += urlQuery ? ',' + key : 'rarity=' + key;
	  else{
		urlQuery += urlQuery ? '&rarity=' + key : 'rarity=' +key;
	  }
	}
  });
  
  if (filterParameters.page > 0)
    urlQuery += urlQuery ? '&page=' + filterParameters.page : 'page=' + filterParameters.page;

  if (filterParameters.order != 'newest')
    urlQuery += urlQuery ? "&order=" + encodeURIComponent(filterParameters.order) : "order=" + encodeURIComponent(filterParameters.order);

  let back = null
  
  back = searchParams.get('back');
  
  let currentUrl = encodeURIComponent(usePathname());
  
  if(urlQuery)
    currentUrl += encodeURIComponent('?' + urlQuery);
  
  if (back){
 	urlQuery += urlQuery ? '&back=' + encodeURIComponent(back)  : 'back=' + encodeURIComponent(back);
  }

  if (typeof window !== "undefined") {
	
	let hash = '';
    if (window.location.hash != ''){
      hash = window.location.hash;
	  console.log('hash: ' + window.location.hash);
	}

	// see https://dev.to/vvo/how-to-solve-window-is-not-defined-errors-in-react-and-next-js-5f97
    window.history.pushState({}, "", urlQuery ? window.location.pathname + "?" + urlQuery + hash : window.location.pathname + hash);
  }
  
  let queryParams = 'limit=' + filterParameters.limit;
  
  if (address){
    queryParams += '&address=' + address;
  }
  
  function mimeMapping(fileType){
	
	const mimeTypes =
	{
	  images: [
	    'image/apng', 
		'image/avif', 
		'image/gif', 
		'image/jpg', 
		'image/jpeg', 
		'image/png', 
		'image/svg+xml', 
		'image/webp',
	  ],
	  videos: [
	    'video/mp4', 
		'video/webm', 
		'video/mpeg', 
		'video/quicktime',
	  ],
	  audio: [
	    'audio/midi',
		'audio/mod', 
		'audio/mpeg', 
		'audio/mp3', 
		/*'audio/mp4', 
		'audio/wave', 
		'audio/wav', 
		'audio/webm',*/
	  ],
	  text: [
	    'text/plain',
		'text/html',
		'text/markdown',
	  ],
	  binary: [
	    'application/epub+zip',
		'application/json', 
		'application/pdf', 
		'application/pgp-signature',
		'application/octet-stream',
		/*'application/ogg',
		'application/zip',
		'application/pkcs8',*/
	  ],
	  model: [
	    'model/gltf-binary',
	    'model/3mf', 
		'model/e57', 
		'model/example', 
		'model/gltf+json', 
		'model/JT', 
		'model/iges', 
		'model/mtl', 
		'model/obj',
		'model/prc',
		'model/step',
		'model/step+xml',
		'model/step+zip',
		'model/step-xml+zip',
		'model/stl',
		'model/u3d',
		'model/vnd.bary',
		'model/vnd.cld',
		'model/vnd.collada+xml',
		'model/vnd.dwf',
		'model/vnd.flatland.3dml',
		'model/vnd.gdl',
		'model/vnd.gs-gdl',
		'model/vnd.gtw',
		'model/vnd.moml+xml',
		'model/vnd.mts',
		'model/vnd.opengex',
		'model/vnd.parasolid.transmit.binary',
		'model/vnd.parasolid.transmit.text',
		'model/vnd.pytha.pyox',
		'model/vnd.rosette.annotated-data-model',
		'model/vnd.sap.vds',
		'model/vnd.usda',
		'model/vnd.usdz+zip',
		'model/vnd.valve.source.compiled-map',
		'model/vnd.vtu',
		'model/x3d-vrml',
		'model/x3d+fastinfoset',
		'model/x3d+xml',
	  ]
	};
	
	let string = '';
	
	mimeTypes[fileType].map((mimeType) => {
	  string += string ? ('&mime_type=' + encodeURIComponent(mimeType)) : ('mime_type=' + encodeURIComponent(mimeType));
	});
	
	return string;
  };
  
  Object.keys(filterParameters.filetype).map((key) =>{
	if (filterParameters.filetype[key]){
	  //console.log("Key: " + key);
      queryParams += queryParams ? '&' + mimeMapping(key) : mimeMapping(key);
	}
  
  });
  
  Object.keys(filterParameters.rarity).map((key) =>{
	if (filterParameters.rarity[key]){
	  //console.log("Key: " + key);
      queryParams += queryParams ? '&rarity=' + key : 'rarity=' + key;
	}
  
  });
  
  queryParams += queryParams ? '&offset=' + filterParameters.page * filterParameters.limit : 'offset=' + filterParameters.page * filterParameters.limit;
  
  queryParams += queryParams ? '&order=' + filterParameters.order : 'order=' + filterParameters.order;

  useEffect(() => {
	  
	ordigramApiRequest('inscriptions', queryParams).then(response => {
	  setInscriptions(response.data);
	  console.log("response object: " + JSON.stringify(response));
	  setLoading(false);
	  
    }).catch((error) => {
      console.log(error);
    });
  
  }, [queryParams]);
  
  if(loading){
    //return <div>Loading...</div>;
	return(
	<>
	  <InscriptionsFilter
	    filterParameters={filterParameters}
		navbarOpen={navbarOpen}
		toggleNavbar={toggleNavbar}
		toggleView={toggleView}
		gridView={gridView}
		handleClick={handleClick}
	  />
	  <Puff 
		style={{
		  margin: 'auto', 
		  height: '10em', 
		  width: '10em'
		 }} 
		speed="2" 
		stroke="#eeeeee" 
		fill="#eeeeee" 
	  />
	</>
	);  
  }
 
  let inscriptionsList = '';
  
  if (Array.isArray(inscriptions.results)){
  
    inscriptionsList = 
      inscriptions.results.map((inscription) => 
	    <Inscription
          key={id}		
	      ownerAddress={inscription.address}
		  genesisAddress={inscription.genesis_address}
		  id={inscription.id}
		  genesisTransactionId={inscription.genesis_tx_id}
		  offset={inscription.offset}
		  output={inscription.output}
		  satoshiCoinbaseHeight={inscription.sat_coinbase_height}
		  number={inscription.number}
		  contentType={inscription.content_type}
		  mimeType={inscription.mime_type}
		  satoshi={inscription.sat_ordinal}
		  satoshiRarity={inscription.sat_rarity}
		  contentLength={inscription.content_length}
		  date={new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(inscription.genesis_timestamp)}
		  height={inscription.genesis_block_height}
		  genesisBlockHash={inscription.genesis_block_hash}
		  fee={inscription.genesis_fee}
		  value={inscription.value}
		  currentUrl={currentUrl}
	    />
	  );
	}
  
  return(
    <>
      <InscriptionsFilter
	    filterParameters={filterParameters}
		navbarOpen={navbarOpen}
		toggleNavbar={toggleNavbar}
		toggleView={toggleView}
		gridView={gridView}
		handleClick={handleClick}
	  />
	  
      <div id="inscriptions-feed" className={ gridView ? "inscriptions-container gridview" : "inscriptions-container"}>
	    <PageTitle filterParameters={filterParameters} handleTagClick={toggleNavbar} page={filterParameters.page} address={address} />
	    {inscriptionsList ? inscriptionsList : "API Temporarily Unavailable. Be back shortly!"}
	  </div>
	  
	  <Pagination
	    currentPage={filterParameters.page}
		handleClick={handleClick}
		cssId='pagination-bottom'
		limit={filterParameters.limit}
		total={inscriptions.total}
	  />
	  
	</>
  );
}

function Inscription({ isDetailsPage = false, currentUrl=null, ownerAddress, genesisAddress, genesisTransactionId, offset, output, id, number, contentType, mimeType, satoshi, satoshiRarity, contentLength, date, height, satoshiCoinbaseHeight, genesisBlockHash, fee, value }){

const [ownerState, setOwnerState] = useState({value: ownerAddress, copied: false});
const [numberState, setNumberState] = useState({value: number, copied: false});
const [idState, setIdState] = useState({value: id, copied: false});
const [satoshiState, setSatoshiState] = useState({value: satoshi, copied: false});
const [genesisAddressState, setGenesisAddressState] = useState({value: genesisAddress, copied: false});
const [genesisBlockHashState, setGenesisBlockHashState] = useState({value: genesisBlockHash, copied: false});
const [genesisTransactionIdState, setGenesisTransactionIdState] = useState({value: genesisTransactionId, copied: false});
const [outputState, setOutputState] = useState({value: output, copied: false});

let profileLink = "/profile/" + ownerAddress;

if (currentUrl)
  profileLink += "?back=" + currentUrl;

if (!isDetailsPage)
  profileLink += encodeURIComponent('#' + id);

  return (
    <div id={id} key={id} className="inscription-tile">
	  
	  <div className="inscription-tile-head">
	    <div className="inscription-avatar"></div>
		<div className="inscription-owner" title={ownerAddress}>
		  <a href={profileLink}>{ownerAddress}</a>
		
		</div>
		
		<CopyToClipboard text={ownerState.value} onCopy={() => setOwnerState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
		</CopyToClipboard>
		{ownerState.copied ? <span className="copied">Copied!</span> : null}
		
	  </div>
	  
	  <div className="inscription-tile-content">
	    <InscriptionContentDisplay id={id} mimeType={mimeType} url={!isDetailsPage} currentUrl={currentUrl} />
	  </div>
	  
	  <div className="inscription-info">
	    <a id="download-link" title="Download Inscription Content" href={"/api/inscriptions-content?id=" + id + "&mimetype=" + mimeType + "&download=1"}><BsDownload /></a>
	    <ul>
		  <li className="datetime">{date}</li>
		  <li>
            <b>#<span title={number}><a href={ !isDetailsPage ? "/inscription/" + id + "?back=" + currentUrl + encodeURIComponent('#' + id) : null}>{number}</a></span></b>
			<CopyToClipboard text={numberState.value} onCopy={() => setNumberState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
			</CopyToClipboard>
			{numberState.copied ? <span className="copied" >Copied!</span> : null}
		  </li>
		  <li>
		    <b>Id</b> <span title={id} className="truncate-text"><a href={ !isDetailsPage ? "/inscription/" + id + "?back=" + currentUrl + encodeURIComponent('#' + id) : null}>{id}</a></span>
			<CopyToClipboard text={idState.value} onCopy={
			  () => setIdState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
			</CopyToClipboard>
			{idState.copied ? <span className="copied">Copied!</span> : null}
		  </li>
		  
		  <li><b>Rarity</b> {satoshiRarity}</li>
		  
		  <li><b>Content Type</b> {contentType}</li>
		  
		  <li>
		    <b>Satoshi#</b> <span title={satoshi}>{satoshi}</span>
			<CopyToClipboard text={satoshiState.value} onCopy={
			  () => setSatoshiState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
			</CopyToClipboard>
			{satoshiState.copied ? <span className="copied">Copied!</span> : null}
		  </li>
		  
		  <li><b>Content Length</b> {contentLength} bytes</li>
		  
		  <li><b>Inscription Height</b> {height}</li>

		  <li>
		    <b>Block</b> <span title={genesisBlockHash} className="truncate-text">{genesisBlockHash}</span>
			<CopyToClipboard text={genesisBlockHashState.value} onCopy={
			  () => setGenesisBlockHashState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
			</CopyToClipboard>
			{genesisBlockHashState.copied ? <span className="copied">Copied!</span> : null}
		  </li>

		  <li><b>Satoshi Height</b> {satoshiCoinbaseHeight}</li>
		  
		  <li>
		    <b>Creator</b> <span title={genesisAddress} className="truncate-text"><a href={'/profile/' + genesisAddress + "?back=" + currentUrl}>{genesisAddress}</a></span>
			<CopyToClipboard text={genesisAddressState.value} onCopy={
			  () => setGenesisAddressState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
			</CopyToClipboard>
			{genesisAddressState.copied ? <span className="copied">Copied!</span> : null}
		  </li>
		  
		  <li>
		    <b>TXID</b> <span title={genesisTransactionId} className="truncate-text">{genesisTransactionId}</span>
			<CopyToClipboard text={genesisTransactionIdState.value} onCopy={
			  () => setGenesisTransactionIdState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
			</CopyToClipboard>
			{genesisTransactionIdState.copied ? <span className="copied">Copied!</span> : null}
		  </li>
		  		  <li>
		    <b>Output</b> <span title={output} className="truncate-text">{output}</span>
			<CopyToClipboard text={outputState.value} onCopy={
			  () => setOutputState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
			</CopyToClipboard>
			{outputState.copied ? <span className="copied">Copied!</span> : null}
		  </li>
		  <li><b>Offset</b> {offset}</li>
		  <li><b>Fee</b> {fee} sats</li>
		  <li><b>Value</b> {value} sats</li>
		  
		</ul>
	  </div>
	</div>
  );
}

export function InscriptionDetails({id, currentUrl = null}){
  
  const [inscriptionData, setInscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  let queryParams = 'id=' + id;
	
	useEffect(() => {
		
	ordigramApiRequest('inscription', queryParams).then(response => {
	  setInscriptionData(response.data);
	  console.log("response object: " + JSON.stringify(response));
	  setLoading(false);
	  
    }).catch((error) => {
      console.log(error);
    });
  
  }, [queryParams]);
  
  if(loading){
    //return <div>Loading...</div>;
	return(
	<>
	  <Puff 
		style={{
		  margin: 'auto', 
		  height: '10em', 
		  width: '10em'
		 }} 
		speed="2" 
		stroke="#eeeeee" 
		fill="#eeeeee" 
	  />
	</>
	);
	
	//return <Puff style={{margin: 'auto', height: '10em', width: '10em'}} speed="2" stroke="#eeeeee" fill="#eeeeee" />
  }
	
	return(
	<>
	  <Inscription 
	      isDetailsPage={true}
		  currentUrl={currentUrl}
	      ownerAddress={inscriptionData.address}
		  genesisAddress={inscriptionData.genesis_address}
		  id={inscriptionData.id}
		  genesisTransactionId={inscriptionData.genesis_tx_id}
		  offset={inscriptionData.offset}
		  output={inscriptionData.output}
		  satoshiCoinbaseHeight={inscriptionData.sat_coinbase_height}
		  number={inscriptionData.number}
		  contentType={inscriptionData.content_type}
		  mimeType={inscriptionData.mime_type}
		  satoshi={inscriptionData.sat_ordinal}
		  satoshiRarity={inscriptionData.sat_rarity}
		  contentLength={inscriptionData.content_length}
		  date={new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(inscriptionData.genesis_timestamp)}
		  height={inscriptionData.genesis_block_height}
		  genesisBlockHash={inscriptionData.genesis_block_hash}
		  fee={inscriptionData.genesis_fee}
		  value={inscriptionData.value}
	    />
	 </> 
	)
}

function InscriptionContentDisplay({id, mimeType, url=false, currentUrl=null}){
  
  const [fileData, setFileData] = useState(null);
  const [contentState, setContentState] = useState({value: '', copied: false});
  
  
  let queryParams = 'id=' + id + '&mimetype=' + mimeType;
  
  let fileDataBuffer = null
  
  useEffect(() => {
    if (!fileData){
	  ordigramApiRequest('inscriptions-content', queryParams).then(response => {
		  
	    setFileData(response.data);
		
      }).catch((error) => {
		console.log(error);  
	  });
    }
  }, []);
  
  if(!fileData){
	  
    //return <p>Loading...</p>;
	return <Puff style={{margin: 'auto', height: '5em', width: '5em'}} speed="2" stroke="#eeeeee" fill="#eeeeee" />
	
  } else {
	  
    try{
      fileDataBuffer = Buffer.from(fileData, 'binary');
    } catch(error){
      console.log("error trying to read fileDataBuffer : " + error);
    }	

    if (mimeType.includes('text')){
	  
      return(
	  
	    <p className="text-plain">
		  {fileDataBuffer.toString()}
		<CopyToClipboard 
		  text={fileDataBuffer.toString()} 
	      onCopy={() => setContentState({copied: true})}
		>
		  <span className="copy">
		    <BsCopy className="copy-white" />
	      </span>
	    </CopyToClipboard>
		{contentState.copied ? <span className="copied">Copied!</span> : null}
		</p>		  
	  );
	
    } else if (mimeType.includes('image')){
	  
	  if (mimeType == 'image/svg+xml'){
	    //const testString = '<svg version="1.1" baseProfile="full" width="300" height="200" xmlns="http://www.w3.org/2000/svg"> <rect width="100%" height="100%" fill="black" /> <circle cx="150" cy="100" r="90" fill="blue" /></svg>';
	    return(
	      <div style={{width: '100%', /*background: 'url(\'/no-image-placeholder.svg\') center center no-repeat #eeeeee',*/ backgroundSize: 'contain'}}>
	        <a
			  href={ url ? '/inscription/' + id + "?back=" + currentUrl + encodeURIComponent('#' + id) : null}
			>
			  <img 
			    src={`data:${mimeType};utf8,${encodeURIComponent(fileDataBuffer.toString())}`}
			    onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src="/no-image-placeholder.svg";
                }} 
			  />
			</a>
	      </div>
	    );
	  }
	
	  else{
        return(
		  <a
		    className="inscription-content-link"
			href={ url ? '/inscription/' + id + "?back=" + currentUrl + encodeURIComponent('#' + id) : null}
	      >
	        <img 
	          src={`data:{mimetype};base64,${fileDataBuffer.toString('base64')}`} 
		      onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src="/no-image-placeholder.svg";
              }} 
	        />
		  </a>
	    );
	  }
    } else if (mimeType.includes('video')){
	  
        return(
	      <video controls>
	        <source type={mimeType} src={`data:${mimeType};base64,${fileDataBuffer.toString('base64')}`} />
	      </video>
	    );
	  
    } else if (mimeType.includes('audio')){

      return(
	    <audio controls style={{width: '100%'}}>
	      <source type={mimeType} src={`data:${mimeType};base64,${fileDataBuffer.toString('base64')}`} />
	    </audio>
	  );
	  
    } else if (mimeType.includes('application')){
	  
      if (mimeType == 'application/pdf'){
	  
	    return <embed type={mimeType} src={`data:${mimeType};base64,${fileDataBuffer.toString('base64')}`} />
	
	  }
	  
	  else {
	    return(		
		  <p className="text-plain">
			{fileDataBuffer.toString()}
			<CopyToClipboard 
		      text={fileDataBuffer.toString()} 
	          onCopy={() => setContentState({copied: true})}
		    >
			  <span className="copy">
		        <BsCopy className="copy-white" />
	          </span>
			</CopyToClipboard>
			{contentState.copied ? <span className="copied">Copied!</span> : null}
		  </p>
		)
	  }
	  
    } else if (mimeType.includes('model')){
	  
    }
  }
  
}

export function InscriptionsFilter({filterParameters=null, toggleNavbar=null, navbarOpen=null, toggleView=null, gridView=false, handleClick=null}){

  const ref = useRef();
  const router = useRouter();
  
  const searchParams = useSearchParams();
  
  let back = '';
  
  back = searchParams.get('back');
  
  useEffect(() => {
    const handler = (event) => {
      if (
        navbarOpen &&
        ref.current &&
        !ref.current.contains(event.target)
      ){
        //setNavbarOpen(false);
	    toggleNavbar();
      }
    };
	
    document.addEventListener('mousedown', handler);
    
	return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', handler);
    };
  }, 
    [navbarOpen]
  );

  return (
    <nav className="navbar" ref={ref}>
	<a id="home" href="/"><AiOutlineHome /></a>
	
	{
	  back &&
	  <a id="back-button" href={decodeURIComponent(back)}>
        <BsArrowLeftSquare />
      </a>
	}

	
	{ filterParameters !== null &&
	<>
	<button
      className="toggle"
      onClick={() => toggleNavbar()}
    >
      {false ? <BsFilter /> : <BsFilter />}
    </button>
	
	<button className="toggle-view" onClick={()=>toggleView()}>
	{!gridView ?
	  <CgDisplayGrid />
	:
	  <CgDisplayFullwidth />
	} 
	</button>
    <div id="inscriptions-filter" className={`menu-nav${navbarOpen ? ' show-menu' : ''}`}>
      <div id="filter-filetype">
	    <div className="filter-header"><b>Filetype</b></div>
        <ul>
	      <li key="images"><label><input type="checkbox" checked={filterParameters.filetype.images} onChange={() => handleClick('images')} /> Images</label></li>
	      <li key="videos"><label><input type="checkbox" checked={filterParameters.filetype.videos} onChange={() => handleClick('videos')} /> Videos</label></li>
	      <li key="audio"><label><input type="checkbox" checked={filterParameters.filetype.audio} onChange={() => handleClick('audio')} /> Audio</label></li>
	      <li key="text"><label><input type="checkbox" checked={filterParameters.filetype.text} onChange={() => handleClick('text')} /> Text</label></li>
	      <li key="binary"><label><input type="checkbox" checked={filterParameters.filetype.binary} onChange={() => handleClick('binary')} /> Binary</label></li>
		  <li key="model"><label><input type="checkbox" checked={filterParameters.filetype.model} onChange={() => handleClick('model')} /> Model</label></li>
	    </ul>
      </div>
	  
	  <div id="filter-rarity">
	    <div className="filter-header"><b>Rarity</b></div>
        <ul>
	      <li key="common"><label><input type="checkbox" checked={filterParameters.rarity.common} onChange={() => handleClick('common', 'rarity')} /> Common</label></li>
	      <li key="uncommon"><label><input type="checkbox" checked={filterParameters.rarity.uncommon} onChange={() => handleClick('uncommon', 'rarity')} /> Uncommon</label></li>
	      <li key="rare"><label><input type="checkbox" checked={filterParameters.rarity.rare} onChange={() => handleClick('rare', 'rarity')} /> Rare</label></li>
	      <li key="epic"><label><input type="checkbox" checked={filterParameters.rarity.epic} onChange={() => handleClick('epic', 'rarity')} /> Epic</label></li>
	      <li key="legendary"><label><input type="checkbox" checked={filterParameters.rarity.legendary} onChange={() => handleClick('legendary', 'rarity')} /> Legendary</label></li>
		  <li key="mythic"><label><input type="checkbox" checked={filterParameters.rarity.mythic} onChange={() => handleClick('mythic', 'rarity')} /> Mythic</label></li>
	    </ul>
      </div>
	  
	  <div id="filter-order">
	    <div className="filter-header"><b>Sort by</b></div>
        <select 
		  className="dropdown" 
		  value={filterParameters.order}
		  defaultValue="newest" 
		  onChange={e => handleClick(e.target.value, 'order')}
		>
		  <option value="newest">
		    Newest
		  </option>
		  <option value="oldest">
		    Oldest
	      </option>
		  <option value="rarest">
		    Rarest
		  </option>
		  <option value="commonest">
		    Most Common
		  </option>
		</select>
	  </div>
	  
    </div>
	</>
	}
	</nav>
  );
}

function Pagination({currentPage, limit, total=40,  handleClick, cssId="pagination"}){
  console.log('total: ' + total + ', limit: ' + limit + ', currentPage: ' + currentPage);
  return(
    <div id={cssId}>
	{ currentPage > 0 && <button id="previous-button" onClick={() => handleClick(parseInt(currentPage, 10)-1, 'page')}>&lt;</button>}
	{ total - limit * currentPage > limit + 1 && <button id="next-button" onClick={() => handleClick(parseInt(currentPage, 10)+1, 'page')}>&gt;</button>}
	</div>
  );
}

export function PageTitle({filterParameters = null, handleTagClick = null, page = 0, address = null, id = null}){
	
  const [addressState, setAddressState] = useState({value: address, copied: false});
  const [idState, setIdState] = useState({value: id, copied: false});
  
  let fileTypeTags, rarityTags = '';
  
  if(filterParameters){
  
    console.log('filterParameters: ' + JSON.stringify(filterParameters));
  
    if(Object.values(filterParameters.filetype).every((v) => v === false)){
      fileTypeTags = <Tag onClick={ handleTagClick ? ()=>handleTagClick(true) : null} severity="success" rounded>All Filetypes</Tag>
    }
    else{ 
      fileTypeTags = Object.keys(filterParameters.filetype).map((key) =>
        filterParameters.filetype[key] && <Tag key={key} onClick={ handleTagClick ? ()=>handleTagClick(true) : null} severity="success" rounded>{capitalize(key)}</Tag>
      );
    }

    if(Object.values(filterParameters.rarity).every((v) => v === false)){
      rarityTags = <Tag onClick={ handleTagClick ? ()=>handleTagClick(true) : null} severity="info" rounded>All Rarities</Tag>
    }
    else{ 
      rarityTags = Object.keys(filterParameters.rarity).map((key) =>
        filterParameters.rarity[key] && <Tag key={key} onClick={ handleTagClick ? ()=>handleTagClick(true) : null} severity="info" rounded>{capitalize(key)}</Tag>
      );
    }
  }
  
  page = parseInt(page) + 1;
  
  let headline = '';
  
  if (address){
	  headline = 
	   <>
		    <div className="inscription-avatar"></div>
			<h1 id="address" title={address}>
			  {address}
			</h1>
			<CopyToClipboard text={addressState.value} onCopy={() => setAddressState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
		    </CopyToClipboard> 
		    {addressState.copied ? <span className="copied">Copied!</span> : null}
	   </>;
  } else if (id){

	  headline = 
	   <>
			<h1 id="inscription-details-id">
			  <span>Inscription ID </span>
			  <span title={id}>{id}</span>
			</h1>
			<CopyToClipboard text={idState.value} onCopy={() => setIdState({copied: true})}>
			  <span className="copy"><BsCopy className="copy-white" /></span>
		    </CopyToClipboard> 
		    {idState.copied ? <span className="copied">Copied!</span> : null}
	   </>;

  } else {
    
	headline = 
	  <h1>{capitalize(filterParameters.order)} Inscriptions
	      { page > 1 &&
	        <> - Page {page}</>
	      }
	  </h1>;
	
  }
  
  return(
    <div id="title-container">
	  
	  {headline}
	  
	  <div id="filetype-tags">
	    {fileTypeTags}
	    {rarityTags}
	  </div>
	  
	</div>
  );
}