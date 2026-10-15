'use client';
import {useState} from 'react';
import {Pencil,Plus} from 'lucide-react';
import {type Item,type Project} from './data';

type Props={projects:Project[];onEdit:(project:Project,metric?:Item)=>void};
const number=(value:number)=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1}).format(value);
export default function Indicators({projects,onEdit}:Props){
 const ordered=[...projects].sort((a,b)=>Number(b.focus)-Number(a.focus)||a.code.localeCompare(b.code,'ko',{numeric:true}));
 const [projectId,setProjectId]=useState('');
 const project=ordered.find(p=>p.id===projectId)||ordered[0];
 const metrics=((project?.metrics||[]) as Item[]).filter(m=>!m.deletedAt);
 return <div className="secondary-view kpi-page">
  <div className="page-heading"><div><h1>성과 지표</h1><p>과제별 KPI의 목표와 실적을 관리합니다.</p></div></div>
  <section className="unified-section"><div className="unified-section-head"><strong>과제별 KPI</strong><span>기준 연도 2026</span></div>
   <div className="kpi-layout"><aside className="kpi-projects" aria-label="KPI 조회 과제">{ordered.map(p=><button key={p.id} className={p.id===project?.id?'active':''} onClick={()=>setProjectId(p.id)} title={p.name}>{p.focus&&<b aria-label="중점과제">★ </b>}<span>{p.alias||p.name}</span><small>{(p.metrics||[]).length}개</small></button>)}</aside>
    <div className="kpi-detail">{project?<><div className="kpi-detail-head"><div><small>{project.code} · {project.agency||'지원기관 미등록'}</small><h2>{project.name}</h2></div><button className="btn small" onClick={()=>onEdit(project)}><Plus size={14}/>KPI 추가</button></div>
     <div className="tablewrap"><table className="kpi-table"><thead><tr><th>KPI</th><th>목표</th><th>실적</th><th>달성률</th><th>기준일</th><th>수정</th></tr></thead><tbody>{metrics.map(metric=>{const target=Number(metric.target||0),actual=Number(metric.actual||0),rate=target>0?Math.max(0,actual/target*100):0;return <tr key={metric.id}><td><strong>{metric.title}</strong><small>{metric.method||'과제별 실적 집계'}</small></td><td>{number(target)} {metric.unit}</td><td>{number(actual)} {metric.unit}</td><td><strong>{target>0?`${number(rate)}%`:'—'}</strong><div className="kpi-progress"><i style={{width:`${Math.min(100,rate)}%`}}/></div></td><td>{String(metric.due||'—').replaceAll('-','.')}</td><td><button className="btn small" onClick={()=>onEdit(project,metric)} aria-label={`${metric.title} 수정`}><Pencil size={13}/>수정</button></td></tr>})}</tbody></table>{!metrics.length&&<div className="empty-state">등록된 KPI가 없습니다.</div>}</div></>:<div className="empty-state">등록된 과제가 없습니다.</div>}</div>
   </div>
  </section>
 </div>;
}
