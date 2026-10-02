
(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let db=null,currentUser=null,fs=null,auth=null,authMod=null;

  function configured(){
    return !!(
      cfg.enabled &&
      cfg.apiKey && !String(cfg.apiKey).startsWith("PASTE_") &&
      cfg.projectId && !String(cfg.projectId).startsWith("PASTE_")
    );
  }

  function scoreFromStars(stars,totalStars){
    return totalStars?Math.round(Number(stars||0)/Number(totalStars)*100):0;
  }

  function normalizedSeat(seatNo){
    return String(Number(String(seatNo||"").trim())).padStart(2,"0");
  }

  function studentAccountEmail(className,seatNo){
    // 不使用學生真實 Email；僅作 Firebase Email/Password 的穩定帳號識別。
    return `python1151-${String(className||"").trim()}-${normalizedSeat(seatNo)}@student.course115.local`;
  }

  const api={
    configured:configured(),
    state:"starting",
    stage:"尚未開始",
    uid:null,
    error:null,
    errorCode:"",
    errorMessage:"",
    ready:null,

    diagnostic(){
      return {
        configured:api.configured,
        state:api.state,
        stage:api.stage,
        uid:api.uid,
        errorCode:api.errorCode,
        errorMessage:api.errorMessage,
        projectId:cfg.projectId||"",
        authDomain:cfg.authDomain||""
      };
    },

    async reconnect(){
      api.error=null;api.errorCode="";api.errorMessage="";
      return await initialize(true);
    },

    isAnonymous(){
      return !!currentUser?.isAnonymous;
    },

    accountEmail(className,seatNo){
      return studentAccountEmail(className,seatNo);
    },

    async linkStudentAccount(className,seatNo,password){
      await api.ready;
      if(!currentUser||!auth||!authMod) throw Error("AUTH_NOT_READY");
      const email=studentAccountEmail(className,seatNo);
      const credential=authMod.EmailAuthProvider.credential(email,password);
      const result=await authMod.linkWithCredential(currentUser,credential);
      currentUser=result.user;
      api.uid=currentUser.uid;
      api.stage="學生學習帳號已綁定";
      return {ok:true,uid:currentUser.uid,email};
    },

    async signInStudentAccount(className,seatNo,password){
      await api.ready;
      if(!auth||!authMod) throw Error("AUTH_NOT_READY");
      const email=studentAccountEmail(className,seatNo);
      const result=await authMod.signInWithEmailAndPassword(auth,email,password);
      currentUser=result.user;
      api.uid=currentUser.uid;
      api.stage="學生學習帳號登入完成";
      return {ok:true,uid:currentUser.uid,email};
    },

    async saveStudent(payload){
      await api.ready;
      if(!api.configured||!currentUser||!db) return {ok:false,offline:true};
      try{
        api.stage="寫入 Firestore";
        const ref=fs.doc(db,"students",currentUser.uid);
        await fs.setDoc(ref,{
          uid:currentUser.uid,
          className:String(payload.className||"").trim(),
          seatNo:String(payload.seatNo||"").trim(),
          name:String(payload.name||"").trim(),
          courseId:"python",
          stars:Number(payload.stars||0),
          totalStars:Number(payload.totalStars||0),
          score:scoreFromStars(payload.stars,payload.totalStars),
          progress:payload.progress||{},
          completed:!!payload.completed,
          certificateUnlocked:!!payload.completed,
          currentStation:payload.currentStation||"",
          currentChallenge:Number(payload.currentChallenge||0),
          updatedAt:fs.serverTimestamp(),
          lastSeenAt:fs.serverTimestamp()
        },{merge:true});
        api.stage="Firestore 寫入完成";
        return {ok:true};
      }catch(e){
        api.state="error";
        api.stage="寫入 Firestore 失敗";
        api.error=e;
        api.errorCode=e?.code||"";
        api.errorMessage=e?.message||String(e);
        throw e;
      }
    },

    async loadStudent(){
      await api.ready;
      if(!api.configured||!currentUser||!db) return null;
      try{
        api.stage="讀取 Firestore";
        const snap=await fs.getDoc(fs.doc(db,"students",currentUser.uid));
        api.stage="Firestore 讀取完成";
        return snap.exists()?snap.data():null;
      }catch(e){
        api.state="error";
        api.stage="讀取 Firestore 失敗";
        api.error=e;
        api.errorCode=e?.code||"";
        api.errorMessage=e?.message||String(e);
        throw e;
      }
    }
  };

  async function initialize(force=false){
    if(!configured()){
      api.state="disabled";
      api.stage="Firebase 尚未設定";
      return false;
    }
    try{
      api.state="starting";
      api.stage="載入 Firebase SDK";
      const [appMod,authM,fsMod]=await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
      ]);

      api.stage="初始化 Firebase App";
      let app;
      try{
        app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
      }catch(e){
        app=appMod.initializeApp(cfg);
      }

      authMod=authM;
      auth=authM.getAuth(app);
      db=fsMod.getFirestore(app);
      fs=fsMod;

      api.stage="設定登入狀態保存";
      await authM.setPersistence(auth,authM.browserLocalPersistence);

      api.stage="匿名登入";
      if(!auth.currentUser || force){
        if(force && auth.currentUser){
          currentUser=auth.currentUser;
        }else{
          const cred=await authM.signInAnonymously(auth);
          currentUser=cred.user;
        }
      }else{
        currentUser=auth.currentUser;
      }

      api.uid=currentUser?.uid||null;
      api.state="ready";
      api.stage="Firebase 已連線";
      api.error=null;api.errorCode="";api.errorMessage="";
      return true;
    }catch(e){
      api.state="error";
      api.error=e;
      api.errorCode=e?.code||"";
      api.errorMessage=e?.message||String(e);
      if(api.stage==="載入 Firebase SDK") api.stage="Firebase SDK 載入失敗";
      else if(api.stage==="匿名登入") api.stage="匿名登入失敗";
      else if(api.stage==="設定登入狀態保存") api.stage="登入狀態設定失敗";
      else if(api.stage==="初始化 Firebase App") api.stage="Firebase App 初始化失敗";
      return false;
    }
  }

  api.ready=initialize(false);
  window.CourseDB=api;
})();
