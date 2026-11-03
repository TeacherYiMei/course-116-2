/**
 * shared/teacher-dashboard.js (v21 - 多單元智慧聯動與容錯版)
 */
(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let currentUnit="python";
  const $=s=>document.querySelector(s);

  const UNIT_CONFIG = {
    all:    { name: "全學期四單元總覽", maxStars: 93, title: "📊 116 資訊科技｜四單元總覽 (v21)" },
    unit1:  { name: "單元一：數位時代", maxStars: 24, title: "💾 單元一：數位時代｜教師端 (v21)" },
    python: { name: "單元二：進入 Python 的世界", maxStars: 30, title: "👩‍🏫 Python 學習進度｜教師端 (v21)" },
    unit3:  { name: "單元三：系統平臺大冒險", maxStars: 24, title: "🖥️ 單元三：系統平臺大冒險｜教師端 (v21)" },
    aiot:   { name: "延伸專題：5016B AIoT 守護站", maxStars: 15, title: "💡 5016B AIoT 智慧教室守護站｜教師端 (v21)" }
  };

  const configured=()=>!!(
    cfg.enabled && cfg.apiKey && !String(cfg.apiKey).startsWith("PASTE_")
  );

  function esc(x){
    return String(x??"").replace(/[&<>"']/g,m=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  function fmtTime(v){
    try{
      return v&&typeof v.toDate==="function" ? v.toDate().toLocaleString("zh-TW") : "";
    }catch(e){return ""}
  }

  function seatSort(a,b){
    return Number(a.seatNo||999)-Number(b.seatNo||999) ||
      String(a.name||"").localeCompare(String(b.name||""),"zh-Hant");
  }

  function progressSum(progress){
    return Object.values(progress||{}).reduce((n,v)=>n+Number(v||0),0);
  }

  function mergeDuplicateStudents(rows){
    const groups=new Map();
    for(const row of rows){
      const key=`${String(row.className||"").trim()}::${String(row.seatNo||"").trim()}`;
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.values()].map(group=>{
      group.sort((a,b)=> Number(b.stars||0)-Number(a.stars||0));
      const best={...group[0]};
      best.duplicateCount=group.length;
      best.sourceRecords=group;
      return best;
    });
  }

  function isAdmin(){ return teacherProfile?.role==="admin"; }
  function allowedClasses(){
    if(isAdmin()) return null;
    return Array.isArray(teacherProfile?.classes) ? teacherProfile.classes.map(String).filter(Boolean).sort() : [];
  }

  function filtered(){
    const cls=$("#classFilter").value;
    return currentRows.filter(r=>!cls || String(r.className)===cls).sort(seatSort);
  }

  function getStudentUnitData(r, unitKey){
    const cfgUnit = UNIT_CONFIG[unitKey];
    const maxStars = cfgUnit.maxStars;
    const modsData = r.modules || {};

    if(unitKey === "python"){
      const stars = Number(r.stars || modsData.python?.stars || progressSum(r.progress) || 0);
      const score = Number(r.score || modsData.python?.score || (maxStars ? Math.round(stars/maxStars*100) : 0));
      const completed = !!r.completed || !!modsData.python?.completed || stars >= maxStars;
      const station = r.currentStation || modsData.python?.currentStation || "P1";
      const chal = r.currentChallenge || modsData.python?.currentChallenge || 1;
      const currentLevel = `${station}${chal ? `・第 ${chal} 題` : ""}`;
      return { stars: Math.min(maxStars, stars), maxStars, score: Math.min(100, score), completed, currentLevel };
    }

    let unitObj = {};
    if(unitKey === "unit1") {
      unitObj = modsData.unit1 || modsData.digital || r.unit1 || r.digital || r.ch1 || {};
    } else if(unitKey === "unit3") {
      unitObj = modsData.unit3 || modsData.system || r.unit3 || r.system || r.systemPlatform || r.ch3 || {};
    } else if(unitKey === "aiot") {
      unitObj = modsData.aiot || modsData.project5016B || r.aiot || r.project5016B || r.unit4 || {};
    }

    const stars = Number(unitObj.stars || unitObj.score || 0);
    const score = Number(unitObj.score || Math.round(stars / maxStars * 100));
    const completed = !!unitObj.completed || stars >= maxStars;
    const currentLevel = unitObj.currentLevel || (stars > 0 ? "進行中" : "尚未開始");

    if(unitKey === "all") {
      const d1 = getStudentUnitData(r, "unit1");
      const d2 = getStudentUnitData(r, "python");
      const d3 = getStudentUnitData(r, "unit3");
      const d4 = getStudentUnitData(r, "aiot");
      const totalStars = d1.stars + d2.stars + d3.stars + d4.stars;
      const totalMax = 93;
      const totalScore = Math.round(totalStars / totalMax * 100);
      const allDone = d1.completed && d2.completed && d3.completed && d4.completed;
      const summaryText = `數位:${d1.stars}★ | Py:${d2.stars}★ | 系統:${d3.stars}★ | AIoT:${d4.stars}★`;
      return { stars: totalStars, maxStars: totalMax, score: totalScore, completed: allDone, currentLevel: summaryText };
    }

    return { stars: Math.min(maxStars, stars), maxStars, score: Math.min(100, score), completed, currentLevel };
  }

  function render(){
    const rows=filtered();
    const cfgUnit = UNIT_CONFIG[currentUnit] || UNIT_CONFIG.python;

    let totalStarsSum = 0;
    let totalScoreSum = 0;
    let doneCount = 0;

    const mappedRows = rows.map(r=>{
      const uData = getStudentUnitData(r, currentUnit);
      totalStarsSum += uData.stars;
      totalScoreSum += uData.score;
      if(uData.completed) doneCount++;

      return {
        ...r,
        _uStars: uData.stars,
        _uMax: uData.maxStars,
        _uScore: uData.score,
        _uCompleted: uData.completed,
        _uLevel: uData.currentLevel
      };
    });

    $("#studentCount").textContent=rows.length;
    $("#avgStars").textContent=rows.length ? (totalStarsSum/rows.length).toFixed(1) : "0";
    $("#avgScore").textContent=rows.length ? Math.round(totalScoreSum/rows.length) : "0";
    $("#doneCount").textContent=doneCount;

    $("#rows").innerHTML=mappedRows.map(r=>`<tr>
      <td>${esc(r.className)}</td>
      <td>${esc(r.seatNo)}</td>
      <td>${esc(r.name)}</td>
      <td class="maintainCol"><button class="manageBtn" data-id="${esc(r.id)}" type="button">🛠️ 維護</button></td>
      <td>⭐ ${r._uStars}/${r._uMax}</td>
      <td>${r._uScore}</td>
      <td>${esc(r._uLevel)}</td>
      <td><span class="badge ${r._uCompleted?"done":""}">${r._uCompleted?"已完成":"進行中"}</span></td>
      <td>${esc(fmtTime(r.updatedAt))}</td>
      <td>${Number(r.duplicateCount||1)>1?`<span class="badge">已合併 ${Number(r.duplicateCount)} 筆</span>`:"1 筆"}</td>
    </tr>`).join("");

    document.querySelectorAll(".manageBtn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const row=rows.find(x=>String(x.id)===String(btn.dataset.id));
        if(row) alert(`學生：${row.name} (${row.className}班 ${row.seatNo}號)`);
      });
    });
  }

  function buildClassFilter(){
    const old=$("#classFilter").value;
    let classes = isAdmin() ? [...new Set(currentRows.map(r=>String(r.className||"")).filter(Boolean))].sort() : allowedClasses();
    $("#classFilter").innerHTML='<option value="">全部授權班級</option>'+classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
    if(classes.includes(old)) $("#classFilter").value=old;
  }

  function renderTeacherIdentity(){
    const label=$("#teacherIdentity");
    if(!label)return;
    if(isAdmin()){ label.textContent="管理者｜可查看全部班級"; return; }
    const classes=allowedClasses();
    label.textContent=`${teacherProfile?.displayName||"教師"}｜授權班級：${classes.join("、")}`;
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
    $("#dbStatus").textContent="讀取資料中 (v21)…";
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
      $("#dbStatus").textContent=`最後更新：${new Date().toLocaleTimeString("zh-TW")}`;
    }catch(e){
      currentRows=[];
      render();
      $("#dbStatus").textContent="讀取失敗："+(e?.message||"未知錯誤");
    }
  }

  async function init(){
    if(!configured()) return;
    try{
      const [appMod,authMod,fsMod]=await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
      ]);
      const app=appMod.initializeApp(cfg);
      auth=authMod.getAuth(app);
      db=fsMod.getFirestore(app);
      mods={auth:authMod,fs:fsMod};

      document.querySelectorAll(".unitTabBtn").forEach(btn=>{
        btn.addEventListener("click",()=>{
          document.querySelectorAll(".unitTabBtn").forEach(b=>b.classList.remove("active"));
          btn.classList.add("active");
          currentUnit = btn.dataset.unit;
          const cfgUnit = UNIT_CONFIG[currentUnit];
          const headerTitle = document.querySelector("header b");
          if(headerTitle && cfgUnit) headerTitle.textContent = cfgUnit.title;
          render();
        });
      });

      authMod.onAuthStateChanged(auth,async user=>{
        if(!user){ $("#loginCard").classList.remove("hidden"); $("#dashboard").classList.add("hidden"); return; }
        const profile=await loadTeacherProfile(user.uid);
        if(profile && (profile.role==="teacher" || profile.role==="admin")){
          teacherProfile=profile;
          $("#loginCard").classList.add("hidden");
          $("#dashboard").classList.remove("hidden");
          renderTeacherIdentity();
          await loadRows();
        }else{
          $("#loginError").textContent="這個帳號尚未被設定為教師或管理者。";
          await authMod.signOut(auth);
        }
      });
    }catch(e){ console.error(e); }
  }

  $("#loginBtn").onclick=async()=>{
    try{ await mods.auth.signInWithEmailAndPassword(auth,$("#email").value.trim(),$("#password").value); }
    catch(e){ $("#loginError").textContent="登入失敗，請確認 Email 與密碼。"; }
  };
  $("#logoutBtn").onclick=()=>mods.auth.signOut(auth);
  $("#refreshBtn").onclick=loadRows;
  $("#classFilter").onchange=render;

  init();
})();
