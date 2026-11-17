/* 116course 跨章延伸挑戰。獨立模組 extension；與原單元成績互不覆蓋。 */
(function(){'use strict';
 const TASKS=[
  {id:'E1',title:'位元解碼員',area:'數位時代',kind:'quiz',desc:'讀懂十進位、二進位與 8 位元儲存。'},
  {id:'E2',title:'文字密碼翻譯官',area:'文字數位化',kind:'quiz',desc:'分辨 ASCII 字元編碼與數字資料。'},
  {id:'E3',title:'影音容量偵探',area:'聲音與影像數位化',kind:'quiz',desc:'用取樣頻率、量化位元及像素估算檔案容量。'},
  {id:'E4',title:'電腦系統診斷師',area:'系統平臺',kind:'quiz',desc:'認識五大單元、記憶體與雲端平臺。'},
  {id:'E5',title:'Python 二進位轉換器',area:'Python × 數位時代',kind:'python',desc:'從空白編輯器建立 8 位元二進位轉換程式。'},
  {id:'E6',title:'數位檔案管理師',area:'三章綜合',kind:'python',desc:'自行撰寫未壓縮 PCM 音訊容量計算程式。'}
 ];
 let active='E1', pythonReady=null, lastCode={}, seed=null, questions={};
 const $=s=>document.querySelector(s);
 function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 function record(id){return STORE.level('extension',id)||{};}
 function stars(id){return Math.min(3, Math.max(0,Number(record(id).stars)||0));}
 function sum(){return TASKS.reduce((a,t)=>a+stars(t.id),0);}
 function buildSeed(){ if(seed!==null)return; seed= Math.floor(Math.random()*100000); }
 function questionSet(id){
  buildSeed();if(questions[id])return questions[id];
  const n=19+(seed%75),letter='ABCDEFGHJKLMNPQRSTUVWXYZ'[(seed>>3)%24];
  const q={
    E1:[['將十進位 '+n+' 轉成二進位（不加 0b）',n.toString(2)],['用 8 位元儲存這個數字（補足前面的 0）',n.toString(2).padStart(8,'0')],['8 位元可表示幾種不同組合？','256']],
    E2:[['大寫英文字母 '+letter+' 的 ASCII 十進位編碼是？',String(letter.charCodeAt(0))],['ASCII 十進位 66 對應哪個英文字母？','B'],['要在電腦中通用地呈現各國文字，較適合選 ASCII 還是 Unicode？','Unicode']],
    E3:[['單聲道 8000 Hz、8 位元、錄 2 秒，未壓縮資料多少位元組？','16000'],['16×16 像素，每像素 4 位元，未壓縮影像資料多少位元組？','128'],['聲音的取樣頻率提高，其他條件不變時，未壓縮資料量會增加、減少還是不變？','增加']],
    E4:[['負責實際執行算術與邏輯運算的硬體單元是哪一個？','算術與邏輯單元'],['關機後仍保存檔案的裝置：RAM 還是 SSD？','SSD'],['多人同時在線上協作文件，主要利用哪一種平臺？','雲端系統平臺']]
  };questions[id]=q[id];return q[id];
 }
 function render(){
  if(!STORE.me())return;
  const me=STORE.me();$('#extIdentity').textContent=`目前學生：${me.cls} 班 ${Number(me.seat)} 號 ${me.name}`;
  $('#extSummary').innerHTML=`<div class="ext-summary"><div class="ext-chip">★ 延伸星星 <strong>${sum()} / 18</strong></div><div class="ext-chip">已完成 <strong>${TASKS.filter(t=>stars(t.id)===3).length} / 6</strong> 站</div><div class="ext-chip">🏅 ${sum()===18?'跨章整合大師':sum()>=12?'程式任務達人':sum()>=6?'數位探索者':'探索中'}</div><div class="ext-chip">${stars('E1')===3&&stars('E2')===3?'✅':'🔒'} 資料解碼徽章</div><div class="ext-chip">${stars('E3')===3&&stars('E4')===3?'✅':'🔒'} 系統觀察徽章</div><div class="ext-chip">${stars('E5')===3&&stars('E6')===3?'✅':'🔒'} Python 實作徽章</div></div>`;
  $('#extNav').innerHTML=TASKS.map(t=>`<button type="button" data-id="${t.id}" aria-current="${active===t.id}"><b>${t.id}｜${t.title}</b><small>${t.area} · ★ ${stars(t.id)}/3</small></button>`).join('');
  $('#extNav').querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.id;render();});
  const t=TASKS.find(t=>t.id===active);
  let html=`<h2>${esc(t.title)}</h2><p>${esc(t.desc)}</p><p>本關最高 <b>3 顆星</b>。曾經取得的星星不會因為再次練習而降低。</p>`;
  if(t.kind==='quiz'){
   html+=`<div class="ext-help">以教材觀念自行計算、作答；每個正確答案獲得 1 顆星。系統記錄同一關歷次最高成績。</div>`;
   html+=questionSet(t.id).map((q,i)=>`<div class="ext-question"><label for="extq${i}">${i+1}. ${esc(q[0])}</label><input id="extq${i}" autocomplete="off" spellcheck="false" aria-label="第${i+1}題作答"></div>`).join('');
   html+=`<button class="ext-button" id="extCheck">檢查答案並儲存星星</button>`;
  } else {
   html+=t.id==='E5'?`<div class="ext-help">任務規格：使用 input() 接收一個 0～255 的整數，輸出剛好 8 位數的二進位字串。範例：輸入 5 → 輸出 00000101。<br>提示：先將文字轉成數字，再使用 bin() 或 format() 處理二進位與補 0；請自己組合程式，不提供完整答案。</div>`:
   `<div class="ext-help">任務規格：依序輸入四個整數：取樣頻率 Hz、每樣本位元數、聲道數、秒數。輸出未壓縮 PCM 的資料量（整數位元組，僅輸出數字）。假設位元深度是 8 的倍數。範例：輸入 8000、8、1、2 → 輸出 16000。<br>提示：一個樣本的位元組數＝位元數÷8；容量＝頻率×每樣本位元組×聲道×秒數。</div>`;
   html+=`<p class="ext-warning">⌨️ 請自行輸入 Python。此編輯區會阻止貼上與拖入程式碼；提供概念提示但不提供可複製完整答案。此設計無法技術上完全阻止外部工具或人工轉錄。</p><label for="extCode"><b>Python 程式編輯區</b></label><textarea id="extCode" class="ext-code" autocomplete="off" spellcheck="false" placeholder="# 請從這裡自己輸入 Python 程式"></textarea><button class="ext-button" id="extCheck">▶ 執行三組測試並記錄成果</button><p id="extRuntime">首次啟動需載入 Python 執行環境（需連線）。</p>`;
  }
  html+=`<div class="ext-feedback" id="extFeedback" role="status" aria-live="polite">準備好就開始挑戰。</div>`;
  $('#extTask').innerHTML=html;
  if(t.kind==='python'){
    const ta=$('#extCode');ta.value=lastCode[t.id]||STORE.draft('ext-code-'+t.id)||'';
    ta.addEventListener('input',()=>{lastCode[t.id]=ta.value;STORE.draft('ext-code-'+t.id,ta.value);});
    ta.addEventListener('paste',ev=>{ev.preventDefault();$('#extFeedback').textContent='請自行輸入程式碼，這次挑戰不開放貼上。';});
    ta.addEventListener('drop',ev=>{ev.preventDefault();$('#extFeedback').textContent='此處不接受拖曳文字，請自行鍵入。';});
  }
  $('#extCheck').onclick=t.kind==='quiz'?()=>checkQuiz(t.id):()=>checkPython(t.id);
 }
 function normalized(v){return String(v).trim().replace(/\s+/g,'').toLowerCase();}
 function checkQuiz(id){
  const q=questionSet(id);let correct=0,lines=[];
  q.forEach(([label,answer],i)=>{const val=$('#extq'+i).value;const ok=normalized(val)===normalized(answer);correct+=ok?1:0;lines.push(`第 ${i+1} 題：${ok?'✓ 正確':'✗ 再想想'}`);});
  const previous=stars(id);
  STORE.saveLevel('extension',id,{stars:correct,done:correct===3,score:Math.round(correct/3*100)});
  const result=`本次 ${correct}/3 題正確。\n${lines.join('\n')}\n已保留歷次最高星數：★ ${stars(id)}/3；雲端同步狀態以主站提示為準。`;
  render();$('#extFeedback').textContent=result;
  showReward(id,correct,previous);
 }

 function showReward(id,earned,previous){
  const current=stars(id), total=sum(), task=TASKS.find(t=>t.id===id);
  const gained=Math.max(0,current-previous);
  const finished=current===3, newlyFinished=previous<3&&finished;
  const nextIndex=TASKS.findIndex(t=>t.id===id)+1;
  const next=TASKS[nextIndex];
  document.querySelector('#extReward')?.remove();
  const layer=document.createElement('div');
  layer.id='extReward';layer.className='ext-reward-overlay';
  layer.innerHTML=`<div class="ext-reward-card" role="dialog" aria-modal="true" aria-labelledby="extRewardTitle" tabindex="-1">
    <div class="ext-sparkles" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--i:${i}">✦</i>`).join('')}</div>
    <div class="ext-reward-icon" aria-hidden="true">${finished?'🏆':current>0?'🌟':'💪'}</div>
    <div class="ext-reward-eyebrow">${finished?'挑戰成功！':current>0?'繼續加油！':'再試一次！'}</div>
    <h2 id="extRewardTitle">${esc(task.title)}</h2>
    <div class="ext-reward-stars" aria-label="本關共獲得 ${current} 顆星">${[1,2,3].map((n)=>`<span class="${n<=current?'won':'empty'}" style="--n:${n}" aria-hidden="true">★</span>`).join('')}</div>
    <div class="ext-reward-count">本關累積 <strong>${current} / 3</strong> 顆星</div>
    <p class="ext-reward-message">${gained>0?`🎉 這次新獲得 <b>${gained} 顆星</b>！`:finished?'✨ 已獲得滿星，紀錄會繼續保留！':earned>0?'星星已累積；再次練習也不會扣星。':'錯誤不會扣除已獲得的星星。'}</p>
    ${newlyFinished?'<div class="ext-reward-pass">✅ 第一次完成本站，正式過關！</div>':''}
    <div class="ext-reward-total">🧭 延伸挑戰累積：<strong>${total} / 18 ★</strong></div>
    <div class="ext-reward-actions"><button type="button" class="ext-button ext-reward-close">返回本關</button>${next?'<button type="button" class="ext-button ext-reward-next">挑戰下一站 →</button>':'<a class="ext-button ext-reward-link" href="hub.html">返回闖關地圖 →</a>'}</div>
    <small>成績以原有最高星數保存；雲端同步狀態請依主站提示確認。</small>
   </div>`;
  document.body.appendChild(layer);
  const close=()=>{layer.remove();document.removeEventListener('keydown',onKey)};
  const onKey=(e)=>{if(e.key==='Escape')close()};
  document.addEventListener('keydown',onKey);
  layer.querySelector('.ext-reward-close').onclick=close;
  layer.querySelector('.ext-reward-next')?.addEventListener('click',()=>{close();active=next.id;render();window.scrollTo({top:0,behavior:'smooth'});});
  layer.addEventListener('click',e=>{if(e.target===layer)close()});
  layer.querySelector('.ext-reward-card').focus();
 }

 function updateNavOnly(){const old=$('#extFeedback')?.textContent;render();if(old)$('#extFeedback').textContent=old;}
 async function ensurePython(){
  if(!pythonReady)pythonReady=PYRUN.init(CONFIG.PYODIDE_URL).catch(e=>{pythonReady=null;throw e;});
  await pythonReady;
 }
 function pyCases(id){
  const n=15+Math.floor(Math.random()*150);
  if(id==='E5')return [5,n,254].map(x=>({inputs:[String(x)],expect:x.toString(2).padStart(8,'0')}));
  return [
   {inputs:['8000','8','1','2'],expect:'16000'},
   {inputs:['16000','16','2','3'],expect:'192000'},
   {inputs:['22050','8','2','4'],expect:'176400'}
  ];
 }
 async function checkPython(id){
  const code=$('#extCode')?.value||'';
  if(code.trim().length<12){$('#extFeedback').textContent='請先自行寫出完整程式，再執行測試。';return;}
  if(!/\binput\s*\(/.test(code)||!/\bprint\s*\(/.test(code)){$('#extFeedback').textContent='請確認程式有使用 input() 接收資料，並用 print() 輸出結果。';return;}
  const b=$('#extCheck');b.disabled=true;const msg=$('#extFeedback');msg.textContent='正在執行 Python 與三組測試…';
  try{
   await ensurePython();let correct=0;let feedback=[];
   for(const [i,test] of pyCases(id).entries()){
    const r=await PYRUN.run(code,test.inputs,{timeout:4000});
    const out=(r.events||[]).filter(ev=>ev[0]==='out').map(ev=>ev[1]).join('').trim();
    const ok=!r.error&&!r.need&&!r.timeout&&out===test.expect;
    if(ok)correct++;
    feedback.push(`測試 ${i+1}：${ok?'✓ 通過':'✗ 未通過'}${r.error?'（執行錯誤）':''}`);
   }
   const previous=stars(id);
   STORE.saveLevel('extension',id,{stars:correct,done:correct===3,score:Math.round(correct*100/3)});
   msg.textContent=`本次通過 ${correct}/3 組測試；歷次最高 ★ ${stars(id)}/3。\n${feedback.join('\n')}\n若失敗，請檢查輸入型態、輸出格式與運算邏輯。`;
   const old=msg.textContent;render();$('#extFeedback').textContent=old;
   showReward(id,correct,previous);
  }catch(e){msg.textContent=`執行環境尚未成功載入，未評分或改動成績。請檢查網路：${String(e.message||e).slice(0,120)}`;}
  finally{const btn=$('#extCheck');if(btn)btn.disabled=false;}
 }
 document.addEventListener('DOMContentLoaded',()=>UI.requireLogin(()=>{render();window.addEventListener('store:change',()=>{if(STORE.me()){const v=$('#extSummary');if(v){const saved=$('#extFeedback')?.textContent;render();if(saved)$('#extFeedback').textContent=saved;}}});}));
})();
