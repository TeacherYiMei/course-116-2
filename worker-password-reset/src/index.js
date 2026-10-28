const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{
  status,
  headers:{"Content-Type":"application/json; charset=utf-8",...headers}
});

function corsHeaders(env,request){
  const origin=request.headers.get("Origin")||"";
  const allowed=String(env.ALLOWED_ORIGIN||"").replace(/\/$/,"");
  return {
    "Access-Control-Allow-Origin":origin===allowed?origin:allowed,
    "Access-Control-Allow-Headers":"Authorization, Content-Type",
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Access-Control-Max-Age":"86400",
    "Vary":"Origin"
  };
}

function b64url(bytes){
  const arr=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
  let s="";
  for(const b of arr)s+=String.fromCharCode(b);
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function b64urlText(obj){
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}
function pemToArrayBuffer(pem){
  const b64=String(pem)
    .replace(/\\n/g,"\n")
    .replace(/-----BEGIN PRIVATE KEY-----/g,"")
    .replace(/-----END PRIVATE KEY-----/g,"")
    .replace(/\s+/g,"");
  const bin=atob(b64);
  const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out.buffer;
}

async function googleAccessToken(env){
  const now=Math.floor(Date.now()/1000);
  const unsigned=[
    b64urlText({alg:"RS256",typ:"JWT"}),
    b64urlText({
      iss:env.SERVICE_ACCOUNT_EMAIL,
      scope:"https://www.googleapis.com/auth/identitytoolkit",
      aud:"https://oauth2.googleapis.com/token",
      iat:now,
      exp:now+3600
    })
  ].join(".");

  const key=await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(env.SERVICE_ACCOUNT_PRIVATE_KEY),
    {name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},
    false,
    ["sign"]
  );
  const signature=await crypto.subtle.sign(
    {name:"RSASSA-PKCS1-v1_5"},
    key,
    new TextEncoder().encode(unsigned)
  );
  const assertion=`${unsigned}.${b64url(signature)}`;

  const resp=await fetch("https://oauth2.googleapis.com/token",{
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const data=await resp.json();
  if(!resp.ok||!data.access_token)throw Error("SERVICE_ACCOUNT_TOKEN_FAILED");
  return data.access_token;
}

async function verifyFirebaseTeacher(env,idToken){
  const resp=await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`,
    {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({idToken})
    }
  );
  const data=await resp.json();
  if(!resp.ok||!data.users?.[0]?.localId)throw Error("INVALID_TEACHER_TOKEN");
  return data.users[0];
}

function fsValue(v){
  if(!v)return undefined;
  if("stringValue" in v)return v.stringValue;
  if("integerValue" in v)return Number(v.integerValue);
  if("doubleValue" in v)return Number(v.doubleValue);
  if("booleanValue" in v)return !!v.booleanValue;
  if("arrayValue" in v)return (v.arrayValue.values||[]).map(fsValue);
  if("mapValue" in v){
    const out={};
    for(const [k,x] of Object.entries(v.mapValue.fields||{}))out[k]=fsValue(x);
    return out;
  }
}
function firestoreFields(fields){
  const out={};
  for(const [k,v] of Object.entries(fields||{}))out[k]=fsValue(v);
  return out;
}

async function firestoreGet(env,path,idToken){
  const url=`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/${path}`;
  const resp=await fetch(url,{headers:{Authorization:`Bearer ${idToken}`}});
  if(resp.status===403)throw Error("FIRESTORE_PERMISSION_DENIED");
  if(resp.status===404)throw Error("DOCUMENT_NOT_FOUND");
  if(!resp.ok)throw Error("FIRESTORE_READ_FAILED");
  return await resp.json();
}

async function markMustChangePassword(env,studentUid,idToken){
  const base=`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/students/${encodeURIComponent(studentUid)}`;
  const qs=new URLSearchParams();
  qs.append("updateMask.fieldPaths","mustChangePassword");
  qs.append("updateMask.fieldPaths","passwordResetAt");

  const resp=await fetch(`${base}?${qs.toString()}`,{
    method:"PATCH",
    headers:{
      "Authorization":`Bearer ${idToken}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      fields:{
        mustChangePassword:{booleanValue:true},
        passwordResetAt:{timestampValue:new Date().toISOString()}
      }
    })
  });
  if(!resp.ok)throw Error("PASSWORD_FLAG_WRITE_FAILED");
}

function makeTemporaryPassword(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  const bytes=new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out="A7!";
  for(let i=0;i<9;i++)out+=chars[bytes[i]%chars.length];
  return out;
}

function normalizedSeat(seatNo){
  return String(Number(String(seatNo||"").trim())).padStart(2,"0");
}
function expectedStudentEmail(className,seatNo){
  return `python1151-${String(className||"").trim()}-${normalizedSeat(seatNo)}@student.course115.local`;
}

async function adminRepairLogin(env,studentUid,email,password){
  const accessToken=await googleAccessToken(env);
  const resp=await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/accounts:update`,
    {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${accessToken}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({localId:studentUid,email,password})
    }
  );
  const data=await resp.json().catch(()=>({}));
  if(!resp.ok)throw Error(data?.error?.message||"AUTH_ACCOUNT_REPAIR_FAILED");
  return data;
}

export default{
  async fetch(request,env){
    const cors=corsHeaders(env,request);
    const origin=request.headers.get("Origin")||"";
    const allowed=String(env.ALLOWED_ORIGIN||"").replace(/\/$/,"");

    if(request.method==="OPTIONS"){
      if(origin!==allowed)return json({ok:false,error:"ORIGIN_NOT_ALLOWED"},403,cors);
      return new Response(null,{status:204,headers:cors});
    }
    if(origin!==allowed)return json({ok:false,error:"ORIGIN_NOT_ALLOWED"},403,cors);

    const url=new URL(request.url);
    if(request.method!=="POST"||url.pathname!=="/reset-student-password"){
      return json({ok:false,error:"NOT_FOUND"},404,cors);
    }

    try{
      const header=request.headers.get("Authorization")||"";
      const idToken=header.startsWith("Bearer ")?header.slice(7):"";
      if(!idToken)return json({ok:false,error:"MISSING_AUTH"},401,cors);

      const body=await request.json();
      const studentUid=String(body.studentUid||"").trim();
      if(!studentUid)return json({ok:false,error:"MISSING_STUDENT_UID"},400,cors);

      const authUser=await verifyFirebaseTeacher(env,idToken);
      const teacherUid=authUser.localId;

      const teacherDoc=await firestoreGet(
        env,
        `teachers/${encodeURIComponent(teacherUid)}`,
        idToken
      );
      const teacher=firestoreFields(teacherDoc.fields);
      const role=String(teacher.role||"");
      if(role!=="teacher"&&role!=="admin")return json({ok:false,error:"NOT_A_TEACHER"},403,cors);

      // Firestore Rules 先做第一層授權：老師無權限時這裡就會 403。
      const studentDoc=await firestoreGet(
        env,
        `students/${encodeURIComponent(studentUid)}`,
        idToken
      );
      const student=firestoreFields(studentDoc.fields);
      const studentClass=String(student.className||"");
      const classes=Array.isArray(teacher.classes)?teacher.classes.map(String):[];
      if(role!=="admin"&&!classes.includes(studentClass)){
        return json({ok:false,error:"CLASS_NOT_AUTHORIZED"},403,cors);
      }

      const expectedEmail=expectedStudentEmail(student.className,student.seatNo);
      const temporaryPassword=makeTemporaryPassword();
      const repaired=await adminRepairLogin(env,studentUid,expectedEmail,temporaryPassword);
      await markMustChangePassword(env,studentUid,idToken);

      return json({
        ok:true,
        temporaryPassword,
        studentUid,
        loginEmail:repaired.email||expectedEmail,
        repairedLogin:true
      },200,cors);
    }catch(e){
      const error=e?.message||String(e);
      let status=500;
      if(error==="INVALID_TEACHER_TOKEN"||error==="MISSING_AUTH")status=401;
      if(["FIRESTORE_PERMISSION_DENIED","NOT_A_TEACHER","CLASS_NOT_AUTHORIZED"].includes(error))status=403;
      if(error==="DOCUMENT_NOT_FOUND")status=404;
      return json({ok:false,error,message:error},status,cors);
    }
  }
};
