(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let db=null,currentUser=null,fs=null,auth=null,authMod=null;

  function configured(){return !!(cfg.enabled&&cfg.apiKey&&!String(cfg.apiKey).startsWith("PASTE_")&&cfg.projectId)}
  function normalizedSeat(seatNo){return String(Number(String(seatNo||"").trim())).padStart(2,"0")}
  function studentAccountEmail(className,seatNo){
    return `python1151-${String(className||"").trim()}-${normalizedSeat(seatNo)}@student.course115.local`;
  }
  // 穩定帳號登入／綁定完成後通知 STORE：將目前瀏覽器尚未上傳的舊單元紀錄合併至原 UID。
  function announceStableAccount(){
    if(currentUser && !currentUser.isAnonymous){
      try{window.dispatchEvent(new CustomEvent("courseauth:stable",{detail:{uid:currentUser.uid}}));}catch(e){}
    }
  }

  const api={
    configured:configured(),state:"starting",stage:"尚未開始",uid:null,error:null,errorCode:"",errorMessage:"",ready:null,
    diagnostic(){return {configured:api.configured,state:api.state,stage:api.stage,uid:api.uid,errorCode:api.errorCode,errorMessage:api.errorMessage,projectId:cfg.projectId||"",authDomain:cfg.authDomain||""}},
    async reconnect(){api.error=null;api.errorCode="";api.errorMessage="";return await initialize(true)},
    isAnonymous(){return !!currentUser?.isAnonymous},
    accountEmail(className,seatNo){return studentAccountEmail(className,seatNo)},
    matchesStudentProfile(profile){
      if(!profile || !currentUser || currentUser.isAnonymous)return false;
      return String(currentUser.email||"").toLowerCase()===studentAccountEmail(profile.cls||profile.className,profile.seat||profile.seatNo).toLowerCase();
    },
    async linkStudentAccount(className,seatNo,password){
      await api.ready;if(!currentUser||!auth||!authMod)throw Error("AUTH_NOT_READY");
      const email=studentAccountEmail(className,seatNo);
      const credential=authMod.EmailAuthProvider.credential(email,password);
      const result=await authMod.linkWithCredential(currentUser,credential);
      currentUser=result.user;api.uid=currentUser.uid;api.stage="學生學習帳號已綁定";
      announceStableAccount();
      return {ok:true,uid:currentUser.uid,email};
    },
    async signInStudentAccount(className,seatNo,password){
      await api.ready;if(!auth||!authMod)throw Error("AUTH_NOT_READY");
      const email=studentAccountEmail(className,seatNo);
      const result=await authMod.signInWithEmailAndPassword(auth,email,password);
      currentUser=result.user;api.uid=currentUser.uid;api.stage="學生學習帳號登入完成";
      announceStableAccount();
      return {ok:true,uid:currentUser.uid,email};
    },
    async changeOwnPassword(newPassword){
      await api.ready;
      if(!currentUser||!authMod)throw Error("AUTH_NOT_READY");
      const pwd=String(newPassword||"");
      if(pwd.length<6)throw Error("密碼至少需要 6 個字元");
      await authMod.updatePassword(currentUser,pwd);
      await api.saveStudent({
        mustChangePassword:false,
        passwordChangedAt:fs.serverTimestamp()
      });
      return {ok:true};
    },
    async signOutStudentAccount(){
      await api.ready;
      if(!auth||!authMod)throw Error("AUTH_NOT_READY");
      await authMod.signOut(auth);
      const cred=await authMod.signInAnonymously(auth);
      currentUser=cred.user;
      api.uid=currentUser.uid;
      api.stage="已切換為新學生";
      return {ok:true,uid:currentUser.uid};
    },
    // v16.52: Keep the immutable identity already stored for this UID.
    // Legacy students may have seatNo "1" while new login normalizes it to "01".
    // Firestore rules deny any student write changing seatNo, name or className.
    async existingIdentity(ref, profile){
      const snap=await fs.getDoc(ref);
      if(!snap.exists()) return {exists:false, identity:profile||{}, data:null};
      const old=snap.data();
      if(profile){
        const oldCls=String(old.className||"").trim();
        const newCls=String(profile.className||"").trim();
        const oldSeat=Number(String(old.seatNo||"").trim());
        const newSeat=Number(String(profile.seatNo||"").trim());
        if(oldCls && newCls && oldCls!==newCls) throw Error("STUDENT_IDENTITY_MISMATCH: className");
        if(old.seatNo!=null && profile.seatNo!=null &&
           (!Number.isInteger(oldSeat)||!Number.isInteger(newSeat)||oldSeat!==newSeat))
           throw Error("STUDENT_IDENTITY_MISMATCH: seatNo");
      }
      return {exists:true,data:old,identity:{
        className:old.className,seatNo:old.seatNo,name:old.name
      }};
    },
    async saveStudent(payload){
      await api.ready;
      if(!api.configured||!currentUser||!db)return {ok:false};
      const ref=fs.doc(db,"students",currentUser.uid);
      const requested={className:payload.className,seatNo:payload.seatNo,name:payload.name};
      const existing=await api.existingIdentity(ref,requested);
      const safePayload={...payload};
      if(existing.exists){
        // Never attempt an immutable profile change from a student session.
        for(const field of ["className","seatNo","name"]){
          if(existing.identity[field]!==undefined) safePayload[field]=existing.identity[field];
          else delete safePayload[field];
        }
      }
      await fs.setDoc(ref,{
        ...safePayload,uid:currentUser.uid,updatedAt:fs.serverTimestamp(),
        lastSeenAt:fs.serverTimestamp()
      },{merge:true});
      return {ok:true};
    },
    async loadStudent(){
      await api.ready;if(!api.configured||!currentUser||!db)return null;
      const snap=await fs.getDoc(fs.doc(db,"students",currentUser.uid));
      return snap.exists()?snap.data():null;
    },
    async saveCourseLevel(term,mod,levelId,record,profile){
      await api.ready;
      if(!api.configured||!currentUser||currentUser.isAnonymous||!db)return {ok:false,reason:"NO_STABLE_ACCOUNT"};
      const ref=fs.doc(db,"students",currentUser.uid);
      const snap=await fs.getDoc(ref);
      const old=snap.exists()?(snap.data().courseProgress||{}):{};
      const next=JSON.parse(JSON.stringify(old));
      next[term]=next[term]||{modules:{}};
      next[term].modules=next[term].modules||{};
      next[term].modules[mod]=next[term].modules[mod]||{levels:{}};
      next[term].modules[mod].levels=next[term].modules[mod].levels||{};
      const prev=next[term].modules[mod].levels[levelId]||{};
      next[term].modules[mod].levels[levelId]={...prev,...record,stars:Math.max(Number(prev.stars||0),Number(record.stars||0)),updatedAt:Date.now()};
      const payload={courseProgress:next,courseProgressUpdatedAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp(),lastSeenAt:fs.serverTimestamp()};
      if(profile){
        const requested={className:String(profile.cls||profile.className||""),seatNo:String(profile.seat||profile.seatNo||""),name:String(profile.name||"")};
        const existing=await api.existingIdentity(ref,requested);
        if(!existing.exists) Object.assign(payload,requested);
        // Existing identity is immutable: leave all three fields unchanged.
      }
      await fs.setDoc(ref,payload,{merge:true});
      return {ok:true,uid:currentUser.uid};
    },
    async loadCourseSnapshot(term,profile){
      await api.ready;
      if(!api.configured||!currentUser||currentUser.isAnonymous||!db)return null;
      const snap=await fs.getDoc(fs.doc(db,"students",currentUser.uid));
      if(!snap.exists())return {modules:{}};
      const all=snap.data().courseProgress||{};
      return all[term]||{modules:{}};
    },
    async saveCourseSnapshot(term,data,profile){
      await api.ready;
      if(!api.configured||!currentUser||currentUser.isAnonymous||!db)return {ok:false,reason:"NO_STABLE_ACCOUNT"};
      const ref=fs.doc(db,"students",currentUser.uid);
      const snap=await fs.getDoc(ref);
      const remote=snap.exists()?(snap.data().courseProgress||{}):{};
      const merged=JSON.parse(JSON.stringify(remote));
      const localModules=(data&&data.modules)||{};
      merged[term]=merged[term]||{modules:{}};
      merged[term].modules=merged[term].modules||{};
      for(const [mod,modData] of Object.entries(localModules)){
        merged[term].modules[mod]=merged[term].modules[mod]||{levels:{}};
        const dest=merged[term].modules[mod].levels||(merged[term].modules[mod].levels={});
        for(const [id,rec] of Object.entries((modData&&modData.levels)||{})){
          const old=dest[id]||{};
          dest[id]={...old,...rec,stars:Math.max(Number(old.stars||0),Number(rec.stars||0))};
        }
      }
      const payload={courseProgress:merged,courseProgressUpdatedAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp(),lastSeenAt:fs.serverTimestamp()};
      if(profile){
        const requested={className:String(profile.cls||profile.className||""),seatNo:String(profile.seat||profile.seatNo||""),name:String(profile.name||"")};
        const existing=await api.existingIdentity(ref,requested);
        if(!existing.exists) Object.assign(payload,requested);
        // Existing identity is immutable: leave all three fields unchanged.
      }
      await fs.setDoc(ref,payload,{merge:true});
      return {ok:true,uid:currentUser.uid};
    }
  };

  async function initialize(force=false){
    if(!configured()){api.state="disabled";api.stage="Firebase 尚未設定";return false}
    try{
      api.state="starting";api.stage="載入 Firebase SDK";
      const [appMod,authM,fsMod]=await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
      ]);
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
      authMod=authM;auth=authM.getAuth(app);db=fsMod.getFirestore(app);fs=fsMod;
      await authM.setPersistence(auth,authM.browserSessionPersistence);
      // 等待 Firebase 還原上一頁的穩定學生登入狀態，再決定是否建立匿名帳號。
      // 舊版直接檢查 auth.currentUser，會在還原尚未完成時誤建匿名帳號，導致其他單元無法寫入學生 UID。
      currentUser=await new Promise((resolve,reject)=>{
        let off=()=>{};
        off=authM.onAuthStateChanged(auth,user=>{off();resolve(user);},err=>{off();reject(err);});
      });
      if(!currentUser){
        const cred=await authM.signInAnonymously(auth);
        currentUser=cred.user;
      }
      api.uid=currentUser?.uid||null;api.state="ready";api.stage=currentUser?.isAnonymous?"Firebase 已連線（尚未登入學生帳號）":"Firebase 學生帳號已連線";
      return true;
    }catch(e){
      api.state="error";api.error=e;api.errorCode=e?.code||"";api.errorMessage=e?.message||String(e);api.stage="Firebase 初始化失敗";return false;
    }
  }
  api.ready=initialize(false).then(ok=>{try{window.dispatchEvent(new CustomEvent("coursedb:ready"));}catch(e){};return ok;});window.CourseDB=api;
})();