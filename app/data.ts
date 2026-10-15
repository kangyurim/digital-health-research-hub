export type Item = { id: string; [key: string]: any };
export type Project = Item & { name: string; code: string; team: string; status: string; focus: boolean; agency: string; lead: string; start: string; end: string; updated: string; description: string; records: Item[]; events: Item[]; budgets: Item[]; plans: Item[]; changes: Item[]; people: Item[]; documents: Item[] };
export type Workspace = { projects: Project[]; demo: boolean };
export const teams = ['AI전략운영팀', '의료데이터관리팀', '디지털헬스팀', '미지정'];
export const organization = [
 {name:'디지털헬스팀',leader:'엄재준',members:['이상휘 과장','최운성 주임','남윤진 사무원']},
 {name:'의료데이터관리팀',leader:'김경안',members:['곽인혜 대리','박다슬 주임','안태진 사무원']},
 {name:'AI전략운영팀',leader:'정무열',members:['김지원 사무원','강유림 사무원']},
];
export const today = () => new Date().toLocaleDateString('sv-SE', {timeZone:'Asia/Seoul'});
export const uid = () => crypto.randomUUID();
export function budget(p: Project, year = '2026', kind = '전체') {
 const rows = p.budgets.filter(b => b.year === year && (kind === '전체' || b.kind === kind));
 const initial = rows.reduce((s,b)=>s+Number(b.initial||0),0);
 const reflected = p.changes.filter(c=>c.year===year && c.status==='승인' && c.applied);
 const delta = reflected.reduce((s,c)=>s+(rows.some(b=>b.id===c.categoryId)?Number(c.amount||0):0)-(c.type==='비목 간 이동'&&rows.some(b=>b.id===c.fromId)?Number(c.amount||0):0),0);
 const spent = rows.reduce((s,b)=>s+Number(b.spent||0),0);
 const planned = p.plans.filter(b=> b.year===year && b.status!=='완료' && b.status!=='취소' && (kind==='전체'||rows.some(r=>r.id===b.categoryId))).reduce((s,b)=>s+Number(b.amount||0),0);
 return {initial,delta,total:initial+delta,spent,remaining:initial+delta-spent,planned,rate:initial+delta>0?spent/(initial+delta)*100:null};
}
export function categoryBudget(p: Project, b: Item) {
 const changes=p.changes.filter(c=>c.year===b.year&&c.status==='승인'&&c.applied);
 const delta=changes.reduce((s,c)=>s+(c.categoryId===b.id?Number(c.amount):0)-(c.type==='비목 간 이동'&&c.fromId===b.id?Number(c.amount):0),0);
 const planned=p.plans.filter(c=>c.categoryId===b.id&&c.year===b.year&&!['완료','취소'].includes(c.status)).reduce((s,c)=>s+Number(c.amount),0);
 return {delta,total:Number(b.initial)+delta,spent:Number(b.spent),planned};
}
export function makeDemo(): Workspace {
 const rows:[string,string,string,string,string,string][]=[
 ['본인진료기록열람지원 시스템(건강정보 고속도로)','','','외과 이성환 교수','실시간 마이헬스웨이 데이터 공여 플랫폼 · 운영체계 구축 및 산업 생태계 참여','미지정'],
 ['가상환자, 가상병원 기반 의료기술개발 사업','','','외과 이성환 교수','가상환경 기반 디지털 의료서비스를 통해 충실한 정보전달, 보호자 참여 기회 증대, 환자의 자기결정권 강화','미지정'],
 ['다기관-멀티모달 연합학습 기반 의료 인공지능 기술 시범모델 개발사업','','','외과 이성환 교수','환자 중심 다학제 진료 체계 지원 플랫폼 내 AI 에이전트의 사용자 맞춤형 기술 개발 및 적용','미지정'],
 ['의료AI 혁신 생태계 조성사업(닥터앤서 3.0)','','','외과 이성환 교수','위암 수술 환자 데이터 기반 합병증 예측 AI와 맞춤형 케어플랜 검증','미지정'],
 ['의료데이터 중심병원 지원사업','데중병원','안태진 사무원','외과 이성환 교수','1) 의료 빅데이터 활용을 통한 국민건강증진 및 미래 혁신 의료기술 사업 육성\n2) 지속가능한 보건의료 데이터 활용 생태계를 통한 의료 혁신•산업혁신 지원','의료데이터관리팀'],
 ['의료AI 보건의료인 직무교육사업','직무교육','정무열 팀장, 김지원 사무원','외과 이성환 교수','병원 현장 중심의 AI 실무인재 양성을 통해 의료기관의 디지털 전환 가속화 및 지역별 AI 기술수준의 편차를 완화','AI전략운영팀'],
 ['Physical AI 기반 의료로봇 기술통합센터 구축','피지컬AI','정무열 팀장, 김지원 사무원, 강유림 사무원','성형외과 김덕열 교수','인프라 구축을 통해 AI 기반 판단 기능과 로봇의 물리적 제어, 임상 안전성이 통합된 차세대 의료로봇의 시제품 개발부터 시험/평가, 실증, 인허가, 시장 진출에 이르는 전주기 지원 체계를 확립하고 국내 의료로봇 산업 기술 경쟁력 과 글로벌 시장 대응력을 강화','AI전략운영팀'],
 ['독자 AI 파운데이션모델 사업','독파모','정무열 팀장, 김지원 사무원, 강유림 사무원','','병원 업무 및 의료 분야에서 LG AI 연구원이 개발한 K-EXAONE을 활용한 다양한 적용·실증 사례 발굴 및 추진 (컨소시엄 참여, 별도 예산 배정 없음)','AI전략운영팀'],
 ['의료 데이터 스페이스 구축','스페이스','곽인혜 대리','외과 이성환 교수','1) 기관마다 서로 다른 형식으로 수집된 원시 데이터를 SNOMED CT 표준용어체계에 맞춰 정규화하는 데이터 표준화 Agent를 구축\n2) 비정형 영상검사 판독문에서 소견 단위로 개체명을 인식·추출하는 영상검사 NER Agent를 개발\n3) 두 Agent의 산출물과 약물·처방 등 정형 임상정보를 결합해 방문(내원) 단위의 진료경과 요약문을 생성하는 Agent를 완성하는 것','의료데이터관리팀'],
 ['TRI-Agentic AI: 초개인화 질환 관리를 통한 예후 향상을 지원하는 Agentic AI 기반 토탈 솔루션 개발 및 실증','닥터앤서','곽인혜 대리','외과 이성환 교수','1) 6개 질환군(산모, 소아 만성호흡부전, 전립선비대증, 척추·관절 수술 재활, 위암, 대장암) 대상의 다기관 데이터 연계 기반 Agentic AI 의료 서비스 개발 및 실증\n2) 웨어러블·IoT 기기, Single AI Agent, 병원 데이터와 연동되는 통합 Agent 시스템을 통한 실시간 맞춤형 의료 대응 및 다기관 확장 실증','의료데이터관리팀'],
 ['더 나은 환자 경험을 위한 클라우드 기반 디지털 의료서비스 모델 개발 및 실증','가상병원','곽인혜 대리','외과 이성환 교수','1) 환자 경험 개선을 위한 가상환경 기반 디지털 의료서비스 모델 개발 및 실증\n2) 가상환경 기반 의료서비스의 4대 시나리오에 대한 다음의 목표를 달성하고자 함','의료데이터관리팀'],
 ['FLAME-ARK 솔루션 개발 실증: 환자 중심 협진 지원 AI','멀티모달','곽인혜 대리','외과 이성환 교수','1) 환자 중심 다학제 진료 체계 지원 솔루션 및 플랫폼 구축과 실증\n2) 환자 중심 다학제 진료 체계 지원 플랫폼 내 AI 에이전트의 사용자 맞춤형 기술 개발 및 적용','의료데이터관리팀'],
 ['의료기관 AX 직무역량강화 컨설팅 사업','컨설팅','정무열 팀장, 강유림 사무원','','','AI전략운영팀'],
 ['의료 AI 테스트베드 지원사업','테스트베드','이상휘 과장','','','디지털헬스팀'],
 ['건강보험 빅데이터 분석센터 구축','분석센터','유승훈 선임연구원','','','미지정'],
 ];
 return addMonitoringExamples({demo:false,projects:rows.map(([name,alias,manager,lead,description,team],i)=>({
  id:`project-${i+1}`,code:`PRJ-${String(i+1).padStart(3,'0')}`,name,alias,manager:manager?`담당자${i+1}`:'',lead:lead?`책임자${i+1}`:'',description,team,
  status:'진행',statusConfirmed:false,focus:false,agency:'',start:'',end:'',updated:'',author:'',program:'',note:'',
  records:[],events:[],budgets:[],plans:[],changes:[],people:[],documents:[]
 }))});
}

export function useExampleNames(workspace:Workspace):Workspace {
 return {...workspace,projects:workspace.projects.map((p,i)=>({...p,lead:p.lead&&/교수|이성환|김덕열/.test(p.lead)?'책임자'+(i+1):p.lead,manager:p.manager&&/사무원|팀장|대리|과장|연구원/.test(p.manager)?'담당자'+(i+1):p.manager}))};
}

// Explicitly requested demonstration records; never replace entered operational data.
export function addMonitoringExamples(workspace:Workspace):Workspace {
 const examples:Record<string,{agency:string;total:number;spent:number;start:string;end:string}>={
  'project-5':{agency:'예시 지원기관 A',total:800000000,spent:480000000,start:'2026-01-01',end:'2028-12-31'},
  'project-6':{agency:'예시 지원기관 B',total:300000000,spent:165000000,start:'2026-03-01',end:'2026-12-31'},
  'project-9':{agency:'예시 지원기관 C',total:500000000,spent:210000000,start:'2026-04-01',end:'2027-12-31'}
 };
 return {...workspace,projects:workspace.projects.map(p=>{
  const e=examples[p.id];if(!e||p.exampleSeedVersion)return p;
  const prefix='example-'+p.id;
  return {...p,focus:true,exampleSeedVersion:1,exampleData:true,statusConfirmed:p.statusConfirmed||true,
   agency:p.agency||e.agency,host:p.host||'분당차병원',start:p.start||e.start,end:p.end||e.end,
   yearStart:p.yearStart||e.start,yearEnd:p.yearEnd||'2026-12-31',annual:p.annual||true,round:p.round||'1',participation:p.participation||'주관',
   records:p.records.length?p.records:[
    {id:prefix+'-r1',date:'2026-10-08',title:'[예시] 10월 1차 워킹그룹 보고',author:p.manager||'담당자1',progress:'당해연도 세부 추진계획을 점검하고 부서별 수행 범위를 정리했습니다.',issue:'협력부서 검토 일정 확정이 필요합니다.',plan:'10월 중간점검 회의에서 담당 업무와 일정을 확정합니다.',followup:'담당자별 확인 사항 취합'},
    {id:prefix+'-r2',date:'2026-10-15',title:'[예시] 10월 2차 워킹그룹 보고',author:p.manager||'담당자1',progress:'주요 산출물 초안 검토를 완료하고 4분기 추진 일정을 조정했습니다.',issue:'지원기관 제출자료의 최종 검토 담당자 지정이 필요합니다.',plan:'10월 22일 중간점검 후 10월 30일까지 보고자료를 취합합니다.',discussion:'추가 검토 회의 일정 및 자료 제출 범위',followup:'검토 결과는 다음 워킹그룹에 보고'}
   ],
   events:p.events.length?p.events:[
    {id:prefix+'-e1',title:'[예시] 1차 워킹그룹 회의',type:'회의',start:'2026-10-08T09:00',end:'2026-10-08T10:00',owner:p.manager,place:'분당차병원 회의실',done:true},
    {id:prefix+'-e2',title:'[예시] 2차 워킹그룹 회의',type:'회의',start:'2026-10-15T09:00',end:'2026-10-15T10:00',owner:p.manager,place:'분당차병원 회의실',done:false},
    {id:prefix+'-e3',title:'[예시] 중간점검 회의',type:'회의',start:'2026-10-22T14:00',end:'2026-10-22T15:30',owner:p.manager,done:false},
    {id:prefix+'-e4',title:'[예시] 월간 보고자료 마감',type:'보고',start:'2026-10-30T16:00',end:'2026-10-30T17:00',owner:p.manager,done:false}
   ],
   budgets:p.budgets.length?p.budgets:[
    {id:prefix+'-b1',name:'연구활동비 (예시)',year:'2026',kind:'현금',costType:'직접비',source:'정부지원금',provider:e.agency,initial:e.total*0.9,spent:e.spent*0.9,date:'2026-10-15'},
    {id:prefix+'-b2',name:'간접비 (예시)',year:'2026',kind:'현금',costType:'간접비',source:'정부지원금',provider:e.agency,initial:e.total*0.1,spent:e.spent*0.1,date:'2026-10-15'}
   ]};
 })};
}
