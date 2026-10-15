
(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let manageRow=null;
  let currentAccountRecord=null;
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
      best.sourceRecords=group.map(r=>({
        id:r.id,
        className:String(r.className||""),
        seatNo:String(r.seatNo||""),
        name:String(r.name||""),
        stars:Number(r.stars||0),
        totalStars:Number(r.totalStars||26),
        score:Number(r.score||0),
        progress:r.progress||{},
        currentStation:String(r.currentStation||""),
        currentChallenge:r.currentChallenge||"",
        completed:!!r.completed,
        certificateUnlocked:!!r.certificateUnlocked,
        updatedAt:r.updatedAt||null,
        lastSeenAt:r.lastSeenAt||null
      }));
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
      <td class="maintainCol"><button class="manageBtn" data-id="${esc(r.id)}" type="button">🛠️ 維護</button></td>
      <td>⭐ ${Number(r.stars||0)}/${Number(r.totalStars||26)}</td>
      <td>${Number(r.score||0)}</td>
      <td>${esc(r.currentStation||"")} ${r.currentChallenge?`・第 ${r.currentChallenge} 題`:""}</td>
      <td><span class="badge ${r.completed?"done":""}">${r.completed?"已完成":"進行中"}</span></td>
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
      alert("這個教師帳號沒有維護此班級的權限。");
      return;
    }

    manageRow=row;
    const dlg=$("#studentManageDialog");
    const title=$("#manageStudentTitle");
    const list=$("#manageRecordList");
    const note=$("#manageStudentNote");

    title.textContent=`${row.className} 班｜${row.seatNo} 號｜${row.name}`;
    note.textContent=Number(row.duplicateCount||1)>1
      ? `目前合併顯示 ${row.duplicateCount} 筆原始紀錄。請只刪除確認錯誤的那一筆。`
      : "這位學生目前只有 1 筆原始紀錄。";

    const records=(row.sourceRecords||[row]).slice().sort((a,b)=>
      Number(b.stars||0)-Number(a.stars||0)
    );

    list.innerHTML=records.map((rec,index)=>`
      <div class="recordCard" data-record="${esc(rec.id)}">
        <div class="recordInfo">
          <b>紀錄 ${index+1}</b>
          <span>⭐ ${Number(rec.stars||0)}/${Number(rec.totalStars||26)}</span>
          <span>${esc(rec.currentStation||"尚未開始")}${rec.currentChallenge?`・第 ${esc(rec.currentChallenge)} 題`:""}</span>
          <span>${rec.completed?"已完成":"進行中"}</span>
          <span class="status">更新：${esc(fmtTime(rec.updatedAt)||"—")}</span>
        </div>
        <div class="recordActions">
          <button class="detailRecordBtn soft" type="button" data-docid="${esc(rec.id)}">📊 關卡明細</button>
          <button class="editRecordBtn soft" type="button" data-docid="${esc(rec.id)}">✏️ 更正資料</button>
          <button class="accountRecordBtn soft" type="button" data-docid="${esc(rec.id)}">🔑 帳號／密碼</button>
          <button class="resetRecordBtn warningBtn" type="button" data-docid="${esc(rec.id)}">↺ 重設進度</button>
          <button class="deleteRecordBtn danger" type="button"
            data-docid="${esc(rec.id)}"
            data-class="${esc(rec.className)}"
            data-seat="${esc(rec.seatNo)}"
            data-name="${esc(rec.name)}">
            🗑️ 刪除此筆
          </button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".deleteRecordBtn").forEach(btn=>{
      btn.addEventListener("click",()=>deleteStudentRecord(btn.dataset));
    });
    list.querySelectorAll(".detailRecordBtn").forEach(btn=>{
      btn.addEventListener("click",()=>showProgressDetail(records.find(r=>String(r.id)===String(btn.dataset.docid))));
    });
    list.querySelectorAll(".editRecordBtn").forEach(btn=>{
      btn.addEventListener("click",()=>openEditRecord(records.find(r=>String(r.id)===String(btn.dataset.docid))));
    });
    list.querySelectorAll(".accountRecordBtn").forEach(btn=>{
      btn.addEventListener("click",()=>openAccountDialog(records.find(r=>String(r.id)===String(btn.dataset.docid))));
    });
    list.querySelectorAll(".resetRecordBtn").forEach(btn=>{
      btn.addEventListener("click",()=>resetStudentProgress(records.find(r=>String(r.id)===String(btn.dataset.docid))));
    });

    dlg.showModal();
  }


  function normalizedSeat(seatNo){
    return String(Number(String(seatNo||"").trim())).padStart(2,"0");
  }

  function expectedStudentEmail(className,seatNo){
    return `python1151-${String(className||"").trim()}-${normalizedSeat(seatNo)}@student.course115.local`;
  }

  function openAccountDialog(rec){
    if(!rec)return;
    if(!canManageClass(rec.className)){
      alert("你沒有維護此班級學生帳號的權限。");
      return;
    }

    currentAccountRecord=rec;
    $("#accountStudentTitle").textContent=
      `${rec.className} 班｜${rec.seatNo} 號｜${rec.name}`;

    $("#accountUid").textContent=rec.id||"";
    $("#accountEmail").textContent=expectedStudentEmail(rec.className,rec.seatNo);
    $("#accountStatus").textContent="";
    $("#tempPasswordBox").hidden=true;
    $("#tempPasswordValue").textContent="";

    const endpoint=String(window.COURSE116_PASSWORD_RESET_URL||"").trim();
    $("#resetPasswordBtn").disabled=!endpoint;
    $("#resetPasswordBtn").textContent=endpoint
      ? "🔑 一鍵重設學生密碼"
      : "🔒 尚未設定密碼重設後端";

    $("#accountDialog").showModal();
  }

  async function copyText(text,label){
    try{
      await navigator.clipboard.writeText(text);
      $("#accountStatus").textContent=`已複製${label}。`;
    }catch(e){
      $("#accountStatus").textContent=`無法自動複製，請手動選取${label}。`;
    }
  }


  function temporaryPasswordMessage(name,className,seatNo){
    return `確定要重設「${className} 班 ${seatNo} 號 ${name}」的登入密碼嗎？

重設後原密碼會立即失效，系統會產生一次性臨時密碼。`;
  }

  async function resetStudentPassword(){
    const rec=currentAccountRecord;
    if(!rec)return;

    const endpoint=String(window.COURSE116_PASSWORD_RESET_URL||"").trim();
    if(!endpoint){
      $("#accountStatus").textContent="尚未設定密碼重設後端網址。";
      return;
    }
    if(!canManageClass(rec.className)){
      $("#accountStatus").textContent="你沒有維護此班級學生帳號的權限。";
      return;
    }
    if(!confirm(temporaryPasswordMessage(rec.name,rec.className,rec.seatNo)))return;

    const btn=$("#resetPasswordBtn");
    btn.disabled=true;
    btn.textContent="⏳ 正在重設…";
    $("#accountStatus").textContent="正在驗證教師權限並重設密碼…";
    $("#tempPasswordBox").hidden=true;

    try{
      const user=auth?.currentUser;
      if(!user)throw Error("教師登入已失效，請重新登入教師端。");
      const idToken=await user.getIdToken(true);

      const res=await fetch(endpoint.replace(/\/$/,"")+"/reset-student-password",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer "+idToken
        },
        body:JSON.stringify({studentUid:String(rec.id||"")})
      });

      let data={};
      try{data=await res.json();}catch(e){}

      if(!res.ok||!data.ok){
        throw Error(data.message||data.error||`後端回應 ${res.status}`);
      }

      $("#tempPasswordValue").textContent=data.temporaryPassword||"";
      $("#tempPasswordBox").hidden=false;
      $("#accountStatus").textContent="✅ 密碼已重設。請把臨時密碼交給該學生。";
    }catch(e){
      console.error(e);
      $("#accountStatus").textContent="重設失敗："+(e?.message||String(e));
    }finally{
      btn.disabled=false;
      btn.textContent="🔑 一鍵重設學生密碼";
    }
  }


  function progressRows(progress){
    const needs={p1:2,p2:3,p3:3,p4:2,p5:3,p6:2,p7:2,p8:3,p9:3,p10:3};
    return Object.entries(needs).map(([id,total])=>{
      const done=Math.max(0,Math.min(total,Number(progress?.[id]||0)));
      return {id:id.toUpperCase(),done,total,complete:done>=total};
    });
  }

  function showProgressDetail(rec){
    if(!rec)return;
    const rows=progressRows(rec.progress);
    $("#detailTitle").textContent=`${rec.className} 班｜${rec.seatNo} 號｜${rec.name}`;
    $("#progressDetailBody").innerHTML=rows.map(r=>`
      <tr>
        <td>${r.id}</td>
        <td>${r.done} / ${r.total}</td>
        <td>${r.complete?'<span class="badge done">完成</span>':'<span class="badge">進行中</span>'}</td>
      </tr>
    `).join("");
    $("#progressDetailSummary").textContent=
      `總星星 ${Number(rec.stars||0)}/${Number(rec.totalStars||26)}｜評分 ${Number(rec.score||0)}｜${rec.completed?"全部完成":"尚未全部完成"}`;
    $("#progressDetailDialog").showModal();
  }

  function openEditRecord(rec){
    if(!rec)return;
    if(!canManageClass(rec.className)){
      alert("你沒有維護此班級資料的權限。");
      return;
    }
    $("#editDocId").value=rec.id;
    $("#editOriginalClass").value=rec.className;
    $("#editClassName").value=rec.className;
    $("#editSeatNo").value=rec.seatNo;
    $("#editStudentName").value=rec.name;
    $("#editRecordError").textContent="";
    $("#editAccountWarning").textContent=
      "🔒 學生端已無法自行修改班級、座號與姓名，只有教師可在此更正。注意：若學生已建立學習帳號，班級／座號同時也是登入識別的一部分；免 Functions 版本無法同步修改 Firebase Authentication 登入帳號，因此更正班級或座號前請先確認，學生之後可能仍需用原班級／座號登入。";
    $("#editRecordDialog").showModal();
  }

  function validEditFields(className,seatNo,name){
    if(!/^[1-9][0-9]{2}$/.test(className)) return "班級請輸入 3 位數，例如 701、802、910。";
    if(!/^(?:[1-9]|[1-9][0-9])$/.test(seatNo)) return "座號請輸入 1～99，不要加「號」或前導 0。";
    if(name.length<2||name.length>20||!/^[\u3400-\u9FFF A-Za-z·・．'’-]+$/.test(name))
      return "姓名請輸入 2～20 個中文字或英文字母。";
    return "";
  }

  async function seatConflict(className,seatNo,excludeId){
    const {collection,query,where,getDocs}=mods.fs;
    const q=query(
      collection(db,"students"),
      where("className","==",String(className)),
      where("seatNo","==",String(seatNo))
    );
    const snap=await getDocs(q);
    return snap.docs.some(d=>d.id!==excludeId);
  }

  async function saveEditedRecord(){
    const docid=$("#editDocId").value;
    const originalClass=$("#editOriginalClass").value;
    const className=$("#editClassName").value.trim();
    const seatNo=String(Number($("#editSeatNo").value.trim()||0));
    const name=$("#editStudentName").value.trim();
    const err=$("#editRecordError");

    const msg=validEditFields(className,seatNo,name);
    if(msg){err.textContent=msg;return;}

    if(!canManageClass(originalClass) || !canManageClass(className)){
      err.textContent="只能把學生資料維護在你被授權的班級範圍內。";
      return;
    }

    try{
      err.textContent="正在檢查班級與座號…";
      if(await seatConflict(className,seatNo,docid)){
        err.textContent=`${className} 班 ${seatNo} 號已經有其他學生紀錄，請先確認是否為重複資料。`;
        return;
      }

      const ok=confirm(
        `確定儲存學生資料更正？\n\n`+
        `${originalClass} 班 → ${className} 班\n`+
        `座號：${seatNo}\n姓名：${name}`
      );
      if(!ok){err.textContent="";return;}

      err.textContent="正在儲存…";
      await mods.fs.updateDoc(mods.fs.doc(db,"students",docid),{
        className,seatNo,name,
        updatedAt:mods.fs.serverTimestamp()
      });
      $("#editRecordDialog").close();
      $("#studentManageDialog").close();
      await loadRows();
    }catch(e){
      err.textContent="儲存失敗："+(e?.code||e?.message||"未知錯誤");
    }
  }

  async function resetStudentProgress(rec){
    if(!rec)return;
    if(!canManageClass(rec.className)){
      alert("你沒有重設此班級學生進度的權限。");
      return;
    }
    const typed=prompt(
      `這會把 ${rec.className} 班 ${rec.seatNo} 號 ${rec.name} 的 Python 進度歸零。\n\n`+
      `請輸入「重設」兩個字確認：`
    );
    if(typed!=="重設")return;

    try{
      $("#manageDeleteStatus").textContent="正在重設進度…";
      await mods.fs.updateDoc(mods.fs.doc(db,"students",rec.id),{
        stars:0,
        score:0,
        progress:{},
        completed:false,
        certificateUnlocked:false,
        currentStation:"P1",
        currentChallenge:1,
        updatedAt:mods.fs.serverTimestamp()
      });
      $("#studentManageDialog").close();
      await loadRows();
    }catch(e){
      $("#manageDeleteStatus").textContent="";
      alert("重設失敗："+(e?.code||e?.message||"未知錯誤"));
    }
  }

  async function deleteStudentRecord(data){
    const className=String(data.class||"");
    if(!canManageClass(className)){
      alert("你沒有刪除此班級資料的權限。");
      return;
    }

    const ok=confirm(
      `確定刪除這筆學生紀錄？\\n\\n`+
      `${className} 班 ${data.seat} 號 ${data.name}\\n\\n`+
      `刪除後無法從教師端復原。`
    );
    if(!ok)return;

    try{
      $("#manageDeleteStatus").textContent="正在刪除…";
      await mods.fs.deleteDoc(mods.fs.doc(db,"students",data.docid));
      $("#manageDeleteStatus").textContent="已刪除。正在重新讀取資料…";
      $("#studentManageDialog").close();
      await loadRows();
    }catch(e){
      $("#manageDeleteStatus").textContent="";
      alert("刪除失敗："+(e?.code||e?.message||"未知錯誤"));
    }
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
  $("#closeManageBtn").onclick=()=>{
    $("#manageDeleteStatus").textContent="";
    $("#studentManageDialog").close();
  };
  $("#closeDetailBtn").onclick=()=>$("#progressDetailDialog").close();
  $("#closeEditBtn").onclick=()=>$("#editRecordDialog").close();
  $("#saveEditBtn").onclick=saveEditedRecord;
  $("#closeAccountBtn").onclick=()=>$("#accountDialog").close();
  $("#copyUidBtn").onclick=()=>copyText($("#accountUid").textContent," UID");
  $("#copyEmailBtn").onclick=()=>copyText($("#accountEmail").textContent,"學習帳號");
  $("#copyTempPasswordBtn").onclick=()=>copyText($("#tempPasswordValue").textContent,"臨時密碼");
  $("#resetPasswordBtn").onclick=resetStudentPassword;

  init();
})();
