const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const sourcePath=path.join(__dirname,'..','app','data.ts');
const output=ts.transpileModule(fs.readFileSync(sourcePath,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleRef=new Module(sourcePath,module);
moduleRef._compile(output,sourcePath);
const {makeDemo,fillProjectExamples,fillAgencyExamples,removeInventedReports}=moduleRef.exports;
const data=fillProjectExamples(removeInventedReports(fillAgencyExamples(makeDemo())));
if(data.projects.length!==16)throw Error(`Expected 16 projects, got ${data.projects.length}`);
for(const project of data.projects){
 if(!project.start||!project.end||!project.yearStart||!project.yearEnd||!project.agency||!project.host)throw Error(`Incomplete dates or agency: ${project.code}`);
 if(!project.budgets.some(item=>item.year==='2026'))throw Error(`Missing 2026 budget: ${project.code}`);
 if(!project.documents.some(item=>item.url&&fs.existsSync(path.join(__dirname,'..','public',item.url))))throw Error(`Missing linked document: ${project.code}`);
 if(!project.metrics?.length)throw Error(`Missing KPI: ${project.code}`);
 if(project.records.some(item=>/^example-project-\d+-r[12]$/.test(item.id)))throw Error(`Invented report returned: ${project.code}`);
}
for(const meeting of data.workgroups||[])for(const section of meeting.sections){
 if(!section.projectIds.length)continue;
 if(section.blocks.some(block=>!block.items.some(Boolean)))throw Error(`Empty agenda block: ${meeting.date} ${section.title}`);
 if(!section.attachments.length)throw Error(`Missing meeting attachment: ${meeting.date} ${section.title}`);
}
console.log(`Validated ${data.projects.length} projects and ${data.workgroups?.length||0} working-group meetings`);
