import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
export async function POST(req:Request){
 const user=await getChatGPTUser();if(!user)return new Response('Unauthorized',{status:401});
 if(req.headers.get('origin')&&new URL(req.headers.get('origin')!).host!==new URL(req.url).host)return new Response('Forbidden',{status:403});
 const form=await req.formData(), file=form.get('file');
 if(!(file instanceof File)||file.size>20*1024*1024)return Response.json({error:'20MB 이하의 파일을 선택해 주세요.'},{status:400});
 const key=`${user.userId}/${crypto.randomUUID()}`;
 await env.BUCKET!.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:'application/octet-stream'},customMetadata:{name:file.name}});
 return Response.json({fileKey:key,fileName:file.name});
}
export async function GET(req:Request){
 const user=await getChatGPTUser();if(!user)return new Response('Unauthorized',{status:401});
 const key=new URL(req.url).searchParams.get('key')||'';
 if(!key.startsWith(user.userId+'/'))return new Response('Forbidden',{status:403});
 const obj=await env.BUCKET!.get(key);if(!obj)return new Response('Not found',{status:404});
 return new Response(obj.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(obj.customMetadata?.name||'document')}`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}});
}
