(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let manageRow=null;
  let currentUnit="unit1"; 
  const $=s=>document.querySelector(s);

  const UNIT_CONFIG = {
    unit1:  { id: "unit1", name: "單元一 | 數位時代", icon: "🔢", maxStars: 24, tabColor: "blue", mods: ["digital", "unit1", "u1"] },
    python: { id: "python", name: "單元二 | Python", icon: "🐍", maxStars: 30, tabColor: "emerald", mods: ["python", "py"] },
    unit3:  { id: "unit3", name: "單元三 | 系統平臺", icon: "💻", maxStars: 24, tabColor: "cyan", mods: ["platform", "system", "unit3", "u3"] },
    aiot:   { id: "aiot", name: "5016B 專題", icon: "💡", maxStars: 15, tabColor: "amber", mods: ["aiot", "arduino", "5016"] }
  };

  // v16.54: each module's actual saved level IDs. A dash means no level-level
  // evidence; do not transform aggregate-only scores into invented completions.
  const SUBUNITS={
    unit1:[
      {id:'d1',label:'1-1 二進位',parts:['x1','u1'],max:6},
      {id:'d2',label:'1-2 文字',parts:['x2','u2'],max:6},
      {id:'d3',label:'1-3 音訊',parts:['x3','u3'],max:6},
      {id:'d4',label:'1-4 影像',parts:['x4','u4'],max:6}
    ],
    python:Array.from({length:10},(_,i)=>({id:'p'+(i+1),label:'P'+(i+1),parts:['p'+(i+1)],max:3})),
    unit3:Array.from({length:8},(_,i)=>({id:'G'+(i+1),label:'G'+(i+1),parts:['G'+(i+1)],max:3})),
    aiot:Array.from({length:5},(_,i)=>({id:'S'+(i+1),label:'S'+(i+1),parts:['S'+(i+1)],max:3}))
  };
  function getSubunitData(r,unitKey){
    const cfg=UNIT_CONFIG[unitKey], records=r.sourceRecords||[r], best={};
    const observed=new Set();
    for(const record of records){
      const sources=[record.modules,record.progress?._mods,record.courseProgress?.['11601']?.modules];
      for(const source of sources){
        if(!source || typeof source!=='object')continue;
        for(const alias of cfg.mods){
          const levels=source[alias]?.levels;
          if(!levels || typeof levels!=='object')continue;
          for(const [raw,entry] of Object.entries(levels)){
            const key=String(raw).toLowerCase();
            const n=Number(entry?.stars);
            if(!Number.isFinite(n)||n<0)continue;
            observed.add(key);
            best[key]=Math.max(best[key]||0,n);
          }
        }
      }
      if(unitKey==='python'){
        for(const [raw,val] of Object.entries(record.progress||{})){
          const key=raw.toLowerCase();
          if(!/^p(?:10|[1-9])$/.test(key))continue;
          const n=Number(val);
          if(Number.isFinite(n)&&n>=0){observed.add(key);best[key]=Math.max(best[key]||0,n);}
        }
      }
    }
    return SUBUNITS[unitKey].map(sub=>{
      const count=sub.parts.filter(p=>observed.has(p.toLowerCase())).length;
      const stars=sub.parts.reduce((sum,p)=>sum+(best[p.toLowerCase()]||0),0);
      return {...sub,stars:Math.min(sub.max,stars),observed:count>0, complete:count===sub.parts.length&&stars>=sub.max};
    });
  }
  function subunitBadge(sub){
    const cls=!sub.observed?'unknown':sub.complete?'complete':sub.stars>0?'partial':'empty';
    const status=!sub.observed?'未同步／無逐關紀錄':sub.complete?'滿星':sub.stars>0?'進行中':'目前 0 星';
    return `<div class="subunit-score ${cls}" title="${esc(sub.label)}：${esc(status)}"><strong>${sub.observed?`★ ${sub.stars}`:'—'}</strong><small>${sub.observed?'/ '+sub.max:'待確認'}</small><span>${sub.observed?(sub.complete?'✓ 滿星':sub.stars>0?'進行中':'0 星'):'未有明細'}</span></div>`;
  }

  const configured=()=>!!(cfg.enabled && cfg.apiKey && !String(cfg.apiKey).startsWith("PASTE_"));
  function esc(x){ return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
  function fmtTime(v){ try{ return v&&typeof v.toDate==="function" ? v.toDate().toLocaleString("zh-TW") : ""; }catch(e){return ""} }
  function seatSort(a,b){ return Number(a.seatNo||999)-Number(b.seatNo||999) || String(a.name||"").localeCompare(String(b.name||""),"zh-Hant"); }

  // 🔴 關鍵修復：這裡使用正確的同步函數，並且絕不重複宣告！
  function isAdmin(){ return teacherProfile?.role==="admin"; }
  function allowedClasses(){ return isAdmin() ? null : Array.isArray(teacherProfile?.classes) ? teacherProfile.classes.map(String).filter(Boolean).sort() : []; }
  function canManageClass(className){ return isAdmin() || allowedClasses().includes(String(className)); }
  function filtered(){ const cls=$("#classFilter")?.value || ""; return currentRows.filter(r=>!cls || String(r.className)===cls).sort(seatSort); }

  function mergeDuplicateStudents(rows){
    const groups=new Map();
    for(const row of rows){
      // 🔴 關鍵修復：強制將座號轉為數字再做分組，這樣 "5" 和 "05" 就會完美合併，不會漏掉任何舊成績！
      const seatKey = Number(String(row.seatNo||"").trim() || 0);
      const key=`${String(row.className||"").trim()}::${seatKey}`;
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.values()].map(group=>{
      group.sort((a,b)=> {
          let tA = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate().getTime() : new Date(a.updatedAt).getTime()) : 0;
          let tB = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate().getTime() : new Date(b.updatedAt).getTime()) : 0;
          return tB - tA;
      });
      
      const best={...group[0]};
      best.duplicateCount=group.length;
      best.sourceRecords=group;
      
      if(group.length>1){
        const mergedMods = {};
        const mergedProgress = {};
        for(const r of group) {
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
        
        best.stars = Math.max(...group.map(r=>Number(r.stars||0)));
        best.unit1Stars = Math.max(...group.map(r=>Number(r.unit1Stars || (r.progress && r.progress._u1) || 0)));
        best.unit3Stars = Math.max(...group.map(r=>Number(r.unit3Stars || (r.progress && r.progress._u3) || 0)));
        best.aiotStars = Math.max(...group.map(r=>Number(r.aiotStars || (r.progress && r.progress._aiot) || 0)));
      }
      return best;
    });
  }

  // 多入口相容：舊版 modules、progress._mods 與新版 courseProgress 皆納入。
  // 同一關卡取最高成績；同班同座的舊 UID 僅做唯讀彙總，不移動或刪除帳號。
  function getStudentUnitData(r, unitKey){
    const cfg=UNIT_CONFIG[unitKey];
    const records=r.sourceRecords||[r];
    const levelBest={};
    let moduleTotal=0, fallback=0, pyTotal=0, found=false;
    for(const record of records){
      const sources=[record.modules, record.progress?._mods,
        record.courseProgress?.['11601']?.modules];
      for(const source of sources){
        if(!source)continue;
        for(const alias of cfg.mods){
          const m=source[alias]; if(!m)continue;
          found=true;
          const declared=Number(m.stars)||0;
          moduleTotal=Math.max(moduleTotal,declared);
          for(const [id,lv] of Object.entries(m.levels||{})){
            levelBest[id]=Math.max(levelBest[id]||0,Number(lv?.stars)||0);
          }
        }
      }
      if(unitKey==='unit1')fallback=Math.max(fallback,Number(record.unit1Stars)||0,Number(record.progress?._u1)||0);
      if(unitKey==='unit3')fallback=Math.max(fallback,Number(record.unit3Stars)||0,Number(record.progress?._u3)||0);
      if(unitKey==='aiot')fallback=Math.max(fallback,Number(record.aiotStars)||0,Number(record.progress?._aiot)||0);
      if(unitKey==='python'){
        let py=0;
        for(const [k,v] of Object.entries(record.progress||{})){
          if(/^p(?:10|[1-9])$/.test(k) && Number.isFinite(Number(v)))py+=Number(v);
        }
        pyTotal=Math.max(pyTotal,py,Number(record.stars)||0);
      }
    }
    const levelSum=Object.values(levelBest).reduce((a,n)=>a+n,0);
    const base=Math.max(levelSum,moduleTotal,pyTotal);
    const stars=Math.max(base,fallback);
    const detail=Object.entries(levelBest).filter(([,n])=>n>0).map(([k,n])=>`${k}:${n}★`);
    const isManual=fallback>base;
    const details=isManual?'✅ 舊版補登成績保留':detail.length?detail.join(', '):stars>0?'已取得單元成績':found?'尚無已得星星':'尚未找到雲端關卡紀錄';
    return {stars,maxStars:cfg.maxStars,score:Math.min(100,Math.round(stars/cfg.maxStars*100)),details,isManual,found:found || stars>0};
  }

  function setupUI() {
    const tableWrap = document.querySelector('.tableWrap');
    if (!tableWrap) return;
    let panel = document.querySelector('#customHeaderInfo');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'customHeaderInfo';
      panel.className = 'unit-dashboard';
      tableWrap.parentNode.insertBefore(panel, tableWrap);
      panel.innerHTML = `
        <h2 class="unit-page-title">📚 各單元獨立星星成績</h2>
        <p class="unit-instructions">點選一個單元，查看該單元所有學生的星星與關卡明細。成績為唯讀顯示，不會修改學生紀錄。</p>
        <div id="unitCards" class="unit-card-grid" role="group" aria-label="選擇單元"></div>
        <div id="unit-panel" class="unit-active-panel"></div>`;
    }
    // 隱藏舊版重複的單元切換與統計，保留原始資料和教師工具列。
    const originalTabs=document.querySelector('#moduleTabs');
    if(originalTabs) originalTabs.style.display="none";
    const originalFocus=document.querySelector('.moduleFocus');
    if(originalFocus) originalFocus.style.display="none";
    const oldSummary=document.querySelector('.summary');
    if(oldSummary) oldSummary.style.display="none";
  }

  function renderUnitCards(rows){
    const cards=document.querySelector('#unitCards');
    if(!cards)return;
    cards.innerHTML=Object.entries(UNIT_CONFIG).map(([key,u])=>{
      const scores=rows.map(r=>getStudentUnitData(r,key));
      const earned=scores.reduce((n,d)=>n+d.stars,0);
      const avg=scores.length?(earned/scores.length).toFixed(1):'0.0';
      const studentsWithStars=scores.filter(d=>d.stars>0).length;
      const selected=key===currentUnit;
      return `<button type="button" class="unit-score-card ${selected?'selected':''}" data-unit="${key}" aria-pressed="${selected}" aria-label="${esc(u.name)}，平均 ${avg} 顆星">
          <span class="unit-score-heading"><span class="unit-score-icon">${u.icon}</span><span>${esc(u.name)}</span></span>
          <span class="unit-score-number"><span class="unit-star-glyph">★</span>${avg}<span class="unit-score-suffix"> / ${u.maxStars} 平均星</span></span>
          <span class="unit-score-foot">${studentsWithStars} / ${rows.length} 位學生有星星</span>
        </button>`;
    }).join('');
    cards.querySelectorAll('[data-unit]').forEach(btn=>btn.addEventListener('click',()=>{
      currentUnit=btn.dataset.unit;
      render();
    }));
  }

  function render(){
    setupUI();
    const rows = filtered();
    const cfgUnit = UNIT_CONFIG[currentUnit];
    renderUnitCards(rows);
    
    let totalStarsSum = 0;
    
    const mappedRows = rows.map(r => {
      const d = getStudentUnitData(r, currentUnit);
      totalStarsSum += d.stars;
      return { ...r, _d: d };
    });

    const avg = rows.length ? (totalStarsSum/rows.length).toFixed(1) : "0.0";
    
    $("#unit-panel").innerHTML = `
      <div class="unit-active-title"><div><h3>${cfgUnit.icon} ${esc(cfgUnit.name)}</h3>
      <p>以下每列只顯示本單元成績；可切換上方單元卡查看其他課程。</p></div>
      <div class="unit-active-average"><strong>★ ${avg}</strong><span>全班平均 / ${cfgUnit.maxStars} 星</span></div></div>`;

    // Each subunit gets its own large, readable column. Keep horizontal scrolling.
    const subs=SUBUNITS[currentUnit];
    const summary=subs.map((sub,i)=>{
      const values=mappedRows.map(r=>getSubunitData(r,currentUnit)[i]);
      const withScore=values.filter(v=>v.observed && v.stars>0).length;
      const complete=values.filter(v=>v.complete).length;
      return `<div class="subunit-summary"><strong>${esc(sub.label)}</strong><span>★ ${withScore} 人有星星</span><small>${complete} 人滿星／${rows.length} 人</small></div>`;
    }).join('');
    const activePanel=$("#unit-panel");
    if(activePanel)activePanel.insertAdjacentHTML('beforeend',`<div class="subunit-summary-grid" aria-label="各小關進度摘要">${summary}</div><p class="subunit-notice">— 表示尚無逐關紀錄，不能視為 0 星；若只找到舊版總星數，仍保留在「單元總星」欄，不會平均分配到各關。</p>`);
    const theadTr = document.querySelector(".tableWrap thead tr") || document.querySelector("table thead tr");
    if (theadTr) {
      theadTr.innerHTML = `
        <th>班級</th><th>座號</th><th>姓名</th><th class="maintainCol">維護</th>
        <th class="unit-star-column">單元總星 ⭐</th>
        ${subs.map(sub=>`<th class="subunit-head" title="${esc(sub.label)}">${esc(sub.label)}<span>滿分 ${sub.max}★</span></th>`).join('')}
        <th>完成度</th><th>最近更新</th>`;
    }
    if($("#rows")) {
      $("#rows").innerHTML = mappedRows.map(r=>{
        const subScores=getSubunitData(r,currentUnit);
        return `<tr class="student-score-row">
        <td>${esc(r.className)}</td><td class="seat-num">${esc(r.seatNo)}</td>
        <td class="student-name">${esc(r.name)}</td>
        <td class="maintainCol"><button class="manageBtn" data-id="${esc(r.id)}" type="button">維護</button></td>
        <td class="unit-star-column"><div class="star-strong ${r._d.stars===0?'star-zero':''}">
          <span class="star-symbol">★</span><strong>${r._d.stars}</strong><span class="star-maximum">/ ${r._d.maxStars}</span>
        </div><div class="star-progress"><span style="width:${r._d.score}%"></span></div></td>
        ${subScores.map(v=>`<td class="subunit-cell">${subunitBadge(v)}</td>`).join('')}
        <td><span class="completion-percent">${r._d.score}%</span><span class="completion-label">${r._d.score===100?'✅ 單元滿星':r._d.stars>0?'進行中':r._d.found?'目前 0 星':'未找到雲端紀錄'}</span></td>
        <td class="sync-time">${r.updatedAt ? fmtTime(r.updatedAt) : '無更新時間'}
        ${Number(r.duplicateCount||1)>1?`<span class="dup-chip">合併顯示 ${Number(r.duplicateCount)} 筆</span>`:''}</td>
      </tr>`;}).join('');
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
           if($("#dbStatus")) $("#dbStatus").textContent=`請確認授權班級設定`;
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

  // 🔴 確保這裡絕對沒有 async allowedClasses
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
