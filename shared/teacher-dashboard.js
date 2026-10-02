
(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  const $=s=>document.querySelector(s);

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
      if(group.length>1){
        const merged={};
        for(const r of group){
          for(const [k,v] of Object.entries(r.progress||{})){
            merged[k]=Math.max(Number(merged[k]||0),Number(v||0));
          }
        }
        const mergedStars=progressSum(merged);
        if(mergedStars>Number(best.stars||0)){
          best.progress=merged;
          best.stars=mergedStars;
          best.score=best.totalStars
            ? Math.round(mergedStars/Number(best.totalStars)*100)
            : Number(best.score||0);
        }
      }
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

  function render(){
    const rows=filtered();
    $("#studentCount").textContent=rows.length;
    $("#avgStars").textContent=rows.length
      ? (rows.reduce((n,r)=>n+Number(r.stars||0),0)/rows.length).toFixed(1)
      : "0";
    $("#avgScore").textContent=rows.length
      ? Math.round(rows.reduce((n,r)=>n+Number(r.score||0),0)/rows.length)
      : "0";
    $("#doneCount").textContent=rows.filter(r=>r.completed).length;

    $("#rows").innerHTML=rows.map(r=>`<tr>
      <td>${esc(r.className)}</td>
      <td>${esc(r.seatNo)}</td>
      <td>${esc(r.name)}</td>
      <td>⭐ ${Number(r.stars||0)}/${Number(r.totalStars||26)}</td>
      <td>${Number(r.score||0)}</td>
      <td>${esc(r.currentStation||"")} ${r.currentChallenge?`・第 ${r.currentChallenge} 題`:""}</td>
      <td><span class="badge ${r.completed?"done":""}">${r.completed?"已完成":"進行中"}</span></td>
      <td>${esc(fmtTime(r.updatedAt))}</td>
      <td>${Number(r.duplicateCount||1)>1?`<span class="badge">已合併顯示 ${Number(r.duplicateCount)} 筆</span>`:"1 筆"}</td>
    </tr>`).join("");
  }

  function buildClassFilter(){
    const old=$("#classFilter").value;
    let classes;

    if(isAdmin()){
      classes=[...new Set(
        currentRows.map(r=>String(r.className||"")).filter(Boolean)
      )].sort();
    }else{
      classes=allowedClasses();
    }

    $("#classFilter").innerHTML=
      '<option value="">全部授權班級</option>'+
      classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");

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
    label.textContent=`${name}｜授權班級：${classes.length?classes.join("、"):"尚未設定"}`;
  }

  async function loadTeacherProfile(uid){
    const snap=await mods.fs.getDoc(mods.fs.doc(db,"teachers",uid));
    if(!snap.exists()) return null;
    return {uid,...snap.data()};
  }

  async function queryClass(className){
    const {collection,query,where,getDocs}=mods.fs;
    const q=query(
      collection(db,"students"),
      where("className","==",String(className))
    );
    const snap=await getDocs(q);
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  }

  async function loadRows(){
    $("#dbStatus").textContent="讀取資料中…";
    try{
      if(isAdmin()){
        const snap=await mods.fs.getDocs(mods.fs.collection(db,"students"));
        currentRows=snap.docs.map(d=>({id:d.id,...d.data()}));
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
      $("#dbStatus").textContent="讀取失敗："+(e?.code||e?.message||"未知錯誤");
    }
  }

  function exportExcel(){
    const cls=$("#classFilter").value;
    if(!cls){
      alert("請先選擇一個班級，再下載該班 Excel。");
      return;
    }

    if(!isAdmin() && !allowedClasses().includes(cls)){
      alert("這個教師帳號沒有此班級的匯出權限。");
      return;
    }

    const rows=filtered();
    if(!rows.length){
      alert("這個班級目前沒有資料。");
      return;
    }

    const data=rows.map(r=>({
      "班級":r.className||"",
      "座號":Number(r.seatNo||0),
      "姓名":r.name||"",
      "星星":Number(r.stars||0),
      "滿星數":Number(r.totalStars||26),
      "評分":Number(r.score||0),
      "完成狀態":r.completed?"已完成":"進行中",
      "目前進度":`${r.currentStation||""}${r.currentChallenge?` 第${r.currentChallenge}題`:""}`,
      "最近更新":fmtTime(r.updatedAt),
      "原始紀錄筆數":Number(r.duplicateCount||1)
    }));

    const ws=XLSX.utils.json_to_sheet(data);
    ws["!cols"]=[
      {wch:8},{wch:7},{wch:12},{wch:7},{wch:8},
      {wch:7},{wch:10},{wch:28},{wch:20},{wch:12}
    ];

    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,`${cls}班`);
    XLSX.writeFile(wb,`Python學習進度_${cls}班.xlsx`);
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

        if(
          profile &&
          (profile.role==="teacher" || profile.role==="admin")
        ){
          teacherProfile=profile;
          $("#loginCard").classList.add("hidden");
          $("#dashboard").classList.remove("hidden");
          $("#logoutBtn").classList.remove("hidden");
          renderTeacherIdentity();
          await loadRows();
        }else{
          $("#loginError").textContent=
            "這個帳號尚未被設定為教師或管理者。";
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
      await mods.auth.signInWithEmailAndPassword(
        auth,
        $("#email").value.trim(),
        $("#password").value
      );
    }catch(e){
      $("#loginError").textContent=
        "登入失敗，請確認 Email、密碼與教師權限。";
    }
  };

  $("#logoutBtn").onclick=()=>mods.auth.signOut(auth);
  $("#refreshBtn").onclick=loadRows;
  $("#classFilter").onchange=render;
  $("#exportBtn").onclick=exportExcel;

  init();
})();
