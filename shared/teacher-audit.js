(function(){
  'use strict';
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods,teacherProfile=null,records=[],audited=[];
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>{const x=Number(v);return Number.isFinite(x)?Math.max(0,Math.min(30,x)):0;};
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
    </tr>`).join('');
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
      $('#refreshBtn').onclick=load;$('#classFilter').onchange=render;$('#issueFilter').onchange=render;$('#exportAuditBtn').onclick=csvExport;
      const login=async()=>{try{await authMod.signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#password').value);await show();}catch(e){$('#loginError').textContent=e?.message||String(e);}};
      $('#loginBtn').onclick=login;$('#password').onkeydown=e=>{if(e.key==='Enter')login();};
      if(auth.currentUser)await show();
    }catch(e){$('#loginError').textContent=e?.message||'Firebase 載入失敗';}
  }
  boot();
})();
