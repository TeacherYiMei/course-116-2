(function(){
  'use strict';
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods,teacherProfile=null,records=[],audited=[],historic=[];
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>{const x=Number(v);return Number.isFinite(x)?Math.max(0,Math.min(30,x)):0;};
  const normSeat=x=>{const k=Number(String(x??'').trim());return Number.isFinite(k)&&k>0?String(k):'';};
  const identity=r=>[String(r.className||'').trim(),normSeat(r.seatNo),String(r.name||'').trim()].join('::');
  const seatKey=r=>`${String(r.className||'').trim()}::${Number(String(r.seatNo||'').trim())}`;
  const isAdmin=()=>teacherProfile?.role==='admin';
  const classes=()=>isAdmin()?null:(Array.isArray(teacherProfile?.classes)?teacherProfile.classes.map(String):[]);
  const stamp=v=>{try{return v&&typeof v.toDate==='function'?v.toDate().toLocaleString('zh-TW'):'';}catch{return '';}};
  function calcLevels(levels){
    if(!levels||typeof levels!=='object')return null;
    let sum=0,count=0,found=false;
    for(let i=1;i<=10;i++){
      const k='p'+i;
      let v=levels[k]??levels[k.toUpperCase()];
      if(v===undefined)continue;
      found=true;count++;
      sum+=Math.min(3,n(v&&typeof v==='object'?(v.stars??v.completed??0):v));
    }
    return found?{sum:Math.min(30,sum),count}:null;
  }
  function sourcesFor(r){
    const sources=[];
    const legacy=calcLevels(r.progress);
    if(legacy)sources.push({name:'progress.p1～p10',value:legacy.sum,levels:legacy.count});
    if(r.stars!==undefined)sources.push({name:'stars',value:n(r.stars),levels:null});
    const roots=[['modules',r.modules],['progress._mods',r.progress?._mods],['courseProgress.11601.modules',r.courseProgress?.['11601']?.modules]];
    for(const [root,data] of roots){
      for(const alias of ['python','py']){
        const obj=data?.[alias];if(!obj||typeof obj!=='object')continue;
        if(obj.stars!==undefined)sources.push({name:`${root}.${alias}.stars`,value:n(obj.stars),levels:null});
        const lev=calcLevels(obj.levels);
        if(lev)sources.push({name:`${root}.${alias}.levels`,value:lev.sum,levels:lev.count});
      }
    }
    return sources;
  }
  function audit(){
    const groups=new Map();
    for(const r of records){const k=seatKey(r);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
    audited=records.map(r=>{
      const group=groups.get(seatKey(r))||[r], sources=sourcesFor(r);
      const values=sources.map(s=>s.value), high=values.length?Math.max(...values):0,low=values.length?Math.min(...values):0;
      const all=group.flatMap(sourcesFor),best=all.length?Math.max(...all.map(s=>s.value)):0;
      const issues=[],types=[];
      if(high>low){issues.push(`此 UID 來源最高 ${high} 星、最低 ${low} 星；可能讀取格式不同`);types.push('history','stars');}
      if(group.length>1){issues.push(`同班同座有 ${group.length} 個 Firebase 紀錄，跨 UID 可見最高 ${best} 星；請核對姓名及帳號，勿直接合併`);types.push('duplicate','history');}
      if(best>high){issues.push(`其他 UID 有較高 Python 紀錄（${best} 星），目前 UID 最高 ${high} 星`);types.push('history','stars');}
      const priority=String(r.className)==='902'&&Number(r.seatNo)===28;
      if(priority){issues.unshift('已回報：原本 30 星，現曾顯示 3 星；須核對歷史備份（不能只依目前資料斷定 30 星仍存在）');types.push('priority');}
      if(String(r.className)==='910'&&[30,36].includes(Number(r.seatNo))){
        issues.unshift('910 班特殊情況：30 號原帳號、36 號暫用帳號；先核對身分與實際登入 UID，勿直接合併');types.push('alias910');
      }
      if(!sources.length){issues.push('未找到可判讀的 Python 星數欄位（可能尚未同步或使用其他資料路徑）');types.push('history');}
      return {...r,sources,high,best,issues,types:[...new Set(types)],duplicates:group.length};
    });
    render();refresh910();
  }
  function pastMatch(r){
    if(!historic.length)return null;
    const uid=historic.find(x=>x.UID&&x.UID===String(r.id));
    if(uid)return {row:uid,kind:'相同 UID'};
    const candidates=historic.filter(x=>identity({className:x['班級'],seatNo:x['座號'],name:x['姓名']})===identity(r));
    return candidates.length===1?{row:candidates[0],kind:'同班座號姓名（UID 未對上）'}:null;
  }
  function pastValue(x){
    if(!x)return null;
    const vals=[x['當前stars'],x['同班同座最高可讀星']].map(Number).filter(v=>Number.isFinite(v)&&v>=0&&v<=30);
    return vals.length?Math.max(...vals):null;
  }
  function pastInfo(r){
    const match=pastMatch(r);
    if(!match)return historic.length?'歷史檔未找到唯一匹配':'未載入歷史檔';
    const prev=pastValue(match.row);
    if(prev===null)return '歷史數字無法解析';
    return `${match.kind}：歷史最高 ${prev} 星，目前此 UID 最高 ${r.high} 星${prev>r.high?'；⚠️ 可能下降，需核對來源與日期':'；未見較高星數'}`;
  }
  function filtered(){
    const cls=$('#classFilter').value,issue=$('#issueFilter').value;
    return audited.filter(r=>(!cls||String(r.className)===cls) && (issue==='all'||(issue==='issues'?r.issues.length>0:r.types.includes(issue))))
      .sort((a,b)=>String(a.className||'').localeCompare(String(b.className||''))||Number(a.seatNo)-Number(b.seatNo));
  }
  function render(){
    const key=r=>seatKey(r);
    $('#mRecords').textContent=records.length;
    $('#mStudents').textContent=new Set(audited.map(key)).size;
    $('#mIssues').textContent=new Set(audited.filter(r=>r.issues.length).map(key)).size;
    $('#mStarMismatch').textContent=new Set(audited.filter(r=>r.types.includes('stars')).map(key)).size;
    $('#rows').innerHTML=filtered().map(r=>`<tr>
      <td>${esc(r.className)}</td><td>${esc(r.seatNo)}</td><td>${esc(r.name)}</td>
      <td class="code" title="每個 UID 分開顯示">…${esc(String(r.id).slice(-6))}</td>
      <td><b>★ ${n(r.stars)}/30</b></td><td><b>★ ${r.best}/30</b><span class="status">（同座可讀資料）</span></td>
      <td class="issueList">${r.sources.map(s=>`<span class="reason">${esc(s.name)}：${s.value} 星${s.levels===null?'':`／${s.levels} 關有紀錄`}</span>`).join('')||'—'}</td>
      <td class="issueList">${r.issues.length?r.issues.map(t=>`<span class="reason"><span class="badge warn">待查</span> ${esc(t)}</span>`).join(''):'<span class="badge ok">目前各來源一致；不代表歷史上未掉星</span>'}</td>
      <td>${esc(stamp(r.updatedAt)||'—')}</td>
      <td class="issueList"><span class="reason">${esc(pastInfo(r))}</span><button class="soft" type="button" data-detail="${esc(r.id)}">核對此 UID</button></td>
    </tr>`).join('');
    $('#rows').querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>showDetail(b.dataset.detail)));
  }
  const saveFile=(text,name,mime)=>{
    const blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  };
  const safeValue=v=>{
    if(v==null)return v;
    if(Array.isArray(v))return v.map(safeValue);
    if(typeof v==='object'){
      if(typeof v.toDate==='function')return v.toDate().toISOString();
      const res={};for(const [k,val] of Object.entries(v))res[k]=safeValue(val);return res;
    }
    return v;
  };
  function backupRecord(r){
    return safeValue({uid:r.id,className:r.className,seatNo:r.seatNo,name:r.name,stars:r.stars,progress:r.progress,modules:r.modules,courseProgress:r.courseProgress,updatedAt:r.updatedAt});
  }
  function showDetail(id){
    const r=audited.find(x=>x.id===id);if(!r)return;
    const same=audited.filter(x=>seatKey(x)===seatKey(r));
    const nameConflict=new Set(same.map(x=>String(x.name||'').trim())).size>1;
    const other=same.filter(x=>x.id!==r.id);
    const el=$('#detailBody');
    el.innerHTML=`<p><b>${esc(r.className)} 班 ${esc(r.seatNo)} 號 ${esc(r.name)}</b>；UID：<span class="code">${esc(r.id)}</span></p>
      <p>目前 UID：${r.high} 星；同班同座可讀最高：${r.best} 星。<b>${nameConflict?'⚠️ 同座姓名不同，嚴禁直接合併':'同座號不等於相同帳號，請先核對身分'}</b></p>
      <p><b>歷史對照：</b>${esc(pastInfo(r))}</p>
      <p><b>不同 UID：</b>${other.length?other.map(x=>`<span class="badge warn">…${esc(x.id.slice(-6))}｜${esc(x.name)}｜${x.high} 星</span>`).join(''):'無'}</p>
      <p><b>目前可讀來源：</b>${r.sources.map(s=>`<span class="badge">${esc(s.name)}：${s.value} 星</span>`).join('')||'無'}</p>
      <p class="note">恢復檢查：① 對照姓名與身分 ② 確認較高的逐關原始資料 ③ 先下載此 UID 進度備份 ④ 保留兩個 UID 原始文件。僅有總星數或截圖，不能證明 P1～P10 的逐關完成狀態；本頁不會自動寫入成績。</p>
      <button type="button" class="primary" id="saveRecordBtn">下載此 UID 原始進度 JSON</button>`;
    $('#saveRecordBtn').onclick=()=>saveFile(JSON.stringify({source:'116course-v16.63',savedAt:new Date().toISOString(),record:backupRecord(r)},null,2),`116course_進度備份_${String(r.className)}_${String(r.seatNo)}_${r.id.slice(-6)}.json`,'application/json;charset=utf-8');
    $('#detailPanel').classList.remove('hidden');$('#detailPanel').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function exportSnapshot(){
    const payload={source:'116course-v16.63',savedAt:new Date().toISOString(),warning:'Contains personal student learning records. Keep private. Read-only backup; cannot restore directly.',records:records.map(backupRecord)};
    saveFile(JSON.stringify(payload,null,2),'116course_原始進度備份_'+new Date().toISOString().slice(0,10)+'.json','application/json;charset=utf-8');
  }
  function parseCSV(s){
    s=s.replace(/^\uFEFF/,'');
    let data=[],row=[],cell='',quoted=false;
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(c==='"'){
        if(quoted&&s[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
      }else if(c===','&&!quoted){row.push(cell);cell='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(cell);cell='';if(row.some(x=>x!==''))data.push(row);row=[];}
      else cell+=c;
    }
    if(quoted)throw Error('CSV 引號不完整');
    if(cell||row.length){row.push(cell);data.push(row);}
    const headers=data.shift()||[];
    if(!['班級','座號','姓名','UID'].every(x=>headers.includes(x)))throw Error('不符合 v16.61 稽核 CSV 欄位');
    return data.map(c=>Object.fromEntries(headers.map((k,i)=>[k,c[i]||''])));
  }
  async function loadHistory(file){
    if(!file){historic=[];$('#historyStatus').textContent='尚未載入歷史檔';$('#exportComparisonBtn').disabled=true;render();return;}
    try{
      if(file.size>5_000_000)throw Error('CSV 太大，超過 5 MB');
      historic=parseCSV(await file.text());
      $('#historyStatus').textContent=`已在本機載入 ${historic.length} 筆資料：${file.name}。請確認這份檔案日期確實早於現在。`;
      $('#exportComparisonBtn').disabled=false;render();
    }catch(e){historic=[];$('#historyStatus').textContent='讀取失敗：'+e.message;$('#exportComparisonBtn').disabled=true;render();}
  }
  function exportComparison(){
    const head=['班級','座號','姓名','UID','目前此UID最高星','歷史可讀最高星','匹配方式','待核對說明'];
    const rows=filtered().map(r=>{const m=pastMatch(r);return [r.className,r.seatNo,r.name,r.id,r.high,m?pastValue(m.row):'',m?.kind||'',pastInfo(r)];});
    const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    saveFile('\ufeff'+[head,...rows].map(a=>a.map(q).join(',')).join('\r\n'),'116course_歷史對照_'+new Date().toISOString().slice(0,10)+'.csv','text/csv;charset=utf-8');
  }
  function export910Alias(){
    const group=audited.filter(r=>String(r.className)==='910' && [30,36].includes(Number(r.seatNo)));
    if(!group.length){alert('目前授權範圍內找不到 910 班 30／36 號雲端紀錄');return;}
    const numeric=(x)=>{const n=Number(x);return Number.isFinite(n)?Math.max(0,Math.min(3,n)):0;};
    function levels(r){
      const result={};
      const paths=[r.progress,r.modules?.python?.progress,r.progress?._mods?.python?.progress,
       r.modules?.python?.levels,r.progress?._mods?.python?.levels,r.courseProgress?.['11601']?.modules?.python?.levels];
      for(let i=1;i<=10;i++){
        const k='p'+i;result[k]=0;
        for(const p of paths){if(!p||typeof p!=='object')continue;
          const v=p[k]??p[k.toUpperCase()];if(v===undefined)continue;
          result[k]=Math.max(result[k],numeric(v&&typeof v==='object'?v.stars:v));
        }
      }return result;
    }
    const teacherConfirmedName=''; // 教師需在下載後人工確認，不在程式內認定相同學生
    const aliases=group.map(r=>({uid:r.id,className:r.className,seatNo:r.seatNo,name:r.name,stars:r.stars,perLevel:levels(r),updatedAt:safeValue(r.updatedAt),sources:r.sources,raw:backupRecord(r)}));
    const names=[...new Set(group.map(r=>String(r.name||'').trim()))];
    const matching=(name)=>aliases.filter(x=>x.name===name);
    const candidates=names.map(name=>{
      const same=matching(name);const perLevel={};
      for(let i=1;i<=10;i++){const k='p'+i;perLevel[k]=Math.max(0,...same.map(x=>x.perLevel[k]||0));}
      return {name,uidCount:same.length,perLevel,candidateTotal:Object.values(perLevel).reduce((a,b)=>a+b,0),note:'候選逐關最高成績；不同 UID 不自動合併，不能證明全部原始進度仍存在'};
    });
    saveFile(JSON.stringify({source:'116course-v16.63',savedAt:new Date().toISOString(),warning:'唯讀核對檔，含學生個資，不可公開上傳或直接匯入資料庫',userStatement:'910 班 30 號曾暫用 36 號，須教師確認目前使用 UID',aliases,candidates},null,2),
      '116course_910班30與36號_唯讀核對_'+new Date().toISOString().slice(0,10)+'.json','application/json;charset=utf-8');
  }

  // v16.64 受控恢復：只對 910/30 的本人記錄寫入已確認的逐關最高星數。
  // 不變更 Firebase Auth、不處理跨姓名記錄、不刪除任何歷史文件。
  const max3=v=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(3,Math.floor(n))):0;};
  function pythonFromRecord(r){
    const roots=[r.progress,r.modules?.python?.progress,r.progress?._mods?.python?.progress,
      r.modules?.python?.levels,r.progress?._mods?.python?.levels,r.courseProgress?.['11601']?.modules?.python?.levels];
    const obj={};
    for(let i=1;i<=10;i++){
      const k='p'+i;let v=0;
      for(const x of roots){if(!x||typeof x!=='object')continue;
        const a=x[k]??x[k.toUpperCase()];if(a===undefined)continue;
        v=Math.max(v,max3(a&&typeof a==='object'?a.stars:a));
      }obj[k]=v;
    }return obj;
  }
  const digitalKeys=['x1','u1','x2','u2','x3','u3','x4','u4'];
  function digitalFromRecord(r){
    const roots=[r.modules?.digital?.levels,r.progress?._mods?.digital?.levels,
      r.courseProgress?.['11601']?.modules?.digital?.levels];
    const out={};
    for(const key of digitalKeys){
      for(const root of roots){const v=root?.[key];if(!v||typeof v!=='object')continue;
        const prev=out[key];if(!prev || max3(v.stars)>max3(prev.stars))out[key]=v;
      }
    }return out;
  }
  function mergeDigitalSources(live){
    const out={};for(const key of digitalKeys){
      const options=live.map(r=>digitalFromRecord(r)[key]).filter(Boolean);
      if(!options.length)continue;
      const best=Math.max(...options.map(v=>max3(v.stars)));
      const most=options.find(v=>max3(v.stars)===best);
      const tasks={};let tries=0,done=false,score=0;
      for(const ob of options){tries=Math.max(tries,Number(ob.tries)||0);done=done||ob.done===true;score=Math.max(score,Number(ob.score)||0);
        for(const [task,flag] of Object.entries(ob.extra?.tasks||{}))if(flag)tasks[task]=flag;
      }
      out[key]={...most,stars:best,tries,done,...(score||most.score?{score:score||most.score}:{}),...(Object.keys(tasks).length?{extra:{...(most.extra||{}),tasks}}:{})};
    }return out;
  }
  const sameName=(a,b)=>String(a||'').normalize('NFC').trim()===String(b||'').normalize('NFC').trim();
  const canRestore910=()=>isAdmin()||(teacherProfile?.role==='teacher'&&classes()?.includes('910'));
  function restoreCandidates(){
    const all=records.filter(r=>String(r.className)==='910' && [30,36].includes(Number(r.seatNo)));
    const verifiedName=String($('#restore910Name')?.value||'').trim();
    const targets=verifiedName?all.filter(r=>Number(r.seatNo)===30 && sameName(r.name,verifiedName)):[];
    const sources=verifiedName?all.filter(r=>sameName(r.name,verifiedName)):[];
    const levels={};for(let i=1;i<=10;i++)levels['p'+i]=Math.max(0,...sources.map(r=>pythonFromRecord(r)['p'+i]));
    const digital=mergeDigitalSources(sources);return {all,targets,sources,levels,total:Object.values(levels).reduce((a,b)=>a+b,0),digital,digitalTotal:Object.values(digital).reduce((n,v)=>n+max3(v.stars),0)};
  }
  function refresh910(){
    const box=$('#restore910Panel');if(!box)return;
    box.classList.toggle('hidden',!(canRestore910()&&records.some(r=>String(r.className)==='910')));
    if(!canRestore910())return;
    const x=restoreCandidates(),picker=$('#restore910Target'),old=picker.value;
    picker.innerHTML='<option value="">請選擇已確認可登入的 30 號 UID</option>'+x.targets.map(r=>`<option value="${esc(r.id)}">…${esc(r.id.slice(-6))}｜現有 ${pythonTotal(r)} 星｜更新 ${esc(stamp(r.updatedAt)||'未知')}</option>`).join('');
    if(x.targets.some(r=>r.id===old))picker.value=old;
    const verifiedName=String($('#restore910Name').value||'').trim();const min=x.all.filter(r=>verifiedName&&!sameName(r.name,verifiedName));
    $('#restore910Preview').innerHTML=`<p><b>同姓名來源：${x.sources.length} 筆 UID｜Python 候選 ${x.total}/30 星；數位時代 ${x.digitalTotal}/24 星</b>（P1～P10 逐關最高，不將總星直接相加）</p>
    <p>${Object.entries(x.levels).map(([k,v])=>`<span class="badge">${esc(k.toUpperCase())}: ★${v}</span>`).join('')}</p>
    <p>30 號候選正式 UID：${x.targets.length} 筆；排除姓名不符記錄：${min.length} 筆。<b>必須由授權教師確認哪個 UID 真的可登入。</b></p>`;
    validateRestore();
  }
  const pythonTotal=r=>Object.values(pythonFromRecord(r)).reduce((a,b)=>a+b,0);
  function validateRestore(){
    const x=restoreCandidates();
    $('#restore910Apply').disabled=!(canRestore910()&&x.targets.some(r=>r.id===$('#restore910Target').value)&&x.sources.some(r=>Number(r.seatNo)===36)
      &&$('#restore910Identity').checked&&$('#restore910Backup').checked
      &&$('#restore910Confirm').value.trim()==='910-30');
  }
  function download910Backup(){
    const x=restoreCandidates();if(!x.all.length)return alert('無可讀的 910 班 30／36 號資料');
    saveFile(JSON.stringify({source:'116course-v16.64-before-recovery',savedAt:new Date().toISOString(),
      caution:'含學生個資；保留所有 UID 原始記錄，不能直接匯入覆蓋',records:x.all.map(backupRecord)},null,2),
      '116course_910_30_36_恢復前完整備份_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json','application/json;charset=utf-8');
  }
  function download910Proposal(){
    const x=restoreCandidates();saveFile(JSON.stringify({source:'116course-v16.64-proposal',savedAt:new Date().toISOString(),
      status:'待教師確認正式 UID；尚未變更任何 Firebase 文件',sourceUIDs:x.sources.map(r=>r.id),
      targetUID:$('#restore910Target').value||null,proposedLevels:x.levels,total:x.total,digitalLevels:x.digital,digitalTotal:x.digitalTotal,
      excludedUIDs:x.all.filter(r=>!sameName(r.name,$('#restore910Name').value)).map(r=>r.id)},null,2),
      '116course_910_30_36_Python與數位時代候選恢復方案.json','application/json;charset=utf-8');
  }
  async function apply910Restore(){
    validateRestore();if($('#restore910Apply').disabled)return;
    const uid=$('#restore910Target').value;
    const preview=restoreCandidates();const current=preview.targets.find(r=>r.id===uid);
    if(!current||!confirm(`僅對 910 班 30 號 UID …${uid.slice(-6)} 恢復星數（不刪除舊 UID）。\n你已確認此 UID 是要保留的 30 號正式帳號，且已備份嗎？`))return;
    const status=$('#restore910Status');status.textContent='正在重新驗證雲端 UID 與逐關成績…';
    $('#restore910Apply').disabled=true;
    try{
      // 交易中讀取所有來源與目標，避免操作時 UI 的舊資料覆蓋新資料。
      // Firestore transaction 必須先完成全部 get，再進行 update。
      const ids=[...new Set([...preview.sources.map(r=>r.id),uid])];
      const refs=ids.map(id=>mods.fs.doc(db,'students',id));
      const result=await mods.fs.runTransaction(db,async tx=>{
        const snaps=[];for(const ref of refs)snaps.push(await tx.get(ref));
        if(snaps.some(s=>!s.exists()))throw Error('有來源 UID 在核對後消失，請重新檢查');
        const live=snaps.map((s,i)=>({id:ids[i],...s.data()}));
        if(live.some(r=>String(r.className)!=='910'|| ![30,36].includes(Number(r.seatNo))||!sameName(r.name,$('#restore910Name').value)))
          throw Error('UID 身分／班級／姓名發生變動，已停止寫入');
        const target=live.find(r=>r.id===uid);
        if(!target||Number(target.seatNo)!==30)throw Error('目標不是 910 班 30 號，禁止寫入');
        const levels={};for(let i=1;i<=10;i++)levels['p'+i]=Math.max(...live.map(r=>pythonFromRecord(r)['p'+i]));
        const total=Object.values(levels).reduce((a,b)=>a+b,0);
        const digital=mergeDigitalSources(live);const digitalTotal=Object.values(digital).reduce((n,v)=>n+max3(v.stars),0);
        // 只更新 Python、數位時代各關較高成績；保留其他單元及原始 metadata。
        const patch={stars:Math.max(n(target.stars),total),'modules.python.stars':Math.max(n(target.modules?.python?.stars),total),
          'progress._mods.python.stars':Math.max(n(target.progress?._mods?.python?.stars),total)};
        for(const [k,v] of Object.entries(levels)){
          patch['progress.'+k]=v;
          patch['modules.python.progress.'+k]=v;
          patch['progress._mods.python.progress.'+k]=v;
          const oldLevel=target.courseProgress?.['11601']?.modules?.python?.levels?.[k.toUpperCase()];
          if(v>max3(oldLevel?.stars))patch['courseProgress.11601.modules.python.levels.'+k.toUpperCase()]={stars:v};
        }
        for(const [k,v] of Object.entries(digital)){
          for(const root of ['modules.digital.levels.','progress._mods.digital.levels.','courseProgress.11601.modules.digital.levels.']){
            const existing=root.startsWith('modules.')?target.modules?.digital?.levels?.[k]:root.startsWith('progress.')?target.progress?._mods?.digital?.levels?.[k]:target.courseProgress?.['11601']?.modules?.digital?.levels?.[k];
            if(max3(v.stars)>max3(existing?.stars))patch[root+k]=v;
          }
        }
        patch['modules.digital.stars']=Math.max(Number(target.modules?.digital?.stars)||0,digitalTotal);
        patch['progress._mods.digital.stars']=Math.max(Number(target.progress?._mods?.digital?.stars)||0,digitalTotal);
        tx.update(mods.fs.doc(db,'students',uid),patch);
        return {total,levels,digitalTotal,targetUID:uid,sourceUIDs:live.map(r=>r.id)};
      });
      status.textContent=`恢復寫入成功：目標 UID …${uid.slice(-6)}，Python ${result.total}/30 星、數位時代 ${result.digitalTotal}/24 星。請以該學生帳號登入確認，並回教師端核對。所有來源 UID 均已保留。`;
      // 在學習資料更新成功後仍保留確認資訊，讓老師可以自行另存備份。
      await load();
    }catch(e){status.textContent='未能完成寫入：'+(e?.message||String(e))+'。任何不確定狀況請重新下載備份並核對，不要重複操作。';}
    finally{validateRestore();}
  }

  function csvExport(){
    const cols=['班級','座號','姓名','UID','當前stars','同班同座最高可讀星','各來源','異常／待查','最近更新'];
    const csv=[cols,...filtered().map(r=>[r.className,r.seatNo,r.name,r.id,n(r.stars),r.best,r.sources.map(s=>`${s.name}:${s.value}`).join(' | '),r.issues.join(' | '),stamp(r.updatedAt)])].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='116course_Python唯讀稽核_'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  async function load(){
    $('#dbStatus').textContent='唯讀查詢中…';
    try{
      let docs=[];
      if(isAdmin()){const snap=await mods.fs.getDocs(mods.fs.collection(db,'students'));docs=snap.docs;}
      else for(const cls of classes()){const snap=await mods.fs.getDocs(mods.fs.query(mods.fs.collection(db,'students'),mods.fs.where('className','==',String(cls))));docs.push(...snap.docs);}
      const seen=new Map();for(const d of docs)seen.set(d.id,{id:d.id,...d.data()});
      records=[...seen.values()].filter(r=>isAdmin()||classes().includes(String(r.className)));
      const previous=$('#classFilter').value;
      const allClasses=isAdmin()?[...new Set(records.map(r=>String(r.className)))].sort():classes();
      $('#classFilter').innerHTML='<option value="">全部授權班級</option>'+allClasses.map(c=>`<option value="${esc(c)}">${esc(c)} 班</option>`).join('');
      if(allClasses.includes(previous))$('#classFilter').value=previous;
      audit();$('#dbStatus').textContent='讀取完成：'+new Date().toLocaleString('zh-TW')+'（唯讀，不修改成績）';
    }catch(e){$('#dbStatus').textContent='讀取失敗：'+(e?.message||String(e));}
  }
  async function show(){
    const user=auth.currentUser;if(!user)return;
    const snap=await mods.fs.getDoc(mods.fs.doc(db,'teachers',user.uid));
    teacherProfile=snap.exists()?snap.data():null;
    if(!teacherProfile||!['admin','teacher'].includes(teacherProfile.role))throw Error('教師權限不足');
    $('#teacherIdentity').textContent=teacherProfile.displayName||'教師';
    $('#loginCard').classList.add('hidden');$('#dashboard').classList.remove('hidden');await load();
  }
  async function boot(){
    try{
      const [appMod,authMod,fsMod]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')]);
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
      auth=authMod.getAuth(app);db=fsMod.getFirestore(app);mods={auth:authMod,fs:fsMod};
      $('#refreshBtn').onclick=load;$('#classFilter').onchange=render;$('#issueFilter').onchange=render;$('#exportAuditBtn').onclick=csvExport;$('#exportSnapshotBtn').onclick=exportSnapshot;$('#export910AliasBtn').onclick=export910Alias;$('#plan910Btn').onclick=refresh910;$('#backup910Btn').onclick=download910Backup;$('#proposal910Btn').onclick=download910Proposal;$('#restore910Apply').onclick=apply910Restore;['restore910Name','restore910Target','restore910Identity','restore910Backup','restore910Confirm'].forEach(id=>{$('#'+id).addEventListener('change',validateRestore);$('#'+id).addEventListener('input',id==='restore910Name'?refresh910:validateRestore);});$('#historyFile').onchange=e=>loadHistory(e.target.files[0]);$('#exportComparisonBtn').onclick=exportComparison;$('#closeDetail').onclick=()=>$('#detailPanel').classList.add('hidden');
      const login=async()=>{try{await authMod.signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#password').value);await show();}catch(e){$('#loginError').textContent=e?.message||String(e);}};
      $('#loginBtn').onclick=login;$('#password').onkeydown=e=>{if(e.key==='Enter')login();};
      if(auth.currentUser)await show();
    }catch(e){$('#loginError').textContent=e?.message||'Firebase 載入失敗';}
  }
  boot();
})();
