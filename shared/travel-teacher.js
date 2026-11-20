/* 旅拍 v16.84：僅顯示學生端未核驗的影片技術檢測結果，不處理影片與人工評分。 */
import {getApp,getApps,initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,query,where,getDocs,getDoc,doc} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(window.COURSE115_FIREBASE_CONFIG);
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id),list=$('travelTeacherList'),status=$('travelTeacherStatus');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let profile=null,rows=[];
const canSee=c=>profile?.role==='admin'||Array.isArray(profile?.classes)&&profile.classes.map(String).includes(String(c));
function render(){
  if(!rows.length){list.innerHTML='<p class="status">目前尚無技術檢測紀錄。學生可以到「90 秒旅拍」頁面選 MP4 進行免費檢測。</p>';return;}
  list.innerHTML=rows.map(r=>{
    const detail=r.details||{};
    const items=[['⏱️ 長度','duration',30],['📺 解析度','resolution',15],['📐 比例','ratio',10],['✅ 可解碼','playable',10],['🎞️ 變化','motion',20],['☀️ 曝光','light',10],['📦 檔案','bitrate',5]];
    return `<article style="border-radius:16px;padding:15px;background:linear-gradient(130deg,#f1fbff,#fffbef);border:1px solid #c9e9e4">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px"><b>${esc(r.className)} 班 ${esc(r.seatNo)} 號 ${esc(r.name)}</b><strong style="font-size:1.3rem;color:${r.passed?'#087f5b':'#b36a20'}">${Number(r.score)||0} / 100｜${r.passed?'🌟 技術達標':'🌱 繼續加油'}</strong></div>
      <p class="status" style="margin:5px 0">影片約 ${Number(r.duration||0).toFixed(1)} 秒｜${Number(r.width)||0} × ${Number(r.height)||0}｜${r.checkedAt?.toDate?.().toLocaleString('zh-TW')||'時間未知'}</p>
      <div style="display:flex;flex-wrap:wrap;gap:7px">${items.map(([name,key,max])=>`<span style="background:white;border:1px solid #cce3ef;border-radius:99px;padding:5px 9px;font-size:.86rem">${name} ${Number(detail[key])||0}/${max}</span>`).join('')}</div>
      <p class="status" style="color:#a35a00">⚠️ 學生端檢測，未經伺服器核驗；未儲存或收取影片，無法單獨證明作品品質。</p></article>`;
  }).join('');
}
async function load(){
  if(!profile){status.textContent='請先登入教師帳號';return;}
  status.textContent='讀取技術檢測紀錄中……';
  try{
    let docs=[];
    if(profile.role==='admin')docs=(await getDocs(collection(db,'travelAutoChecks'))).docs;
    else for(const cls of profile.classes||[]){
      docs.push(...(await getDocs(query(collection(db,'travelAutoChecks'),where('className','==',String(cls))))).docs);
    }
    const selected=$('classFilter')?.value||'';
    rows=docs.map(x=>({id:x.id,...x.data()})).filter(x=>canSee(x.className)&&(!selected||String(x.className)===selected));
    rows.sort((a,b)=>String(a.className).localeCompare(String(b.className))||Number(a.seatNo)-Number(b.seatNo));
    status.textContent=`找到 ${rows.length} 筆技術檢測紀錄（非正式作品評分）`;render();
  }catch(e){status.textContent='讀取失敗：'+(e.code||e.message);}
}
$('travelTeacherRefresh').addEventListener('click',load);
$('classFilter')?.addEventListener('change',()=>{if(profile)load();});
onAuthStateChanged(auth,async user=>{
  profile=null;rows=[];list.innerHTML='';if(!user)return;
  try{
    const snap=await getDoc(doc(db,'teachers',user.uid));
    if(!snap.exists()||!['teacher','admin'].includes(snap.data().role))return;
    profile=snap.data();await load();
  }catch(e){status.textContent='教師身分檢查失敗：'+(e.code||e.message);}
});
