(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let manageRow=null;
  let currentAccountRecord=null;
  let currentUnit="unit1"; // 與目前 HTML 預設單元一致
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

  // 同班同座號不同姓名不合併。跨 UID 同姓名只供教師核對，不寫回任何帳號。
  function mergeDuplicateStudents(rows){
    const groups=new Map();
    const normSeat=s=>String(parseInt(String(s||""),10)||String(s||"").trim());
    for(const row of rows){
      const key=`${String(row.className||"").trim()}::${normSeat(row.seatNo)}::${String(row.name||"").trim()}`;
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.values()].map(group=>{
      group.sort((a,b)=>
        unitSnapshot(b,"python")-unitSnapshot(a,"python") ||
        Number(b.stars||0)-Number(a.stars||0)
      );
      const best={...group[0]};
      best.duplicateCount=group.length;
      best.sourceRecords=group.map(r=>({...r}));
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

  // v16.66：同一 UID 跨版本讀取；只影響教師版顯示，不寫入 Firestore。
  const safeStars=(v,max=3)=>Math.max(0,Math.min(max,Number(v)||0));
  const obj=v=>v && typeof v==="object" && !Array.isArray(v)?v:{};
  function moduleSources(r,kind){
    const p=obj(r.progress), mods=obj(r.modules), old=obj(p._mods);
    const cp=obj(obj(obj(r.courseProgress)["11601"]).modules);
    const aliases=kind==="digital"?["digital","unit1"]:
      kind==="platform"?["platform","unit3"]:
      kind==="arduino"?["arduino","aiot"]:["python"];
    return aliases.flatMap(key=>[obj(mods[key]),obj(old[key]),obj(cp[key])]);
  }
  function unitSnapshot(r,unitKey){
    const kind=unitKey==="unit1"?"digital":unitKey==="unit3"?"platform":unitKey==="aiot"?"arduino":unitKey;
    const max=unitKey==="unit1"||unitKey==="unit3"?24:unitKey==="aiot"?15:30;
    const sources=moduleSources(r,kind);
    const ids=kind==="python"?Array.from({length:10},(_,i)=>`P${i+1}`):
      kind==="digital"?["x1","u1","x2","u2","x3","u3","x4","u4"]:
      kind==="platform"?Array.from({length:8},(_,i)=>`G${i+1}`):Array.from({length:5},(_,i)=>`S${i+1}`);
    const p=obj(r.progress);
    const byLevel=ids.map(id=>{
      const fromLevels=sources.map(s=>safeStars(obj(obj(s.levels)[id]).stars));
      if(kind==="python"){
        const k=id.toLowerCase();
        fromLevels.push(safeStars(p[k]));
        sources.forEach(s=>fromLevels.push(safeStars(obj(s.progress)[k])));
      }
      return Math.max(0,...fromLevels);
    }).reduce((a,b)=>a+b,0);
    const summary=Math.max(0,...sources.map(s=>safeStars(s.stars,max)));
    const root=kind==="python"?Math.max(safeStars(r.stars,max),
      ids.reduce((n,id)=>n+safeStars(p[id.toLowerCase()]),0)):0;
    // summary 是歷史總數的保底值；逐關缺失時不可拿 0 覆蓋它。
    return Math.min(max,Math.max(byLevel,summary,root));
  }
  function getStudentUnitData(r,unitKey){
    if(unitKey==="all"){
      const pieces=["unit1","python","unit3","aiot"].map(k=>getStudentUnitData(r,k));
      const stars=pieces.reduce((n,s)=>n+s.stars,0),maxStars=93;
      return {stars,maxStars,score:Math.round(stars/maxStars*100),
        completed:pieces.every(p=>p.completed),currentLevel:`數位:${pieces[0].stars}★ | Py:${pieces[1].stars}★ | 系統:${pieces[2].stars}★ | AIoT:${pieces[3].stars}★`};
    }
    const maxStars=UNIT_CONFIG[unitKey]?.maxStars||30;
    const records=r.sourceRecords?.length?r.sourceRecords:[r];
    const scores=records.map(rec=>unitSnapshot(rec,unitKey));
    const stars=Math.max(0,...scores);
    const candidate=records.length>1 && scores.some(v=>v!==stars);
    const raw=obj(r.modules)[unitKey];
    const completed=stars>=maxStars || (!candidate && !!obj(raw).completed);
    let currentLevel=stars?"進行中":"尚未開始";
    if(candidate) currentLevel=`跨 UID 星數不同・需核對（此為最高可讀 ${stars}★）`;
    else if(unitKey==="python" && r.currentStation) currentLevel=String(r.currentStation);
    return {stars,maxStars,score:Math.round(stars/maxStars*100),completed,currentLevel};
  }

  // v16.67：單元按鈕的 data-module（digital/python/platform/arduino）
  // 對應原本成績資料鍵（unit1/python/unit3/aiot）。
  const TAB_TO_UNIT={digital:"unit1",python:"python",platform:"unit3",arduino:"aiot"};
  const UNIT_TO_TAB={unit1:"digital",python:"python",unit3:"platform",aiot:"arduino"};
  const SUBUNITS={
    unit1:[
      {label:"1-1 二進位",parts:["x1","u1"],max:6},
      {label:"1-2 文字",parts:["x2","u2"],max:6},
      {label:"1-3 音訊",parts:["x3","u3"],max:6},
      {label:"1-4 影像",parts:["x4","u4"],max:6}
    ],
    python:Array.from({length:10},(_,i)=>({label:`P${i+1}`,parts:[`P${i+1}`],max:3})),
    unit3:Array.from({length:8},(_,i)=>({label:`G${i+1}`,parts:[`G${i+1}`],max:3})),
    aiot:Array.from({length:5},(_,i)=>({label:`S${i+1}`,parts:[`S${i+1}`],max:3}))
  };
  function getSubunitData(row,unitKey){
    const kind=unitKey==="unit1"?"digital":unitKey==="unit3"?"platform":unitKey==="aiot"?"arduino":unitKey;
    const records=row.sourceRecords?.length?row.sourceRecords:[row];
    const best={}, observed=new Set();
    for(const rec of records){
      for(const source of moduleSources(rec,kind)){
        for(const [raw,detail] of Object.entries(obj(source.levels))){
          const id=raw.toLowerCase(), n=Number(obj(detail).stars);
          if(!Number.isFinite(n)||n<0)continue;
          observed.add(id);
          best[id]=Math.max(best[id]||0,safeStars(n,3));
        }
        if(kind==="python"){
          for(const [raw,val] of Object.entries(obj(source.progress))){
            if(!/^p(?:10|[1-9])$/i.test(raw))continue;
            const id=raw.toLowerCase(),n=Number(val);
            if(Number.isFinite(n)&&n>=0){observed.add(id);best[id]=Math.max(best[id]||0,safeStars(n,3));}
          }
        }
      }
      if(kind==="python"){
        for(const [raw,val] of Object.entries(obj(rec.progress))){
          if(!/^p(?:10|[1-9])$/i.test(raw))continue;
          const id=raw.toLowerCase(), n=Number(val);
          if(Number.isFinite(n)&&n>=0){observed.add(id);best[id]=Math.max(best[id]||0,safeStars(n,3));}
        }
      }
    }
    return SUBUNITS[unitKey].map(sub=>{
      const parts=sub.parts.map(id=>id.toLowerCase());
      const stars=Math.min(sub.max,parts.reduce((n,id)=>n+(best[id]||0),0));
      return {...sub,stars,observed:parts.some(id=>observed.has(id)),complete:parts.every(id=>observed.has(id))&&stars>=sub.max};
    });
  }
  function subunitBadge(item){
    if(!item.observed)return '<div class="subunit-score unknown"><strong>—</strong><small>待確認</small><span>無逐關紀錄</span></div>';
    return `<div class="subunit-score ${item.complete?"complete":item.stars?"partial":"empty"}"><strong>★ ${item.stars}</strong><small> / ${item.max}</small><span>${item.complete?"✓ 滿星":item.stars?"進行中":"0 星"}</span></div>`;
  }
  function render(){
    const rows=filtered();
    const cfgUnit=UNIT_CONFIG[currentUnit]||UNIT_CONFIG.unit1;
    const mapped=rows.map(row=>({...row,_score:getStudentUnitData(row,currentUnit)}));
    const sum=mapped.reduce((n,row)=>n+row._score.stars,0);
    const mean=rows.length?(sum/rows.length).toFixed(1):"0.0";
    const avgScore=rows.length?Math.round(mapped.reduce((n,r)=>n+r._score.score,0)/rows.length):0;
    const done=mapped.filter(r=>r._score.completed).length;
    $("#studentCount").textContent=String(rows.length);
    $("#avgStars").textContent=mean;
    $("#avgScore").textContent=String(avgScore);
    $("#doneCount").textContent=String(done);
    document.querySelectorAll(".moduleTab[data-module]").forEach(btn=>{
      btn.setAttribute("aria-pressed",String(TAB_TO_UNIT[btn.dataset.module]===currentUnit));
    });
    const title=$("#moduleFocusTitle"), note=$("#moduleFocusNote"),avg=$("#moduleFocusAverage");
    if(title)title.textContent=cfgUnit.name;
    if(note)note.textContent="各小關星數依目前可讀取的歷史逐關紀錄顯示；只有總星數時不推算各關成績";
    if(avg)avg.textContent=mean;
    const starHead=$("#moduleStarHeader");
    const subs=SUBUNITS[currentUnit]||[];
    const head=document.querySelector(".moduleTable thead tr");
    if(head)head.innerHTML=`<th>班級</th><th>座號</th><th>姓名</th><th class="maintainCol">維護</th><th>單元總星</th>${subs.map(sub=>`<th class="subunit-head">${esc(sub.label)}<span>滿分 ${sub.max}★</span></th>`).join("")}<th>完成度</th><th>最近更新</th>`;
    $("#rows").innerHTML=mapped.map(row=>{
      const detail=getSubunitData(row,currentUnit),d=row._score;
      return `<tr class="student-score-row"><td>${esc(row.className)}</td><td class="seat-num">${esc(row.seatNo)}</td><td class="student-name">${esc(row.name)}</td><td class="maintainCol"><button class="manageBtn" type="button" data-id="${esc(row.id)}">🛠️ 維護</button></td><td class="unit-star-column"><div class="star-strong ${d.stars?"":"star-zero"}"><span class="star-symbol">★</span><strong>${d.stars}</strong><span class="star-maximum">/ ${d.maxStars}</span></div><div class="star-progress"><span style="width:${Math.max(0,Math.min(100,d.score))}%"></span></div>${String(d.currentLevel).includes("需核對")?`<small>${esc(d.currentLevel)}</small>`:""}</td>${detail.map(item=>`<td class="subunit-cell">${subunitBadge(item)}</td>`).join("")}<td><span class="completion-percent">${d.score}%</span><span class="completion-label">${d.completed?"已滿星":d.stars?"進行中":"未找到有效星數"}</span></td><td class="sync-time">${esc(fmtTime(row.updatedAt)||"—")}</td></tr>`;
    }).join("");
    document.querySelectorAll(".manageBtn").forEach(btn=>btn.addEventListener("click",()=>{
      const rec=rows.find(r=>String(r.id)===String(btn.dataset.id));
      if(rec)openStudentManage(rec);
    }));
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
    $("#inspectAuthResult").textContent="重設前請先檢查 UID 與登入 Email 的對應。";

    const endpoint=String(window.COURSE116_PASSWORD_RESET_URL||"").trim();
    $("#resetPasswordBtn").disabled=!endpoint;
    $("#inspectAuthBtn").disabled=!endpoint;
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

  async function inspectStudentAuth(){
    const rec=currentAccountRecord;
    if(!rec)return;
    const view=$("#inspectAuthResult");
    const btn=$("#inspectAuthBtn");
    btn.disabled=true;
    view.textContent="正在向管理後端查詢 Authentication 帳號對應…";
    try{
      const result=await apiPost("/inspect-student-account",{studentUid:String(rec.id||"")});
      const uid=String(result.studentUid||"");
      const owner=String(result.emailOwnerUid||"");
      const targetEmail=String(result.authEmail||"");
      const expected=String(result.expectedEmail||"");
      const parts=[`選取 UID：${uid}`,`預期登入 Email：${expected}`,`此 UID 的 Auth Email：${targetEmail||"找不到 Auth 帳號"}`];
      if(!result.authUidExists){
        parts.push("⚠️ 此 Firestore UID 在 Authentication 找不到帳號，重設密碼無效，請先處理帳號對應。");
      }else if(owner&&owner!==uid){
        parts.push(`⚠️ 預期 Email 已被另一個 UID 使用：${owner}。不要對目前 UID 直接重設，請核對歷史帳號與姓名。`);
      }else if(targetEmail&&targetEmail!==expected){
        parts.push("⚠️ Auth Email 與目前班級座號不一致，重設時將校正登入 Email；請先核對是否為本人。");
      }else if(owner===uid){
        parts.push("✅ Email 已綁在選取的 UID，能進一步執行重設。");
      }else{
        parts.push("⚠️ 尚未確認預期 Email 的擁有者，請核對後再重設。");
      }
      view.textContent=parts.join("\n");
      view.style.whiteSpace="pre-wrap";
    }catch(e){
      view.textContent="檢查失敗："+(e?.message||String(e))+"。若顯示 NOT_FOUND，請確認 Worker 也已部署 v16.65。";
    }finally{btn.disabled=false;}
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
        const messages={
          AUTH_EMAIL_OWNED_BY_OTHER_UID:"此座號的登入 Email 已綁定另一個 UID。請先點『檢查此 UID 與登入 Email』核對，不要建立新帳號。",
          AUTH_UID_NOT_FOUND:"選取的 Firestore UID 並沒有對應 Authentication 帳號，無法在此直接重設。",
          CLASS_NOT_AUTHORIZED:"教師沒有管理這個班級的權限。",
          INVALID_TEACHER_TOKEN:"教師登入已失效，請重新登入教師端。",
          ORIGIN_NOT_ALLOWED:"目前網站來源未列入 Worker 允許清單，需檢查 Worker 的 ALLOWED_ORIGIN。",
          SERVICE_ACCOUNT_TOKEN_FAILED:"Worker 的 Google 服務帳號認證失敗，請檢查 Worker Secrets。"
        };
        throw Error(messages[data.error]||data.message||data.error||`後端回應 ${res.status}`);
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

      // 目前 HTML 使用 moduleTab/data-module，不能再綁定不存在的 unitTabBtn。
      document.querySelectorAll(".moduleTab[data-module]").forEach(btn=>{
        btn.addEventListener("click",()=>{
          const target=TAB_TO_UNIT[btn.dataset.module];
          if(!target)return;
          currentUnit=target;
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
  $("#inspectAuthBtn").onclick=inspectStudentAuth;
  $("#trashStudentBtn").onclick=openTrash;
  $("#runRescueBtn").onclick=runRescueStudent;
  $("#closeTrashBtn").onclick=()=>$("#trashDialog").close();

  init();
})();
