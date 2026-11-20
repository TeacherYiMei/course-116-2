(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let auth,db,mods;
  let teacherProfile=null;
  let currentRows=[];
  let manageRow=null;
  let currentAccountRecord=null;
  let legacyKnowledgeDocs=[];
  let legacyKnowledgeError="";
  // 旅拍技術檢測由獨立唯讀模組載入；僅用於顯示及匯出，絕不當成星星或教師認證成績。
  let travelChecksByUid=new Map();
  window.addEventListener('travel:records',event=>{
    const list=Array.isArray(event.detail?.records)?event.detail.records:[];
    travelChecksByUid=new Map(list.map(row=>[String(row.id||row.studentUid||''),row]));
    if(currentUnit==='media'&&teacherProfile)render();
  });
  let currentUnit="unit1"; // 與目前 HTML 預設單元一致
  let currentTerm="11601"; // 教師選擇，與學生進度所屬學期分開管理
  const FIRST_UNITS=["unit1","python","unit3","aiot","extension","knowledge"];
  const SECOND_UNITS=["media","network","data","sheet","cipher","arduino2"];
  const $=s=>document.querySelector(s);

  const UNIT_CONFIG = {
    all:    { name: "全學期四單元總覽", maxStars: 93, title: "📊 116 資訊科技｜四單元總覽" },
    unit1:  { name: "單元一：數位時代", maxStars: 24, title: "💾 單元一：數位時代｜教師端" },
    python: { name: "單元二：進入 Python 的世界", maxStars: 30, title: "👩‍🏫 Python 學習進度｜教師端" },
    unit3:  { name: "單元三：系統平臺大冒險", maxStars: 24, title: "🖥️ 單元三：系統平臺大冒險｜教師端" },
    aiot:   { name: "延伸專題：5016B AIoT 守護站", maxStars: 15, title: "💡 5016B AIoT 智慧教室守護站｜教師端" },
    extension: { name:"跨章延伸｜數位科技任務中心", maxStars:18, title:"🧭 數位科技任務中心｜教師端" },
    knowledge: { name:"知識闖關特攻隊", maxStars:12, title:"🚀 知識闖關特攻隊｜教師端" },
    media: {name:"單元四：90 秒旅拍與 AI",maxStars:30},
    network: {name:"單元五：網路世界",maxStars:30},
    data: {name:"單元六：資料偵探",maxStars:12},
    sheet: {name:"單元六：試算表實作",maxStars:15},
    cipher: {name:"單元六：密碼特務",maxStars:18},
    arduino2: {name:"下學期：5016B 守護站 2.0",maxStars:15},
    year: {name:"116 全學年學習總覽",maxStars:243}
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
  // 舊站紀錄唯讀，絕不直接寫入或覆蓋。
  function legacyKnowledgeStar(row,id){
    const item=obj(obj(row._legacyKnowledge).stations)[id];
    if(!item)return 0;
    if(item.completed)return 3;
    const first=Number(item.firstRoundCorrect||0);
    return Math.max(0,Math.min(2,Math.floor(first/4)));
  }

  function moduleSources(r,kind){
    if(SECOND_UNITS.includes(kind)){
      // 下學期只能採信有 11602 學期標記的雲端紀錄；絕不混入舊版 _mods。
      const modules=obj(obj(obj(r.courseProgress)["11602"]).modules);
      return [obj(modules[kind==="arduino2"?"arduino":kind])];
    }
    const p=obj(r.progress), mods=obj(r.modules), old=obj(p._mods);
    const cp=obj(obj(obj(r.courseProgress)["11601"]).modules);
    const aliases=kind==="digital"?["digital","unit1"]:
      kind==="platform"?["platform","unit3"]:
      kind==="arduino"?["arduino","aiot"]:kind==="extension"?["extension"]:kind==="knowledge"?["knowledge"]:["python"];
    return aliases.flatMap(key=>[obj(mods[key]),obj(old[key]),obj(cp[key])]);
  }
  function unitSnapshot(r,unitKey){
    if(SECOND_UNITS.includes(unitKey)){
      const conf=UNIT_CONFIG[unitKey];
      const levels=obj(moduleSources(r,unitKey)[0].levels);
      const ids=SUBUNITS[unitKey].filter(sub=>sub.max>0).flatMap(sub=>sub.parts);
      const detailed=ids.reduce((n,id)=>n+safeStars(obj(levels[id]).stars),0);
      // 下學期不得從未分學期的舊總星數推估，以免挪用上學期資料。
      const summary=safeStars(moduleSources(r,unitKey)[0].stars,conf.maxStars);
      return Math.min(conf.maxStars,Math.max(detailed,summary));
    }
    const kind=unitKey==="unit1"?"digital":unitKey==="unit3"?"platform":unitKey==="aiot"?"arduino":unitKey;
    const max=unitKey==="unit1"||unitKey==="unit3"?24:unitKey==="aiot"?15:unitKey==="extension"?18:unitKey==="knowledge"?12:30;
    const sources=moduleSources(r,kind);
    const ids=kind==="python"?Array.from({length:10},(_,i)=>`P${i+1}`):
      kind==="digital"?["x1","u1","x2","u2","x3","u3","x4","u4"]:
      kind==="platform"?Array.from({length:8},(_,i)=>`G${i+1}`):kind==="extension"?Array.from({length:6},(_,i)=>`E${i+1}`):kind==="knowledge"?Array.from({length:4},(_,i)=>`R${i+1}`):Array.from({length:5},(_,i)=>`S${i+1}`);
    const p=obj(r.progress);
    const byLevel=ids.map(id=>{
      const fromLevels=sources.map(s=>safeStars(obj(obj(s.levels)[id]).stars));
      if(kind==="knowledge")fromLevels.push(...(r.sourceRecords?.length?r.sourceRecords:[r]).map(x=>legacyKnowledgeStar(x,id)));
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
    if(unitKey==="year"){
      const first=FIRST_UNITS.map(k=>getStudentUnitData(r,k));
      const second=SECOND_UNITS.map(k=>getStudentUnitData(r,k));
      const scores=first.concat(second);
      const stars=scores.reduce((n,v)=>n+v.stars,0),maxStars=243;
      return {stars,maxStars,score:Math.round(stars/maxStars*100),
        completed:scores.every(v=>v.completed),
        currentLevel:`上學期 ${first.reduce((n,v)=>n+v.stars,0)}★／123★；下學期 ${second.reduce((n,v)=>n+v.stars,0)}★／120★`};
    }
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
    const raw=SECOND_UNITS.includes(unitKey)?obj(obj(obj(obj(r.courseProgress)["11602"]).modules)[unitKey==="arduino2"?"arduino":unitKey]):obj(r.modules)[unitKey];
    const completed=stars>=maxStars || (!candidate && !!obj(raw).completed);
    let currentLevel=stars?"進行中":"尚未開始";
    if(candidate) currentLevel=`跨 UID 星數不同・需核對（此為最高可讀 ${stars}★）`;
    else if(unitKey==="python" && r.currentStation) currentLevel=String(r.currentStation);
    return {stars,maxStars,score:Math.round(stars/maxStars*100),completed,currentLevel};
  }

  // v16.67：單元按鈕的 data-module（digital/python/platform/arduino）
  // 對應原本成績資料鍵（unit1/python/unit3/aiot）。
  const TAB_TO_UNIT={digital:"unit1",python:"python",platform:"unit3",arduino:"aiot",extension:"extension",knowledge:"knowledge",media:"media",network:"network",data:"data",sheet:"sheet",cipher:"cipher",arduino2:"arduino2"};
  const UNIT_TO_TAB={unit1:"digital",python:"python",unit3:"platform",aiot:"arduino",extension:"extension",knowledge:"knowledge"};
  const SUBUNITS={
    unit1:[
      {label:"1-1 二進位",parts:["x1","u1"],max:6},
      {label:"1-2 文字",parts:["x2","u2"],max:6},
      {label:"1-3 音訊",parts:["x3","u3"],max:6},
      {label:"1-4 影像",parts:["x4","u4"],max:6}
    ],
    python:Array.from({length:10},(_,i)=>({label:`P${i+1}`,parts:[`P${i+1}`],max:3})),
    unit3:Array.from({length:8},(_,i)=>({label:`G${i+1}`,parts:[`G${i+1}`],max:3})),
    aiot:Array.from({length:5},(_,i)=>({label:`S${i+1}`,parts:[`S${i+1}`],max:3})),
    extension:Array.from({length:6},(_,i)=>({label:`E${i+1}`,parts:[`E${i+1}`],max:3})),
    knowledge:Array.from({length:4},(_,i)=>({label:`K${i+1}｜10題`,parts:[`R${i+1}`],max:3})),
    media:[...Array.from({length:4},(_,i)=>({label:`M${i+1}`,parts:[`M${i+1}`],max:3})),...Array.from({length:6},(_,i)=>({label:`A${i+1}`,parts:[`A${i+1}`],max:3})),...Array.from({length:5},(_,i)=>({label:`W${i+1}｜作品`,parts:[`W${i+1}`],max:0}))],
    network:Array.from({length:10},(_,i)=>({label:`N${i+1}`,parts:[`N${i+1}`],max:3})),
    data:Array.from({length:4},(_,i)=>({label:`D${i+1}`,parts:[`D${i+1}`],max:3})),
    sheet:Array.from({length:5},(_,i)=>({label:`T${i+1}`,parts:[`T${i+1}`],max:3})),
    cipher:Array.from({length:6},(_,i)=>({label:`K${i+1}`,parts:[`K${i+1}`],max:3})),
    arduino2:Array.from({length:5},(_,i)=>({label:`S${i+1}`,parts:[`S${i+1}`],max:3})),
    year:[{label:"上學期",parts:[],max:123},{label:"下學期",parts:[],max:120}]
  };
  function getSubunitData(row,unitKey){
    if(unitKey==="year")return [FIRST_UNITS,SECOND_UNITS].map((units,i)=>{
      const max=i===0?123:120,stars=units.reduce((n,k)=>n+getStudentUnitData(row,k).stars,0);
      return {label:i===0?"上學期":"下學期",stars,max,observed:stars>0,complete:stars>=max};
    });
    const kind=unitKey==="unit1"?"digital":unitKey==="unit3"?"platform":unitKey==="aiot"?"arduino":unitKey;
    const records=row.sourceRecords?.length?row.sourceRecords:[row];
    const best={}, observed=new Set(),finished=new Set();
    for(const rec of records){
      if(kind==="knowledge"){ for(let k=1;k<=4;k++){const id=`r${k}`,s=legacyKnowledgeStar(rec,`R${k}`);if(obj(rec._legacyKnowledge).stations?.[`R${k}`]){observed.add(id);best[id]=Math.max(best[id]||0,s)}} }
      for(const source of moduleSources(rec,kind)){
        for(const [raw,detail] of Object.entries(obj(source.levels))){
          const id=raw.toLowerCase(), n=Number(obj(detail).stars);
          if(obj(detail).done){observed.add(id);finished.add(id);}
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
      if(sub.max===0)return {...sub,stars:0,observed:parts.some(id=>observed.has(id)),complete:parts.every(id=>finished.has(id))};
      return {...sub,stars,observed:parts.some(id=>observed.has(id)),complete:parts.every(id=>observed.has(id))&&stars>=sub.max};
    });
  }
  function subunitBadge(item){
    if(!item.observed)return '<div class="subunit-score unknown"><strong>—</strong><small>待確認</small><span>無逐關紀錄</span></div>';
    if(item.max===0)return `<div class="subunit-score ${item.complete?'complete':'partial'}"><strong>${item.complete?'✓':'…'}</strong><small>作品任務</small><span>${item.complete?'已完成':'進行中'}</span></div>`;
    return `<div class="subunit-score ${item.complete?"complete":item.stars?"partial":"empty"}"><strong>★ ${item.stars}</strong><small> / ${item.max}</small><span>${item.complete?"✓ 滿星":item.stars?"進行中":"0 星"}</span></div>`;
  }
  function travelForStudent(row){
    // 只採相同 UID，且班級／座號／姓名一致的結果；跨 UID 不自動合併。
    const sources=row.sourceRecords?.length?row.sourceRecords:[row];
    const ident=x=>`${String(x.className||'').trim()}|${Number(x.seatNo)}|${String(x.name||'').trim()}`;
    const own=ident(row);
    return sources.map(s=>travelChecksByUid.get(String(s.id||'')))
      .filter(c=>c&&c.source==='student-browser-unverified'&&ident(c)===own)
      .sort((a,b)=>(b.checkedAt?.seconds||0)-(a.checkedAt?.seconds||0))[0]||null;
  }
  function render(){
    document.querySelectorAll('[data-teacher-term]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.teacherTerm===currentTerm)));
    document.querySelectorAll('[data-term-group]').forEach(el=>el.classList.toggle('hidden',el.dataset.termGroup!==currentTerm));
    const termStatus=$('#teacherTermStatus');
    if(termStatus)termStatus.textContent=currentTerm==='year'?'全學年｜上下學期分開核對後加總':currentTerm==='11601'?'116-1 上學期':'116-2 下學期';
    const rows=filtered();
    const cfgUnit=UNIT_CONFIG[currentUnit]||UNIT_CONFIG.unit1;
    const mapped=rows.map(row=>({...row,_score:getStudentUnitData(row,currentUnit)}));
    const bySeat=new Map();
    const seatKey=r=>`${String(r.className||'').trim()}::${parseInt(String(r.seatNo||''),10)||String(r.seatNo||'').trim()}`;
    mapped.forEach(r=>{const k=seatKey(r);const a=bySeat.get(k)||[];a.push(r);bySeat.set(k,a)});
    mapped.forEach(r=>{
      const siblings=bySeat.get(seatKey(r))||[];
      r._identityConflict=siblings.some(other=>String(other.name||'').trim()!==String(r.name||'').trim());
    });
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
    if(head)head.innerHTML=`<th>班級</th><th>座號</th><th>姓名</th><th class="maintainCol">維護</th><th>單元總星</th>${subs.map(sub=>`<th class="subunit-head">${esc(sub.label)}<span>滿分 ${sub.max}★</span></th>`).join("")}${currentUnit==='media'?'<th>🐣 旅拍技術檢測<br><small>學生端未核驗／85 分達標</small></th>':''}<th>完成度</th><th>最近更新</th>`;
    $("#rows").innerHTML=mapped.map(row=>{
      const detail=getSubunitData(row,currentUnit),d=row._score;
      const travel=currentUnit==='media'?travelForStudent(row):null;
      const travelCell=currentUnit==='media'?`<td><div style="padding:8px 10px;border-radius:10px;background:${travel?(travel.score>=85?'#dcfce7':'#fff7ed'):'#f1f5f9'};min-width:110px;text-align:center"><b style="font-size:1.25rem;color:${travel?(travel.score>=85?'#047857':'#a16207'):'#64748b'}">${travel?esc(travel.score)+' / 100':'—'}</b><br><small>${travel?(travel.passed?'🌟 技術達標':'🌱 未達標'):'尚無檢測'}</small></div></td>`:'';
      return `<tr class="student-score-row"><td>${esc(row.className)}</td><td class="seat-num">${esc(row.seatNo)}</td><td class="student-name">${esc(row.name)}${row._identityConflict?'<div style="color:#9a3412;font-size:12px;font-weight:600">⚠ 同座不同姓名，請核對 UID</div>':''}${row._legacyCrossUID&&currentUnit==='knowledge'?'<div style="color:#1d4ed8;font-size:12px">舊站同名紀錄（UID 不同，唯讀）</div>':''}</td><td class="maintainCol"><button class="manageBtn" type="button" data-id="${esc(row.id)}">🛠️ 維護</button> <button class="progressAuditBtn" type="button" data-id="${esc(row.id)}" style="padding:5px 8px;border:1px solid #8da4c9;border-radius:7px;background:#f0f5ff;color:#173b73;margin-top:4px">🔎 診斷</button></td><td class="unit-star-column"><div class="star-strong ${d.stars?"":"star-zero"}"><span class="star-symbol">★</span><strong>${d.stars}</strong><span class="star-maximum">/ ${d.maxStars}</span></div><div class="star-progress"><span style="width:${Math.max(0,Math.min(100,d.score))}%"></span></div>${String(d.currentLevel).includes("需核對")?`<small>${esc(d.currentLevel)}</small>`:""}${row._legacyCrossUID&&currentUnit==='knowledge'?'<small style="color:#1d4ed8">含舊站候選星數，尚未寫回主站</small>':''}</td>${detail.map(item=>`<td class="subunit-cell">${subunitBadge(item)}</td>`).join("")}${travelCell}<td><span class="completion-percent">${d.score}%</span><span class="completion-label">${d.completed?"已滿星":d.stars?"進行中":"未找到有效星數"}</span></td><td class="sync-time">${esc(fmtTime(row.updatedAt)||"—")}</td></tr>`;
    }).join("");
    document.querySelectorAll(".manageBtn").forEach(btn=>btn.addEventListener("click",()=>{
      const rec=rows.find(r=>String(r.id)===String(btn.dataset.id));
      if(rec)openStudentManage(rec);
    }));
    document.querySelectorAll(".progressAuditBtn").forEach(btn=>btn.addEventListener("click",()=>{
      const rec=rows.find(r=>String(r.id)===String(btn.dataset.id));
      if(rec)showProgressAudit(rec);
    }));
  }


  // v16.74 唯讀診斷：所有資料來源的 UID 與已保存關卡一覽；絕不寫入 Firestore。
  function showProgressAudit(row){
    const list=row.sourceRecords?.length?row.sourceRecords:[row];
    const cls=String(row.className||"").trim(),seat=Number(row.seatNo),name=String(row.name||"").trim();
    const oldMatches=legacyKnowledgeDocs.filter(x=>String(x.className||"").trim()===cls && Number(x.seatNo)===seat);
    const same=oldMatches.filter(x=>String(x.name||"").trim()===name);
    const other=oldMatches.filter(x=>String(x.name||"").trim()!==name);
    const sameSeatCloud=currentRows.filter(x=>String(x.className||'').trim()===cls && Number(x.seatNo)===seat && String(x.name||'').trim()!==name);
    const euid=new Set(list.map(x=>String(x.id||x.uid||"")));
    const rows=SUBUNITS[currentUnit]||[];
    const native=list.map((rec,i)=>{
      const items=rows.map(sub=>{
        const q=getSubunitData({...rec,sourceRecords:[rec]},currentUnit).find(x=>x.label===sub.label);
        return q?.observed?`${sub.label}: ${q.stars}/${q.max}`:`${sub.label}: 未見逐關`;
      });
      return `<div style="padding:12px;border:1px solid #dbe5f2;border-radius:12px;margin:8px 0;background:#f7faff"><b>來源 ${i+1}｜UID ${esc(rec.id||rec.uid||'未知')}</b><div style="font-size:13px;margin:5px 0">${esc(rec.className)} 班 ${esc(rec.seatNo)} 號｜${esc(rec.name)}</div><div style="font-size:13px">${esc(rows.map((_,j)=>items[j]).join(' · '))}</div><div style="font-size:13px;margin-top:4px">此來源最高可讀：${currentUnit==='year'?getStudentUnitData(rec,'year').stars:unitSnapshot(rec,currentUnit)} / ${UNIT_CONFIG[currentUnit].maxStars} ★</div></div>`;
    }).join('');
    const old=same.map(rec=>{
      const ss=['R1','R2','R3','R4'].map(k=>`${k}: ${legacyKnowledgeStar({_legacyKnowledge:rec},k)}★`).join(' / ');
      const sameUID=euid.has(String(rec.id||''));
      return `<div style="padding:8px;border-bottom:1px solid #ddd">UID ${esc(rec.id||'未知')}｜${sameUID?'✅ 同 UID':'⚠️ 不同 UID，僅供人工核對'}<div>${esc(ss)}</div></div>`;
    }).join('');
    document.getElementById('progressAuditDialog')?.remove();
    const dlg=document.createElement('dialog');dlg.id='progressAuditDialog';dlg.style.cssText='width:min(760px,94vw);max-height:86vh;overflow:auto;border:1px solid #ccd6e8;border-radius:18px;padding:24px;box-shadow:0 18px 60px #0004';
    dlg.innerHTML=`<h2 style="margin:0 0 9px">🔎 學習成績來源診斷（唯讀）</h2><p><b>${esc(cls)} 班 ${esc(row.seatNo)} 號｜${esc(name)}</b>｜${esc(UNIT_CONFIG[currentUnit].name)}</p><p style="background:#fff8dc;border-radius:9px;padding:10px">注意：目前顯示 0★ 只代表教師版在可讀取紀錄中未找到星數，不表示學生從未闖關。不要用 0★ 覆蓋本機資料。此視窗完全不修改學生資料。</p><h3>116 主站紀錄（${list.length} 個 UID）</h3>${native}<h3>舊複習站同班同座（${oldMatches.length} 筆）</h3>${legacyKnowledgeError?`<p style="color:#a33">讀取舊站失敗：${esc(legacyKnowledgeError)}</p>`:''}${same.length?old:'<p>沒有找到同班、同座且同姓名的舊站紀錄。</p>'}${other.length?`<p style="color:#a33">⚠️ 舊站另有 ${other.length} 筆同座、不同姓名紀錄，已排除合併。</p>`:''}${sameSeatCloud.length?`<p style="color:#a33">⚠️ 主站有 ${sameSeatCloud.length} 筆同座不同姓名的學生：${esc(sameSeatCloud.map(x=>x.name+'（UID '+String(x.id||'').slice(0,8)+'…）').join('、'))}。不能視為同一位學生。</p>`:''}${row._legacyCrossUID?'<p style="color:#1d4ed8">舊站同名成績來自另一個 UID；本版僅供教師核對，未同步到學生帳號或 Firebase。</p>':''}<p style="font-size:13px;color:#456">若學生端仍顯示星星但此處沒有：請在原電腦先下載進度備份，並檢查上方雲端同步狀態。若舊站不同 UID 有星星，須確認帳號身分後再恢復，不應直接相加。</p><button type="button" class="progressAuditClose" style="padding:9px 22px;border:0;border-radius:9px;background:#244b9c;color:white">關閉</button>`;
    document.body.appendChild(dlg);
    dlg.querySelector('.progressAuditClose').addEventListener('click',()=>dlg.close());
    dlg.addEventListener('close',()=>dlg.remove());
    dlg.showModal();
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
      const parts=[`選取 UID：${uid}`,`預期登入 Email：${expected}`,`此 UID 的 Auth Email：${targetEmail||"尚未綁定 Email（可能是舊匿名帳號）"}`,`Worker Firebase 專案：${result.workerProjectId||"未回傳"}`,`登入方式：${(result.authProviderIds||[]).join(", ")||"匿名／未提供 provider"}`];
      if(!result.authUidExists){
        parts.push("⚠️ 此 Firestore UID 在 Authentication 找不到帳號，重設密碼無效，請先處理帳號對應。");
      }else if(owner&&owner!==uid){
        parts.push(`⚠️ 預期 Email 已被另一個 UID 使用：${owner}。不要對目前 UID 直接重設，請核對歷史帳號與姓名。`);
      }else if(targetEmail&&targetEmail!==expected){
        parts.push("⚠️ Auth Email 與目前班級座號不一致，重設時將校正登入 Email；請先核對是否為本人。");
      }else if(owner===uid){
        parts.push("✅ Email 已綁在選取的 UID，能進一步執行重設。");
      }else{
        parts.push("ℹ️ 此 UID 尚未綁定預期登入 Email。若確認本人，可使用受控重設將 Email/密碼連結到現有 UID；不會建立新 UID。");
      }
      view.textContent=parts.join("\n");
      view.style.whiteSpace="pre-wrap";
    }catch(e){
      view.textContent="檢查失敗："+(e?.message||String(e))+"。請先修復此診斷，不要繼續產生一次性密碼。";
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
          SERVICE_ACCOUNT_TOKEN_FAILED:"Worker 的 Google 服務帳號認證失敗，請檢查 Worker Secrets。",
          AUTH_RESET_BINDING_NOT_VERIFIED:"Authentication 已收到變更，但再次核對時 Email 沒有對應到選取的 UID。請勿使用這次密碼，請先查核 Firebase 專案及歷史 UID。"
        };
        throw Error(messages[data.error]||data.message||data.error||`後端回應 ${res.status}`);
      }

      $("#tempPasswordValue").textContent=data.temporaryPassword||"";
      $("#tempPasswordBox").hidden=false;
      $("#accountEmail").textContent=data.loginEmail||expectedStudentEmail(rec.className,rec.seatNo);
      if(String(data.verifiedUid||"")!==String(rec.id||"")||String(data.verifiedEmailOwnerUid||"")!==String(rec.id||""))
        throw Error("後端尚未證實登入 Email 屬於此 UID；請勿使用臨時密碼。");
      $("#accountStatus").textContent="✅ 已再次查證登入 Email 屬於此 UID，密碼重設已完成。請把臨時密碼交給該學生。";
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
    if(!res.ok||!data.ok){
      const code=String(data.error||data.message||`HTTP_${res.status}`);
      if(res.status===404 && code.includes("NOT_FOUND")){
        let workerHost="";
        try{workerHost=new URL(endpoint).origin;}catch(_){workerHost="後端網址格式有誤";}
        throw Error(`Worker 路由查無結果（HTTP 404 / ${code}）。檢查請求：${workerHost}${path}。請在 Cloudflare 確認此網址對應目前部署的 Worker，以及該 Worker 包含此 API；這不代表學生 UID 不存在。`);
      }
      throw Error(`後端 HTTP ${res.status}：${code}`);
    }
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

  // 只讀取舊站的 midtermStudents。只以完全相同 UID 自動比對；不跨 UID 合併。
  async function readLegacyKnowledge(){
    try{
      const f=mods.fs, col=f.collection(db,"midtermStudents");
      let docs=[];
      if(isAdmin()){
        const snap=await f.getDocs(col);docs=snap.docs;
      }else{
        const cls=allowedClasses();
        for(const c of cls){
          const q=f.query(col,f.where("className","==",String(c)));
          const snap=await f.getDocs(q);docs.push(...snap.docs);
        }
      }
      legacyKnowledgeDocs=docs.map(d=>({id:d.id,...d.data()}));
      legacyKnowledgeError="";
      const byUID=new Map(legacyKnowledgeDocs.map(d=>[d.id,d]));
      // v16.75：舊站與主站 UID 可能不同，僅在完整身分一致且來源唯一時，
      // 在教師端顯示「舊站候選星數」；不更動任何 Firebase 紀錄。
      const ident=x=>`${String(x.className||'').trim()}::${parseInt(String(x.seatNo||''),10)||String(x.seatNo||'').trim()}::${String(x.name||'').trim()}`;
      const legacyByIdentity=new Map();
      legacyKnowledgeDocs.forEach(old=>{
        const key=ident(old);
        const arr=legacyByIdentity.get(key)||[];
        arr.push(old);legacyByIdentity.set(key,arr);
      });
      currentRows.forEach(row=>{
        const sources=row.sourceRecords||[row];
        sources.forEach(rec=>{
          delete rec._legacyKnowledge;
          delete rec._legacyCrossUID;
          const direct=byUID.get(rec.id);
          if(direct && ident(direct)===ident(rec)){
            rec._legacyKnowledge=direct;
          }else{
            const matches=legacyByIdentity.get(ident(rec))||[];
            if(matches.length===1){
              rec._legacyKnowledge=matches[0];
              rec._legacyCrossUID=String(matches[0].id)!==String(rec.id);
            }
          }
        });
        if(sources.some(rec=>rec._legacyCrossUID))row._legacyCrossUID=true;
      });
      return {ok:true,count:byUID.size};
    }catch(e){legacyKnowledgeDocs=[];legacyKnowledgeError=String(e?.code||e?.message||"未知錯誤");console.warn("舊站紀錄唯讀查詢失敗（不影響主站）",e);return {ok:false,error:legacyKnowledgeError};}
  }

  // v16.76：唯讀稽核，不以完成速度或沒有明細直接指控學生。
  function integrityAuditRows(){
    const cls=String($('#classFilter')?.value||'').trim();
    const rows=filtered();
    const units=currentTerm==='11602'?SECOND_UNITS:currentTerm==='year'?FIRST_UNITS.concat(SECOND_UNITS):FIRST_UNITS;
    return rows.flatMap(student=>units.map(unit=>{
      const info=getStudentUnitData(student,unit);
      const parts=getSubunitData(student,unit);
      const documented=parts.filter(p=>p.observed).length;
      const hasConflict=(student.sourceRecords||[]).length>1;
      const flags=[];
      if(info.stars>0 && documented===0)flags.push('有總星數，沒有逐關明細');
      if(info.stars===info.maxStars && documented<parts.length)flags.push('滿星但逐關證據不完整');
      if(hasConflict)flags.push('同名多 UID，需核對來源');
      return {cls:student.className,seat:student.seatNo,name:student.name,
        unit:UNIT_CONFIG[unit]?.name||unit,stars:info.stars,max:info.maxStars,
        documented,total:parts.length,flags};
    })).filter(x=>x.flags.length);
  }
  function openIntegrityAudit(){
    const all=integrityAuditRows();
    const dlg=document.createElement('dialog');
    dlg.style.cssText='max-width:min(980px,96vw);max-height:85vh;overflow:auto;border:1px solid #b8c7df;border-radius:14px;padding:22px';
    const rows=all.slice(0,200);
    dlg.innerHTML=`<h2>🔎 星星紀錄完整性稽核</h2><p>本次列出 ${all.length} 筆需要核對的單元紀錄。<strong>這些標記不能證明作弊</strong>，也可能來自舊版資料、跨 UID 或同步失敗。</p>
    <p>只讀取目前教師已授權的班級；不更動學生星星。</p>
    <div style="overflow:auto;max-height:50vh"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th>班級</th><th>座號</th><th>姓名</th><th>單元</th><th>星數</th><th>可見逐關</th><th>待核對原因</th></tr></thead><tbody>
    ${rows.map(x=>`<tr>${[x.cls,x.seat,x.name,x.unit,`${x.stars}/${x.max}`,`${x.documented}/${x.total}`,x.flags.join('、')].map(v=>`<td style="border-top:1px solid #ddd;padding:6px">${esc(v)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div><p style="font-size:12px">最多先顯示 200 筆，下載可包含全部紀錄。</p>
    <button type="button" id="integrityCsvBtn">下載待核對 CSV</button> <button type="button" id="integrityCloseBtn">關閉</button>`;
    document.body.appendChild(dlg);dlg.showModal();
    dlg.querySelector('#integrityCloseBtn').onclick=()=>dlg.close();
    dlg.addEventListener('close',()=>dlg.remove());
    dlg.querySelector('#integrityCsvBtn').onclick=()=>{
      const header=['班級','座號','姓名','單元','星星','滿分','已見逐關','逐關總數','待核對原因'];
      const lines=[header,...all.map(x=>[x.cls,x.seat,x.name,x.unit,x.stars,x.max,x.documented,x.total,x.flags.join('；')])];
      const csv='\ufeff'+lines.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
      const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download='116course_星星稽核_待核對.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    };
  }
  function installIntegrityAuditButton(){
    if(document.querySelector('#integrityAuditBtn'))return;
    const refresh=document.querySelector('#refreshBtn');if(!refresh)return;
    const btn=document.createElement('button');btn.id='integrityAuditBtn';btn.type='button';btn.textContent='🔎 成績可信度稽核';btn.style.marginLeft='8px';
    refresh.insertAdjacentElement('afterend',btn);btn.addEventListener('click',openIntegrityAudit);
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
      const legacyStatus=await readLegacyKnowledge();
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
      const travel=currentUnit==='media'?travelForStudent(r):null;
      return {
        "學期":currentTerm==='11601'?'116-1 上學期':currentTerm==='11602'?'116-2 下學期':'116 全學年',
        "班級":r.className||"",
        "座號":Number(r.seatNo||0),
        "姓名":r.name||"",
        "單元":cfgUnit.name,
        "星星":uData.stars,
        "滿星數":uData.maxStars,
        "評分":uData.score,
        "完成狀態":uData.completed?"已完成":"進行中",
        "目前進度":uData.currentLevel,
        "最近更新":fmtTime(r.updatedAt),
        ...(currentUnit==='media'?{
          "旅拍技術檢測分數":travel?Number(travel.score):"未檢測",
          "旅拍85分技術達標":travel?(travel.passed?"達標":"未達標"):"未檢測",
          "評分來源":"學生瀏覽器技術檢測（未經伺服器核驗）",
          "影片秒數":travel?Number(travel.duration).toFixed(1):"",
          "影片解析度":travel?`${travel.width}×${travel.height}`:"",
          "檢測時間":travel?fmtTime(travel.checkedAt):"",
          ...Object.fromEntries([['長度','duration'],['解析度','resolution'],['比例','ratio'],['可解碼','playable'],['畫面變化','motion'],['曝光','light'],['檔案效率','bitrate']].map(([name,key])=>['旅拍_'+name+'得分',travel?.details?.[key]??'']))
        }:{}),
        ...Object.fromEntries(getSubunitData(r,currentUnit).map(x=>[x.label+(x.max===0?"狀態":"星數"),x.max===0?(x.complete?"完成":x.observed?"進行中":"待核對"):x.observed?x.stars:"待核對"]))
      };
    });

    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,`${cls}班_${currentTerm}_${currentUnit}`.slice(0,31));
    XLSX.writeFile(wb,`學習進度_${cls}班_${currentTerm}_${currentUnit}.xlsx`);
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
      document.querySelectorAll('[data-teacher-term]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const term=btn.dataset.teacherTerm;
          if(!['11601','11602','year'].includes(term))return;
          currentTerm=term;
          currentUnit=term==='11601'?'unit1':term==='11602'?'media':'year';
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
          installIntegrityAuditButton();
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
  $("#closeTrashBtn").onclick=()=>$("#trashDialog").close();

  init();
})();
