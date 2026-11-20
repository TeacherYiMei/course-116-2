/* 旅拍小導演 v16.84：影片留在本機，僅同步「學生端未核驗」技術檢測分數。 */
const $=id=>document.getElementById(id),cfg=window.COURSE115_FIREBASE_CONFIG;
const fileInput=$('travelFile'),button=$('travelSubmit'),statusBox=$('travelStatus'),resultBox=$('travelGrade');
let identity=null,uid=null,busy=false,db=null,fs=null;
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
    $('travelAuth').textContent=`☁️ ${p.className} 班 ${p.seatNo} 號 ${p.name}｜可同步技術檢測紀錄（非教師認證成績）。`;
    const prior=await fs.getDoc(fs.doc(db,'travelAutoChecks',uid));
    if(prior.exists())say(`上次技術檢測 ${prior.data().score} 分，可重新挑戰。`);
  }catch(e){$('travelAuth').textContent='目前僅能本機練習；雲端身分確認失敗：'+(e.code||e.message);}
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
    <div class="${passed?'travel-pass':'travel-retry'}">${passed?'🎉 85 分達標！獲得「旅拍小導演技術達標」徽章！':'🌱 還差 '+(85-score)+' 分！調整技術項目，再來挑戰一次吧！'}</div>
    <p class="small">此分數只反映影片技術特徵，無法認證故事、字幕、轉場或音樂品質；抽樣影格差異也不是實際剪接數量。</p>`;
}
button.addEventListener('click',async()=>{
  if(busy)return;const file=fileInput.files?.[0];
  if(!file){say('請先選一支 MP4 影片喔！',true);return;}
  if(!/\.mp4$/i.test(file.name)||!['','video/mp4'].includes(file.type)){say('請從 Canva 匯出 MP4 影片。',true);return;}
  if(file.size<1||file.size>250*1024*1024){say('請選小於 250 MB 的影片。',true);return;}
  busy=true;button.disabled=true;const p=$('travelProgress');p.style.display='block';p.value=0;
  let media;
  try{
    say('🐣 小導演正在讀取影片……');media=await readVideo(file);
    let sampled={motion:null,goodLight:null};
    try{sampled=await sampleFrames(media.video,media.duration,n=>{p.value=n;say(`🔎 正在檢查影片畫面…… ${n}%`);});}
    catch(e){say('部分影格無法分析，這部分採保守分數：'+e.message);}
    const result=window.TRAVEL_GRADER.grade({duration:media.duration,width:media.width,height:media.height,size:file.size,...sampled});
    show(result);
    if(uid&&identity){
      try{
        await fs.setDoc(fs.doc(db,'travelAutoChecks',uid),{
          studentUid:uid,...identity,term:'11602',unit:'media',score:result.score,passed:result.passed,
          duration:result.measurements.duration,width:result.measurements.width,height:result.measurements.height,
          fileSize:result.measurements.size,details:Object.fromEntries(result.categories.map(c=>[c.key,c.score])),
          source:'student-browser-unverified',checkedAt:fs.serverTimestamp()
        });
        say('✅ 技術檢測完成！已同步至教師版（學生端、未核驗）。');
      }catch(e){say('檢測完成，但雲端同步失敗：'+(e.code||e.message),true);}
    }else say('✅ 本機技術檢測完成。登入學生帳號後才能同步。');
  }catch(e){say('檢測失敗：'+(e.message||e),true);}
  finally{if(media){media.video.pause();media.video.removeAttribute('src');media.video.load();URL.revokeObjectURL(media.url);}busy=false;button.disabled=false;p.style.display='none';}
});
connect();
