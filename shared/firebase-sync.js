(function(){
  const cfg=window.COURSE115_FIREBASE_CONFIG||{};
  let db=null,currentUser=null,fs=null,auth=null,authMod=null;

  function configured(){return !!(cfg.enabled&&cfg.apiKey&&!String(cfg.apiKey).startsWith("PASTE_")&&cfg.projectId)}
  function normalizedSeat(seatNo){return String(Number(String(seatNo||"").trim())).padStart(2,"0")}
  function studentAccountEmail(className,seatNo){
    return `python1151-${String(className||"").trim()}-${normalizedSeat(seatNo)}@student.course115.local`;
  }

  const api={
    configured:configured(),state:"starting",stage:"尚未開始",uid:null,error:null,errorCode:"",errorMessage:"",ready:null,
    diagnostic(){return {configured:api.configured,state:api.state,stage:api.stage,uid:api.uid,errorCode:api.errorCode,errorMessage:api.errorMessage,projectId:cfg.projectId||"",authDomain:cfg.authDomain||""}},
    async reconnect(){api.error=null;api.errorCode="";api.errorMessage="";return await initialize(true)},
    isAnonymous(){return !!currentUser?.isAnonymous},
    accountEmail(className,seatNo){return studentAccountEmail(className,seatNo)},
    async linkStudentAccount(className,seatNo,password){
      await api.ready;if(!currentUser||!auth||!authMod)throw Error("AUTH_NOT_READY");
      const email=studentAccountEmail(className,seatNo);
      const credential=authMod.EmailAuthProvider.credential(email,password);
      const result=await authMod.linkWithCredential(currentUser,credential);
      currentUser=result.user;api.uid=currentUser.uid;api.stage="學生學習帳號已綁定";
      return {ok:true,uid:currentUser.uid,email};
    },
    async signInStudentAccount(className,seatNo,password){
      await api.ready;if(!auth||!authMod)throw Error("AUTH_NOT_READY");
      const email=studentAccountEmail(className,seatNo);
      const result=await authMod.signInWithEmailAndPassword(auth,email,password);
      currentUser=result.user;api.uid=currentUser.uid;api.stage="學生學習帳號登入完成";
      return {ok:true,uid:currentUser.uid,email};
    },
    async saveStudent(payload){
      await api.ready;
      if(!api.configured||!currentUser||!db)return {ok:false};
      const ref=fs.doc(db,"students",currentUser.uid);
      await fs.setDoc(ref,{
        ...payload,
        uid:currentUser.uid,
        updatedAt:fs.serverTimestamp(),
        lastSeenAt:fs.serverTimestamp()
      },{merge:true});
      return {ok:true};
    },
    async loadStudent(){
      await api.ready;if(!api.configured||!currentUser||!db)return null;
      const snap=await fs.getDoc(fs.doc(db,"students",currentUser.uid));
      return snap.exists()?snap.data():null;
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
      await authM.setPersistence(auth,authM.browserLocalPersistence);
      if(!auth.currentUser&&!force){const cred=await authM.signInAnonymously(auth);currentUser=cred.user}
      else currentUser=auth.currentUser;
      api.uid=currentUser?.uid||null;api.state="ready";api.stage="Firebase 已連線";
      return true;
    }catch(e){
      api.state="error";api.error=e;api.errorCode=e?.code||"";api.errorMessage=e?.message||String(e);api.stage="Firebase 初始化失敗";return false;
    }
  }
  api.ready=initialize(false);window.CourseDB=api;
})();