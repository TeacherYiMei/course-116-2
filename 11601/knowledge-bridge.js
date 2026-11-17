/* 116 學年度知識闖關特攻隊：舊題庫／原站闖關邏輯共用，但進度由 116 STORE 管理。
   不再建立第二個學生帳號，不改舊 midtermStudents 資料。 */
(function(){
 'use strict';
 const K='course116_midterm_review_v2',PROFILE='midterm_review_profile_v2';
 let current=null,db=null,fs=null,auth=null,loading=null;
 const byId=id=>document.getElementById(id);
 function me(){return window.STORE?.me?.()||null}
 function stable(){const p=me(),u=auth?.currentUser;return !!(p&&u&&!u.isAnonymous&&window.CourseDB?.matchesStudentProfile?.(p))}
 function state(){try{return JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){return {}}}
 function validStation(r){return r&&typeof r==='object'&& !Array.isArray(r)}
 function star(r){if(!r)return 0;return r.completed?3:Math.max(0,Math.min(2,Math.floor((Number(r.firstRoundCorrect)||0)/4)))}
 function best(a,b){a=validStation(a)?a:{};b=validStation(b)?b:{};return { ...a,...b,
   completed:!!(a.completed||b.completed),correct:Math.max(Number(a.correct)||0,Number(b.correct)||0),
   lastCorrect:Math.max(Number(a.lastCorrect)||0,Number(b.lastCorrect)||0),
   firstRoundCorrect:Math.max(Number(a.firstRoundCorrect)||0,Number(b.firstRoundCorrect)||0),
   rounds:Math.max(Number(a.rounds)||0,Number(b.rounds)||0),
   totalWrongAnswers:Math.max(Number(a.totalWrongAnswers)||0,Number(b.totalWrongAnswers)||0),
   weakTopics:[...new Set([...(a.weakTopics||[]),...(b.weakTopics||[])])],
   completedAt:a.completedAt||b.completedAt||null};}
 function mergeCloudLocally(cloud){
   const old=state(),incoming=cloud?.stations||{},out={...old};
   ['R1','R2','R3','R4'].forEach(id=>{if(incoming[id])out[id]=best(out[id],incoming[id]);});
   localStorage.setItem(K,JSON.stringify(out));
 }
 function fromStore(){const out={};for(let i=1;i<=4;i++){
    const id='R'+i,r=STORE.level('knowledge',id);const e=r?.extra?.review;
    if(e)out[id]=best(e,{completed:!!r.done,correct:r.done?10:Number(e.correct||0)});
    else if(r?.done)out[id]={completed:true,correct:10,lastCorrect:10,firstRoundCorrect:10,rounds:1,weakTopics:[],totalWrongAnswers:0};
   }return {stations:out};}
 function progress(){
   const stars=['R1','R2','R3','R4'].reduce((n,id)=>n+(Number(STORE.level('knowledge',id)?.stars)||0),0);
   byId('knTotal').textContent='⭐ '+stars+' / 12'+(stars>=12?' · 🏆 特攻王':'');
 }
 async function sdk(){
   await CourseDB.ready;
   const [appMod,authMod,fsMod]=await Promise.all([
     import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
     import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
     import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')]);
   const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(window.COURSE115_FIREBASE_CONFIG);
   auth=authMod.getAuth(app);db=fsMod.getFirestore(app);fs=fsMod;
   await auth.authStateReady?.();current=auth.currentUser;
 }
 async function oldCloud(){
   if(!stable())return null;
   try{
     const snap=await fs.getDoc(fs.doc(db,'midtermStudents',auth.currentUser.uid));
     if(!snap.exists())return null;
     const old=snap.data(),p=me();
     if(String(old.className)!==String(p.cls)||Number(old.seatNo)!==Number(p.seat)||String(old.name)!==String(p.name))return null;
     return old;
   }catch(e){console.warn('舊站紀錄唯讀查詢未完成',e);return null;}
 }
 // 提供原四站引擎需要的同名 API，但學生登入只依主站已驗證之帳號。
 const ready=sdk();
 window.MidtermDB={ready,
    user(){return stable()?auth.currentUser:null},
    async loginOrCreate(){throw Object.assign(new Error('請在 116 主站登入後返回'),{code:'USE_MAIN_LOGIN'})},
    async logout(){throw Object.assign(new Error('請在主站登出'),{code:'USE_MAIN_LOGOUT'})},
    async load(){
      if(!stable())return null;
      await STORE.syncFromCloud?.();
      const newer=fromStore(),older=await oldCloud();
      return {stations:{...(older?.stations||{}),...Object.fromEntries(
        ['R1','R2','R3','R4'].map(id=>[id,best(older?.stations?.[id],newer.stations[id])]))}};
    },
    async save(payload){
      if(!stable())throw new Error('STABLE_ACCOUNT_REQUIRED');
      let saved=true;
      for(let i=1;i<=4;i++){
        const id='R'+i,rec=payload.stations?.[id];if(!rec)continue;
        const prior=STORE.level('knowledge',id)||{};
        const merged=best(prior.extra?.review,rec);
        const score=star(merged);
        STORE.saveLevel('knowledge',id,{stars:score,done:!!merged.completed,score:Math.round((Number(merged.firstRoundCorrect)||0)*10),extra:{review:merged}});
      }
      progress();
      // 不能把觸發上傳視為已同步：原 STORE 預設非同步，狀態以主站提示為準。
      return {ok:saved};
    }
 };
 window.KNOWLEDGE_BRIDGE={async start(){
   try{
     await ready;
     if(!stable()){
       byId('knAuth').classList.remove('kn-hidden');
       return;
     }
     const p=me();const wanted={className:p.cls,seatNo:String(Number(p.seat)),name:p.name};
     try{const prev=JSON.parse(localStorage.getItem(PROFILE)||'null');if(prev && (String(prev.className)!==wanted.className||Number(prev.seatNo)!==Number(wanted.seatNo)||String(prev.name)!==wanted.name)){localStorage.removeItem(K)}}catch(e){localStorage.removeItem(K)}
     localStorage.setItem(PROFILE,JSON.stringify(wanted));
     byId('knGame').classList.remove('kn-hidden');
     await STORE.syncFromCloud?.();
     const restored=await window.MidtermDB.load();if(restored)mergeCloudLocally(restored);
     byId('studentTag').textContent=`${p.cls} 班｜${Number(p.seat)} 號｜${p.name}`;
     await window.MIDTERM.init();
     // 進度同步以原本 STORE 儲存功能完成；禁止跨使用者共用本機舊站紀錄。
     progress();
   }catch(e){byId('knAuth').classList.remove('kn-hidden');byId('knAuth').textContent='無法載入學習帳號或題庫，請回到主站確認登入狀態。 '+(e?.message||'');console.error(e);}
 }};
})();
