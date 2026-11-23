/* 旅拍 v16.84：僅顯示學生端未核驗的影片技術檢測結果，不處理影片與人工評分。 */
import {getApp,getApps,initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,query,where,getDocs,getDoc,doc} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const app=getApps().length?getApp():initializeApp(window.COURSE115_FIREBASE_CONFIG);
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id),list=$('travelTeacherList'),status=$('travelTeacherStatus');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let profile=null,rows=[],allRecords=[];
const canSee=c=>profile?.role==='admin'||Array.isArray(profile?.classes)&&profile.classes.map(String).includes(String(c));
function render(){
  if(!rows.length){list.innerHTML='<p class="status">目前尚無技術檢測紀錄。學生可以到「90 秒旅拍」頁面選 MP4 進行免費檢測。</p>';return;}
  list.innerHTML=rows.map(r=>{
    const detail=r.details||{};
    const staged=['stage-v1','stage-v2','stage-v3'].includes(r.gradingVersion);
    const items=staged?[[r.gradingVersion==='stage-v1'?'⏱️ 階段片長':'🖼️ 截圖佐證',r.gradingVersion==='stage-v1'?'stageDuration':'timelineEvidence',35],['📺 畫質','resolution',20],['📐 比例','ratio',15],['🎞️ 變化','motion',15],['☀️ 亮度','light',10],['📦 檔案','bitrate',5]]:[['⏱️ 長度','duration',30],['📺 解析度','resolution',15],['📐 比例','ratio',10],['✅ 可解碼','playable',10],['🎞️ 變化','motion',20],['☀️ 曝光','light',10],['📦 檔案','bitrate',5]];
    return `<article style="border-radius:16px;padding:15px;background:linear-gradient(130deg,#f1fbff,#fffbef);border:1px solid #c9e9e4">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px"><b>${esc(r.className)} 班 ${esc(r.seatNo)} 號 ${esc(r.name)}</b><strong style="font-size:1.3rem;color:${r.passed?'#087f5b':'#b36a20'}">${Number(r.score)||0} / 100｜${r.passed?'🌟 技術達標':'🌱 繼續加油'}</strong></div>
      <p class="status" style="margin:5px 0">影片約 ${Number(r.duration||0).toFixed(1)} 秒｜${Number(r.width)||0} × ${Number(r.height)||0}｜${r.checkedAt?.toDate?.().toLocaleString('zh-TW')||'時間未知'}</p>
      ${staged?'<p class="status"><b>'+(r.gradingVersion==='stage-v3'?'最後檢測暫評：':'舊版四站技術分數：')+'</b>'+(r.gradingVersion==='stage-v3'?'完整作品 '+(r.stages?.[0]==null?'未提交':Number(r.stages[0])+' 分'):['分鏡素材','剪輯文字','特效轉場','音樂完成'].map((s,i)=>esc(s)+' '+(r.stages?.[i]==null?'未提交':Number(r.stages[i])+' 分')).join(' ｜ '))+'</p>':'<p class="status">舊版單次技術檢測（未分階段）。</p>'}
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
    allRecords=docs.map(x=>({id:x.id,...x.data()})).filter(x=>canSee(x.className));
    rows=allRecords.filter(x=>!selected||String(x.className)===selected);
    rows.sort((a,b)=>String(a.className).localeCompare(String(b.className))||Number(a.seatNo)-Number(b.seatNo));
    // 主教師表依 UID 合併顯示，與既有星星完全分開。
    window.dispatchEvent(new CustomEvent('travel:records',{detail:{records:allRecords}}));
    status.textContent=`找到 ${rows.length} 筆技術檢測紀錄（非正式作品評分）`;render();
  }catch(e){rows=[];allRecords=[];window.dispatchEvent(new CustomEvent('travel:records',{detail:{records:[]}}));render();status.textContent='讀取失敗：'+(e.code||e.message)+'；請檢查旅拍集合的 Firestore 安全規則。';}
}
$('travelTeacherRefresh').addEventListener('click',load);
$('travelTeacherExport')?.addEventListener('click',()=>{
  if(!profile){alert('請先登入教師帳號');return;}
  if(!rows.length){alert('目前沒有可匯出的旅拍技術檢測紀錄');return;}
  if(!window.XLSX){alert('Excel 匯出元件尚未載入，請重新整理或檢查網路');return;}
  const points=[['影片長度','duration'],['解析度','resolution'],['畫面比例','ratio'],['可解碼','playable'],['畫面變化','motion'],['曝光','light'],['檔案效率','bitrate']];
  const data=rows.map(r=>({
    '學期':'116-2 下學期','班級':r.className,'座號':Number(r.seatNo),'姓名':r.name,
    '技術檢測分數':Number(r.score)||0,'85分技術達標':r.passed?'達標':'未達標',
    '成績來源':'學生端技術檢測（未核驗）','評分版本':r.gradingVersion||'舊版單次評分',
    '新版完整作品檢測':r.gradingVersion==='stage-v3'?(r.stages?.[0]??'未提交'):'非新版','分鏡素材階段':r.gradingVersion==='stage-v3'?'－':(r.stages?.[0]??'未提交'),'剪輯文字階段':r.stages?.[1]??'未提交',
    '特效轉場階段':r.stages?.[2]??'未提交','配樂完成階段':r.stages?.[3]??'未提交',
    '時間軸截圖佐證暫分':Number(r.details?.timelineEvidence)||0,'影片秒數':Number(r.duration||0).toFixed(1),
    '解析度':`${Number(r.width)||0}×${Number(r.height)||0}`,
    ...Object.fromEntries(points.map(([title,key])=>[title+'得分',Number(r.details?.[key])||0])),
    '檢測時間':r.checkedAt?.toDate?.().toLocaleString('zh-TW')||''
  }));
  const sheet=XLSX.utils.json_to_sheet(data),book=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book,sheet,'旅拍技術檢測');
  const cls=$('classFilter')?.value||'授權班級';
  XLSX.writeFile(book,`11602_90秒旅拍_技術檢測_${cls}.xlsx`);
});
$('classFilter')?.addEventListener('change',()=>{if(profile)load();});
onAuthStateChanged(auth,async user=>{
  profile=null;rows=[];allRecords=[];list.innerHTML='';window.dispatchEvent(new CustomEvent('travel:records',{detail:{records:[]}}));if(!user)return;
  try{
    const snap=await getDoc(doc(db,'teachers',user.uid));
    if(!snap.exists()||!['teacher','admin'].includes(snap.data().role))return;
    profile=snap.data();await load();
  }catch(e){status.textContent='教師身分檢查失敗：'+(e.code||e.message);}
});
