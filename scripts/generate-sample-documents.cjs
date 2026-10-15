const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const file=path.join(__dirname,'..','app','data.ts');
const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
let rows;
function visit(node){
 if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='rows'&&ts.isArrayLiteralExpression(node.initializer))rows=node.initializer;
 ts.forEachChild(node,visit);
}
visit(source);
if(!rows)throw Error('Project seed rows not found');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const output=path.join(__dirname,'..','public','sample-documents');
fs.mkdirSync(output,{recursive:true});
const projectRows=rows.elements.map(row=>row.elements.map(element=>element.text||''));
projectRows.push(['간호 스케줄 배정 자동화 시스템 구축 (삼일 PwC 협업)','간호 스케줄','','','간호 스케줄 배정 자동화 시스템 구축']);
projectRows.forEach((values,index)=>{
 const [name,alias,,,goal]=values;
 const code=`PRJ-${String(index+1).padStart(3,'0')}`;
 const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(name)} · 사업 개요</title><style>body{font-family:system-ui,'Noto Sans KR',sans-serif;color:#262626;max-width:820px;margin:48px auto;padding:0 24px;line-height:1.7}header{border-bottom:2px solid #333;padding-bottom:20px}small{color:#666}h1{font-size:26px;line-height:1.45}section{padding:18px 0;border-bottom:1px solid #ddd}h2{font-size:16px;margin:0 0 12px}p{white-space:pre-line;margin:0}.note{background:#f3f3f3;padding:16px;margin-top:28px;font-size:13px;color:#555}</style></head><body><header><small>${code} · 디지털헬스전략실</small><h1>${escape(name)}</h1>${alias?`<small>약칭 ${escape(alias)}</small>`:''}</header><section><h2>사업 목표</h2><p>${escape(goal||'과제별 수행 목표와 범위를 검토합니다.')}</p></section><section><h2>검토 항목</h2><p>수행 일정, 예산 편성, 참여기관 역할 및 성과지표를 과제관리 화면에서 확인합니다.</p></section><p class="note">화면 구성과 첨부 기능을 확인하기 위한 자료입니다. 실제 협약 내용과 제출 문서는 담당자가 확인해 교체해 주세요.</p></body></html>`;
 fs.writeFileSync(path.join(output,`${code}.html`),html);
});
console.log(`${projectRows.length} project documents generated`);
