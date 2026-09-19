import http from 'node:http';
import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {existsSync,createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||8080);
const ADMIN_TOKEN=process.env.ZAT_ADMIN_TOKEN||'';
const DATA_DIR=path.join(__dirname,'data');
const PROFILE_FILE=path.join(DATA_DIR,'profiles.json');
const EVENT_FILE=path.join(DATA_DIR,'events.ndjson');
await mkdir(DATA_DIR,{recursive:true});
if(!existsSync(PROFILE_FILE)) await writeFile(PROFILE_FILE,'{}\n');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const ipHits=new Map();
function limited(ip){const now=Date.now(),w=60_000;let e=ipHits.get(ip);if(!e||now-e.start>w)e={start:now,n:0};e.n++;ipHits.set(ip,e);return e.n>180}
function json(res,status,obj){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(obj))}
function validUsername(s){return /^[a-z0-9][a-z0-9_-]{1,39}$/i.test(s)}
function sanitizeProfile(p){
 if(!p||typeof p!=='object')throw new Error('invalid profile');
 const str=(v,max=240)=>String(v??'').slice(0,max);
 const spaces=Array.isArray(p.spaces)?p.spaces.slice(0,20).map((s,i)=>({id:Number(s.id)||i+1,title:str(s.title,80),subtitle:str(s.subtitle,180),image:str(s.image,500),disclosure:str(s.disclosure,40),note:str(s.note,600),product:str(s.product,100),url:str(s.url,500)})):[];
 return {username:str(p.username,40),name:str(p.name,80),city:str(p.city,80),time:str(p.time,30),headline:str(p.headline,120),roles:str(p.roles,120),bio:str(p.bio,500),avatar:str(p.avatar,500),spaces};
}
async function parseBody(req,max=512_000){let b='';for await(const c of req){b+=c;if(b.length>max)throw new Error('too large')}return b?JSON.parse(b):{}}
async function serveFile(req,res){
 let pathname=decodeURIComponent(new URL(req.url,'http://x').pathname);if(pathname==='/'||!path.extname(pathname))pathname='/index.html';
 const file=path.normalize(path.join(__dirname,pathname));if(!file.startsWith(__dirname)){res.writeHead(403);return res.end('Forbidden')}
 if(!existsSync(file)){res.writeHead(404);return res.end('Not found')}
 const ext=path.extname(file);res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream','cache-control':ext==='.html'?'no-cache':'public, max-age=604800, immutable','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','content-security-policy':"default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"});createReadStream(file).pipe(res)
}
const server=http.createServer(async(req,res)=>{
 try{
  const ip=req.socket.remoteAddress||'unknown';if(limited(ip))return json(res,429,{error:'rate limited'});
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/health')return json(res,200,{ok:true});
  if(u.pathname.startsWith('/api/profile/')){
   const username=u.pathname.split('/').pop();if(!validUsername(username))return json(res,400,{error:'invalid username'});
   const db=JSON.parse(await readFile(PROFILE_FILE,'utf8')||'{}');
   if(req.method==='GET'){if(!db[username])return json(res,404,{error:'not found'});return json(res,200,db[username])}
   if(req.method==='POST'){
    if(!ADMIN_TOKEN||req.headers.authorization!==`Bearer ${ADMIN_TOKEN}`)return json(res,401,{error:'unauthorized'});
    const body=sanitizeProfile(await parseBody(req));db[username]=body;await writeFile(PROFILE_FILE,JSON.stringify(db,null,2));return json(res,200,{ok:true})
   }
  }
  if(u.pathname==='/api/events'&&req.method==='POST'){const raw=await parseBody(req,64_000);await appendFile(EVENT_FILE,JSON.stringify({ts:Date.now(),ip:String(ip).slice(0,64),...raw})+'\n');return json(res,202,{ok:true})}
  if(u.pathname==='/api/stats'&&req.method==='GET'){
   if(!ADMIN_TOKEN||req.headers.authorization!==`Bearer ${ADMIN_TOKEN}`)return json(res,401,{error:'unauthorized'});
   const text=existsSync(EVENT_FILE)?await readFile(EVENT_FILE,'utf8'):'';const rows=text.trim()?text.trim().split('\n').slice(-5000).map(x=>JSON.parse(x)):[];const counts={};for(const r of rows)counts[r.type]=(counts[r.type]||0)+1;return json(res,200,{events:rows.length,counts})
  }
  return serveFile(req,res)
 }catch(e){return json(res,500,{error:'server error'})}
});
server.listen(PORT,()=>console.log(`Zat running at http://localhost:${PORT}`));
