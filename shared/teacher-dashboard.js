(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let manageRow=null;
  let currentAccountRecord=null;
  let currentUnit="unit1"; 
  const $=s=>document.querySelector(s);

  const UNIT_CONFIG = {
    unit1:  { id: "unit1", name: "單元一｜數位時代", maxStars: 24 },
    python: { id: "python", name: "單元二｜Python", maxStars: 30 },
    unit3:  { id: "unit3", name: "單元三｜系統平臺", maxStars: 24 },
    aiot:   { id: "aiot", name: "5016B 專題", maxStars: 15 }
  };

  const configured=()=>!!(cfg.enabled && cfg.apiKey && !String(cfg.apiKey).startsWith("PASTE_"));
  function esc(x){ return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
  function fmtTime(v){ try{ return v&&typeof v.toDate==="function" ? v.toDate().toLocaleString("zh-TW") : ""; }catch(e){return ""} }
  function seatSort(a,b){ return Number(a.seatNo||999)-Number(b.seatNo||999) || String(a.name||"").localeCompare(String(b.name||""),"zh-Hant"); }
  function progressSum(progress){ 
    if (!progress) return 0;
    let sum = 0;
    for (let k in progress) {
      if (k.startsWith('_')) continue;
      let val = Number(progress[k]);
      if (!isNaN(val)) sum += val;
    }
    return sum;
  }

  function mergeDuplicateStudents(rows){
    const groups=new Map();
    for(const row of rows){
      const key=`${String(row.className||"").trim()}::${String(row.seatNo||"").trim()}`;
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.values()].map(group=>{
      group.sort((a,b)=> (b.lastSync ? new Date(b.lastSync).getTime() : 0) - (a.lastSync ? new Date(a.lastSync).getTime() : 0) || Number(b.stars||0)-Number(a.stars||0));
      const best={...group[0]};
      best.duplicateCount=group.length;
      best.sourceRecords=group.map(r=>({
        id:r.id, className:String(r.className||""), seatNo:String(r.seatNo||""), name:String(r.name||""),
        stars:Number(r.stars||0), progress:r.progress||{}, modules:r.modules||{}, 
        unit1Stars:r.unit1Stars||0, unit3Stars:r.unit3Stars||0, aiotStars:r.aiotStars||0,
        lastSync:r.lastSync||null, updatedAt:r.updatedAt||null
      }));
      if(group.length>1){
        const merged={};
        for(const r of group) {
          for(const [k,v] of Object.entries(r.progress||{})){ 
            if(k.startsWith('_')) { merged[k] = Math.max(Number(merged[k]||0), Number(v||0)||0); }
            else { merged[k]=Math.max(Number(merged[k]||0), Number(v||0)||0); }
          }
        }
        best.progress=merged;
        best.unit1Stars = Math.max(...group.map(r=>Number(r.unit1Stars||(r.progress&&r.progress._u1)||0)||0));
        best.unit3Stars = Math.max(...group.map(r=>Number(r.unit3Stars||(r.progress&&r.progress._u3)||0)||0));
        best.aiotStars = Math.max(...group.map(r=>Number(r.aiotStars||(r.progress&&r.progress._aiot)||0)||0));
        best.stars = Math.max(...group.map(r=>Number(r.stars||progressSum(r.progress)||0)||0));
      }
      return best;
    });
  }

  function isAdmin(){ return teacherProfile?.role==="admin"; }
  function allowedClasses(){ return isAdmin() ? null : Array.isArray(teacherProfile?.classes) ? teacherProfile.classes.map(String).filter(Boolean).sort() : []; }
  function canManageClass(className){ return isAdmin() || allowedClasses().includes(String(className)); }
  function filtered(){ const cls=$("#classFilter").value; return currentRows.filter(r=>!cls || String(r.className)===cls).sort(seatSort); }

  function getStudentUnitData(r, unitKey){
    const cfg = UNIT_CONFIG[unitKey];
    const modsData = r.modules || (r.progress && r.progress._mods) || {};
    
    let stars = 0;
    let details = "尚未有關卡紀錄";
    
    if (unitKey === "python") {
      stars = Number(modsData.python?.stars ?? r.stars ?? progressSum(r.progress) ?? 0);
      details = r.progress && Object.keys(r.progress).length > 0 ? "已進行 Python 挑戰" : "尚未開始";
    } else {
      if (unitKey === "unit1") {
        stars = Number(r.unit1Stars || (r.progress && r.progress._u1) || modsData.digital?.stars || modsData.unit1?.stars || 0);
        const lvs = modsData.digital?.levels || modsData.unit1?.levels || {};
        if (Object.keys(lvs).length > 0) details = Object.entries(lvs).map(([k,v])=>`${k}:${v.stars||0}★`).join(', ');
      }
      else if (unitKey === "unit3") {
        stars = Number(r.unit3Stars || (r.progress && r.progress._u3) || modsData.platform?.stars || modsData.unit3?.stars || 0);
        const lvs = modsData.platform?.levels || modsData.unit3?.levels || {};
        if (Object.keys(lvs).length > 0) details = Object.entries(lvs).map(([k,v])=>`${k}:${v.stars||0}★`).join(', ');
      }
      else if (unitKey === "aiot") {
        stars = Number(r.aiotStars || (r.progress && r.progress._aiot) || modsData.arduino?.stars || modsData.aiot?.stars || 0);
        const lvs = modsData.arduino?.levels || modsData.aiot?.levels || {};
        if (Object.keys(lvs).length > 0) details = Object.entries(lvs).map(([k,v])=>`${k}:${v.stars||0}★`).join(', ');
      }
    }
    
    if(isNaN(stars)) stars = 0;
    const score = Math.min(100, Math.round((stars / cfg.maxStars) * 100));
    
    return { stars, maxStars: cfg.maxStars, score, details };
  }

  function setupTabs() {
    const wrap = $("#app") || document.body;
    let tabHtml = `<div class="tabs-container" style="margin-bottom:20px; border-bottom:1px solid #e2e8f0; display:flex; gap:10px;">`;
    for(let k in UNIT_CONFIG) {
       tabHtml += `<button class="unit-tab-btn" data-unit="${k}" style="padding:10px 20px; border:none; border-bottom:3px solid transparent; background:none; font-weight:bold; cursor:pointer; color:#64748b;">${UNIT_CONFIG[k].name}</button>`;
    }
    tabHtml += `</div>`;
    
    let headerDiv = $("#unitHeaderInfo");
    if (!headerDiv) {
       headerDiv = document.createElement("div");
       headerDiv.id = "unitHeaderInfo";
       // Insert before tableWrap
       const tableWrap = document.querySelector(".tableWrap");
       if (tableWrap) tableWrap.parentNode.insertBefore(headerDiv, tableWrap);
    }
    
    if (!document.querySelector(".tabs-container")) {
       headerDiv.innerHTML = tabHtml + `<div id="unitStats" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#f8fafc; border-radius:12px; margin-bottom:20px;"></div>`;
       
       document.querySelectorAll(".unit-tab-btn").forEach(btn => {
           btn.addEventListener("click", (e) => {
               currentUnit = e.target.dataset.unit;
               render();
           });
       });
    }
  }

  function render(){
    setupTabs();
    const rows=filtered();
    const cfgUnit = UNIT_CONFIG[currentUnit];
    
    // Update Tab Styles
    document.querySelectorAll(".unit-tab-btn").forEach(btn => {
        if(btn.dataset.unit === currentUnit) {
            btn.style.color = "#2563eb";
            btn.style.borderBottomColor = "#2563eb";
        } else {
            btn.style.color = "#64748b";
            btn.style.borderBottomColor = "transparent";
        }
    });

    let totalStarsSum = 0; let doneCount = 0;

    const mappedRows = rows.map(r=>{
      const d = getStudentUnitData(r, currentUnit);
      totalStarsSum += d.stars;
      if(d.stars >= d.maxStars) doneCount++;
      return { ...r, _d: d };
    });

    const avg = rows.length ? (totalStarsSum/rows.length).toFixed(1) : "0.0";
    $("#unitStats").innerHTML = `
        <h2 style="margin:0; font-size:1.5rem; color:#1e293b;">${cfgUnit.name}</h2>
        <div style="font-size:1.5rem; font-weight:bold; color:#2563eb;">${avg} <span style="font-size:0.9rem; color:#64748b;">平均星星</span></div>
    `;

    const theadTr = document.querySelector(".tableWrap thead tr") || document.querySelector("table thead tr");
    if (theadTr) {
        theadTr.innerHTML = `
            <th>班級</th><th>座號</th><th>姓名</th><th>維護</th>
            <th>單元星星</th><th>各關卡星星</th><th>完成度</th><th>最近更新</th>
        `;
    }

    if($("#rows")) {
      $("#rows").innerHTML = mappedRows.map(r=>`<tr>
        <td>${esc(r.className)}</td>
        <td>${esc(r.seatNo)}</td>
        <td>${esc(r.name)}</td>
        <td class="maintainCol"><button class="manageBtn" data-id="${esc(r.id)}" type="button">🛠️ 維護</button></td>
        <td style="font-size:1.2rem; font-weight:bold; color:#f59e0b;">⭐ ${r._d.stars} <span style="font-size:0.9rem; color:#94a3b8;">/ ${r._d.maxStars}</span></td>
        <td style="font-size:0.85rem; color:#64748b;">${esc(r._d.details)}</td>
        <td>
           <div style="font-weight:bold; color:${r._d.score===100?'#10b981':'#3b82f6'};">${r._d.score}%</div>
           <div style="font-size:0.75rem; color:#94a3b8;">${r._d.score===100?'已完成':'進行中'}</div>
        </td>
        <td style="font-size:0.85rem; color:#64748b;">
           ${r.lastSync ? new Date(r.lastSync).toLocaleString('zh-TW', {month:'numeric', day:'numeric', hour:'numeric', minute:'numeric', second:'numeric'}) : '尚未同步'}
           ${Number(r.duplicateCount||1)>1?`<br><span class="badge" style="margin-top:4px; display:inline-block;">已合併 ${Number(r.duplicateCount)} 筆</span>`:""}
        </td>
      </tr>`).join("");
    }

    document.querySelectorAll(".manageBtn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const row = rows.find(x=>String(x.id)===String(btn.dataset.id));
        if(row) openStudentManage(row);
      });
    });
  }

  function openStudentManage(row){
    if(!canManageClass(row.className)){ alert("這個教師帳號沒有維護此班級的權限。"); return; }
    manageRow=row;
    const dlg=$("#studentManageDialog");
    const title=$("#manageStudentTitle");
    const list=$("#manageRecordList");
    const note=$("#manageStudentNote");

    if(title) title.textContent=`${row.className} 班｜${row.seatNo} 號｜${row.name}`;
    const records=(row.sourceRecords||[row]).slice().sort((a,b)=> Number(b.stars||0)-Number(a.stars||0));
    
    let html = ``;
    if(Number(row.duplicateCount||1)>1){
       html += `<p class="small warning">目前合併顯示 ${row.duplicateCount} 筆原始紀錄。請只刪除確認錯誤的那一筆。</p>`;
    }
    
    const d1 = getStudentUnitData(row, "unit1");
    const d2 = getStudentUnitData(row, "python");
    const d3 = getStudentUnitData(row, "unit3");
    const d4 = getStudentUnitData(row, "aiot");

    html += `
      <div style="margin-top:12px; background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
        <p style="color:#15803d;font-weight:700;margin-bottom:8px;">✏️ 手動補登各單元星星數：</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label class="small bold">單元一：數位時代 (滿分 24)<input type="number" id="editUnit1Stars" value="${d1.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">單元二：Python (滿分 30)<input type="number" id="editPythonStars" value="${d2.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">單元三：系統平臺 (滿分 24)<input type="number" id="editUnit3Stars" value="${d3.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">5016B 專題 (滿分 15)<input type="number" id="editAiotStars" value="${d4.stars}" class="input" style="width:100%;"></label>
        </div>
        <button id="saveManualStarsBtn" class="btn primary mt1" style="width:100%;">💾 儲存手動星星數</button>
        <div id="manualStarStatus" class="small bold mt1"></div>
      </div>
    `;

    html += records.map((rec,index)=>`
      <div class="recordCard" data-record="${esc(rec.id)}">
        <div class="recordInfo">
          <b>雲端紀錄片段 ${index+1}</b>
          <span class="status">更新：${rec.lastSync ? new Date(rec.lastSync).toLocaleString('zh-TW') : esc(fmtTime(rec.updatedAt)||"—")}</span>
        </div>
        <div class="recordActions">
          <button class="deleteRecordBtn btn sm" style="color:var(--bad);border-color:var(--bad)" type="button"
            data-docid="${esc(rec.id)}" data-class="${esc(rec.className)}" data-seat="${esc(rec.seatNo)}" data-name="${esc(rec.name)}">
            🗑️ 移到回收桶
          </button>
        </div>
      </div>
    `).join("");

    if(list) list.innerHTML = html;
    if(note) note.innerHTML = "";

    const saveManualBtn = $("#saveManualStarsBtn");
    if(saveManualBtn) {
      saveManualBtn.onclick = async () => {
        const btn = $("#saveManualStarsBtn");
        const status = $("#manualStarStatus");
        btn.disabled = true; btn.textContent = "儲存中...";
        try {
          const u1 = Number($("#editUnit1Stars").value);
          const py = Number($("#editPythonStars").value);
          const u3 = Number($("#editUnit3Stars").value);
          const a4 = Number($("#editAiotStars").value);
          
          const updates = {
            "unit1Stars": u1, "progress._u1": u1,
            "stars": py, "modules.python.stars": py,
            "unit3Stars": u3, "progress._u3": u3,
            "aiotStars": a4, "progress._aiot": a4,
            "lastSync": new Date().toISOString(),
            "updatedAt": mods.fs.serverTimestamp()
          };
          await mods.fs.updateDoc(mods.fs.doc(db, "students", row.id), updates);
          status.style.color = "#15803d"; status.textContent = "✅ 星星已成功更新！";
          setTimeout(() => { if(dlg) dlg.close(); loadRows(); }, 1200);
        } catch (err) {
          status.style.color = "#dc2626"; status.textContent = "儲存失敗：" + err.message;
          btn.disabled = false; btn.textContent = "💾 儲存手動星星數";
        }
      };
    }

    if(list) {
      list.querySelectorAll(".deleteRecordBtn").forEach(btn=>btn.addEventListener("click",()=>deleteStudentRecord(btn.dataset)));
    }
    if(dlg) dlg.showModal();
  }

  /* --- 帳號與救援、回收桶功能 --- */
  function buildClassFilter(){
    const old=$("#classFilter")?.value;
    let classes = isAdmin() ? [...new Set(currentRows.map(r=>String(r.className||"")).filter(Boolean))].sort() : allowedClasses();
    if($("#classFilter")) {
      $("#classFilter").innerHTML='<option value="">全部授權班級</option>'+classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
      if(classes.includes(old)) $("#classFilter").value=old;
    }
  }

  function renderTeacherIdentity(){
    const label=$("#teacherIdentity");
    if(!label)return;
    if(isAdmin()){ label.textContent=`管理者｜可查看全部班級`; return; }
    const classes=allowedClasses();
    label.textContent=`${teacherProfile?.displayName||"教師"}｜授權班級：${classes.length?classes.join("、"):"尚未設定"}`;
  }

  async function loadTeacherProfile(uid){
    const snap=await mods.fs.getDoc(mods.fs.doc(db,"teachers",uid));
    return snap.exists() ? {uid,...snap.data()} : null;
  }

  async function queryClass(className){
    const q=mods.fs.query(mods.fs.collection(db,"students"),mods.fs.where("className","==",String(className)));
    const snap=await mods.fs.getDocs(q);
    return snap.docs.map(d=>({id:d.id, ...d.data()}));
  }

  async function loadRows(){
    if($("#dbStatus")) $("#dbStatus").textContent="讀取資料中…";
    try{
      if(isAdmin()){
        const snap=await mods.fs.getDocs(mods.fs.collection(db,"students"));
        currentRows=snap.docs.map(d=>({id:d.id, ...d.data()}));
      }else{
        const classes=allowedClasses();
        if(!classes.length){ currentRows=[]; render(); return; }
        const result=await Promise.all(classes.map(queryClass));
        const seen=new Map();
        result.flat().forEach(r=>seen.set(r.id,r));
        currentRows=[...seen.values()];
      }
      currentRows=mergeDuplicateStudents(currentRows);
      buildClassFilter();
      render();
      if($("#dbStatus")) $("#dbStatus").textContent=`最後更新：${new Date().toLocaleTimeString("zh-TW")}`;
    }catch(e){
      currentRows=[]; render();
      if($("#dbStatus")) $("#dbStatus").textContent="讀取失敗："+(e?.message||"未知錯誤");
    }
  }

  async function init(){
    if(!configured()){ if($("#loginError")) $("#loginError").textContent="尚未設定 Firebase。"; return; }
    try{
      const [appMod,authMod,fsMod]=await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
      ]);
      const app=appMod.initializeApp(cfg);
      auth=authMod.getAuth(app); db=fsMod.getFirestore(app); mods={auth:authMod,fs:fsMod};
      
      authMod.onAuthStateChanged(auth,async user=>{
        if(!user){
          if($("#loginCard")) $("#loginCard").classList.remove("hidden");
          if($("#dashboard")) $("#dashboard").classList.add("hidden");
          return;
        }
        const profile=await loadTeacherProfile(user.uid);
        if(profile && (profile.role==="teacher" || profile.role==="admin")){
          teacherProfile=profile;
          if($("#loginCard")) $("#loginCard").classList.add("hidden");
          if($("#dashboard")) $("#dashboard").classList.remove("hidden");
          renderTeacherIdentity();
          await loadRows();
        }else{
          if($("#loginError")) $("#loginError").textContent="權限不足。";
          await authMod.signOut(auth);
        }
      });
    }catch(e){ if($("#loginError")) $("#loginError").textContent="初始化失敗："+e.message; }
  }

  if($("#loginBtn")) $("#loginBtn").onclick=async()=>{
    if($("#loginError")) $("#loginError").textContent="";
    try{ await mods.auth.signInWithEmailAndPassword(auth,$("#email").value.trim(),$("#password").value); }
    catch(e){ if($("#loginError")) $("#loginError").textContent="登入失敗。"; }
  };
  if($("#logoutBtn")) $("#logoutBtn").onclick=()=>mods.auth.signOut(auth);
  if($("#refreshBtn")) $("#refreshBtn").onclick=loadRows;
  if($("#classFilter")) $("#classFilter").onchange=render;
  if($("#closeManageBtn")) $("#closeManageBtn").onclick=()=>{ if($("#studentManageDialog")) $("#studentManageDialog").close(); };
  
  init();
})();
