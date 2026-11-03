(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let currentUnit="python";
  const $=s=>document.querySelector(s);

  const UNIT_CONFIG = {
    all:    { name: "全學期四單元總覽", maxStars: 93, title: "📊 116 資訊科技｜四單元總覽" },
    unit1:  { name: "單元一：數位時代", maxStars: 24, title: "💾 單元一：數位時代｜教師端" },
    python: { name: "單元二：進入 Python 的世界", maxStars: 30, title: "👩‍🏫 Python 學習進度｜教師端" },
    unit3:  { name: "單元三：系統平臺大冒險", maxStars: 24, title: "🖥️ 單元三：系統平臺大冒險｜教師端" },
    aiot:   { name: "延伸專題：5016B AIoT 守護站", maxStars: 15, title: "💡 5016B AIoT 智慧教室守護站｜教師端" }
  };

  const configured=()=>!!(
    cfg.enabled &&
    cfg.apiKey &&
    !String(cfg.apiKey).startsWith("PASTE_")
  );

  function esc(x){
    return String(x??"").replace(/[&<>"']/g,m=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  function fmtTime(v){
    try{
      return v&&typeof v.toDate==="function"
        ? v.toDate().toLocaleString("zh-TW")
        : "";
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
      group.sort((a,b)=>
        Number(b.stars||0)-Number(a.stars||0) ||
        progressSum(b.progress)-progressSum(a.progress)
      );
      const best={...group[0]};
      best.duplicateCount=group.length;
      best.sourceRecords=group.map(r=>({
        id:r.id,
        className:String(r.className||""),
        seatNo:String(r.seatNo||""),
        name:String(r.name||""),
        stars:Number(r.stars||0),
        totalStars:Number(r.totalStars||30),
        score:Number(r.score||0),
        progress:r.progress||{},
        modules:r.modules||{},
        currentStation:String(r.currentStation||""),
        currentChallenge:r.currentChallenge||"",
        completed:!!r.completed,
        updatedAt:r.updatedAt||null
      }));
      return best;
    });
  }

  function isAdmin(){
    return teacherProfile?.role==="admin";
  }

  function allowedClasses(){
    if(isAdmin()) return null;
    return Array.isArray(teacherProfile?.classes)
      ? teacherProfile.classes.map(String).filter(Boolean).sort()
      : [];
  }

  function filtered(){
    const cls=$("#classFilter").value;
    return currentRows
      .filter(r=>!cls || String(r.className)===cls)
      .sort(seatSort);
  }

  // 萬用智慧解析器：自動掃描學生文檔內所有可能存放各單元進度的欄位
  function getStudentUnitData(r, unitKey){
    const cfgUnit = UNIT_CONFIG[unitKey];
    const maxStars = cfgUnit.maxStars;

    if(unitKey === "python"){
      const stars = Number(r.stars || r.modules?.python?.stars || r.python?.stars || progressSum(r.progress) || 0);
      const score = Number(r.score || r.modules?.python?.score || (maxStars ? Math.round(stars/maxStars*100) : 0));
      const completed = !!r.completed || !!r.modules?.python?.completed || stars >= maxStars;
      const station = r.currentStation || r.modules?.python?.currentStation || "P1";
      const chal = r.currentChallenge || r.modules?.python?.currentChallenge || 1;
      const currentLevel = `${station}${chal ? `・第 ${chal} 題` : ""}`;
      return { stars: Math.min(maxStars, stars), maxStars, score: Math.min(100, score), completed, currentLevel };
    }

    // 針對其他單元（unit1, unit3, aiot），搜尋所有可能的主鍵、modules 子物件、或獨立欄位
    let obj = {};
    if(unitKey === "unit1") {
      obj = r.modules?.unit1 || r.unit1 || r.digital || r.ch1 || r.unit_1 || r.modules?.digital || r.modules?.ch1 || {};
    } else if(unitKey === "unit3") {
      obj = r.modules?.unit3 || r.unit3 || r.system || r.systemPlatform || r.ch3 || r.unit_3 || r.modules?.system || {};
    } else if(unitKey === "aiot") {
      obj = r.modules?.aiot || r.aiot || r.project5016B || r.unit4 || r.ch4 || r.unit_4 || r.modules?.project5016B || {};
    }

    // 如果物件內有 stars 或 score
    let stars = Number(obj.stars || obj.score || obj.star || 0);
    let score = Number(obj.score || Math.round(stars / maxStars * 100));
    let completed = !!obj.completed || stars >= maxStars;
    let currentLevel = obj.currentLevel || obj.status || (stars > 0 ? "進行中" : "尚未開始");

    // 如果找不到，但學生端有把資料存在其他地方（例如 r[`${unitKey}Stars`] 等）
    if(stars === 0) {
      stars = Number(r[`${unitKey}Stars`] || r[`${unitKey}_stars`] || 0);
      if(stars > 0) {
        score = Math.round(stars / maxStars * 100);
        completed = stars >= maxStars;
        currentLevel = "進行中";
      }
    }

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
    $("#avgStars").textContent=rows.length
      ? (totalStarsSum/rows.length).toFixed(1)
      : "0";
    $("#avgScore").textContent=rows.length
      ? Math.round(totalScoreSum/rows.length)
      : "0";
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
      <td>${Number(r.duplicateCount||1)>1?`<span class="badge">已合併顯示 ${Number(r.duplicateCount)} 筆</span>`:"1 筆"}</td>
    </tr>`).join("");

    document.querySelectorAll(".manageBtn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const row=rows.find(x=>String(x.id)===String(btn.dataset.id));
        if(row) openStudentManage(row);
      });
    });
  }

  function canManageClass(className){
    return isAdmin() || allowedClasses().includes(String(className));
  }

  function openStudentManage(row){
    if(!canManageClass(row.className)){
      alert("沒有此班級維護權限。");
      return;
    }
    const dlg=$("#studentManageDialog");
    $("#manageStudentTitle").textContent=`${row.className} 班｜${row.seatNo} 號｜${row.name}`;
    $("#manageStudentNote").textContent="學生資料維護";
    const records=(row.sourceRecords||[row]);
    $("#manageRecordList").innerHTML=records.map((rec,i)=>`
      <div class="recordCard">
        <div class="recordInfo">
          <b>紀錄 ${i+1}</b>
          <span>⭐ ${Number(rec.stars||0)}/30</span>
          <span>${esc(rec.currentStation||"")}${rec.currentChallenge?`・第 ${rec.currentChallenge} 題`:""}</span>
        </div>
      </div>
    `).join("");
    dlg.showModal();
  }

  function buildClassFilter(){
    const old=$("#classFilter").value;
    let classes;
    if(isAdmin()){
      classes=[...new Set(currentRows.map(r=>String(r.className||"")).filter(Boolean))].sort();
    }else{
      classes=allowedClasses();
    }
    $("#classFilter").innerHTML='<option value="">全部授權班級</option>'+classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
    if(classes.includes(old)) $("#classFilter").value=old;
  }

  function renderTeacherIdentity(){
    const label=$("#teacherIdentity");
    if(!label)return;
    if(isAdmin()){
      label.textContent=`管理者｜可查看全部班級`;
      return;
    }
    const classes=allowedClasses();
    const name=teacherProfile?.displayName||"教師";
    label.textContent=`${name}｜授權班級：${classes.join("、")}`;
  }

  async function loadTeacherProfile(uid){
    const snap=await mods.fs.getDoc(mods.fs.doc(db,"teachers",uid));
    if(!snap.exists()) return null;
    return {uid,...snap.data()};
  }

  async function queryClass(className){
    const {collection,query,where,getDocs}=mods.fs;
    const q=query(collection(db,"students"),where("className","==",String(className)));
    const snap=await getDocs(q);
    return snap.docs.map(d=>({id:d.id, ...d.data()}));
  }

  async function loadRows(){
    $("#dbStatus").textContent="讀取資料中…";
    try{
      if(isAdmin()){
        const snap=await mods.fs.getDocs(mods.fs.collection(db,"students"));
        currentRows=snap.docs.map(d=>({id:d.id, ...d.data()}));
      }else{
        const classes=allowedClasses();
        if(!classes.length){
          currentRows=[];
          $("#dbStatus").textContent="這個教師帳號尚未分配任何班級";
          buildClassFilter();
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
      $("#dbStatus").textContent=`最後更新：${new Date().toLocaleTimeString("zh-TW")}`;
    }catch(e){
      currentRows=[];
      render();
      $("#dbStatus").textContent="讀取失敗："+(e?.message||"未知錯誤");
    }
  }

  function exportExcel(){
    const cls=$("#classFilter").value;
    if(!cls){alert("請先選擇一個班級。");return;}
    const rows=filtered();
    if(!rows.length){alert("目前沒有資料。");return;}

    const data=rows.map(r=>{
      const uData = getStudentUnitData(r, currentUnit);
      const cfgUnit = UNIT_CONFIG[currentUnit];
      return {
        "班級":r.className||"",
        "座號":Number(r.seatNo||0),
        "姓名":r.name||"",
        "單元":cfgUnit.name,
        "星星":uData.stars,
        "滿星數":uData.maxStars,
        "評分":uData.score,
        "完成狀態":uData.completed?"已完成":"進行中",
        "目前進度":uData.currentLevel,
        "最近更新":fmtTime(r.updatedAt)
      };
    });

    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,`${cls}班_${currentUnit}`);
    XLSX.writeFile(wb,`學習進度_${cls}班_${currentUnit}.xlsx`);
  }

  async function init(){
    if(!configured()){
      $("#loginError").textContent="尚未設定 Firebase。";
      $("#loginBtn").disabled=true;
      return;
    }

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
        if(!user){
          teacherProfile=null;
          currentRows=[];
          $("#loginCard").classList.remove("hidden");
          $("#dashboard").classList.add("hidden");
          $("#logoutBtn").classList.add("hidden");
          return;
        }

        const profile=await loadTeacherProfile(user.uid);
        if(profile && (profile.role==="teacher" || profile.role==="admin")){
          teacherProfile=profile;
          $("#loginCard").classList.add("hidden");
          $("#dashboard").classList.remove("hidden");
          $("#logoutBtn").classList.remove("hidden");
          renderTeacherIdentity();
          await loadRows();
        }else{
          $("#loginError").textContent="這個帳號尚未被設定為教師或管理者。";
          await authMod.signOut(auth);
        }
      });

    }catch(e){
      $("#loginError").textContent="Firebase 初始化失敗："+e.message;
    }
  }

  $("#loginBtn").onclick=async()=>{
    $("#loginError").textContent="";
    try{
      await mods.auth.signInWithEmailAndPassword(auth,$("#email").value.trim(),$("#password").value);
    }catch(e){
      $("#loginError").textContent="登入失敗，請確認 Email、密碼與教師權限。";
    }
  };

  $("#logoutBtn").onclick=()=>mods.auth.signOut(auth);
  $("#refreshBtn").onclick=loadRows;
  $("#classFilter").onchange=render;
  $("#exportBtn").onclick=exportExcel;
  $("#closeManageBtn").onclick=()=>$("#studentManageDialog").close();
  $("#closeDetailBtn").onclick=()=>$("#progressDetailDialog").close();
  $("#closeEditBtn").onclick=()=>$("#editRecordDialog").close();
  $("#closeAccountBtn").onclick=()=>$("#accountDialog").close();
  $("#trashStudentBtn").onclick=()=>alert("回收桶功能");
  $("#closeTrashBtn").onclick=()=>$("#trashDialog").close();

  init();
})();
