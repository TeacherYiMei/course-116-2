/* 旅拍小導演 v16.84：影片留在本機，僅同步「學生端未核驗」技術檢測分數。 */
const $=id=>document.getElementById(id),cfg=window.COURSE115_FIREBASE_CONFIG;
const fileInput=$('travelFile'),button=$('travelSubmit'),statusBox=$('travelStatus'),resultBox=$('travelGrade');
let identity=null,uid=null,busy=false,db=null,fs=null,cloudAvailable=false,stageIndex=0,stageScores={},stageProof={};
const quizPassed=Array.from({length:4},()=>({}));
const STAGES=[
  {title:'① 分鏡與素材',min:18,max:32,goal:'先剪出 18–32 秒：開場、抵達、至少一個細節畫面。完成後匯出 MP4。'},
  {title:'② 剪輯與文字',min:40,max:58,goal:'剪成 40–58 秒：修剪鏡頭，加入片頭文字與至少兩處說明文字，再匯出 MP4。'},
  {title:'③ 特效與轉場',min:62,max:78,goal:'延長到 62–78 秒：安排片段銜接、試做轉場或動態效果，再匯出 MP4。'},
  {title:'④ 配樂與完成',min:87,max:93,goal:'完成 87–93 秒：加入適當配樂／音效，調整音量並匯出最終 MP4。'}
];
function stageGrade(base,duration){
  const s=STAGES[stageIndex],inRange=duration>=s.min&&duration<=s.max;
  // 只使用可被程式測量的項目；不假稱已自動辨識字幕、轉場或配樂。
  const cat=base.categories,by=k=>cat.find(c=>c.key===k)?.score||0;
  const durationPts=inRange?35:duration>=s.min-4&&duration<=s.max+4?15:0;
  const landscape=Math.abs(base.measurements.width/base.measurements.height-16/9)<=.06;
  const ratioPts=landscape?15:0;
  const score=Math.min(inRange&&landscape?100:84,durationPts+Math.round(by('resolution')/15*20)+ratioPts+Math.round(by('motion')/20*15)+by('light')+by('bitrate'));
  return {...base,score,passed:inRange&&landscape&&score>=85,categories:[
    {key:'stageDuration',title:'⏱️ 階段片長',score:durationPts,max:35,hint:`${duration.toFixed(1)} 秒；本站要求 ${s.min}–${s.max} 秒`},
    {key:'resolution',title:'📺 畫質',score:Math.round(by('resolution')/15*20),max:20,hint:'畫面需清楚可辨'},
    {key:'ratio',title:'📐 比例',score:ratioPts,max:15,hint:'本課程要求橫式 16:9'},
    {key:'motion',title:'🎞️ 畫面差異',score:Math.round(by('motion')/20*15),max:15,hint:'抽樣影格有變化，不代表已證明有剪輯或轉場'},
    {key:'light',title:'☀️ 亮度',score:by('light'),max:10,hint:'避免長時間過暗／過曝'},
    {key:'bitrate',title:'📦 檔案規格',score:by('bitrate'),max:5,hint:'檔案大小與片長比'}
  ]};
}
function renderStages(){
  $('travelStages').innerHTML=STAGES.map((s,i)=>`<span style="${i===stageIndex?'background:#ffe59e;font-weight:900;':''}">${stageScores[i]>=85?'✅':i===stageIndex?'🎬':'🔒'} ${s.title}${stageScores[i]!=null?' '+stageScores[i]+' 分':''}</span>`).join('');
  const s=STAGES[stageIndex];$('travelObjective').textContent=`🎯 本站目標：${s.goal} 程式只能核對 ${s.min}–${s.max} 秒等技術條件。`;
  document.querySelectorAll('[data-stage-guide]').forEach(el=>{el.hidden=Number(el.dataset.stageGuide)!==stageIndex;});
  showQuizProgress();
  $('travelSelfCheck').checked=false;$('travelFile').value='';
}
function showQuizProgress(){
  const done=Object.keys(quizPassed[stageIndex]).length;
  $('travelQuizStatus').textContent=done===2?'🎉 兩題都答對了！完成 Canva 操作、勾選自我檢核後，就能上傳本階段 MP4。':`🧩 本階段小挑戰 ${done} / 2 題答對。請完成兩題再檢測影片。`;
}
document.querySelectorAll('[data-phase][data-q]').forEach(btn=>btn.addEventListener('click',()=>{
  const phase=Number(btn.dataset.phase),question=btn.dataset.q;
  if(phase!==stageIndex||quizPassed[phase][question])return;
  if(btn.dataset.good==='true'){
    quizPassed[phase][question]=true;
    document.querySelectorAll(`[data-phase="${phase}"][data-q="${question}"]`).forEach(b=>{b.disabled=true;b.style.opacity=b===btn?'1':'.55';});
    btn.textContent='✅ '+btn.textContent;showQuizProgress();
  }else{$('travelQuizStatus').textContent='💡 再想想看：先依上方的操作步驟找答案，再試一次。';}
}));
function say(s,bad=false){statusBox.textContent=s;statusBox.style.color=bad?'#b91c1c':'#126f6a';}
function escapeText(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function connect(){
  try{
    const connected=await window.CourseDB?.ready,profile=window.STORE?.me();
    if(!connected||!profile){$('travelAuth').innerHTML='🔒 離線或尚未登入學生帳號，仍可進行<b>本機檢測</b>，只是不能同步。';return;}
    const [appMod,authMod,fsMod]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
    ]);
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
    const user=authMod.getAuth(app).currentUser;db=fsMod.getFirestore(app);fs=fsMod;
    if(!connected||!user||user.isAnonymous||!profile||!window.CourseDB.matchesStudentProfile(profile)){
      $('travelAuth').innerHTML='🔒 可以在這台裝置練習，但尚未登入正式學生帳號，<b>不能同步分數到教師版</b>。請先<a href="hub.html">回闖關地圖登入</a>。';return;
    }
    const snap=await fs.getDoc(fs.doc(db,'students',user.uid));
    if(!snap.exists())throw Error('尚未找到雲端學生資料');
    const p=snap.data();
    if(String(p.className)!==String(profile.cls)||Number(p.seatNo)!==Number(profile.seat)||String(p.name)!==String(profile.name))throw Error('帳號與班級／座號／姓名不一致');
    identity={className:p.className,seatNo:p.seatNo,name:p.name};uid=user.uid;
    // 學生身分已確認；旅拍新集合的存取權限須獨立檢查。
    // 尤其部署了新版網頁卻未發布 Firestore Rules 時，不應誤報成帳號登入失敗。
    try{
      const prior=await fs.getDoc(fs.doc(db,'travelAutoChecks',uid));
      cloudAvailable=true;
      $('travelAuth').textContent=`☁️ ${p.className} 班 ${p.seatNo} 號 ${p.name}｜已連線，可同步旅拍技術檢測分數。`;
      if(prior.exists()){
        const priorData=prior.data();if(priorData.gradingVersion==='stage-v1'&&priorData.stages){
          stageScores={...priorData.stages};stageProof={...(priorData.studentDeclaredStages||{})};
          const incomplete=STAGES.findIndex((s,i)=>!Number.isFinite(+stageScores[i])||+stageScores[i]<85);
          stageIndex=incomplete<0?3:incomplete;renderStages();
        }
        say(`雲端已有旅拍技術檢測紀錄，可繼續分階段挑戰。`);
      }
    }catch(e){
      cloudAvailable=false;
      const denied=String(e.code||'').includes('permission-denied');
      $('travelAuth').textContent=denied
        ?`✅ 已確認 ${p.className} 班 ${p.seatNo} 號 ${p.name}。🐣 本機技術闖關可正常使用；教師版同步尚未開通，需由老師發布「travelAutoChecks」的 Firestore 安全規則。`
        :`✅ 已確認學生身分。本機技術闖關可使用；目前無法讀取雲端紀錄（${e.code||'網路異常'}），稍後可重試。`;
    }
  }catch(e){$('travelAuth').textContent='🐣 本機技術闖關可使用，但尚未完成學生雲端身分確認：'+(e.code||e.message);}
}
function readVideo(file){return new Promise((resolve,reject)=>{
  const video=document.createElement('video'),url=URL.createObjectURL(file);
  video.preload='auto';video.muted=true;video.playsInline=true;
  const timer=setTimeout(()=>{cleanup();URL.revokeObjectURL(url);reject(Error('影片讀取逾時，請改用 H.264 MP4'));},12000);
  function cleanup(){clearTimeout(timer);video.onloadedmetadata=null;video.onerror=null;}
  video.onloadedmetadata=()=>{
    cleanup();
    if(!Number.isFinite(video.duration)||video.duration<=0||!video.videoWidth||!video.videoHeight){URL.revokeObjectURL(url);reject(Error('影片尺寸或時間無法讀取'));return;}
    resolve({video,url,duration:video.duration,width:video.videoWidth,height:video.videoHeight});
  };
  video.onerror=()=>{cleanup();URL.revokeObjectURL(url);reject(Error('此瀏覽器無法解碼影片'));};video.src=url;
});}
async function sampleFrames(video,duration,progress){
  const canvas=document.createElement('canvas');canvas.width=96;canvas.height=54;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('不支援畫面分析');
  const frames=[],lights=[];
  for(let i=1;i<=8;i++){
    const target=Math.min(Math.max(.1,duration*i/9),Math.max(.1,duration-.1));
    await new Promise((resolve,reject)=>{
      let finished=false;
      const ok=()=>finish();
      const timer=setTimeout(()=>finish(Error('影格讀取逾時')),4500);
      function finish(e){if(finished)return;finished=true;clearTimeout(timer);video.removeEventListener('seeked',ok);e?reject(e):resolve();}
      video.addEventListener('seeked',ok,{once:true});
      try{video.currentTime=target;}catch(e){finish(e);}
    });
    ctx.drawImage(video,0,0,96,54);
    const pixels=ctx.getImageData(0,0,96,54).data,mini=[];
    for(let p=0;p<pixels.length;p+=32)mini.push(.2126*pixels[p]+.7152*pixels[p+1]+.0722*pixels[p+2]);
    const avg=mini.reduce((a,b)=>a+b,0)/mini.length;
    lights.push(avg>=35&&avg<=220?1:0);frames.push(mini);progress(Math.round(i*100/8));
  }
  let motion=0;
  for(let i=1;i<frames.length;i++){
    let diff=0;for(let j=0;j<frames[i].length;j++)diff+=Math.abs(frames[i][j]-frames[i-1][j]);
    motion+=diff/frames[i].length;
  }
  return {motion:motion/(frames.length-1),goodLight:lights.reduce((a,b)=>a+b,0)/lights.length};
}
function show(result){
  const {score,passed,categories}=result;
  const items=categories.map(c=>`<div><strong>${escapeText(c.title)}｜${c.score} / ${c.max}</strong><span>${escapeText(c.hint)}</span></div>`).join('');
  resultBox.innerHTML=`<div class="travel-score"><div><small>🐣 小導演的技術檢測結果</small><div class="big">${score}<small style="font-size:1.15rem"> / 100</small></div></div><div style="font-size:2.9rem" aria-hidden="true">${passed?'🏆🌟':'🛠️💪'}</div></div>
    <div class="travel-meter"><i style="width:${score}%"></i></div><div class="travel-score-rows">${items}</div>
    <div class="${passed?'travel-pass':'travel-retry'}">${passed?'✅ 本階段技術達標！':'🌱 本階段尚未達標，請依提示重新匯出。'}　${Object.keys(stageScores).filter(k=>stageScores[k]>=85).length} / 4 站通過</div>
    <p class="small">此分數只反映影片技術條件。學生勾選的文字、轉場、音樂等技能屬自我聲明，沒有經過影像或音訊內容核驗。</p>`;
}
button.addEventListener('click',async()=>{
  if(busy)return;const file=fileInput.files?.[0];
  if(!file){say('請先選一支 MP4 影片喔！',true);return;}
  if(Object.keys(quizPassed[stageIndex]).length!==2){say('請先完成本階段的兩題操作小挑戰。',true);return;}
  if(!$('travelSelfCheck').checked){say('請先完成這一站的操作，並勾選自我檢核。',true);return;}
  if(!/\.mp4$/i.test(file.name)||!['','video/mp4'].includes(file.type)){say('請從 Canva 匯出 MP4 影片。',true);return;}
  if(file.size<1||file.size>250*1024*1024){say('請選小於 250 MB 的影片。',true);return;}
  busy=true;button.disabled=true;const p=$('travelProgress');p.style.display='block';p.value=0;
  let media;
  try{
    say('🐣 小導演正在讀取影片……');media=await readVideo(file);
    let sampled={motion:null,goodLight:null};
    try{sampled=await sampleFrames(media.video,media.duration,n=>{p.value=n;say(`🔎 正在檢查影片畫面…… ${n}%`);});}
    catch(e){say('部分影格無法分析，這部分採保守分數：'+e.message);}
    const result=stageGrade(window.TRAVEL_GRADER.grade({duration:media.duration,width:media.width,height:media.height,size:file.size,...sampled}),media.duration);
    const checkedStage=stageIndex;
    stageScores[checkedStage]=result.score;stageProof[checkedStage]=true;
    show(result);
    if(result.passed&&stageIndex<STAGES.length-1){stageIndex++;renderStages();}
    else renderStages();
    const completed=STAGES.every((s,i)=>Number(stageScores[i])>=85);
    const overall=completed?Math.round(STAGES.reduce((n,s,i)=>n+Number(stageScores[i]),0)/STAGES.length):Math.min(84,Math.round(STAGES.reduce((n,s,i)=>n+(Number(stageScores[i])||0),0)/STAGES.length));
    if(uid&&identity&&cloudAvailable){
      try{
        await fs.setDoc(fs.doc(db,'travelAutoChecks',uid),{
          studentUid:uid,...identity,term:'11602',unit:'media',score:overall,passed:completed,
          duration:result.measurements.duration,width:result.measurements.width,height:result.measurements.height,
          fileSize:result.measurements.size,details:Object.fromEntries(result.categories.map(c=>[c.key,c.score])),
          gradingVersion:'stage-v1',stages:stageScores,studentDeclaredStages:stageProof,completedStages:STAGES.filter((s,i)=>Number(stageScores[i])>=85).length,
          source:'student-browser-unverified',checkedAt:fs.serverTimestamp()
        });
        say(completed?'🎉 四階段技術條件全部達標，已同步教師版（學生端、未核驗）。':'✅ 本階段檢測已同步，請依上方目標繼續下一站。');
      }catch(e){say('檢測完成，但雲端同步失敗：'+(e.code||e.message),true);}
    }else say(uid
      ?'✅ 本機技術檢測已完成。教師版同步尚未開通；請老師確認 Firestore 規則後再進行一次檢測。'
      :'✅ 本機技術檢測已完成。正式登入學生帳號後才可同步。');
  }catch(e){say('檢測失敗：'+(e.message||e),true);}
  finally{if(media){media.video.pause();media.video.removeAttribute('src');media.video.load();URL.revokeObjectURL(media.url);}busy=false;button.disabled=false;p.style.display='none';}
});
renderStages();connect();
