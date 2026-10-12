(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods,teacherProfile=null,records=[],audited=[];
  const $=s=>document.querySelector(s);

  const NEEDS={p1:2,p2:3,p3:3,p4:2,p5:3,p6:2,p7:2,p8:3,p9:3,p10:3};
  const TOTAL=26;

  function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  function fmtTime(v){try{return v&&typeof v.toDate==="function"?v.toDate().toLocaleString("zh-TW"):""}catch(e){return ""}}
  function isAdmin(){return teacherProfile?.role==="admin"}
  function allowedClasses(){return isAdmin()?null:(teacherProfile?.classes||[]).map(String).filter(Boolean).sort()}
  function teachesClass(c){return isAdmin() || (allowedClasses()||[]).includes(String(c))}

  function clampProgress(progress){
    const out={};
    for(const [id,max] of Object.entries(NEEDS)){
      const raw=Number(progress?.[id]||0);
      out[id]=Math.max(0,Math.min(max,Number.isFinite(raw)?raw:0));
    }
    return out;
  }

  function sumProgress(p){return Object.values(clampProgress(p)).reduce((a,b)=>a+b,0)}

  function expectedPosition(progress){
    const p=clampProgress(progress);
    for(let i=1;i<=10;i++){
      const id=`p${i}`,max=NEEDS[id],done=p[id];
      if(done<max){
        return {station:i,challenge:done+1,done:false};
      }
    }
    return {station:10,challenge:3,done:true};
  }

  function hasGap(progress){
    const p=clampProgress(progress);
    let seenIncomplete=false;
    for(let i=1;i<=10;i++){
      const id=`p${i}`;
      if(p[id]<NEEDS[id]) seenIncomplete=true;
      else if(seenIncomplete && p[id]>0) return true;
      if(seenIncomplete && p[id]>0 && p[id]<NEEDS[id] && i>1) return true;
    }
    // More direct: once an earlier station is not fully complete, all later progress must be 0.
    for(let i=1;i<=10;i++){
      const id=`p${i}`;
      if(p[id]<NEEDS[id]){
        for(let j=i+1;j<=10;j++) if(p[`p${j}`]>0) return true;
        break;
      }
    }
    return false;
  }

  function rawOutOfRange(progress){
    const bad=[];
    for(const [id,max] of Object.entries(NEEDS)){
      const v=Number(progress?.[id]||0);
      if(!Number.isFinite(v) || v<0 || v>max) bad.push(`${id.toUpperCase()}=${progress?.[id]}`);
    }
    return bad;
  }

  function stationMatches(text,n,done){
    const s=String(text||"");
    if(done) return s.includes("完成");
    return s.includes(`第 ${n} 關`) || s.includes(`第${n}關`) || s.toLowerCase()===`p${n}`;
  }

  function auditRecord(r,duplicateCount){
    const expectedStars=sumProgress(r.progress);
    const expectedScore=Math.round(expectedStars/TOTAL*100);
    const pos=expectedPosition(r.progress);
    const issues=[];
    const types=new Set();

    const badRaw=rawOutOfRange(r.progress);
    if(badRaw.length){
      issues.push(`關卡完成數超出合理範圍：${badRaw.join("、")}`);
      types.add("progress");
    }

    if(Number(r.totalStars||TOTAL)!==TOTAL){
      issues.push(`totalStars=${Number(r.totalStars||0)}，正常應為 ${TOTAL}`);
      types.add("stars");
    }

    if(Number(r.stars||0)!==expectedStars){
      issues.push(`星星不符：資料庫 ${Number(r.stars||0)}，依關卡應為 ${expectedStars}`);
      types.add("stars");
    }

    if(Number(r.score||0)!==expectedScore){
      issues.push(`評分不符：資料庫 ${Number(r.score||0)}，依關卡應為 ${expectedScore}`);
      types.add("score");
    }

    if(!!r.completed !== (expectedStars===TOTAL)){
      issues.push(`完成狀態不符：${r.completed?"標示已完成":"標示未完成"}，依關卡應為 ${expectedStars===TOTAL?"已完成":"未完成"}`);
      types.add("completed");
    }

    if(hasGap(r.progress)){
      issues.push("疑似跳關：前面關卡尚未完成，但後面關卡已有完成紀錄");
      types.add("gap");
    }

    if(!stationMatches(r.currentStation,pos.station,pos.done)){
      issues.push(`目前關卡不符：顯示「${String(r.currentStation||"空白")}」，依紀錄應在 ${pos.done?"全部完成":`P${pos.station}`}`);
      types.add("position");
    }

    if(!pos.done && Number(r.currentChallenge||0)!==pos.challenge){
      issues.push(`目前挑戰不符：顯示第 ${Number(r.currentChallenge||0)} 題，依紀錄應為第 ${pos.challenge} 題`);
      types.add("position");
    }

    if(duplicateCount>1){
      issues.push(`同班同座號有 ${duplicateCount} 筆原始紀錄`);
      types.add("duplicate");
    }

    return {
      ...r,
      expectedStars,expectedScore,pos,issues,types:[...types],duplicateCount
    };
  }

  function runAudit(){
    const counts=new Map();
    for(const r of records){
      const key=`${String(r.className||"").trim()}::${String(r.seatNo||"").trim()}`;
      counts.set(key,(counts.get(key)||0)+1);
    }
    audited=records.map(r=>{
      const key=`${String(r.className||"").trim()}::${String(r.seatNo||"").trim()}`;
      return auditRecord(r,counts.get(key)||1);
    });
    render();
  }

  function filtered(){
    const cls=$("#classFilter").value;
    const issue=$("#issueFilter").value;
    return audited.filter(r=>{
      if(cls && String(r.className)!==cls) return false;
      if(issue==="all") return true;
      if(issue==="issues") return r.issues.length>0;
      return r.types.includes(issue);
    }).sort((a,b)=>
      String(a.className||"").localeCompare(String(b.className||""),"zh-Hant") ||
      Number(a.seatNo||999)-Number(b.seatNo||999) ||
      Number(b.issues.length)-Number(a.issues.length)
    );
  }

  function render(){
    const rows=filtered();
    const uniqueAll=new Set(audited.map(r=>`${r.className}::${r.seatNo}`));
    const uniqueIssues=new Set(audited.filter(r=>r.issues.length).map(r=>`${r.className}::${r.seatNo}`));
    const starIssues=new Set(audited.filter(r=>r.types.includes("stars")).map(r=>`${r.className}::${r.seatNo}`));
    $("#mRecords").textContent=records.length;
    $("#mStudents").textContent=uniqueAll.size;
    $("#mIssues").textContent=uniqueIssues.size;
    $("#mStarMismatch").textContent=starIssues.size;

    $("#rows").innerHTML=rows.map(r=>`
      <tr>
        <td>${esc(r.className)}</td>
        <td>${esc(r.seatNo)}</td>
        <td>${esc(r.name)}</td>
        <td>⭐ ${Number(r.stars||0)}/${Number(r.totalStars||TOTAL)}</td>
        <td><b>⭐ ${r.expectedStars}/${TOTAL}</b></td>
        <td>${Number(r.score||0)} <span class="status">（應 ${r.expectedScore}）</span></td>
        <td>${esc(r.currentStation||"—")}${r.currentChallenge?`・第 ${esc(r.currentChallenge)} 題`:""}</td>
        <td class="issueList">
          ${r.issues.length
            ? r.issues.map(x=>`<span class="reason"><span class="badge bad">異常</span> ${esc(x)}</span>`).join("")
            : '<span class="badge ok">一致</span>'}
        </td>
        <td>${esc(fmtTime(r.updatedAt)||"—")}</td>
      </tr>
    `).join("");
  }

  async function initFirebase(){
    const appMod=await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js");
    const authMod=await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js");
    const fsMod=await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
    auth=authMod.getAuth(app);db=fsMod.getFirestore(app);mods={auth:authMod,fs:fsMod};
    await authMod.setPersistence(auth,authMod.browserLocalPersistence);
  }

  async function readTeacher(){
    const u=auth.currentUser;if(!u)return null;
    const snap=await mods.fs.getDoc(mods.fs.doc(db,"teachers",u.uid));
    return snap.exists()?snap.data():null;
  }

  function fillClasses(){
    const sel=$("#classFilter");
    const classes=isAdmin()
      ? [...new Set(records.map(r=>String(r.className||"")).filter(Boolean))].sort()
      : allowedClasses();
    sel.innerHTML='<option value="">全部授權班級</option>'+
      classes.map(c=>`<option value="${esc(c)}">${esc(c)} 班</option>`).join("");
  }

  async function loadRecords(){
    $("#dbStatus").textContent="正在讀取學生資料…";
    const {collection,query,where,getDocs}=mods.fs;
    let docs=[];
    if(isAdmin()){
      const snap=await getDocs(collection(db,"students"));docs=snap.docs;
    }else{
      for(const cls of allowedClasses()){
        const q=query(collection(db,"students"),where("className","==",String(cls)));
        const snap=await getDocs(q);docs.push(...snap.docs);
      }
    }
    records=docs.map(d=>({id:d.id,...d.data()})).filter(r=>teachesClass(r.className));
    fillClasses();runAudit();
    $("#dbStatus").textContent=`檢查完成：${new Date().toLocaleString("zh-TW")}`;
  }

  async function showDashboard(){
    teacherProfile=await readTeacher();
    if(!teacherProfile || !["teacher","admin"].includes(teacherProfile.role)){
      throw new Error("這個帳號沒有教師權限。");
    }
    $("#teacherIdentity").textContent=teacherProfile.displayName||"教師";
    $("#loginCard").classList.add("hidden");$("#dashboard").classList.remove("hidden");
    await loadRecords();
  }

  async function login(){
    $("#loginError").textContent="";
    try{
      await mods.auth.signInWithEmailAndPassword(auth,$("#email").value.trim(),$("#password").value);
      await showDashboard();
    }catch(e){
      $("#loginError").textContent=e?.message||"登入失敗";
    }
  }

  async function boot(){
    await initFirebase();
    $("#loginBtn").onclick=login;
    $("#password").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
    $("#refreshBtn").onclick=loadRecords;
    $("#classFilter").onchange=render;
    $("#issueFilter").onchange=render;
    if(auth.currentUser){
      try{await showDashboard()}catch(e){}
    }
  }

  boot();
})();