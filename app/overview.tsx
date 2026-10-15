'use client';
import ResizeHandle from './resize-handle';
import DaySchedule from './day-schedule';
import {useState} from 'react';
import {ArrowUpRight,ChevronLeft,ChevronRight,CalendarDays} from 'lucide-react';
import {budget,categoryBudget,today,type Item,type Project} from './data';
type Props={onEditEvent:(project:Project,event:Item)=>void;projects:Project[];year:string;onOpen:(project:Project,tab:number)=>void;onNavigate:(view:string)=>void};
const money=(n:number)=>new Intl.NumberFormat('ko-KR').format(n);
const dayKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export default function Overview({projects,year,onOpen,onNavigate,onEditEvent}:Props){
 const [listWidth,setListWidth]=useState(210),[progressWidth,setProgressWidth]=useState(360);
 const [panel,setPanel]=useState<'projects'|'budget'>('projects');
 const [projectId,setProjectId]=useState([...projects].sort((a,b)=>Number(b.focus)-Number(a.focus))[0]?.id||'');
 const [budgetScope,setBudgetScope]=useState('전체');
 const [historyId,setHistoryId]=useState('');
 const [mode,setMode]=useState<'월'|'주'|'일'>('월');
 const [cursor,setCursor]=useState(today());
 const [selectedDay,setSelectedDay]=useState(today());
 const [calendarScope,setCalendarScope]=useState('전체');
 const project=projects.find(p=>p.id===projectId)||projects[0];
 const records=[...(project?.records||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const meetings=(project?.events||[]).filter(e=>e.type==='회의'&&!e.deletedAt);
 const history=[...records.map(r=>({id:`r:${r.id}`,date:String(r.date),title:r.title,type:'수행 보고',record:r})),...meetings.map(e=>({id:`e:${e.id}`,date:String(e.start).slice(0,10),title:e.title,type:'회의',record:records.find(r=>String(r.date)<=String(e.start).slice(0,10))}))].sort((a,b)=>b.date.localeCompare(a.date));
 const selectedHistory=history.find(h=>h.id===historyId);
 const record=selectedHistory?selectedHistory.record:records[0];
 const budgetProjects=projects.filter(p=>budgetScope==='전체'||p.id===budgetScope);
 const registered=budgetProjects.filter(p=>p.budgets.some(b=>b.year===year));
 const total=registered.reduce((s,p)=>{const b=budget(p,year);return {total:s.total+b.total,spent:s.spent+b.spent,remaining:s.remaining+b.remaining}}, {total:0,spent:0,remaining:0});
 const classified=(type:string)=>registered.flatMap(p=>p.budgets.filter(b=>b.year===year&&b.costType===type).map(b=>categoryBudget(p,b)));
 const direct=classified('직접비'),indirect=classified('간접비');
 const costCell=(rows:ReturnType<typeof categoryBudget>[])=>rows.length?<>{money(rows.reduce((n,b)=>n+b.total,0))}<small>집행 {money(rows.reduce((n,b)=>n+b.spent,0))}</small></>:'분류 미등록';
 const events=projects.filter(p=>calendarScope==='전체'||p.id===calendarScope).flatMap(p=>p.events.filter(e=>!e.deletedAt).map(e=>({...e,project:p} as Item&{project:Project}))).sort((a,b)=>String(a.start).localeCompare(String(b.start)));
 const date=new Date(cursor+'T12:00:00');
 const first=new Date(date.getFullYear(),date.getMonth(),1);
 const start=new Date(first);start.setDate(1-first.getDay());
 const week=new Date(date);week.setDate(date.getDate()-date.getDay());
 const cells=Array.from({length:mode==='월'?Math.ceil((first.getDay()+new Date(date.getFullYear(),date.getMonth()+1,0).getDate())/7)*7:mode==='주'?7:1},(_,i)=>{const d=new Date(mode==='월'?start:mode==='주'?week:date);d.setDate(d.getDate()+i);return dayKey(d)});
 const onDay=(key:string)=>events.filter(e=>String(e.start).slice(0,10)<=key&&String(e.end||e.start).slice(0,10)>=key);
 const shift=(n:number)=>{const d=new Date(date);if(mode==='월'){d.setDate(1);d.setMonth(d.getMonth()+n)}else d.setDate(d.getDate()+n*(mode==='주'?7:1));setCursor(dayKey(d));setSelectedDay(dayKey(d))};
 return <div className="wire-overview">
  <div className="wire-title"><h1>통합 현황</h1><span>{today().replaceAll('-','.')} 기준</span></div>
  <section className="wire-summary">
   <div className="wire-summary-menu" role="tablist" aria-label="현황 구분">
    <button role="tab" aria-selected={panel==='projects'} className={panel==='projects'?'selected':''} onClick={()=>setPanel('projects')}><span>등록 과제 <small>(중점/전체)</small></span><strong>{projects.filter(p=>p.focus).length} <i>/</i> {projects.length}<ChevronRight size={16}/></strong></button>
    <button role="tab" aria-selected={panel==='budget'} className={panel==='budget'?'selected':''} onClick={()=>setPanel('budget')}><span>사업 예산 현황</span><small>{year}년 · 우리 기관 배정 예산</small><ChevronRight size={16}/></button>
   </div>
   <div className="wire-summary-content">
    {panel==='projects'?<><div className="wire-panel-heading"><h2>등록 과제</h2><button onClick={()=>onNavigate('projects')}>자세히 · 과제 관리 <ArrowUpRight size={14}/></button></div><div className="wire-project-layout adjustable" style={{gridTemplateColumns:`${listWidth}px 6px ${progressWidth}px 6px minmax(180px,1fr)`}}>
     <div className="wire-project-list" aria-label="현황 조회 과제">{[...projects].sort((a,b)=>Number(b.focus)-Number(a.focus)).map(p=><button key={p.id} title={p.name} aria-pressed={p.id===project?.id} className={p.id===project?.id?'selected':''} onClick={()=>{setProjectId(p.id);setHistoryId('')}}><span>{p.focus&&<b className="overview-star">★ </b>}{p.alias||p.name}</span><ChevronRight size={13}/></button>)}</div>
     <ResizeHandle value={listWidth} onChange={setListWidth} min={130} max={450} label="과제 목록 칼럼 폭"/><div className="wire-progress"><div className="wire-subheading"><strong>사업 진행 현황</strong><span>{selectedHistory?selectedHistory.date:'최근 기록'}</span></div>{project&&<p className="wire-project-caption" title={project.name}>{project.alias||project.name} · {project.manager||'담당 미지정'}</p>}{record?<div className="wire-record"><h3>{record.title}</h3>{[['주요 진행 현황',record.progress],['수행 이슈',record.issue],['향후 계획',record.plan]].map(([label,value])=><div key={label}><strong>{label}</strong><p>{value||'등록된 내용이 없습니다.'}</p></div>)}</div>:<div className="wire-empty">{selectedHistory?'선택한 회의일까지 등록된 수행 보고가 없습니다.':'등록된 수행 기록이 없습니다.'}{project&&<button onClick={()=>onOpen(project,2)}>수행 현황 등록·조회 <ArrowUpRight size={13}/></button>}</div>}</div>
     <ResizeHandle value={progressWidth} onChange={setProgressWidth} min={200} max={700} label="진행 현황 칼럼 폭"/><div className="wire-history"><div className="wire-subheading"><strong>워킹그룹 회의·보고</strong><span>최신순</span></div><div>{history.map(h=><button key={h.id} className={selectedHistory?.id===h.id||(!historyId&&h.record?.id===records[0]?.id&&h.type==='수행 보고')?'selected':''} onClick={()=>setHistoryId(h.id)}><small>{h.date.replaceAll('-','.')} · {h.type}</small><strong>{h.title}</strong></button>)}{!history.length&&<div className="wire-empty">등록된 회의·보고가 없습니다.</div>}</div></div>
    </div></>:<><div className="wire-panel-heading"><h2>사업 예산</h2><button onClick={()=>onNavigate('budget')}>자세히 · 예산·집행 <ArrowUpRight size={14}/></button><select aria-label="예산 조회 과제" value={budgetScope} onChange={e=>setBudgetScope(e.target.value)}><option value="전체">전체 과제</option>{projects.map(p=><option key={p.id} value={p.id}>{p.alias||p.name}</option>)}</select></div><div className="wire-budget"><table><thead><tr>{['현재 예산','집행액','직접비','간접비','집행률'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody><tr><td>{registered.length?money(total.total):'미등록'}</td><td>{registered.length?money(total.spent):'미등록'}</td><td>{costCell(direct)}</td><td>{costCell(indirect)}</td><td>{registered.length&&total.total>0?(total.spent/total.total*100).toFixed(1)+'%':'—'}<div className="wire-rate"><i style={{width:`${Math.max(0,Math.min(100,total.total>0?total.spent/total.total*100:0))}%`}}/></div></td></tr></tbody></table><p>단위: 원 · 잔액 {registered.length?money(total.remaining):'미등록'} · 예산 등록 {registered.length}/{budgetProjects.length}건 · 미등록 과제는 합계에서 제외</p></div></>}
   </div>
  </section>
  <section className="wire-calendar">
   <div className="wire-panel-heading"><h2>일정 달력</h2><div className="wire-calendar-options"><select aria-label="달력 과제" value={calendarScope} onChange={e=>setCalendarScope(e.target.value)}><option value="전체">전체 과제 일정</option>{projects.map(p=><option key={p.id} value={p.id}>{p.alias||p.name}</option>)}</select><select aria-label="일정 보기 단위" value={mode} onChange={e=>{setMode(e.target.value as '월'|'주'|'일');setCursor(selectedDay)}}><option>월</option><option>주</option><option>일</option></select></div></div>
   <div className="wire-calendar-toolbar"><button aria-label="이전 기간" onClick={()=>shift(-1)}><ChevronLeft size={19}/></button><strong>{mode==='월'?`${date.getFullYear()}년 ${date.getMonth()+1}월`:mode==='주'?`${cells[0]} ~ ${cells[6]}`:cursor}</strong><button aria-label="다음 기간" onClick={()=>shift(1)}><ChevronRight size={19}/></button><button onClick={()=>{setCursor(today());setSelectedDay(today())}}>오늘</button><span><i/>회의·보고·평가·마감</span></div>
   {mode==='일'?<DaySchedule day={cursor} events={onDay(cursor)} onOpen={onOpen} onEditEvent={onEditEvent}/>:<div className={`wire-calendar-grid mode-${mode}`}>{['일','월','화','수','목','금','토'].map((d,i)=><div key={d} className={`wire-weekday weekday-${i}`}>{d}</div>)}{cells.map(key=><div key={key} className={`wire-day ${key.slice(0,7)!==cursor.slice(0,7)&&mode==='월'?'outside':''} ${key===selectedDay?'selected':''} ${key===today()?'today':''}`}><button className="wire-day-number" aria-label={`${key} 일정 조회`} onClick={()=>setSelectedDay(key)}>{Number(key.slice(-2))}</button>{onDay(key).slice(0,mode==='월'?3:12).map(e=><button className={`wire-event ${e.done?'done':''}`} key={e.id} title={`${e.project.alias||e.project.name} · ${e.title}`} onClick={()=>{setSelectedDay(key);onEditEvent(e.project,e)}}><span>{String(e.start).slice(11,16)}</span>{e.title}</button>)}{mode==='월'&&onDay(key).length>3&&<button className="wire-more" onClick={()=>{setCursor(key);setSelectedDay(key);setMode('일')}}>+{onDay(key).length-3}건 더 보기</button>}</div>)}</div>}
   <div className="wire-day-details"><strong><CalendarDays size={15}/>{selectedDay.replaceAll('-','.')}</strong>{onDay(selectedDay).length?onDay(selectedDay).map(e=><button key={e.id} onClick={()=>onEditEvent(e.project,e)}>{String(e.start).slice(11,16)} · {e.title}<small>{e.project.alias||e.project.name}</small><ArrowUpRight size={13}/></button>):<span>등록된 일정이 없습니다.</span>}</div>
  </section>
 </div>;
}
