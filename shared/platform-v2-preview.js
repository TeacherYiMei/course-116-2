/* 系統平臺重建測試版：完全不呼叫 STORE.saveLevel 或雲端寫入。 */
(function(){'use strict';
const units=[
 {id:'G1',icon:'🕵️',name:'平臺分類局',color:'#2563eb',lesson:['系統平臺由硬體、作業系統及應用軟體構成。','電腦平臺：桌機、筆電；可攜式：手機、智慧手錶。','雲端由遠端伺服器提供服務；嵌入式藏在設備中執行特定工作。'],q:[
 ['桌上型電腦屬於哪種平臺？',['電腦','雲端','嵌入式'],0,'桌機是電腦系統平臺。'],['智慧手錶最符合哪一類？',['嵌入式','可攜式','雲端'],1,'穿戴裝置屬於可攜式。'],
 ['多人一起用線上文件共編，主要用到？',['雲端服務','印表機','離線硬碟'],0,'線上共編透過遠端伺服器。'],['智慧電鍋裡的控制晶片較像？',['雲端','桌機','嵌入式'],2,'專門控制電鍋的電路是嵌入式系統。'],
 ['手機 App 要用網路上傳資料，使用了哪兩者？',['可攜式＋雲端','只有電腦','只有嵌入式'],0,'手機是可攜式設備，也可使用雲端服務。'],['路口號誌控制器不必有螢幕，這說明？',['不是系統','嵌入式可執行專用任務','一定是雲端'],1,'嵌入式系統常在設備內自行控制。']]},
 {id:'G2',icon:'🏭',name:'五大單元傳令兵',color:'#e97823',lesson:['電腦硬體主要包括輸入、輸出、記憶、算術邏輯及控制單元。','輸入單元送入資料；算術邏輯單元進行運算；控制單元協調執行。','記憶單元暫存資料，輸出單元把結果呈現給使用者。'],q:[
 ['鍵盤是？',['輸入單元','輸出單元','控制單元'],0,'鍵盤送入資料。'],['螢幕是？',['記憶單元','輸出單元','算術邏輯單元'],1,'螢幕顯示結果。'],
 ['負責加減與邏輯判斷的是？',['輸入單元','控制單元','算術邏輯單元'],2,'ALU 做運算與邏輯比較。'],['協調各單元工作的主要是？',['控制單元','螢幕','滑鼠'],0,'控制單元發出操作指令。'],
 ['資料進入電腦後，計算前常先放哪裡？',['輸出單元','記憶單元','印表機'],1,'記憶單元保存工作資料。'],['要算出成績並顯示，最合理的流程？',['輸出→輸入→運算','輸入→運算→輸出','運算→關機→輸入'],1,'先取得資料，再運算並輸出。']]},
 {id:'G3',icon:'📦',name:'記憶體快遞',color:'#8b5cf6',lesson:['暫存器通常最快但容量最小；快取讓 CPU 快速取得常用資料。','RAM 是執行程式時的工作記憶體，通常斷電資料就會消失。','SSD 或硬碟容量大，適合長期存放照片與影片。'],q:[
 ['通常速度最快的是？',['暫存器','RAM','硬碟'],0,'暫存器就在處理器內。'],['關機後照片要留下，應存到？',['快取','SSD／硬碟','暫存器'],1,'輔助記憶體可長期儲存。'],
 ['CPU 常用資料放在？',['快取','螢幕','印表機'],0,'快取降低等待時間。'],['一般 RAM 的特色是？',['永久保留','容量比硬碟大','斷電後通常遺失資料'],2,'RAM 多屬揮發性記憶體。'],
 ['合理的速度順序是哪組？',['硬碟→RAM→快取','暫存器→快取→RAM','RAM→暫存器→硬碟'],1,'離 CPU 越近通常越快。'],['要跑大型程式，又要永久保存作品，應搭配？',['只用暫存器','只用快取','RAM＋SSD'],2,'RAM 負責執行，SSD 負責保存。']]},
 {id:'G4',icon:'🧩',name:'電腦組裝師',color:'#0d9488',lesson:['CPU 負責運算；主機板讓各零件連接。','RAM 影響多工工作空間；SSD 保存程式和檔案。','選零件前要先看用途、相容性、效能需求與預算。'],q:[
 ['負責執行運算的是？',['CPU','滑鼠','螢幕'],0,'CPU 是中央處理器。'],['讓零件互相連接的是？',['鍵盤','主機板','印表機'],1,'主機板提供連接與協作的平台。'],
 ['想改善多工工作空間，較可能升級？',['RAM','滑鼠墊','喇叭'],0,'足夠的 RAM 有利同時開啟多個程式。'],['想增加影片儲存空間，優先看？',['CPU 時脈','螢幕亮度','SSD 容量'],2,'影片需要大量儲存空間。'],
 ['買新 CPU 前應先確認？',['機殼顏色','主機板相容性','桌布顏色'],1,'插槽及晶片組需要相容。'],['主要做影片剪輯，應考慮？',['只買最便宜的','只看鍵盤','CPU、RAM、儲存與顯示需求'],2,'剪輯要整體平衡。']]},
 {id:'G5',icon:'🧑‍💻',name:'作業系統總管',color:'#2563eb',lesson:['作業系統管理硬體、檔案、程式與使用者操作。','它分配記憶體與處理器資源，也協助周邊設備工作。','檔案權限、更新與備份有助於資料安全。'],q:[
 ['Windows、Linux 都屬於？',['作業系統','瀏覽器','文字檔'],0,'它們都是作業系統。'],['多個程式同時執行，主要由誰管理資源？',['滑鼠','作業系統','照片'],1,'作業系統安排執行資源。'],
 ['整理資料夾與檔案是誰提供的功能？',['作業系統','風扇','顯示卡'],0,'檔案系統由作業系統管理。'],['新印表機無法使用，可能要安裝？',['桌布','圖片','驅動程式'],2,'驅動程式讓系統和周邊溝通。'],
 ['多人共用電腦，想保護個人資料應？',['全員共用管理者帳號','分開帳號與權限','關掉密碼'],1,'不同權限可減少誤改。'],['作業系統提醒安全更新，較適當的做法？',['永遠忽略','下載不明工具','確認來源後更新並備份'],2,'更新與備份可降低風險。']]},
 {id:'G6',icon:'🩺',name:'電腦急診室',color:'#e11d48',lesson:['先觀察現象，再判斷可能是硬體、軟體、網路或設定問題。','依序檢查電源、線材、錯誤訊息與最近的變更。','排除故障時要先保護檔案，避免亂刪或重灌。'],q:[
 ['電腦完全無法開機，先檢查？',['電源與插頭','桌布','字體'],0,'先排除最基本的供電問題。'],['只有一個網站打不開，先確認？',['CPU 顏色','網址及網路連線','硬碟容量'],1,'先判斷是不是連線或網站問題。'],
 ['程式突然關閉，應先記錄？',['錯誤訊息','螢幕品牌','滑鼠顏色'],0,'錯誤訊息有助診斷。'],['電腦突然變慢，合理的第一步？',['直接格式化','把檔案全刪','查看工作管理員'],2,'先查資源使用情況。'],
 ['電腦出現陌生下載通知，應？',['直接安裝','查證來源並避免開啟','關閉防毒'],1,'不明檔案可能有風險。'],['需要重灌前最重要的是？',['改桌布','刪除系統檔','備份重要資料'],2,'重灌可能清除原有資料。']]},
 {id:'G7',icon:'☁️',name:'雲端披薩店',color:'#0891b2',lesson:['雲端服務讓資料或運算存在遠端伺服器。','上傳、分享、權限與同步是使用雲端時的重要觀念。','重要資料要注意帳號安全、備份與分享對象。'],q:[
 ['雲端儲存主要把檔案放在？',['遠端伺服器','螢幕裡','滑鼠裡'],0,'資料保存在遠端服務。'],['要和組員共同編輯文件，可用？',['紙本獨佔','雲端共編','關閉網路'],1,'雲端共編便於協作。'],
 ['只想讓老師查看檔案，應設定？',['檢視權限','公開編輯','任何人可刪除'],0,'使用最低必要權限。'],['同步圖示出現錯誤時，應？',['假設已完成','立即刪檔','檢查網路與同步狀態'],2,'同步狀態要確實確認。'],
 ['使用共用電腦登入雲端後要？',['記住密碼','登出帳號','分享密碼'],1,'登出可防止他人存取。'],['雲端裡有重要作業時，最安全的是？',['完全不備份','給所有人編輯','保留另一份備份'],2,'備份能降低單點遺失風險。']]},
 {id:'G8',icon:'🤖',name:'嵌入式工程師',color:'#7c3aed',lesson:['嵌入式系統是藏在裝置中執行特定任務的小型電腦。','感測器負責取得環境資訊，控制器根據條件做判斷。','致動器或輸出裝置把判斷轉成動作，例如風扇、燈光或蜂鳴器。'],q:[
 ['智慧路燈的光線感測器負責？',['偵測亮度','播音樂','儲存影片'],0,'感測器讀取環境資料。'],['控制器收到感測資料後主要做？',['裝飾外觀','條件判斷','清洗鏡頭'],1,'控制器依程式決定動作。'],
 ['偵測到高溫後啟動風扇，風扇是？',['致動器','感測器','記憶體'],0,'風扇執行輸出動作。'],['自動澆水裝置需要的感測器？',['光碟機','喇叭','土壤濕度感測器'],2,'需要知道土壤乾濕。'],
 ['設計自動門，合理的流程？',['門先開再偵測','感測→判斷→開門','直接切斷電源'],1,'輸入、判斷、輸出組成控制流程。'],['偵測器失靈時，較安全的設計？',['繼續無限運作','關閉警示','設計異常提醒與安全停止'],2,'嵌入式系統也需要處理異常。']]}
];
const app=document.getElementById('pv-app'),draft=Object.create(null);let unit=null,phase=0,asked=0,pass=0,locked=false;
const $=s=>app.querySelector(s),stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function oldStars(id){try{return Math.max(0,Math.min(3,Number((window.STORE&&STORE.level('platform',id)||{}).stars)||0));}catch(e){return 0;}}
function set(html){app.innerHTML=html;app.scrollIntoView({behavior:'smooth',block:'start'});}
function menu(){unit=null;set('<div class="pv-grid">'+units.map((u,i)=>'<button class="pv-card" data-i="'+i+'" style="--stripe:'+u.color+'"><span class="pv-icon">'+u.icon+'</span><b>第 '+(i+1)+' 關 · '+u.name+'</b><small>📖 教學 → 🎮 三階任務 → ⭐ 徽章</small><p class="pv-stars">測試 '+stars(draft[u.id]||0)+'</p><small>舊版正式紀錄：'+oldStars(u.id)+' / 3 ⭐（唯讀）</small></button>').join('')+'</div>');app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>lesson(units[+b.dataset.i]));}
function lesson(u){unit=u;phase=Math.max(0,Math.min(2,draft[u.id]||0));set('<section class="pv-panel"><span class="pv-chip">'+u.id+' · '+u.name+'</span><h2>'+u.icon+' 闖關前的任務教室</h2><div class="pv-lesson">'+u.lesson.map((v,i)=>'<p><b>📌 '+(i+1)+'.</b> '+v+'</p>').join('')+'</div><p class="pv-tip">💡 讀完後開始三階闖關。每階兩題，答對後可立即查看解釋；兩題全對取得該階星星，未通過可再練習。</p><p>測試星星：<span class="pv-stars">'+stars(draft[u.id]||0)+'</span>　正式舊星：'+oldStars(u.id)+'/3（不變）</p><div class="pv-buttons"><button class="pv-btn" id="start">🎮 '+((draft[u.id]||0)===3?'重玩第三階':'開始第 '+(phase+1)+' 階')+'</button><button class="pv-btn secondary" id="back">← 八關地圖</button></div></section>');$('#start').onclick=()=>{asked=0;pass=0;ask();};$('#back').onclick=menu;}
function ask(){locked=false;const q=unit.q[phase*2+asked],labels=['📘 基礎','🛠️ 操作','🏆 挑戰'];set('<section class="pv-panel"><div class="pv-chip">'+unit.icon+' '+unit.name+' · '+labels[phase]+'</div><p class="pv-muted">第 '+(asked+1)+' / 2 題</p><div class="pv-progress"><i style="width:'+((phase*2+asked)/6*100)+'%"></i></div><h2 style="margin-top:22px">'+q[0]+'</h2><div class="pv-answers" id="answers"></div><p id="feedback" class="pv-good pv-hidden"></p><div class="pv-buttons"><button class="pv-btn pv-hidden" id="next">下一步 →</button><button class="pv-btn secondary" id="lesson">📖 回看教學</button></div></section>');$('#lesson').onclick=()=>lesson(unit);q[1].forEach((v,i)=>{const b=document.createElement('button');b.textContent=v;b.onclick=()=>{if(locked)return;locked=true;if(i===q[2])pass++;$('#answers').querySelectorAll('button').forEach((x,j)=>{x.disabled=true;if(j===q[2])x.style.background='#c8f4dc';else if(j===i)x.style.background='#ffe1e6';});const f=$('#feedback');f.classList.remove('pv-hidden');f.textContent=(i===q[2]?'🌟 正確！':'💡 再學會這個觀念：')+' '+q[3];const next=$('#next');next.classList.remove('pv-hidden');next.textContent=asked===1?'⭐ 結算這一階':'下一題 →';next.onclick=()=>{asked++;if(asked<2)ask();else result();};};$('#answers').appendChild(b);});}
function result(){const gained=pass===2;if(gained)draft[unit.id]=Math.max(draft[unit.id]||0,phase+1);const current=draft[unit.id]||0;set('<section class="pv-panel"><h2>'+(gained?'🎉 任務完成！':'🌱 再試一次就更熟練！')+'</h2><p>本階答對 '+pass+' / 2 題</p><p class="pv-stars">'+stars(current)+'</p><p class="pv-good">'+(gained?'成功收集測試星星！':'先回顧教學，再挑戰同一階。')+'</p><p class="pv-tip">這些是測試星星，沒有寫入 Firebase。原正式紀錄仍是 '+oldStars(unit.id)+' / 3 星。</p><div class="pv-buttons"><button class="pv-btn" id="continue">'+(gained&&current===3?'🏆 查看徽章':gained?'🚀 下一階':'🔄 再挑戰這一階')+'</button><button class="pv-btn secondary" id="back">← 八關地圖</button></div></section>');$('#continue').onclick=()=>{if(gained&&current===3){set('<section class="pv-panel"><h2>🏆 '+unit.name+' 三星達成！</h2><p class="pv-stars">★★★</p><p>恭喜完成三階任務！</p><p class="pv-tip">本頁目前只示範體驗，正式學生星星未變動。</p><button class="pv-btn" id="back">回八關地圖 →</button></section>');$('#back').onclick=menu;}else{phase=gained?current:phase;asked=0;pass=0;ask();}};$('#back').onclick=menu;}
menu();window.PLATFORM_V2_PREVIEW={units:units,oldStars:oldStars};
})();
