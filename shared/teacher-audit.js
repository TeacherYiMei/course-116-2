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
      if(!sources.length){issues.push('未找到可判讀的 Python 星數欄位（可能尚未同步或使用其他資料路徑）');types.push('history');}
      return {...r,sources,high,best,issues,types:[...new Set(types)],duplicates:group.length};
    });
    render();
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
    $('#saveRecordBtn').onclick=()=>saveFile(JSON.stringify({source:'116course-v16.62',savedAt:new Date().toISOString(),record:backupRecord(r)},null,2),`116course_進度備份_${String(r.className)}_${String(r.seatNo)}_${r.id.slice(-6)}.json`,'application/json;charset=utf-8');
    $('#detailPanel').classList.remove('hidden');$('#detailPanel').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function exportSnapshot(){
    const payload={source:'116course-v16.62',savedAt:new Date().toISOString(),warning:'Contains personal student learning records. Keep private. Read-only backup; cannot restore directly.',records:records.map(backupRecord)};
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
      $('#refreshBtn').onclick=load;$('#classFilter').onchange=render;$('#issueFilter').onchange=render;$('#exportAuditBtn').onclick=csvExport;$('#exportSnapshotBtn').onclick=exportSnapshot;$('#historyFile').onchange=e=>loadHistory(e.target.files[0]);$('#exportComparisonBtn').onclick=exportComparison;$('#closeDetail').onclick=()=>$('#detailPanel').classList.add('hidden');
      const login=async()=>{try{await authMod.signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#password').value);await show();}catch(e){$('#loginError').textContent=e?.message||String(e);}};
      $('#loginBtn').onclick=login;$('#password').onkeydown=e=>{if(e.key==='Enter')login();};
      if(auth.currentUser)await show();
    }catch(e){$('#loginError').textContent=e?.message||'Firebase 載入失敗';}
  }
  boot();
})();
