export type Item = { id: string; [key: string]: any };
export type Project = Item & { name: string; code: string; team: string; status: string; focus: boolean; agency: string; lead: string; start: string; end: string; updated: string; description: string; records: Item[]; events: Item[]; budgets: Item[]; plans: Item[]; changes: Item[]; people: Item[]; documents: Item[] };
export type Workspace = { projects: Project[]; demo: boolean };
export const teams = ['AI전략운영팀', '의료데이터관리팀', '디지털헬스팀'];
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
 const names=['의료 특화 초거대 AI 서비스 개발','차세대 의료데이터 통합 플랫폼 구축','디지털 치료기기 임상 실증 연구','멀티모달 의료 AI 진단 기술 개발','보건의료 데이터 활용 생태계 조성','지역사회 디지털 헬스케어 실증','병원 업무 혁신 AI 에이전트 개발','정밀의료 데이터 표준화 연구','스마트병원 선도모델 확산','의료 AI 신뢰성 평가체계 구축','차세대 건강관리 서비스 기획','의료데이터 품질관리 기반 구축'];
 const amounts=[820,640,480,560,390,320,450,280,360,240,180,210];
 const leads=['김민준','이서연','박지훈','정수빈','최현우','김지영'];
 return { demo:true, projects:names.map((name,i)=>{
 const id=`sample-${i+1}`, team=teams[i%3], lead=leads[i%6];
 const status=i<9?'진행':i<11?'예정':'종료';
 const budgets=['인건비','연구활동비','연구시설·장비비','간접비'].map((n,j)=>({id:`${id}-b${j}`,name:n,year:'2026',kind:j===3?'현물':'현금',source:'정부지원금',provider:'지원기관',initial:amounts[i]*1000000*[.5,.25,.15,.1][j],spent:status==='예정'?0:Math.round(amounts[i]*1000000*[.5,.25,.15,.1][j]*(status==='종료'?1:[.63,.48,.72,.55][j])),date:'2026-10-08'}));
 return {id,name,code:`RS-2026-${String(10001+i)}`,team,lead,status,focus:i<8,agency:['한국보건산업진흥원','한국지능정보사회진흥원','한국연구재단'][i%3],start:'2025-04-01',end:i===11?'2026-09-30':'2027-12-31',updated:'2026-10-08',author:lead,description:`${name}을 통해 의료 현장의 디지털 전환 기반을 마련하고, 실증 중심의 기술 개발 및 현장 적용을 추진합니다.`,program:'보건의료 기술 연구개발사업',alias:['Med-AI','Data Link','D-Therapy'][i%3],annual:'예',round:'2',yearStart:'2026-01-01',yearEnd:'2026-12-31',host:'주관 연구기관',partners:'참여 연구기관 A, 참여 연구기관 B',participation:'참여',contacts:'협력기관 담당자 확인 예정',note:'기획 검토를 위한 가상의 예시 과제입니다.',
 records:status==='예정'?[]:[{id:`${id}-r1`,date:'2026-10-08',title:'10월 1차 워킹그룹 수행 보고',author:lead,progress:'핵심 기능 개발 및 데이터 검증 1차 작업 완료. 참여기관 실무 협의를 통해 다음 단계의 수행 범위를 확정했습니다.',plan:'2차 검증 및 실증 대상 기관 협의 진행\n중간 점검 보고자료 작성',discussion:i%3===0?'실증 데이터 활용 범위에 대한 의사결정이 필요합니다.':'다음 회차 실증 일정 및 참여기관별 역할 확인',issue:i%3===0?'참여기관 데이터 제공 일정 조율 필요':'',followup:'담당 기관과 세부 일정을 협의하고 다음 워킹그룹에서 공유 예정',reference:'',updated:'2026-10-08'}, {id:`${id}-r0`,date:'2026-09-24',title:'9월 2차 워킹그룹 수행 보고',author:lead,progress:'개발 요구사항 정리 및 기관별 역할 분담 완료',plan:'1차 검증 수행',discussion:'검증 환경 준비',issue:'',followup:'검증용 데이터 준비 완료',updated:'2026-09-24'}],
 events:i<6?[{id:`${id}-e1`,title:['10월 정기 워킹그룹','데이터 표준화 실무 협의','임상 실증 중간 점검','AI 모델 성능 평가','데이터 활용 보고서 제출','참여기관 정기 회의'][i],type:['회의','회의','평가','평가','보고','회의'][i],start:`2026-10-${[14,15,16,20,22,23][i]}T${i%2?'14:00':'10:00'}`,end:`2026-10-${[14,15,16,20,22,23][i]}T${i%2?'15:00':'11:00'}`,owner:lead,place:'본관 3층 회의실',detail:'과제별 수행 현황 및 향후 계획 공유',done:false}]:[],budgets,plans:status==='진행'?[{id:`${id}-pl`,title:'2차 실증 연구활동비',categoryId:budgets[1].id,year:'2026',amount:20000000,date:'2026-11-01',status:'예정',note:''}]:[],changes:[],people:[{id:`${id}-person`,name:lead,organization:'우리 기관',team,position:'책임연구원',role:'연구책임자',task:'과제 총괄 및 수행 관리',start:'2025-04-01',end:'2027-12-31',active:true,email:'',phone:'',history:'2025-04-01 신규 참여 (예시)'}],documents:[]};
 })};
}
