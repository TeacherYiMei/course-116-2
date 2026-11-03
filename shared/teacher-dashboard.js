(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let manageRow=null;
  let currentAccountRecord=null;
  let currentUnit="python"; // 預設顯示 Python
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
        certificateUnlocked:!!r.certificateUnlocked,
        updatedAt:r.updatedAt||null,
        lastSeenAt:r.lastSeenAt||null
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

  function getStudentUnitData(r, unitKey){
    const modsData = r.modules || {};
    
    if(unitKey === "python"){
      const stars = Number(r.stars || modsData.python?.stars || progressSum(r.progress) || 0);
      const maxStars = 30;
      const score = Number(r.score || (maxStars ? Math.round(stars/maxStars*100) : 0));
      const completed = !!r.completed || !!modsData.python?.completed || stars >= maxStars;
      const station = r.currentStation || modsData.python?.currentStation || "P1";
      const chal = r.currentChallenge || modsData.python?.currentChallenge || 1;
      const currentLevel = `${station}${chal ? `・第 ${chal} 題` : ""}`;
      return { stars: Math.min(maxStars, stars), maxStars, score: Math.min(100, score), completed, currentLevel };
    }

    let unitObj = modsData[unitKey] || r[unitKey] || {};
    if(unitKey === "unit1") {
      unitObj = modsData.unit1 || r.unit1 || r.digital || r.ch1 || {};
    } else if(unitKey === "unit3") {
      unitObj = modsData.unit3 || r.unit3 || r.system || r.systemPlatform || r.ch3 || {};
    } else if(unitKey === "aiot") {
      unitObj = modsData.aiot || r.aiot || r.project5016B || r.unit4 || r.ch4 || {};
    }

    const cfgUnit = UNIT_CONFIG[unitKey];
    const maxStars = cfgUnit.maxStars;
    const stars = Number(unitObj.stars || unitObj.score || 0);
    const score = Number(unitObj.score || Math.round(stars / maxStars * 100));
    const completed = !!unitObj.completed || stars >= maxStars;
    const currentLevel = unitObj.currentLevel || (stars > 0 ? "進行中" : "尚未開始");

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
          <span>⭐ ${Number(rec.stars||0)}/${Number(rec.totalStars||30)}</span>
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
            🗃️ 移到回收桶
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
      ? "🛠️ 修復登入帳號＋重設密碼"
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
    const email=expectedStudentEmail(className,seatNo);
    return `確定要修復「${className} 班 ${seatNo} 號 ${name}」的登入帳號並重設密碼嗎？\n\n系統會把 Firebase Authentication 登入帳號校正為：\n${email}\n\n並產生一次性臨時密碼。`;
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
      $("#accountEmail").textContent=data.loginEmail||expectedStudentEmail(rec.className,rec.seatNo);
      $("#accountStatus").textContent="✅ 登入帳號已校正，密碼也已重設。請把臨時密碼交給該學生。";
    }catch(e){
      console.error(e);
      $("#accountStatus").textContent="重設失敗："+(e?.message||String(e));
    }finally{
      btn.disabled=false;
      btn.textContent="🛠️ 修復登入帳號＋重設密碼";
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
      `總星星 ${Number(rec.stars||0)}/${Number(rec.totalStars||30)}｜評分 ${Number(rec.score||0)}｜${rec.completed?"全部完成":"尚未全部完成"}`;
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
      "🔒 學生端已無法自行修改班級、座號與姓名，只有教師可在此更正。";
    $("#editRecordDialog").showModal();
  }

  function validEditFields(className,seatNo,name){
    if(!/^[1-9][0-9]{2}$/.test(className)) return "班級請輸入 3 位數，例如 701、802、910。";
    if(!/^(?:[1-9]|[1-9][0-9])$/.test(seatNo)) return "座號請輸入 1～99。";
    if(name.length<2||name.length>20||!/^[㐀-鿿 A-Za-z·・．'’-]+$/.test(name))
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
        err.textContent=`${className} 班 ${seatNo} 號已經有其他學生紀錄。`;
        return;
      }

      const ok=confirm(`確定儲存學生資料更正？\n\n${originalClass} 班 → ${className} 班\n座號：${seatNo}\n姓名：${name}`);
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
    const typed=prompt(`這會把 ${rec.className} 班 ${rec.seatNo} 號 ${rec.name} 的 Python 進度歸零。\n\n請輸入「重設」兩個字確認：`);
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

  async function apiPost(path,payload){
    const endpoint=String(window.COURSE116_PASSWORD_RESET_URL||"").trim();
    if(!endpoint)throw Error("尚未設定後端網址");
    const user=auth?.currentUser;
    if(!user)throw Error("教師登入已失效，請重新登入教師端。");
    const idToken=await user.getIdToken(true);
    const res=await fetch(endpoint.replace(/\/$/,"")+path,{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+idToken},
      body:JSON.stringify(payload||{})
    });
    let data={};try{data=await res.json();}catch(e){}
    if(!res.ok||!data.ok)throw Error(data.message||data.error||`後端回應 ${res.status}`);
    return data;
  }

  async function deleteStudentRecord(data){
    const className=String(data.class||"");
    if(!canManageClass(className)){
      alert("你沒有刪除此班級資料的權限。");
      return;
    }
    const ok=confirm(`確定要把 ${className} 班 ${data.seat} 號 ${data.name} 移到回收桶嗎？`);
    if(!ok)return;
    const uid=String(data.docid||"");
    try{
      $("#manageDeleteStatus").textContent="正在移到回收桶…";
      const studentRef=mods.fs.doc(db,"students",uid);
      const snap=await mods.fs.getDoc(studentRef);
      if(!snap.exists())throw Error("找不到學生資料。");
      const rec=snap.data()||{};
      if(!canManageClass(rec.className))throw Error("你沒有維護此班級的權限。");
      await mods.fs.setDoc(mods.fs.doc(db,"deletedStudents",uid),{
        ...rec,
        _deletedAt:mods.fs.serverTimestamp(),
        _deletedBy:auth.currentUser?.uid||"",
        _deletedUid:uid
      });
      await mods.fs.deleteDoc(studentRef);
      $("#studentManageDialog").close();
      await loadRows();
      alert(`${className} 班 ${data.seat} 號 ${data.name} 已移到回收桶。`);
    }catch(e){
      $("#manageDeleteStatus").textContent="";
      alert("移到回收桶失敗："+(e?.message||"未知錯誤"));
    }
  }

  async function runRescueStudent(){
    const className=$("#rescueClass").value.trim();
    const seatNo=$("#rescueSeat").value.trim();
    const name=$("#rescueName").value.trim();
    if(!className||!seatNo||!name){$("#rescueStatus").textContent="請輸入班級、座號與姓名。";return;}
    if(!canManageClass(className)){ $("#rescueStatus").textContent="你沒有維護此班級的權限。";return; }
    const btn=$("#runRescueBtn");btn.disabled=true;btn.textContent="救援中…";
    $("#rescueStatus").textContent="正在尋找帳號…";
    try{
      const data=await apiPost("/rescue-student",{className,seatNo,name});
      $("#rescueResult").hidden=false;
      $("#rescueResult").innerHTML=`<b>✅ 救援完成</b><br>登入帳號：<code>${esc(data.loginEmail||"")}</code><br>臨時密碼：<code>${esc(data.temporaryPassword||"")}</code>`;
      $("#rescueStatus").textContent="請將臨時密碼交給學生登入。";
      await loadRows();
    }catch(e){
      $("#rescueStatus").textContent="救援失敗："+(e?.message||"未知錯誤");
    }finally{btn.disabled=false;btn.textContent="開始救援";}
  }

  async function loadTrashRows(){
    const out=[];
    if(isAdmin()){
      const snap=await mods.fs.getDocs(mods.fs.collection(db,"deletedStudents"));
      snap.forEach(d=>out.push({id:d.id,...d.data()}));
    }else{
      for(const cls of allowedClasses()){
        const q=mods.fs.query(mods.fs.collection(db,"deletedStudents"),mods.fs.where("className","==",String(cls)));
        const snap=await mods.fs.getDocs(q);
        snap.forEach(d=>out.push({id:d.id,...d.data()}));
      }
    }
    return out.sort((a,b)=>(String(a.className||"")+String(a.seatNo||"")).localeCompare(String(b.className||"")+String(b.seatNo||""),"zh-Hant"));
  }

  async function openTrash(){
    $("#trashDialog").showModal();
    $("#trashStatus").textContent="讀取回收桶…";$("#trashList").innerHTML="";
    try{
      const rows=await loadTrashRows();
      $("#trashStatus").textContent=rows.length?`共 ${rows.length} 筆可復原紀錄。`:"回收桶目前是空的。";
      $("#trashList").innerHTML=rows.map(r=>`<div class="trashCard"><div class="row"><b>${esc(r.className)} 班 ${esc(r.seatNo)} 號｜${esc(r.name)}</b><span>⭐ ${Number(r.stars||0)}</span></div><div class="meta">刪除時間：${esc(fmtTime(r._deletedAt)||"—")}</div><div class="actions"><button class="restoreTrashBtn soft" data-uid="${esc(r.id)}" type="button">↩️ 一鍵復原</button><button class="purgeTrashBtn danger" data-uid="${esc(r.id)}" data-label="${esc(r.className)} 班 ${esc(r.seatNo)} 號 ${esc(r.name)}" type="button">永久刪除</button></div></div>`).join("");
      $("#trashList").querySelectorAll(".restoreTrashBtn").forEach(b=>b.onclick=()=>restoreTrashStudent(b.dataset.uid));
      $("#trashList").querySelectorAll(".purgeTrashBtn").forEach(b=>b.onclick=()=>purgeTrashStudent(b.dataset.uid,b.dataset.label));
    }catch(e){$("#trashStatus").textContent="讀取失敗："+(e?.message||"未知錯誤");}
  }

  async function restoreTrashStudent(uid){
    try{
      $("#trashStatus").textContent="正在復原學生…";
      const trashRef=mods.fs.doc(db,"deletedStudents",String(uid||""));
      const snap=await mods.fs.getDoc(trashRef);
      if(!snap.exists())throw Error("找不到這筆資料。");
      const rec={...snap.data()};
      if(!canManageClass(rec.className))throw Error("你沒有維護此班級的權限。");
      delete rec._deletedAt;delete rec._deletedBy;delete rec._deletedUid;
      await mods.fs.setDoc(mods.fs.doc(db,"students",String(uid||"")),rec);
      await mods.fs.deleteDoc(trashRef);
      $("#trashStatus").textContent="✅ 已復原學生。";
      await openTrash();await loadRows();
    }catch(e){$("#trashStatus").textContent="復原失敗："+(e?.message||"未知錯誤");}
  }

  async function purgeTrashStudent(uid,label){
    const ok=confirm(`確定要永久刪除 ${label} 嗎？`);
    if(!ok)return;
    try{
      $("#trashStatus").textContent="正在永久刪除…";
      await apiPost("/permanently-delete-student",{studentUid:String(uid||"")});
      await openTrash();
    }catch(e){$("#trashStatus").textContent="永久刪除失敗："+(e?.message||"未知錯誤");}
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
    label.textContent=`${name}｜授權班級：${classes.length?classes.join("、"):"尚未設定"}`;
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
    if(!cls){alert("請先選擇一個班級。");return;}
    if(!isAdmin() && !allowedClasses().includes(cls)){alert("沒有權限。");return;}
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
  $("#trashStudentBtn").onclick=openTrash;
  $("#runRescueBtn").onclick=runRescueStudent;
  $("#closeTrashBtn").onclick=()=>$("#trashDialog".close());

  init();
})();
