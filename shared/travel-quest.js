/* Canva 旅拍逐步冒險 v16.95：每步一顆星，以 STORE 本地進度及既有學生雲端同步管道記錄。 */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id),mod='media';
  const tasks=[
    {icon:'🧭',title:'我的旅拍故事',goal:'先選一個你熟悉的地點，想好三個鏡頭。',steps:['選一個能安全拍攝的地點，例如校園角落、公園或市場。','依照下面的五個小問題，一格一格填寫，不用另外拿紙。','至少準備三段自己拍的影片，下一關再加入 Canva。'],ask:'把你的旅拍企劃填完整',mode:'form',fields:[['主題名稱','例如：午後的公園散步'],['拍攝地點','例如：附近公園（不要填住家地址）'],['開場畫面','影片一開始，觀眾會看到什麼？'],['中間畫面','接著拍到什麼景色、活動或細節？'],['結尾畫面','最後想用什麼畫面收尾？']]},
    {icon:'🎨',title:'打開 Canva 新專案',goal:'真的建立一份橫式影片，而不是只看教學。',steps:['開啟 Canva 並登入。','首頁選「影片」，找不到就選「建立」→「影片」。','選橫式 16:9 尺寸，再把專案名稱改成「我的旅拍」。','在畫面下方找出「時間軸」，如沒有看到，可先點影片縮圖或切換時間軸檢視。'],ask:'你找到影片時間軸了嗎？',mode:'choice',options:['在畫面下方','在 Canva 帳號設定'],right:0},
    {icon:'📂',title:'上傳我的三個鏡頭',goal:'把素材放進 Canva，但先不要急著加特效。',steps:['左側點「上傳」→「上傳檔案」。','選取你自己拍攝的三段影片，等縮圖上傳完成。','把影片依序拖進下方「主影片軌」。','點播放，看它們是否照想要的順序出現。'],ask:'時間軸順序應該怎麼看？',mode:'choice',options:['左到右依序播放','檔名短的先播放'],right:0},
    {icon:'✂️',title:'剪掉多餘畫面',goal:'讓畫面一開始就吸引人。',steps:['點選第一段影片，拖曳片段左右邊緣來修剪。','把走到定位前的晃動畫面剪掉。','第二段也試著修剪，保留最有趣的部分。','播放比較修剪前後的節奏。'],ask:'完成後確認：至少修剪過兩段影片。',mode:'confirm'},
    {icon:'🧱',title:'加一個片頭分頁',goal:'讓旅拍先有自己的標題畫面。',steps:['把播放頭移到最前面。','在主軌點「＋」或「新增」，選「空白片段／Blank」。','設定片頭背景色，保持文字能閱讀。','播放檢查空白片段是否真的出現在開頭。'],ask:'片頭要獨立顯示，應加入哪個物件？',mode:'choice',options:['主軌的空白片段','只改檔案名稱'],right:0},
    {icon:'🔤',title:'寫下旅拍片名',goal:'加入一行真正會出現在影片裡的文字。',steps:['在 Canva 左側選「文字／Text」→「新增標題」。','輸入你的旅拍名稱，例如「港邊的午後」。','把文字放在片頭，調整大小與顏色，避免和背景混在一起。','在多軌時間軸檢查文字的出現位置；播放確認片頭看得到字。'],ask:'輸入你實際放到 Canva 片頭的名稱',mode:'text'},
    {icon:'💬',title:'讓景點自己說故事',goal:'再做兩段短字幕，而不是把長篇文字塞滿畫面。',steps:['找到影片中最有特色的畫面。','選「文字」，新增一句簡短說明，例如「這是我最喜歡的轉角」。','把文字軌調整到這個鏡頭出現的時間。','另一個畫面重做一次；每句盡量不超過兩行。'],ask:'把實際放進 Canva 的兩句字幕填出來',mode:'form',fields:[['第一句字幕','第一個重點畫面的字幕'],['第二句字幕','第二個重點畫面的字幕']]},
    {icon:'✨',title:'讓文字自然登場',goal:'嘗試淡入，不要讓所有文字同時跳出。',steps:['點一下片頭文字，尋找上方「動畫」。','先試一個簡單的淡入或滑入，再播放比較。','景點字幕也選一種容易閱讀的動畫。','避免每個字都使用不同特效。'],ask:'完成後確認：已預覽至少一種文字動畫。',mode:'confirm'},
    {icon:'🔀',title:'幫兩段畫面接起來',goal:'練習轉場，讓場景切換自然。',steps:['在主影片軌找到兩段相鄰的影片。','把滑鼠移到兩段交界處，找「新增轉場／Add transition」。','選淡化或其他不搶戲的轉場。','播放銜接處，再試一次沒有轉場的版本，選較自然的。'],ask:'轉場通常放在哪裡？',mode:'choice',options:['兩段相鄰畫面的交界處','影片檔名中間'],right:0},
    {icon:'🎼',title:'替旅拍設計自己的配樂',goal:'先決定情緒與節奏，再挑選或製作可合法使用的音樂。',steps:['先選一種情緒：輕快、溫柔、神祕或熱鬧。','在紙上敲出四拍節奏，例如「咚－噠－咚噠」；試著讓節奏搭配開場鏡頭。','Canva 左側找「音訊／Audio」，試聽有授權的音樂；也可以用自己錄製的拍手、腳步、環境音作原創節奏。','想自製配樂：用手機或電腦錄下自己敲擊的節奏、哼唱或彈奏，匯出音訊檔；回 Canva「上傳」→「上傳檔案」，放入音訊軌。','確定素材可合法用於課堂作品，不要直接下載他人的歌曲。'],ask:'記下你的配樂設計',mode:'form',fields:[['想呈現的情緒','例如：輕快、溫柔'],['四拍節奏','例如：咚－噠－咚噠'],['音樂來源','例如：自己錄製拍手節奏，或 Canva 授權音樂']]},
    {icon:'🎚️',title:'讓音樂和畫面同步',goal:'音樂要襯托故事，不蓋過主角。',steps:['選中時間軸的音訊軌，拖動到開頭或適合的畫面。','調整音量：有旁白時，讓音樂比人聲小。','試做片頭淡入與片尾淡出；部分 Canva 帳號的控制項位置可能不同。','把配樂節拍與鏡頭切換對齊，播放並聽聽是否自然。'],ask:'有旁白時，背景音樂應該？',mode:'choice',options:['調低音量，讓人聲清楚','調到最大聲'],right:0},
    {icon:'🏁',title:'加入片尾並完整預覽',goal:'完成能讓人看懂的旅拍故事。',steps:['在主軌最後加入片尾畫面或空白片段。','加上「謝謝觀賞」或自己的作品名稱。','從第一秒完整播放，檢查片頭、字幕、轉場、配樂和片尾。','點 Canva「分享」→「下載」，選 MP4；最後到下方做一次作品技術檢測。'],ask:'完成後確認：已匯出並播放自己的 MP4。',mode:'confirm'}
  ];
  const key='TRAVEL_',earned=i=>!!(window.STORE?.level(mod,key+String(i+1).padStart(2,'0'))?.stars);
  // 訪客練習進度只供畫面使用，正式星星以學生 STORE 為準。
  let guest=Array.from({length:tasks.length},(_,i)=>sessionStorage.getItem('travel_guest_'+i)==='1'),current=0;
  const has=i=>earned(i)||guest[i],count=()=>tasks.filter((_,i)=>has(i)).length;
  window.travelQuestReady=()=>count()===tasks.length;
  function draftKey(i){const p=window.STORE?.me();return 'travel_quest_draft_'+(p?String(p.cls)+'_'+String(p.seat):'guest')+'_'+i;}
  function readDraft(i){try{return JSON.parse(sessionStorage.getItem(draftKey(i))||'{}');}catch(e){return {};}}
  function writeDraft(i,d){try{sessionStorage.setItem(draftKey(i),JSON.stringify(d));}catch(e){}}
  function unlocked(i){return i===0||Array.from({length:i},(_,k)=>k).every(has);}
  function draw(){
    const n=count();$('questStars').textContent=tasks.map((_,i)=>has(i)?'⭐':'☆').join(' ');
    $('questCounter').textContent=`已得到 ${n} / ${tasks.length} 顆學習星星｜${n===tasks.length?'所有技巧都完成，請往下進行最後檢測！':'每次專心完成一個操作就好。'}`;
    document.body.classList.toggle('quest-mode',n!==tasks.length);
    $('questTrack').innerHTML=tasks.map((t,i)=>`<button type="button" data-step="${i}" ${unlocked(i)?'':'disabled'} ${i===current?'aria-current="step"':''}>${has(i)?'⭐':i===current?'👉':'○'} ${i+1}</button>`).join('');
    $('questTrack').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{current=Number(b.dataset.step);draw();}));
    const t=tasks[current],needsCheck=t.mode!=='form',checkText=current===1?'我已成功建立 Canva 影片專案並找到時間軸。':current===2?'我已上傳素材，並在時間軸播放確認順序。':current===3?'我已實際修剪至少兩段影片並播放比較。':current===4?'我已在影片開頭加入空白片段並預覽。':current===5?'我已在 Canva 片頭放入文字並播放確認。':current===7?'我已套用文字動畫，並播放檢查效果。':current===8?'我已在兩段畫面之間試用轉場。':current===10?'我已放入音訊軌並調整過音量。':'我已在 Canva 完成上面的操作並播放確認。';
    $('questStep').innerHTML=`<div style="font-size:2.4rem">${t.icon}</div><p style="color:#145d81;font-weight:800">任務 ${current+1}／${tasks.length}</p><h2>${t.title}</h2><p><b>🎯 這次只做一件事：</b>${t.goal}</p><ol>${t.steps.map(s=>`<li>${s}</li>`).join('')}</ol><p class="quest-hint">🎯 請完成：${t.ask}</p><div id="questAnswer"></div>${needsCheck?'<label class="quest-check"><input type="checkbox" id="questReally"> '+checkText+'</label>':'<p class="small">✏️ 每一格都要填寫；這些草稿只保留在本次瀏覽器分頁，不會上傳到教師資料庫。</p>'}<p id="questMessage" role="status" aria-live="polite"></p><div class="quest-actions"><button id="questClaim" type="button">${has(current)?'⭐ 已獲得這顆星星':'🌟 完成任務，領一顆星星'}</button><button id="questNext" class="secondary" type="button" ${unlocked(current+1)&&current<tasks.length-1?'':'disabled'}>下一關 →</button></div>${n===tasks.length?'<div class="quest-complete"><h3>🏆 12 顆星星收集完成！</h3><p>現在才進行最後 MP4 技術檢測。這些星星只記錄學習任務完成情形，作品內容仍須老師查看。</p><a class="btn" href="#travelSubmission">🚀 前往最後檢測</a></div>':''}`;
    const ans=$('questAnswer'),draft=readDraft(current);if(t.mode==='text'){const inp=document.createElement('input');inp.id='questText';inp.className='quest-input';inp.placeholder='請輸入你的實際作品內容';inp.maxLength=80;inp.value=draft.answer||'';inp.addEventListener('input',()=>writeDraft(current,{answer:inp.value}));ans.append(inp);}
    if(t.mode==='form')t.fields.forEach(([label,placeholder],i)=>{const wrap=document.createElement('label');wrap.style.display='block';wrap.style.margin='15px 0';const heading=document.createElement('strong');heading.textContent=(i+1)+'. '+label;heading.style.display='block';const field=document.createElement('textarea');field.className='quest-input';field.rows=2;field.maxLength=180;field.placeholder=placeholder;field.setAttribute('aria-label',label);field.dataset.field=i;field.value=draft[i]||'';field.addEventListener('input',()=>{const d=readDraft(current);d[i]=field.value;writeDraft(current,d);});wrap.append(heading,field);ans.append(wrap);});
    if(t.mode==='choice')t.options.forEach((o,i)=>{const label=document.createElement('label');label.className='quest-check';const radio=document.createElement('input');radio.type='radio';radio.name='questChoice';radio.value=i;label.append(radio,document.createTextNode(' '+o));ans.append(label);});
    $('questClaim').addEventListener('click',()=>{if(needsCheck&&!document.getElementById('questReally').checked){$('questMessage').textContent='請先完成上面的實作，再勾選具體完成項目。';return;}
      if(t.mode==='text'&&($('questText').value.trim().length<2)){ $('questMessage').textContent='請填寫你實際製作的內容。';return;}
      if(t.mode==='form'){const fields=[...document.querySelectorAll('#questAnswer textarea')];if(fields.some(f=>f.value.trim().length<2)||(current===0&&fields[0].value.trim().length<4)){$('questMessage').textContent='還有欄位尚未完成。請逐格填寫；旅拍主題至少四個字。';return;}}
      if(t.mode==='choice'&&Number(document.querySelector('input[name="questChoice"]:checked')?.value)!==t.right){$('questMessage').textContent='這一步還需要再想想，回到上方操作指示看看。';return;}
      if(!has(current)){const save=window.STORE?.saveLevel(mod,key+String(current+1).padStart(2,'0'),{stars:1,done:true,extra:{kind:'canva-travel-practice',selfDeclared:true}});if(!save?.record){guest[current]=true;sessionStorage.setItem('travel_guest_'+current,'1');}}
      const next=current+1;if(next<tasks.length)current=next;draw();});
    $('questNext').addEventListener('click',()=>{if(current+1<tasks.length&&unlocked(current+1)){current++;draw();}});
  }
  draw();window.addEventListener('store:change',()=>draw());
})();
