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
    unit1:  { id: "unit1", name: "單元一 | 數位時代", icon: "🔢", maxStars: 24, tabColor: "blue", mods: ["digital", "unit1", "u1"] },
    python: { id: "python", name: "單元二 | Python", icon: "🐍", maxStars: 30, tabColor: "emerald", mods: ["python", "py"] },
    unit3:  { id: "unit3", name: "單元三 | 系統平臺", icon: "💻", maxStars: 24, tabColor: "cyan", mods: ["platform", "system", "unit3", "u3"] },
    aiot:   { id: "aiot", name: "5016B 專題", icon: "💡", maxStars: 15, tabColor: "amber", mods: ["aiot", "arduino", "5016"] }
  };

  const configured=()=>!!(cfg.enabled && cfg.apiKey && !String(cfg.apiKey).startsWith("PASTE_"));
  function esc(x){ return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
  function fmtTime(v){ try{ return v&&typeof v.toDate==="function" ? v.toDate().toLocaleString("zh-TW") : ""; }catch(e){return ""} }
  function seatSort(a,b){ return Number(a.seatNo||999)-Number(b.seatNo||999) || String(a.name||"").localeCompare(String(b.name||""),"zh-Hant"); }

  function mergeDuplicateStudents(rows){
    const groups=new Map();
    for(const row of rows){
      const key=`${String(row.className||"").trim()}::${String(row.seatNo||"").trim()}`;
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.values()].map(group=>{
      group.sort((a,b)=> (b.updatedAt ? new Date(b.updatedAt.toDate?b.updatedAt.toDate():b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt.toDate?a.updatedAt.toDate():a.updatedAt).getTime() : 0));
      const best={...group[0]};
      best.duplicateCount=group.length;
      best.sourceRecords=group;
      
      if(group.length>1){
        const mergedMods = {};
        const mergedProgress = {};
        for(const r of group) {
           // 🔴 關鍵修正：精準保留並合併 _mods
           const cMods = r.modules || (r.progress && r.progress._mods) || {};
           for (let mk in cMods) {
              if(!mergedMods[mk]) mergedMods[mk] = { levels: {} };
              let lvs = cMods[mk].levels || {};
              for (let lk in lvs) {
                 if (!mergedMods[mk].levels[lk] || (lvs[lk].stars||0) > (mergedMods[mk].levels[lk].stars||0)) {
                    mergedMods[mk].levels[lk] = lvs[lk];
                 }
              }
           }
           if (r.progress) {
              for (let pk in r.progress) {
                 if (pk === '_mods') continue;
                 mergedProgress[pk] = Math.max(Number(mergedProgress[pk]||0), Number(r.progress[pk]||0));
              }
           }
        }
        
        for (let mk in mergedMods) {
            let sum = 0;
            for (let lk in mergedMods[mk].levels) { sum += (mergedMods[mk].levels[lk].stars||0); }
            mergedMods[mk].stars = sum;
        }
        
        best.modules = mergedMods;
        best.progress = mergedProgress;
        best.progress._mods = mergedMods; // 確保向下相容
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
    let detailsStr = "尚未有關卡紀錄";
    let isManual = false;
    
    let foundMod = null;
    for (let alias of cfg.mods) {
       if (modsData[alias]) { foundMod = modsData[alias]; break; }
    }
    
    if (unitKey === "python") {
       let pyStars = 0;
       if (r.progress) {
          for (let pk in r.progress) { if(!pk.startsWith('_') && !isNaN(Number(r.progress[pk]))) pyStars += Number(r.progress[pk]); }
       }
       stars = Math.max(pyStars, Number(foundMod?.stars||0), Number(r.stars||0));
       if (stars > 0) detailsStr = "已進行 Python 挑戰";
    } else {
       if (foundMod && foundMod.levels) {
          let lvs = foundMod.levels;
          let dt = [];
          let sum = 0;
          for (let k in lvs) {
             let s = Number(lvs[k].stars||0);
             if (s > 0) dt.push(`${k}:${s}★`);
             sum += s;
          }
          stars = Math.max(sum, Number(foundMod.stars||0));
          if (dt.length > 0) detailsStr = dt.join(', ');
       }
       
       // 🔴 關鍵修正：完美抓取任何可能的手動補登欄位，取最高分！
       let fallbackStar = 0;
       if (unitKey === "unit1") fallbackStar = Math.max(Number(r.unit1Stars||0), Number(r.progress?._u1||0), Number(r.progress?.unit1Stars||0));
       if (unitKey === "unit3") fallbackStar = Math.max(Number(r.unit3Stars||0), Number(r.progress?._u3||0), Number(r.progress?.unit3Stars||0));
       if (unitKey === "aiot") fallbackStar = Math.max(Number(r.aiotStars||0), Number(r.progress?._aiot||0), Number(r.progress?.aiotStars||0));
       
       if (fallbackStar > stars) {
          stars = fallbackStar;
          detailsStr = "✅ 教師手動補登保留";
          isManual = true;
       }
    }
    
    if(isNaN(stars)) stars = 0;
    const score = Math.min(100, Math.round((stars / cfg.maxStars) * 100));
    
    return { stars, maxStars: cfg.maxStars, score, details: detailsStr, isManual };
  }

  function setupUI() {
    // 🔴 關鍵修正：徹底清除舊版雙層 UI！
    const tableWrap = document.querySelector('.tableWrap');
    if (tableWrap) {
        let prev = tableWrap.previousElementSibling;
        while (prev) {
            prev.style.display = 'none';
            prev = prev.previousElementSibling;
        }
    }

    if ($("#customHeaderInfo")) return; // 如果已經建立過，就不重複建立

    const wrap = $("#app") || document.querySelector('.tableWrap')?.parentNode || document.body;
    let uiHTML = `
      <div style="background:white; padding:24px; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom:24px;">
         <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <span style="font-size:24px;">📊</span>
            <h1 style="font-size:24px; font-weight:bold; margin:0; color:#1e293b;">各單元學習進度 (v16.45 終極護城河版)</h1>
         </div>
         <p style="font-size:14px; color:#64748b; margin-bottom:20px;">請選擇單元，獨立查看該單元每位學生的星星與關卡完成情形；切換單元不會修改學生資料。</p>
         
         <div style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;" id="custom-tabs-container">
    `;
    
    for (let k in UNIT_CONFIG) {
        const u = UNIT_CONFIG[k];
        const isActive = (k === currentUnit);
        const bg = isActive ? '#2563eb' : '#ffffff';
        const color = isActive ? '#ffffff' : '#475569';
        const border = isActive ? '2px solid #1d4ed8' : '1px solid #cbd5e1';
        const shadow = isActive ? 'box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);' : '';
        
        uiHTML += `<button class="unit-tab-btn" data-unit="${k}" style="background:${bg}; color:${color}; border:${border}; ${shadow} padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:15px; display:flex; align-items:center; gap:8px; transition:all 0.2s;">
            <span>${u.icon}</span> ${u.name}
        </button>`;
    }
    
    uiHTML += `</div><div id="unit-panel" style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;"></div>`;
    
    let headerDiv = document.createElement("div");
    headerDiv.id = "customHeaderInfo";
    if (tableWrap) {
        tableWrap.parentNode.insertBefore(headerDiv, tableWrap);
    } else {
        wrap.insertBefore(headerDiv, wrap.firstChild);
    }
    headerDiv.innerHTML = uiHTML;
    
    document.querySelectorAll(".unit-tab-btn").forEach(btn => {
       btn.addEventListener("click", (e) => {
           currentUnit = e.currentTarget.dataset.unit;
           document.querySelector('#customHeaderInfo').remove(); // 確保切換時重繪 Tab 狀態
           render();
       });
    });
  }

  function render(){
    setupUI();
    const rows = filtered();
    const cfgUnit = UNIT_CONFIG[currentUnit];
    
    let totalStarsSum = 0;
    
    const mappedRows = rows.map(r => {
      const d = getStudentUnitData(r, currentUnit);
      totalStarsSum += d.stars;
      return { ...r, _d: d };
    });

    const avg = rows.length ? (totalStarsSum/rows.length).toFixed(1) : "0.0";
    
    $("#unit-panel").innerHTML = `
        <div>
            <h2 style="margin:0 0 4px 0; font-size:20px; font-weight:bold; color:#1e293b;">${cfgUnit.name}</h2>
            <p style="margin:0; font-size:13px; color:#64748b;">每位學生的本單元星星及各關卡紀錄</p>
        </div>
        <div style="text-align:right;">
            <span style="font-size:28px; font-weight:bold; color:#2563eb;">${avg}</span>
            <span style="font-size:13px; color:#64748b; margin-left:4px;">平均星星</span>
        </div>
    `;

    const theadTr = document.querySelector(".tableWrap thead tr") || document.querySelector("table thead tr");
    if (theadTr) {
        theadTr.innerHTML = `
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">班級</th>
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">座號</th>
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">姓名</th>
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">維護</th>
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">${cfgUnit.name.split('｜')[1] || cfgUnit.name}星星</th>
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">各關卡星星</th>
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">完成度</th>
            <th style="padding:12px; text-align:left; border-bottom:1px solid #e2e8f0; color:#475569;">最近更新</th>
        `;
    }

    if($("#rows")) {
      $("#rows").innerHTML = mappedRows.map(r=>`<tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:16px 12px; color:#334155;">${esc(r.className)}</td>
        <td style="padding:16px 12px; color:#334155;">${esc(r.seatNo)}</td>
        <td style="padding:16px 12px; color:#334155; font-weight:bold;">${esc(r.name)}</td>
        <td style="padding:16px 12px;" class="maintainCol"><button class="manageBtn" style="padding:6px 12px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; cursor:pointer;" data-id="${esc(r.id)}" type="button">🛠️ 維護</button></td>
        
        <td style="padding:16px 12px;">
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:20px;">⭐</span>
                <span style="font-size:18px; font-weight:bold; color:#1e293b;">${r._d.stars}</span>
                <span style="font-size:14px; color:#94a3b8;">/ ${r._d.maxStars}</span>
            </div>
            <div style="height:6px; background:#e2e8f0; border-radius:4px; margin-top:6px; width:80px; overflow:hidden;">
                <div style="height:100%; background:#f59e0b; width:${r._d.score}%;"></div>
            </div>
        </td>
        
        <td style="padding:16px 12px; font-size:13px; color:${r._d.isManual ? '#10b981' : '#64748b'}; font-weight:${r._d.isManual ? 'bold' : 'normal'};">${esc(r._d.details)}</td>
        
        <td style="padding:16px 12px;">
           <div style="font-weight:bold; color:${r._d.score===100?'#10b981':'#3b82f6'};">${r._d.score}%</div>
           <div style="font-size:11px; color:#94a3b8;">${r._d.score===100?'✅ 已完成':'尚未開始'}</div>
        </td>
        
        <td style="padding:16px 12px; font-size:13px; color:#64748b;">
           ${r.updatedAt ? fmtTime(r.updatedAt) : '尚未同步'}
           ${Number(r.duplicateCount||1)>1?`<br><span style="background:#f1f5f9; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; font-size:10px; margin-top:4px; display:inline-block;">已合併 ${Number(r.duplicateCount)} 筆</span>`:""}
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
    if(!canManageClass(row.className)){ alert("權限不足。"); return; }
    manageRow=row;
    const dlg=$("#studentManageDialog");
    const title=$("#manageStudentTitle");
    const list=$("#manageRecordList");
    
    if(title) title.textContent=`${row.className} 班｜${row.seatNo} 號｜${row.name}`;
    
    const d1 = getStudentUnitData(row, "unit1");
    const d2 = getStudentUnitData(row, "python");
    const d3 = getStudentUnitData(row, "unit3");
    const d4 = getStudentUnitData(row, "aiot");

    let html = `
      <div style="margin-top:12px; background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
        <p style="color:#15803d;font-weight:700;margin-bottom:8px;">✏️ 手動補登各單元星星數：</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label class="small bold">單元一：數位時代 (上限 24)<input type="number" id="editUnit1Stars" value="${d1.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">單元二：Python (上限 30)<input type="number" id="editPythonStars" value="${d2.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">單元三：系統平臺 (上限 24)<input type="number" id="editUnit3Stars" value="${d3.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">5016B 專題 (上限 15)<input type="number" id="editAiotStars" value="${d4.stars}" class="input" style="width:100%;"></label>
        </div>
        <button id="saveManualStarsBtn" class="btn primary mt1" style="width:100%;">💾 儲存手動星星數</button>
        <div id="manualStarStatus" class="small bold mt1"></div>
      </div>
    `;

    if(list) list.innerHTML = html;

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
            "progress._u1": u1,
            "stars": py,
            "progress._u3": u3,
            "progress._aiot": a4,
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
    if(dlg) dlg.showModal();
  }

  async function loadRows(){
    if($("#dbStatus")) $("#dbStatus").textContent="讀取資料中…";
    try{
      if(isAdmin()){
        const snap=await mods.fs.getDocs(mods.fs.collection(db,"students"));
        currentRows=snap.docs.map(d=>({id:d.id, ...d.data()}));
      }else{
        const classes=allowedClasses();
        if(!classes.length){ 
           currentRows=[]; 
           render(); 
           return; 
        }
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

  async function allowedClasses(){ return isAdmin() ? null : Array.isArray(teacherProfile?.classes) ? teacherProfile.classes.map(String).filter(Boolean).sort() : []; }
  async function loadTeacherProfile(uid){ const snap=await mods.fs.getDoc(mods.fs.doc(db,"teachers",uid)); return snap.exists() ? {uid,...snap.data()} : null; }
  async function queryClass(className){ const q=mods.fs.query(mods.fs.collection(db,"students"),mods.fs.where("className","==",String(className))); const snap=await mods.fs.getDocs(q); return snap.docs.map(d=>({id:d.id, ...d.data()})); }

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
