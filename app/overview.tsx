'use client';

import {useMemo,useState} from 'react';
import {ArrowRight,CalendarDays,ChevronLeft,ChevronRight,ClipboardList,Coins,FileText,FolderKanban,Target} from 'lucide-react';
import {budget,today,type Item,type Project} from './data';

type Props={projects:Project[];year:string;onOpen:(project:Project,tab:number)=>void;onNavigate:(view:string)=>void};
type Linked=Item&{project:Project};
const won=(value:number)=>`${new Intl.NumberFormat('ko-KR').format(value)}원`;
const ym=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const ymd=(d:Date)=>`${ym(d)}-${String(d.getDate()).padStart(2,'0')}`;
const shortDate=(value:string)=>value?value.slice(5,10).replace('-','.'):'—';

export default function Overview({projects,year,onOpen,onNavigate}:Props){
 const [projectId,setProjectId]=useState('전체');
 const [mode,setMode]=useState<'월'|'주'|'일'>('월');
 const [month,setMonth]=useState(today().slice(0,7));
 const [selectedDay,setSelectedDay]=useState(today());
 const chosen=projects.find(p=>p.id===projectId);
 const scoped=chosen?[chosen]:projects;
 const budgeted=scoped.filter(p=>p.budgets.some(b=>b.year===year));
 const totals=budgeted.reduce((s,p)=>{const b=budget(p,year);return {total:s.total+b.total,spent:s.spent+b.spent,remaining:s.remaining+b.remaining}}, {total:0,spent:0,remaining:0});
 const events=useMemo(()=>scoped.flatMap(project=>project.events.map(event=>({...event,project} as Linked))).sort((a,b)=>String(a.start).localeCompare(String(b.start))),[scoped]);
 const records=useMemo(()=>scoped.flatMap(project=>project.records.map(record=>({...record,project} as Linked))).sort((a,b)=>String(b.date).localeCompare(String(a.date))),[scoped]);
 const issueRecords=records.filter(r=>r.issue).slice(0,4);
 const monthDate=new Date(`${month}-01T12:00:00`);
 const first=new Date(monthDate.getFullYear(),monthDate.getMonth(),1);
 const start=new Date(first);start.setDate(1-first.getDay());
 const cells=Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return ymd(d)});
 const selectedDate=new Date(`${selectedDay}T12:00:00`);
 const weekStart=new Date(selectedDate);weekStart.setDate(selectedDate.getDate()-selectedDate.getDay());
 const shown=mode==='월'?cells:mode==='주'?Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);return ymd(d)}):[selectedDay];
 const shift=(n:number)=>{const d=mode==='월'?new Date(monthDate):new Date(selectedDate);if(mode==='월')d.setMonth(d.getMonth()+n);else d.setDate(d.getDate()+n*(mode==='주'?7:1));setMonth(ym(d));setSelectedDay(ymd(d))};
 const dayEvents=events.filter(e=>String(e.start).slice(0,10)<=selectedDay&&String(e.end||e.start).slice(0,10)>=selectedDay);
 return <div className="overview-page">
  <div className="page-heading"><div><span className="eyebrow">PORTFOLIO OVERVIEW</span><h1>통합 현황</h1><p>과제·사업예산·수행 일정의 등록 현황을 한곳에서 확인합니다.</p></div><span className="snapshot-date">오늘 {today().replaceAll('-','.')}</span></div>
  <div className="overview-controls"><label>조회 범위 <select aria-label="통합 현황 과제 선택" value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="전체">전체 과제</option>{projects.map(p=><option key={p.id} value={p.id}>{p.alias||p.name}</option>)}</select></label><span>{year}년 예산 기준 · 일정은 등록 자료 기준</span></div>
  <div className="overview-top-grid">
   <section className="overview-card portfolio-card"><div className="overview-card-head"><span className="overview-icon"><FolderKanban size={18}/></span><div><h2>등록 과제</h2><p>중점 / 전체</p></div><strong>{scoped.filter(p=>p.focus).length} <small>/ {scoped.length}</small></strong></div><div className="portfolio-split"><div><span>상태 확인</span><b>{scoped.filter(p=>p.statusConfirmed).length}건</b></div><div><span>상태 미확인</span><b>{scoped.filter(p=>!p.statusConfirmed).length}건</b></div></div><div className="mini-section-head"><strong>과제 목록</strong><button onClick={()=>onNavigate('projects')}>과제 관리 <ArrowRight size={13}/></button></div><div className="overview-projects">{scoped.map(p=><button key={p.id} onClick={()=>onOpen(p,0)}><span className="project-dot"/><span><strong>{p.alias||p.name}</strong><small>{p.team||'담당팀 미지정'} · {p.manager||'담당자 미지정'}</small></span><ChevronRight size={16}/></button>)}</div></section>
   <section className="overview-card work-card"><div className="overview-card-head"><span className="overview-icon"><Target size={18}/></span><div><h2>사업 진행 현황</h2><p>최근 수행 기록과 확인할 이슈</p></div><button className="subtle-link" onClick={()=>onNavigate('projects')}>자세히 <ArrowRight size={13}/></button></div><div className="work-metrics"><div><b>{records.length}</b><span>등록된 수행 기록</span></div><div><b>{issueRecords.length}</b><span>최근 이슈 기록</span></div><div><b>{scoped.reduce((n,p)=>n+p.documents.length,0)}</b><span>등록 문서</span></div></div><div className="mini-section-head"><strong>최근 수행·이슈</strong><span>기록 기준</span></div><div className="overview-records">{records.slice(0,5).map(r=><button key={r.id} onClick={()=>onOpen(r.project,2)}><span className={r.issue?'issue-marker':'record-marker'}/><span><strong>{r.title||'제목 없는 기록'}</strong><small>{r.project.alias||r.project.name} · {r.date||'날짜 미등록'}</small>{r.issue&&<em>{r.issue}</em>}</span><ChevronRight size={15}/></button>)}{!records.length&&<div className="empty-message">등록된 수행 기록이 없습니다.<br/>과제관리에서 기록을 추가할 수 있습니다.</div>}</div></section>
  </div>
  <section className="overview-card budget-overview"><div className="overview-card-head"><span className="overview-icon"><Coins size={18}/></span><div><h2>사업 예산 현황</h2><p>{year}년 · 우리 기관 배정 예산</p></div><button className="subtle-link" onClick={()=>onNavigate('budget')}>예산·집행 보기 <ArrowRight size={13}/></button></div>{budgeted.length?<><div className="overview-budget-grid"><div><span>현재 예산</span><strong>{won(totals.total)}</strong></div><div><span>누적 집행액</span><strong>{won(totals.spent)}</strong></div><div><span>잔액</span><strong>{won(totals.remaining)}</strong></div><div><span>집행률</span><strong>{totals.total>0?`${(totals.spent/totals.total*100).toFixed(1)}%`:'산정 불가'}</strong></div></div><div className="budget-track"><span style={{width:`${Math.min(100,totals.total>0?totals.spent/totals.total*100:0)}%`}}/></div><p className="overview-note">예산 등록 {budgeted.length} / {scoped.length}건 · 미등록 과제는 합계에서 제외</p></>:<div className="budget-blank"><Coins size={26}/><strong>등록된 예산 자료가 없습니다.</strong><span>과제관리의 예산집행현황 탭에서 예산 비목을 등록하면 이곳에 합산됩니다.</span></div>}</section>
  <section className="overview-card schedule-overview"><div className="overview-card-head"><span className="overview-icon"><CalendarDays size={18}/></span><div><h2>일정 달력</h2><p>과제별 회의·보고·평가 및 마감</p></div><button className="subtle-link" onClick={()=>onNavigate('calendar')}>일정 관리 <ArrowRight size={13}/></button></div><div className="schedule-toolbar"><div><button aria-label="이전 기간" onClick={()=>shift(-1)}><ChevronLeft size={18}/></button><strong>{mode==='월'?`${monthDate.getFullYear()}년 ${monthDate.getMonth()+1}월`:mode==='주'?`${shortDate(shown[0])} ~ ${shortDate(shown[6])}`:selectedDay}</strong><button aria-label="다음 기간" onClick={()=>shift(1)}><ChevronRight size={18}/></button><button className="today-button" onClick={()=>{setMonth(today().slice(0,7));setSelectedDay(today())}}>오늘</button></div><div className="schedule-modes" aria-label="달력 표시 방식">{(['일','주','월'] as const).map(value=><button key={value} className={mode===value?'active':''} onClick={()=>setMode(value)}>{value}</button>)}</div></div><div className={`overview-calendar ${mode==='일'?'single-day':''}`}>{mode!=='일'&&['일','월','화','수','목','금','토'].map((day,i)=><div className="calendar-label" key={i}>{day}</div>)}{shown.map(day=>{const related=events.filter(e=>String(e.start).slice(0,10)<=day&&String(e.end||e.start).slice(0,10)>=day);return <button key={day} className={`overview-day ${day.slice(0,7)!==month&&mode==='월'?'outside':''} ${day===today()?'today':''} ${day===selectedDay?'selected':''}`} onClick={()=>setSelectedDay(day)}><span>{mode==='일'?day:Number(day.slice(-2))}</span>{related.slice(0,2).map(e=><small key={e.id}>{e.title}</small>)}{related.length>2&&<em>+{related.length-2}건</em>}</button>})}</div><div className="selected-events"><strong>{selectedDay.replaceAll('-','.')} 일정</strong>{dayEvents.length?dayEvents.map(e=><button key={e.id} onClick={()=>onOpen(e.project,2)}><span>{String(e.start).slice(11,16)||'종일'}</span><b>{e.title}</b><small>{e.project.alias||e.project.name}</small><ChevronRight size={14}/></button>):<p>등록된 일정이 없습니다.</p>}</div></section>
  <div className="overview-bottom"><div><ClipboardList size={17}/><span>과제별 상세 업무 정보는 과제관리 화면에서 확인·수정합니다.</span></div><button onClick={()=>onNavigate('projects')}>과제관리로 이동 <ArrowRight size={14}/></button></div>
 </div>;
}
