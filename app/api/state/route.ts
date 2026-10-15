import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { makeDemo, useExampleNames, addMonitoringExamples, normalizeSchedule, restoreMonitoringExamples, seedWorkgroups, fillAgencyExamples, removeInventedReports } from '../../data';
import { z } from 'zod';
const item=z.object({id:z.string().min(1).max(100)}).passthrough();
const SHARED_OWNER='site:appgprj_6acc749a70f4819180d7a2b218e832eb';
const project=item.extend({name:z.string().trim().min(1).max(300),code:z.string().min(1),team:z.string(),status:z.enum(['예정','진행','종료']),focus:z.boolean(),records:z.array(item).max(1000),events:z.array(item).max(1000),budgets:z.array(item).max(500),plans:z.array(item).max(1000),changes:z.array(item).max(1000),people:z.array(item).max(500),documents:z.array(item).max(1000),expenses:z.array(item).max(2000).optional(),settlements:z.array(item).max(100).optional()});
const attachment=z.object({id:z.string(),name:z.string(),url:z.string().optional(),fileKey:z.string().optional(),fileName:z.string().optional()});
const block=z.object({id:z.string(),heading:z.string(),items:z.array(z.string()).max(100)});
const section=z.object({id:z.string(),title:z.string(),projectIds:z.array(z.string()),blocks:z.array(block).max(30),attachments:z.array(attachment).max(30)});
const meeting=z.object({id:z.string(),date:z.string(),title:z.string(),sections:z.array(section).max(100)});
const schema=z.object({revision:z.number().int().nonnegative(),data:z.object({scheduleRevision:z.number().optional(),contentRevision:z.number().optional(),agencyRevision:z.number().optional(),workgroupRevision:z.number().optional(),workgroups:z.array(meeting).max(100).optional(),demo:z.boolean(),projects:z.array(project).max(100)})});
export async function GET() {
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 let row=await env.DB!.prepare('SELECT data, revision FROM workspaces WHERE owner = ?').bind(SHARED_OWNER).first<{data:string;revision:number}>();
 if (!row){
  const legacy=await env.DB!.prepare('SELECT data, revision FROM workspaces ORDER BY updated_at DESC LIMIT 1').first<{data:string;revision:number}>();
  if(legacy){await env.DB!.prepare('INSERT INTO workspaces (owner,data,revision,updated_at) VALUES (?,?,?,?) ON CONFLICT(owner) DO NOTHING').bind(SHARED_OWNER,legacy.data,legacy.revision,new Date().toISOString()).run();row=legacy;}
 }
 if (!row) return Response.json({data:fillAgencyExamples(makeDemo()),revision:0},{headers:{'Cache-Control':'no-store'}});
 const stored=JSON.parse(row.data);
 // Earlier preview data was explicitly marked demo. Replace only those fictional rows;
 // preserve any real projects the owner already entered.
 const existing=stored.demo===true?stored.projects.filter((p:{id:string})=>!p.id.startsWith('sample-')):stored.projects;
 const names=new Set(existing.map((p:{name:string})=>p.name));
 stored.projects=[...existing,...makeDemo().projects.filter(p=>!names.has(p.name))];
 stored.demo=false;
 return Response.json({data:removeInventedReports(fillAgencyExamples(seedWorkgroups(restoreMonitoringExamples(normalizeSchedule(addMonitoringExamples(useExampleNames(stored))))))),revision:row.revision},{headers:{'Cache-Control':'no-store'}});
}
export async function PUT(req: Request) {
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 if(req.headers.get('origin')&&new URL(req.headers.get('origin')!).host!==new URL(req.url).host)return Response.json({error:'잘못된 요청 출처입니다.'},{status:403});
 const raw=await req.text();if(raw.length>3000000)return Response.json({error:'저장 용량을 초과했습니다.'},{status:413});
 let parsed;try{parsed=schema.safeParse(JSON.parse(raw));}catch{return Response.json({error:'올바른 JSON이 아닙니다.'},{status:400});}
 if(!parsed.success)return Response.json({error:'입력 항목을 확인해 주세요.'},{status:400});
 const {data,revision}=parsed.data;
 const previous=await env.DB!.prepare('SELECT data FROM workspaces WHERE owner = ?').bind(SHARED_OWNER).first<{data:string}>();
 const previousProjects=previous?JSON.parse(previous.data).projects:makeDemo().projects;
 for(const p of data.projects){const old=previousProjects.find((x:{id:string})=>x.id===p.id);if(old&&old.code!==p.code)return Response.json({error:'과제번호는 수정할 수 없습니다.'},{status:400});}

 if(new Set(data.projects.map(p=>p.code)).size!==data.projects.length)return Response.json({error:'과제 번호가 중복됩니다.'},{status:400});
 for(const p of data.projects){
  if(p.start && p.end && String(p.start)>String(p.end))return Response.json({error:'과제 종료일을 확인해 주세요.'},{status:400});
  for(const b of p.budgets)if(!Number.isFinite(Number(b.initial))||!Number.isFinite(Number(b.spent))||Number(b.initial)<0||Number(b.spent)<0)return Response.json({error:'예산과 집행액은 0 이상의 숫자여야 합니다.'},{status:400});
  for(const c of [...p.plans,...p.changes]){
   if(!Number.isFinite(Number(c.amount))||(p.plans.includes(c)&&Number(c.amount)<0))return Response.json({error:'금액을 확인해 주세요.'},{status:400});
   const target=p.budgets.find(b=>b.id===c.categoryId&&b.year===c.year);if(!target)return Response.json({error:'동일 연도의 예산 비목을 선택해 주세요.'},{status:400});
   if(c.applied&&c.status!=='승인')return Response.json({error:'승인된 변경만 예산에 반영할 수 있습니다.'},{status:400});
   if(c.type==='비목 간 이동'){const from=p.budgets.find(b=>b.id===c.fromId&&b.year===c.year);if(!from||from.id===target.id||from.kind!==target.kind||Number(c.amount)<=0)return Response.json({error:'비목 이동은 동일 현금·현물 구분의 서로 다른 비목을 선택하고 양수를 입력하세요.'},{status:400});}
  }
  for(const expense of p.expenses||[]){
   if(!Number.isFinite(Number(expense.amount))||Number(expense.amount)<0)return Response.json({error:'지출액은 0 이상의 금액이어야 합니다.'},{status:400});
   if(!p.budgets.some(b=>b.id===expense.categoryId&&b.year===expense.year))return Response.json({error:'지출 내역에 동일 연도의 등록된 비목을 선택해 주세요.'},{status:400});
  }
  for(const settlement of p.settlements||[]){
   for(const key of ['recognized','disallowed','refund'])if(settlement[key]!==undefined&&settlement[key]!==''&&(!Number.isFinite(Number(settlement[key]))||Number(settlement[key])<0))return Response.json({error:'정산 금액은 0 이상 또는 미확정으로 입력해 주세요.'},{status:400});
  }
  for(const d of p.documents)if(d.url&&!/^https?:\/\//.test(String(d.url)))return Response.json({error:'문서 링크는 http 또는 https 주소여야 합니다.'},{status:400});
 }
 for(const meeting of data.workgroups||[])for(const section of meeting.sections){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(meeting.date)||!section.title.trim())return Response.json({error:'워킹그룹 회의 날짜와 제목을 확인해 주세요.'},{status:400});
  if(section.projectIds.some(id=>!data.projects.some(p=>p.id===id)))return Response.json({error:'연결할 과제를 다시 선택해 주세요.'},{status:400});
  for(const a of section.attachments)if(a.url&&!/^https?:\/\//.test(a.url)&&!/^\/workgroup\/[a-z0-9_.-]+$/i.test(a.url))return Response.json({error:'첨부 URL은 http 또는 https 주소여야 합니다.'},{status:400});
 }
 const value=JSON.stringify(data), now=new Date().toISOString();
 const result=revision===0?await env.DB!.prepare('INSERT INTO workspaces (owner,data,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(owner) DO NOTHING').bind(SHARED_OWNER,value,now).run():await env.DB!.prepare('UPDATE workspaces SET data=?,revision=revision+1,updated_at=? WHERE owner=? AND revision=?').bind(value,now,SHARED_OWNER,revision).run();
 if(!result.meta.changes)return Response.json({error:'다른 창에서 변경된 내용이 있습니다. 새로고침 후 다시 입력해 주세요.'},{status:409});
 return Response.json({revision:revision+1});
}
