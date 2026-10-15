'use client';
import {useEffect,useRef} from 'react';
import {type Item,type Project,today} from './data';
type Event=Item&{project:Project};
export default function DaySchedule({day,events,onOpen}:{day:string;events:Event[];onOpen:(p:Project,tab:number)=>void}){
 const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(scroll.current)scroll.current.scrollTop=8*52-12},[day]);
 const minutes=(value:string)=>Number(value.slice(11,13))*60+Number(value.slice(14,16));
 const allDay=events.filter(e=>!String(e.start).includes('T'));
 const timed=events.filter(e=>String(e.start).includes('T')).map(e=>({event:e,start:String(e.start).slice(0,10)<day?0:minutes(String(e.start)),end:String(e.end||e.start).slice(0,10)>day?1440:minutes(String(e.end||e.start)),column:0,columns:1})).sort((a,b)=>a.start-b.start);
 let group:typeof timed=[],ends:number[]=[],groupEnd=-1;
 const finish=()=>{group.forEach(e=>e.columns=ends.length);group=[];ends=[]};
 for(const entry of timed){entry.end=Math.max(entry.start+15,entry.end);if(entry.start>=groupEnd){finish();groupEnd=-1}let c=ends.findIndex(end=>end<=entry.start);if(c<0)c=ends.length;entry.column=c;ends[c]=entry.end;group.push(entry);groupEnd=Math.max(groupEnd,entry.end)}finish();
 const now=new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Seoul',hour12:false});const current=Number(now.slice(0,2))*60+Number(now.slice(3,5));
 return <div className="hour-calendar"><div className="hour-day-heading"><span>GMT+09</span><strong>{day.replaceAll('-','.')} <small>{['일','월','화','수','목','금','토'][new Date(day+'T12:00:00').getDay()]}</small></strong></div>{allDay.length>0&&<div className="all-day"><span>종일</span>{allDay.map(e=><button key={e.id} onClick={()=>onOpen(e.project,2)}>{e.title}</button>)}</div>}<div className="hour-scroll" ref={scroll}><div className="hour-track">{Array.from({length:24},(_,hour)=><div className="hour-line" key={hour} style={{top:hour*52}}><span>{hour===0?'오전 12시':hour<12?`오전 ${hour}시`:hour===12?'오후 12시':`오후 ${hour-12}시`}</span></div>)}<div className="hour-events">{timed.map(({event:e,start,end,column,columns})=><button key={e.id} className="hour-event" style={{top:start/60*52,height:Math.max(22,(Math.min(1440,end)-start)/60*52),left:`${column/columns*100}%`,width:`calc(${100/columns}% - 4px)`}} title={`${e.title} · ${String(e.start).slice(11,16)}–${String(e.end).slice(11,16)}`} onClick={()=>onOpen(e.project,2)}><strong>{e.title}</strong><span>{String(e.start).slice(11,16)}–{String(e.end).slice(11,16)} · {e.project.alias||e.project.name}</span></button>)}{day===today()&&<div className="current-time" style={{top:current/60*52}}><i/></div>}</div></div></div></div>;
}
