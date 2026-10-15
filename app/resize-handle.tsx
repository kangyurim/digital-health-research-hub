'use client';
import {useRef} from 'react';
export default function ResizeHandle({value,onChange,min=100,max=800,vertical=false,label}:{value:number;onChange:(n:number)=>void;min?:number;max?:number;vertical?:boolean;label:string}){
 const origin=useRef<{point:number;value:number}|null>(null);
 return <div role="separator" aria-label={label} aria-orientation={vertical?'horizontal':'vertical'} aria-valuenow={Math.round(value)} aria-valuemin={min} aria-valuemax={max} tabIndex={0} className={vertical?'resize-height-handle':'resize-width-handle'} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);origin.current={point:vertical?e.clientY:e.clientX,value}}} onPointerMove={e=>{if(origin.current)onChange(Math.max(min,Math.min(max,origin.current.value+(vertical?e.clientY:e.clientX)-origin.current.point)))}} onPointerUp={e=>{origin.current=null;e.currentTarget.releasePointerCapture(e.pointerId)}} onPointerCancel={()=>{origin.current=null}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();onChange(Math.max(min,Math.min(max,value+(['ArrowLeft','ArrowUp'].includes(e.key)?-10:10))))}}}/>;
}
