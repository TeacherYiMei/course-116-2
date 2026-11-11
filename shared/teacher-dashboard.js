(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let manageRow=null;
  let currentAccountRecord=null;
  let currentUnit="all"; 
  const $=s=>document.querySelector(s);

  const UNIT_CONFIG = {
    all:    { name: "全學期四單元總覽", maxStars: 93, title: "📊 116 資訊科技｜四單元總覽" },
    unit1:  { name: "單元一：數位時代", maxStars: 24, title: "💾 單元一：數位時代｜教師端" },
    python: { name: "單元二：進入 Python 的世界", maxStars: 30, title: "👩‍🏫 Python 學習進度｜教師端" },
    unit3:  { name: "單元三：系統平臺大冒險", maxStars: 24, title: "🖥️ 單元三：系統平臺大冒險｜教師端" },
    aiot:   { name: "延伸專題：5016B AIoT 守護站", maxStars: 15, title: "💡 5016B AIoT 智慧教室守護站｜教師端" }
  };

  const configured=()=>!!(cfg.enabled && cfg.apiKey && !String(cfg.apiKey).startsWith("PASTE_"));
  function esc(x){ return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
  function fmtTime(v){ try{ return v&&typeof v.toDate==="function" ? v.toDate().toLocaleString("zh-TW") : ""; }catch(e){return ""} }
  function seatSort(a,b){ return Number(a.seatNo||999)-Number(b.seatNo||999) || String(a.name||"").localeCompare(String(b.name||""),"zh-Hant"); }
  function progressSum(progress){ return Object.values(progress||{}).reduce((n,v)=>n+Number(v||0),0); }

  function mergeDuplicateStudents(rows){
    const groups=new Map();
    for(const row of rows){
      const key=`${String(row.className||"").trim()}::${String(row.seatNo||"").trim()}`;
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.values()].map(group=>{
      group.sort((a,b)=> Number(b.stars||0)-Number(a.stars||0) || progressSum(b.progress)-progressSum(a.progress));
      const best={...group[0]};
      best.duplicateCount=group.length;
      best.sourceRecords=group.map(r=>({
        id:r.id, className:String(r.className||""), seatNo:String(r.seatNo||""), name:String(r.name||""),
        stars:Number(r.stars||0), totalStars:Number(r.totalStars||30), score:Number(r.score||0), progress:r.progress||{},
        currentStation:String(r.currentStation||""), currentChallenge:r.currentChallenge||"", completed:!!r.completed,
        certificateUnlocked:!!r.certificateUnlocked, updatedAt:r.updatedAt||null, lastSeenAt:r.lastSeenAt||null,
        modules:r.modules||{}, unit1Stars:r.unit1Stars||0, unit3Stars:r.unit3Stars||0, aiotStars:r.aiotStars||0,
        lastSync:r.lastSync||null
      }));
      if(group.length>1){
        const merged={};
        for(const r of group) {
          for(const [k,v] of Object.entries(r.progress||{})){ merged[k]=Math.max(Number(merged[k]||0),Number(v||0)); }
        }
        const mergedStars=progressSum(merged);
        if(mergedStars>Number(best.stars||0)){
          best.progress=merged; best.stars=mergedStars;
          best.score=best.totalStars ? Math.round(mergedStars/Number(best.totalStars)*100) : Number(best.score||0);
        }
      }
      return best;
    });
  }

  function isAdmin(){ return teacherProfile?.role==="admin"; }
  function allowedClasses(){ return isAdmin() ? null : Array.isArray(teacherProfile?.classes) ? teacherProfile.classes.map(String).filter(Boolean).sort() : []; }
  function canManageClass(className){ return isAdmin() || allowedClasses().includes(String(className)); }
  function filtered(){ const cls=$("#classFilter").value; return currentRows.filter(r=>!cls || String(r.className)===cls).sort(seatSort); }

  function findModule(mods, keys) {
    if(!mods) return {};
    for(let k of keys) { if(mods[k]) return mods[k]; }
    for(let k in mods) {
      const kl = k.toLowerCase();
      if(keys.some(pk => kl.includes(pk))) return mods[k];
    }
    return {};
  }

  function getStudentUnitData(r, unitKey){
    const cfgUnit = UNIT_CONFIG[unitKey];
    const maxStars = cfgUnit.maxStars;
    const modsData = r.modules || (r.progress && r.progress._mods) || {};

    if(unitKey === "python"){
      let stars = Number(modsData.python?.stars ?? r.stars ?? progressSum(r.progress) ?? 0);
      const score = Number(modsData.python?.score ?? r.score ?? (maxStars ? Math.round(stars/maxStars*100) : 0));
      const completed = !!(modsData.python?.completed || r.completed || stars >= maxStars);
      let currentLevel = modsData.python?.currentLevel || (stars > 0 ? "進行中" : "尚未開始");
      return { stars: Math.min(maxStars, stars), maxStars, score: Math.min(100, score), completed, currentLevel };
    }

    let unitObj = {};
    if(unitKey === "unit1") unitObj = findModule(modsData, ["unit1", "digital", "u1", "ch1"]);
    else if(unitKey === "unit3") unitObj = findModule(modsData, ["unit3", "platform", "system", "u3", "ch3"]);
    else if(unitKey === "aiot") unitObj = findModule(modsData, ["aiot", "arduino", "5016", "u4", "ch4"]);

    let stars = Number(unitObj.stars || 0);
    if (stars === 0 && unitObj.levels) {
       stars = Object.values(unitObj.levels).reduce((sum, lvl) => sum + Number(lvl.stars || 0), 0);
    }
    if (stars === 0) {
       if (unitKey === "unit1") stars = Number(r.unit1Stars || (r.progress && r.progress._u1) || 0);
       if (unitKey === "unit3") stars = Number(r.unit3Stars || (r.progress && r.progress._u3) || 0);
       if (unitKey === "aiot") stars = Number(r.aiotStars || (r.progress && r.progress._aiot) || 0);
    }

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
    let doneCount = 0;
    
    // 更新上方統計 (以 Python 單元為代表，或是用 All)
    // 依據使用者的需求，我們直接在表格顯示獨立單元，所以總和和平均可以只算總星數
    let totalStarsSum = 0; let totalScoreSum = 0;

    const mappedRows = rows.map(r=>{
      const d1 = getStudentUnitData(r, "unit1");
      const d2 = getStudentUnitData(r, "python");
      const d3 = getStudentUnitData(r, "unit3");
      const d4 = getStudentUnitData(r, "aiot");
      const dall = getStudentUnitData(r, "all");
      
      totalStarsSum += dall.stars; 
      totalScoreSum += dall.score;
      if(dall.completed) doneCount++;
      
      return { ...r, _d1: d1, _d2: d2, _d3: d3, _d4: d4, _dall: dall };
    });

    if($("#studentCount")) $("#studentCount").textContent = rows.length;
    if($("#avgStars")) $("#avgStars").textContent = rows.length ? (totalStarsSum/rows.length).toFixed(1) : "0";
    if($("#avgScore")) $("#avgScore").textContent = rows.length ? Math.round(totalScoreSum/rows.length) : "0";
    if($("#doneCount")) $("#doneCount").textContent = doneCount;

    // 重新繪製表格標題，顯示所有單元
    const thead = document.querySelector(".tableWrap thead tr");
    if (thead) {
        thead.innerHTML = `
            <th>班級</th><th>座號</th><th>姓名</th><th>維護</th>
            <th>數位(24)</th><th>Py(30)</th><th>系統(24)</th><th>AIoT(15)</th>
            <th>總星(93)</th><th>同步時間</th><th>紀錄</th>
        `;
    }

    if($("#rows")) {
      $("#rows").innerHTML = mappedRows.map(r=>`<tr>
        <td>${esc(r.className)}</td>
        <td>${esc(r.seatNo)}</td>
        <td>${esc(r.name)}</td>
        <td class="maintainCol"><button class="manageBtn" data-id="${esc(r.id)}" type="button">🛠️ 維護</button></td>
        <td style="font-size:1.1rem; font-weight:bold; color:#1e293b;">${r._d1.stars}</td>
        <td style="font-size:1.1rem; font-weight:bold; color:#1e293b;">${r._d2.stars}</td>
        <td style="font-size:1.1rem; font-weight:bold; color:#1e293b;">${r._d3.stars}</td>
        <td style="font-size:1.1rem; font-weight:bold; color:#1e293b;">${r._d4.stars}</td>
        <td style="font-size:1.2rem; font-weight:900; color:#2563eb;">${r._dall.stars}</td>
        <td style="font-size:0.8rem; color:#64748b;">${r.lastSync ? new Date(r.lastSync).toLocaleString('zh-TW', {month:'numeric', day:'numeric', hour:'numeric', minute:'numeric'}) : '—'}</td>
        <td>${Number(r.duplicateCount||1)>1?`<span class="badge">已合併顯示 ${Number(r.duplicateCount)} 筆</span>`:"1 筆"}</td>
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
          <label class="small bold">數位時代 (上限 24)<input type="number" id="editUnit1Stars" value="${d1.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">Python (上限 30)<input type="number" id="editPythonStars" value="${d2.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">系統平臺 (上限 24)<input type="number" id="editUnit3Stars" value="${d3.stars}" class="input" style="width:100%;"></label>
          <label class="small bold">AIoT專題 (上限 15)<input type="number" id="editAiotStars" value="${d4.stars}" class="input" style="width:100%;"></label>
        </div>
        <button id="saveManualStarsBtn" class="btn primary mt1" style="width:100%;">💾 儲存手動星星數</button>
        <div id="manualStarStatus" class="small bold mt1"></div>
      </div>
    `;

    html += records.map((rec,index)=>`
      <div class="recordCard" data-record="${esc(rec.id)}">
        <div class="recordInfo">
          <b>紀錄 ${index+1}</b>
          <span>總⭐ ${Number(rec.stars||0) + Number(rec.unit1Stars||0) + Number(rec.unit3Stars||0)} 顆</span>
          <span class="status">更新：${esc(fmtTime(rec.updatedAt)||"—")}</span>
        </div>
        <div class="recordActions">
          <button class="detailRecordBtn btn sm" type="button" data-docid="${esc(rec.id)}">📊 明細</button>
          <button class="editRecordBtn btn sm" type="button" data-docid="${esc(rec.id)}">✏️ 更正</button>
          <button class="accountRecordBtn btn sm" type="button" data-docid="${esc(rec.id)}">🔑 帳號</button>
          <button class="resetRecordBtn btn sm" type="button" data-docid="${esc(rec.id)}">↺ 重設</button>
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
            "modules.digital.stars": u1, "modules.digital.completed": u1 >= 24, "modules.digital.currentLevel": u1>0?"手動補登":"尚未開始",
            "modules.python.stars": py, "stars": py,
            "modules.platform.stars": u3, "modules.platform.completed": u3 >= 24, "modules.platform.currentLevel": u3>0?"手動補登":"尚未開始",
            "modules.aiot.stars": a4, "modules.aiot.completed": a4 >= 15, "modules.aiot.currentLevel": a4>0?"手動補登":"尚未開始",
            "progress._u1": u1, "progress._u3": u3, "progress._aiot": a4,
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
      list.querySelectorAll(".detailRecordBtn").forEach(btn=>btn.addEventListener("click",()=>showProgressDetail(records.find(r=>String(r.id)===String(btn.dataset.docid)))));
      list.querySelectorAll(".editRecordBtn").forEach(btn=>btn.addEventListener("click",()=>openEditRecord(records.find(r=>String(r.id)===String(btn.dataset.docid)))));
      list.querySelectorAll(".accountRecordBtn").forEach(btn=>btn.addEventListener("click",()=>openAccountDialog(records.find(r=>String(r.id)===String(btn.dataset.docid)))));
      list.querySelectorAll(".resetRecordBtn").forEach(btn=>btn.addEventListener("click",()=>resetStudentProgress(records.find(r=>String(r.id)===String(btn.dataset.docid)))));
    }
    if(dlg) dlg.showModal();
  }

  /* --- 帳號與救援、回收桶功能 --- */
  function normalizedSeat(seatNo){ return String(Number(String(seatNo||"").trim())).padStart(2,"0"); }
  function expectedStudentEmail(className,seatNo){ return `python1151-${String(className||"").trim()}-${normalizedSeat(seatNo)}@student.course115.local`; }

  function openAccountDialog(rec){
    if(!rec)return;
    if(!canManageClass(rec.className)){ alert("你沒有維護此班級學生帳號的權限。"); return; }
    currentAccountRecord=rec;
    if($("#accountStudentTitle")) $("#accountStudentTitle").textContent=`${rec.className} 班｜${rec.seatNo} 號｜${rec.name}`;
    if($("#accountUid")) $("#accountUid").textContent=rec.id||"";
    if($("#accountEmail")) $("#accountEmail").textContent=expectedStudentEmail(rec.className,rec.seatNo);
    if($("#accountStatus")) $("#accountStatus").textContent="";
    if($("#tempPasswordBox")) $("#tempPasswordBox").hidden=true;
    if($("#tempPasswordValue")) $("#tempPasswordValue").textContent="";
    const endpoint=String(window.COURSE116_PASSWORD_RESET_URL||"").trim();
    if($("#resetPasswordBtn")) {
      $("#resetPasswordBtn").disabled=!endpoint;
      $("#resetPasswordBtn").textContent=endpoint ? "🛠️ 修復登入帳號＋重設密碼" : "🔒 尚未設定密碼重設後端";
    }
    if($("#accountDialog")) $("#accountDialog").showModal();
  }

  async function copyText(text,label){
    try{ await navigator.clipboard.writeText(text); if($("#accountStatus")) $("#accountStatus").textContent=`已複製${label}。`;
    }catch(e){ if($("#accountStatus")) $("#accountStatus").textContent=`無法自動複製，請手動選取${label}。`; }
  }

  async function resetStudentPassword(){
    const rec=currentAccountRecord; if(!rec)return;
    const endpoint=String(window.COURSE116_PASSWORD_RESET_URL||"").trim();
    if(!endpoint){ $("#accountStatus").textContent="尚未設定密碼重設後端網址。"; return; }
    if(!confirm(`確定要修復「${rec.className} 班 ${rec.seatNo} 號 ${rec.name}」並重設密碼嗎？
系統會產生臨時密碼。`))return;
    const btn=$("#resetPasswordBtn"); btn.disabled=true; btn.textContent="⏳ 正在重設…";
    $("#accountStatus").textContent="正在驗證教師權限並重設密碼…";
    try{
      const user=auth?.currentUser; if(!user)throw Error("教師登入已失效，請重新登入教師端。");
      const idToken=await user.getIdToken(true);
      const res=await fetch(endpoint.replace(/\/$/,"")+"/reset-student-password",{
        method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+idToken},
        body:JSON.stringify({studentUid:String(rec.id||"")})
      });
      let data={}; try{data=await res.json();}catch(e){}
      if(!res.ok||!data.ok) throw Error(data.message||data.error||`後端回應 ${res.status}`);
      $("#tempPasswordValue").textContent=data.temporaryPassword||""; $("#tempPasswordBox").hidden=false;
      $("#accountEmail").textContent=data.loginEmail||expectedStudentEmail(rec.className,rec.seatNo);
      $("#accountStatus").textContent="✅ 登入帳號已校正，密碼也已重設。請把臨時密碼交給該學生。";
    }catch(e){ $("#accountStatus").textContent="重設失敗："+(e?.message||String(e));
    }finally{ btn.disabled=false; btn.textContent="🛠️ 修復登入帳號＋重設密碼"; }
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
    if($("#detailTitle")) $("#detailTitle").textContent=`${rec.className} 班｜${rec.seatNo} 號｜${rec.name}`;
    if($("#progressDetailBody")) $("#progressDetailBody").innerHTML=progressRows(rec.progress).map(r=>`<tr><td>${r.id}</td><td>${r.done} / ${r.total}</td><td>${r.complete?'<span class="badge done">完成</span>':'<span class="badge">進行中</span>'}</td></tr>`).join("");
    if($("#progressDetailSummary")) $("#progressDetailSummary").textContent=`總星星 ${Number(rec.stars||0)}/${Number(rec.totalStars||30)}｜評分 ${Number(rec.score||0)}｜${rec.completed?"全部完成":"尚未全部完成"}`;
    if($("#progressDetailDialog")) $("#progressDetailDialog").showModal();
  }

  function openEditRecord(rec){
    if(!rec)return;
    if(!canManageClass(rec.className)){ alert("你沒有維護此班級資料的權限。"); return; }
    if($("#editDocId")) $("#editDocId").value=rec.id;
    if($("#editOriginalClass")) $("#editOriginalClass").value=rec.className;
    if($("#editClassName")) $("#editClassName").value=rec.className;
    if($("#editSeatNo")) $("#editSeatNo").value=rec.seatNo;
    if($("#editStudentName")) $("#editStudentName").value=rec.name;
    if($("#editRecordError")) $("#editRecordError").textContent="";
    if($("#editRecordDialog")) $("#editRecordDialog").showModal();
  }

  async function saveEditedRecord(){
    const docid=$("#editDocId").value;
    const originalClass=$("#editOriginalClass").value;
    const className=$("#editClassName").value.trim();
    const seatNo=String(Number($("#editSeatNo").value.trim()||0));
    const name=$("#editStudentName").value.trim();
    const err=$("#editRecordError");
    if(!/^[1-9][0-9]{2}$/.test(className)){ err.textContent="班級請輸入 3 位數。"; return; }
    if(!className||!seatNo||!name){ err.textContent="欄位不能空白。"; return; }
    try{
      err.textContent="正在儲存…";
      await mods.fs.updateDoc(mods.fs.doc(db,"students",docid),{ className, seatNo, name, updatedAt:mods.fs.serverTimestamp() });
      if($("#editRecordDialog")) $("#editRecordDialog").close();
      if($("#studentManageDialog")) $("#studentManageDialog").close();
      await loadRows();
    }catch(e){ err.textContent="儲存失敗："+(e?.message||"未知錯誤"); }
  }

  async function resetStudentProgress(rec){
    if(!rec)return;
    if(prompt(`輸入「重設」確認歸零：`)!=="重設") return;
    try{
      await mods.fs.updateDoc(mods.fs.doc(db,"students",rec.id),{ stars:0, score:0, progress:{}, completed:false, updatedAt:mods.fs.serverTimestamp() });
      if($("#studentManageDialog")) $("#studentManageDialog").close();
      await loadRows();
    }catch(e){ alert("重設失敗"); }
  }

  async function deleteStudentRecord(data){
    if(!confirm(`確定要移到回收桶嗎？`))return;
    try{
      const uid=String(data.docid||"");
      const snap=await mods.fs.getDoc(mods.fs.doc(db,"students",uid));
      if(!snap.exists())throw Error("找不到資料");
      await mods.fs.setDoc(mods.fs.doc(db,"deletedStudents",uid),{ ...snap.data(), _deletedAt:mods.fs.serverTimestamp(), _deletedUid:uid });
      await mods.fs.deleteDoc(mods.fs.doc(db,"students",uid));
      if($("#studentManageDialog")) $("#studentManageDialog").close();
      await loadRows();
      alert("已移到回收桶。");
    }catch(e){ alert("失敗："+e.message); }
  }

  async function apiPost(path,payload){
    const endpoint=String(window.COURSE116_PASSWORD_RESET_URL||"").trim();
    if(!endpoint)throw Error("尚未設定後端網址");
    const user=auth?.currentUser; if(!user)throw Error("教師登入已失效");
    const idToken=await user.getIdToken(true);
    const res=await fetch(endpoint.replace(/\/$/,"")+path,{ method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+idToken}, body:JSON.stringify(payload||{}) });
    let data={};try{data=await res.json();}catch(e){}
    if(!res.ok||!data.ok)throw Error(data.message||data.error||`後端回應 ${res.status}`);
    return data;
  }

  async function runRescueStudent(){
    const className=$("#rescueClass").value.trim(), seatNo=$("#rescueSeat").value.trim(), name=$("#rescueName").value.trim();
    if(!className||!seatNo||!name)return;
    const btn=$("#runRescueBtn"); btn.disabled=true; btn.textContent="救援中…";
    $("#rescueStatus").textContent="正在尋找原本帳號…";
    try{
      const data=await apiPost("/rescue-student",{className,seatNo,name});
      if($("#rescueResult")) { $("#rescueResult").hidden=false; $("#rescueResult").innerHTML=`<b>✅ 救援完成</b><br>登入帳號：<code>${esc(data.loginEmail||"")}</code><br>臨時密碼：<code>${esc(data.temporaryPassword||"")}</code>`; }
      $("#rescueStatus").textContent="請將臨時密碼交給學生登入。";
      await loadRows();
    }catch(e){ $("#rescueStatus").textContent="救援失敗："+(e?.message||"未知錯誤");
    }finally{ btn.disabled=false; btn.textContent="開始救援"; }
  }

  async function loadTrashRows(){
    const out=[];
    if(isAdmin()){ const snap=await mods.fs.getDocs(mods.fs.collection(db,"deletedStudents")); snap.forEach(d=>out.push({id:d.id,...d.data()})); }
    return out.sort((a,b)=>(String(a.className||"")+String(a.seatNo||"")).localeCompare(String(b.className||"")+String(b.seatNo||""),"zh-Hant"));
  }

  async function openTrash(){
    if($("#trashDialog")) $("#trashDialog").showModal();
    if($("#trashStatus")) $("#trashStatus").textContent="讀取回收桶…"; 
    if($("#trashList")) $("#trashList").innerHTML="";
    try{
      const rows=await loadTrashRows();
      if($("#trashStatus")) $("#trashStatus").textContent=rows.length?`共 ${rows.length} 筆可復原紀錄。`:"回收桶目前是空的。";
      if($("#trashList")) {
        $("#trashList").innerHTML=rows.map(r=>`<div class="trashCard"><div class="row"><b>${esc(r.className)} 班 ${esc(r.seatNo)} 號｜${esc(r.name)}</b></div><div class="actions"><button class="restoreTrashBtn btn sm" data-uid="${esc(r.id)}" type="button">↩️ 復原</button><button class="purgeTrashBtn btn sm danger" data-uid="${esc(r.id)}" type="button">永久刪除</button></div></div>`).join("");
        $("#trashList").querySelectorAll(".restoreTrashBtn").forEach(b=>b.onclick=()=>restoreTrashStudent(b.dataset.uid));
        $("#trashList").querySelectorAll(".purgeTrashBtn").forEach(b=>b.onclick=()=>purgeTrashStudent(b.dataset.uid));
      }
    }catch(e){ if($("#trashStatus")) $("#trashStatus").textContent="讀取失敗："+e.message; }
  }

  async function restoreTrashStudent(uid){
    try{
      const trashRef=mods.fs.doc(db,"deletedStudents",String(uid||""));
      const snap=await mods.fs.getDoc(trashRef);
      if(!snap.exists())throw Error("回收桶找不到這筆資料。");
      const rec={...snap.data()};
      delete rec._deletedAt;delete rec._deletedBy;delete rec._deletedUid;
      await mods.fs.setDoc(mods.fs.doc(db,"students",String(uid||"")),rec);
      await mods.fs.deleteDoc(trashRef);
      await openTrash();await loadRows();
    }catch(e){ alert("復原失敗："+e.message); }
  }

  async function purgeTrashStudent(uid){
    if(!confirm(`確定要永久刪除嗎？`))return;
    try{
      await apiPost("/permanently-delete-student",{studentUid:String(uid||"")});
      await openTrash();
    }catch(e){ alert("永久刪除失敗："+e.message); }
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

  function exportExcel(){
    if(!window.XLSX) { alert("無法匯出：缺少 XLSX 模組。"); return; }
    const cls=$("#classFilter").value;
    if(!cls){ alert("請先選擇一個班級。"); return; }
    const rows=filtered();
    const data=rows.map(r=>({
      "班級":r.className||"", "座號":Number(r.seatNo||0), "姓名":r.name||"",
      "星星":Number(r.stars||0), "滿星數":Number(r.totalStars||30), "評分":Number(r.score||0)
    }));
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,`${cls}班`);
    XLSX.writeFile(wb,`學習進度_${cls}班.xlsx`);
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
      
      document.querySelectorAll(".unitTabBtn").forEach(btn=>{
        btn.addEventListener("click",()=>{
          // 移除全部分頁按鈕的邏輯，直接重新 render，因為現在都是顯示全部欄位
        });
      });

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
  if($("#exportBtn")) $("#exportBtn").onclick=exportExcel;
  if($("#closeManageBtn")) $("#closeManageBtn").onclick=()=>{ if($("#studentManageDialog")) $("#studentManageDialog").close(); };
  if($("#closeDetailBtn")) $("#closeDetailBtn").onclick=()=>{$("#progressDetailDialog").close();};
  if($("#closeEditBtn")) $("#closeEditBtn").onclick=()=>{$("#editRecordDialog").close();};
  if($("#saveEditBtn")) $("#saveEditBtn").onclick=saveEditedRecord;
  if($("#closeAccountBtn")) $("#closeAccountBtn").onclick=()=>{$("#accountDialog").close();};
  if($("#copyUidBtn")) $("#copyUidBtn").onclick=()=>copyText($("#accountUid").textContent," UID");
  if($("#copyEmailBtn")) $("#copyEmailBtn").onclick=()=>copyText($("#accountEmail").textContent,"學習帳號");
  if($("#copyTempPasswordBtn")) $("#copyTempPasswordBtn").onclick=()=>copyText($("#tempPasswordValue").textContent,"臨時密碼");
  if($("#resetPasswordBtn")) $("#resetPasswordBtn").onclick=resetStudentPassword;
  if($("#trashStudentBtn")) $("#trashStudentBtn").onclick=openTrash;
  if($("#runRescueBtn")) $("#runRescueBtn").onclick=runRescueStudent;
  if($("#closeTrashBtn")) $("#closeTrashBtn").onclick=()=>{$("#trashDialog").close();};

  init();
})();
