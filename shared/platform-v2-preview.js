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
// 舊版各階實際任務量（包含分類卡、排序及實驗操作），測試版以相同題數設計。
const targets={G1:[8,2,3],G2:[10,2,1],G3:[4,4,4],G4:[8,2,2],G5:[10,1,2],G6:[6,1,1],G7:[8,2,3],G8:[9,2,2]};
// 題目格式：提問、三個選項、正確選項索引、概念解釋。
const extras={
G1:[
 ['筆記型電腦的分類？',['電腦系統','純雲端','只有嵌入式'],0,'筆電仍是電腦平臺。'],['智慧眼鏡最接近哪一類？',['桌面','可攜式','伺服器'],1,'可隨身穿戴。'],['雲端翻譯的運算通常在哪裡？',['遠端伺服器','滑鼠','喇叭'],0,'常由雲端完成運算。'],['掃地機器人的控制電腦屬於？',['桌機','文字處理','嵌入式'],2,'內建控制器完成專用工作。'],['電子票證閘門的控制系統是？',['嵌入式','手機遊戲','桌面電腦'],0,'裝置內部自動控制閘門。'],['手機離線拍照時主要使用？',['遠端雲端運算','本機硬體與軟體','伺服器機房'],1,'離線也能由本機完成拍照。'],['雲端相簿最明顯的功能？',['只能存在相機裡','不用帳號也能任意讀別人資料','跨裝置存取自己的照片'],2,'雲端讓授權裝置存取資料。']
],
G2:[
 ['麥克風屬於？',['輸入單元','算術邏輯單元','輸出單元'],0,'麥克風輸入聲音資料。'],['喇叭屬於？',['輸入','輸出','控制'],1,'喇叭輸出聲音。'],['攝影機擷取畫面是？',['輸出','控制','輸入'],2,'攝影機將影像送進電腦。'],['CPU 中指揮執行步驟的是？',['控制單元','顯示器','硬碟'],0,'控制單元協調指令。'],['計算 8+5 時主要用到？',['印表機','算術邏輯單元','網路線'],1,'運算由 ALU 執行。'],['把結果印到紙上屬於？',['輸出','記憶','輸入'],0,'印表機是輸出設備。'],['把尚未處理完的資料暫放在哪？',['滑鼠','螢幕','記憶單元'],2,'工作資料需要暫存。']
],
G3:[
 ['哪一項通常容量最小？',['暫存器','SSD','硬碟'],0,'暫存器容量非常小。'],['哪一項適合長期保存作業？',['RAM','SSD','快取'],1,'SSD 不靠持續供電維持檔案。'],['電腦同時執行很多程式，較依賴？',['記憶體 RAM','鍵盤顏色','滑鼠大小'],0,'多工需要工作記憶體。'],['CPU 要快速重複使用資料會利用？',['印表機','光碟','快取'],2,'快取能減少存取延遲。'],['記憶體階層的常見取捨？',['速度快通常容量也最大','越靠近 CPU 通常越快而較小','硬碟最快'],1,'速度與容量有不同設計成本。'],['下列哪一種屬於揮發性記憶體？',['RAM','SSD','隨身碟'],0,'RAM 斷電後通常失去資料。'],['快取與 RAM，通常哪個更接近 CPU？',['硬碟','RAM','快取'],2,'快取設計來加速 CPU 存取。'],['下載的大型影片最好保存於？',['暫存器','SSD／硬碟','CPU 快取'],1,'影片需要大量持久空間。'],['開機載入程式時，資料常由 SSD 移至？',['RAM','顯示器','音效卡'],0,'執行中的程式需要工作記憶體。']
],
G4:[
 ['主機板最重要的功能？',['連接與協調零件','只顯示圖片','只播放音樂'],0,'主機板提供連接介面。'],['用來提供電力的是？',['RAM','電源供應器','滑鼠'],1,'電源供應器供應各零件所需電力。'],['電腦散熱不足可能造成？',['效能降低或當機','檔案變大','容量自動增加'],0,'過熱可能觸發降速保護。'],['要升級 RAM 先檢查？',['桌布','喇叭','規格與插槽相容性'],2,'記憶體規格須符合主機板。'],['想看清楚影像，需要？',['顯示裝置','麥克風','印表機'],0,'顯示器呈現畫面。'],['剪輯專案變大時應先確認？',['鍵盤顏色','儲存容量與效能','滑鼠墊圖案'],1,'空間與效能會影響工作流程。']
],
G5:[
 ['資料夾用來？',['整理檔案','增加網速','替 CPU 散熱'],0,'資料夾能分類整理。'],['同時開太多程式可能？',['資源不足','硬碟消失','螢幕一定壞掉'],0,'多工會占用記憶體與 CPU。'],['程式無回應時可查看？',['文字顏色','工作管理工具','桌布'],1,'工作管理工具可查看程式狀態。'],['安裝 App 前應注意？',['來源與權限','圖示大小','字型顏色'],0,'信任來源及最小權限較安全。'],['登入帳號的密碼用途？',['增加風扇速度','擴大硬碟','限制未授權存取'],2,'帳號驗證可保護資料。'],['作業系統通常負責？',['安排處理器工作','直接印出所有照片','取代電源線'],0,'系統分配硬體資源。'],['重要檔案更新前宜先？',['備份','刪掉','關閉保護'],0,'備份降低資料損失風險。']
],
G6:[
 ['滑鼠不能動時，先檢查？',['連接與電池','螢幕桌布','CPU 型號'],0,'先檢查連線和供電。'],['找不到 Wi-Fi 時可以先？',['直接重灌','檢查無線網路設定','刪所有檔案'],1,'先釐清網路設定與訊號。']
],
G7:[
 ['把照片上傳雲端後需確認？',['上傳完成狀態','滑鼠顏色','螢幕尺寸'],0,'要等同步成功才離開。'],['雲端共用連結可能的風險？',['完全沒有','權限設定過寬','鍵盤速度太慢'],1,'公開連結可能讓更多人存取。'],['想和同學共作但不能刪檔，應？',['關閉帳號','公開全世界編輯','限制分享與權限'],2,'適當權限能保護檔案。'],['兩部裝置出現不同版本時要？',['確認同步衝突','直接覆蓋','不看檔名'],0,'版本衝突需先比較。'],['雲端帳號適合啟用？',['簡單共用密碼','多因素驗證','不設密碼'],1,'多重驗證能提高保護。'],['上傳大檔時連線中斷，應？',['認定成功','刪掉來源檔','確認狀態再重試'],2,'確定上傳完成前保留原件。'],['重要作品只存在一個雲端空間？',['最好另做備份','一定百分百安全','不用管理權限'],0,'避免單一儲存點失敗。']
],
G8:[
 ['自動夜燈需要讀取？',['光線亮度','印表機狀態','鍵盤按鍵'],0,'光線感測器可辨別明暗。'],['蜂鳴器主要是？',['輸入','輸出','儲存'],1,'蜂鳴器發出提示音。'],['溫度過高才開風扇，用到了？',['條件判斷','文字格式','列印設定'],0,'以條件控制輸出。'],['自動門的距離感測器是？',['致動器','硬碟','輸入裝置'],2,'距離感測器提供環境資訊。'],['控制板執行程式的主要用途？',['做判斷並控制裝置','只顯示圖片','只存照片'],0,'控制器依程式處理感測資料。'],['要避免馬達一直轉應加入？',['停止條件','更多圖片','桌布'],0,'安全停止是重要設計。'],['嵌入式產品的特性？',['一定是桌機','常為特定功能設計','完全不需程式'],1,'它通常負責特定任務。']
]};
for(const u of units){
 const t=targets[u.id],base=[u.q.slice(0,2),u.q.slice(2,4),u.q.slice(4,6)];
 const missing=t.map((n,i)=>Math.max(0,n-base[i].length));let x=0;
 u.stages=base.map((arr,i)=>arr.concat(extras[u.id].slice(x,x+=missing[i])));
 // 單題或短階段：把多出的既有題移到需要更多練習的階段，不刪除題目。
 for(let i=0;i<3;i++)while(u.stages[i].length<t[i]){
   const donor=u.stages.findIndex((arr,j)=>arr.length>t[j]);
   if(donor<0)throw Error('題庫不足：'+u.id);
   u.stages[i].push(u.stages[donor].pop());
 }
}
const g3=units.find(u=>u.id==='G3');
// 4 題辨識＋4 題動手排序＋4 題情境配置；不同操作要真的完成才算答對。
g3.stages=[g3.q.slice(0,4),[
 {kind:'order',title:'把四位記憶體快遞員由快到慢排列',items:['硬碟／SSD','快取','RAM','暫存器'],answer:['暫存器','快取','RAM','硬碟／SSD'],why:'暫存器 → 快取 → RAM → SSD／硬碟，通常速度依序降低。'},
 {kind:'order',title:'依一般電腦的容量，由小到大排列',items:['RAM','暫存器','SSD／硬碟','快取'],answer:['暫存器','快取','RAM','SSD／硬碟'],why:'容量通常與速度取捨，暫存器最小，輔助記憶體最大。'},
 {kind:'order',title:'程式啟動時，資料從長期儲存一路靠近 CPU 的順序',items:['CPU 暫存器','RAM','SSD','CPU 快取'],answer:['SSD','RAM','CPU 快取','CPU 暫存器'],why:'資料常先由 SSD 載入 RAM，再由快取與暫存器加速 CPU 使用。'},
 {kind:'order',title:'把資料從 CPU 最靠近到最遠的地方排序',items:['RAM','SSD／硬碟','暫存器','快取'],answer:['暫存器','快取','RAM','SSD／硬碟'],why:'這是一般電腦記憶體階層的概念順序。'}
 ],[
 {kind:'allocate',title:'剪輯畢旅影片：把三種資料放到最適合的位置',jobs:['CPU 正在計算的極少量數值','剪輯軟體執行中的工作資料','剪好的影片長期保存'],answer:['暫存器','RAM','SSD／硬碟'],why:'計算在 CPU、工作在 RAM、作品存 SSD。'},
 {kind:'allocate',title:'開啟照片編輯器：依用途分配資料',jobs:['CPU 常常重複取用的資料','正在編輯的圖片工作資料','關機後要保留的照片'],answer:['快取','RAM','SSD／硬碟'],why:'常用資料適合快取，程式工作用 RAM，長期保存用 SSD。'},
 {kind:'allocate',title:'電腦開機後：哪些位置負責不同任務？',jobs:['作業系統的執行中資料','已安裝但未啟動的程式檔','CPU 目前運算的少量數值'],answer:['RAM','SSD／硬碟','暫存器'],why:'執行中的資料放 RAM，檔案存 SSD，運算數值由暫存器處理。'},
 {kind:'allocate',title:'多工與備份：正確安排三個工作',jobs:['同時開的多個 App 的工作空間','常用指令或資料的高速副本','需要保存到明年的作品'],answer:['RAM','快取','SSD／硬碟'],why:'RAM 支援多工、快取加速、SSD 長期儲存。'}
 ]];
const app=document.getElementById('pv-app'),draft=Object.create(null);let unit=null,phase=0,asked=0,pass=0,locked=false;
const $=s=>app.querySelector(s),stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function oldStars(id){try{return Math.max(0,Math.min(3,Number((window.STORE&&STORE.level('platform',id)||{}).stars)||0));}catch(e){return 0;}}
function set(html){app.innerHTML=html;app.scrollIntoView({behavior:'smooth',block:'start'});}
function menu(){unit=null;set('<div class="pv-grid">'+units.map((u,i)=>'<button class="pv-card" data-i="'+i+'" style="--stripe:'+u.color+'"><span class="pv-icon">'+u.icon+'</span><b>第 '+(i+1)+' 關 · '+u.name+'</b><small>📖 教學 → 🎮 三階任務 → ⭐ 徽章</small><small><b style="font-size:1rem;margin:5px 0">共 '+u.stages.reduce((n,s)=>n+s.length,0)+' 題／操作任務</b>（三階：'+u.stages.map(s=>s.length).join('＋')+'）</small><p class="pv-stars">測試 '+stars(draft[u.id]||0)+'</p><small>舊版正式紀錄：'+oldStars(u.id)+' / 3 ⭐（唯讀）</small></button>').join('')+'</div>');app.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>lesson(units[+b.dataset.i]));}
function lesson(u){unit=u;phase=Math.max(0,Math.min(2,draft[u.id]||0));set('<section class="pv-panel"><span class="pv-chip">'+u.id+' · '+u.name+'</span><h2>'+u.icon+' 闖關前的任務教室</h2><div class="pv-lesson">'+u.lesson.map((v,i)=>'<p><b>📌 '+(i+1)+'.</b> '+v+'</p>').join('')+'</div><p class="pv-tip">💡 三階任務分別有 '+u.stages.map(s=>s.length).join('、')+' 題。每題都有即時解釋，達到每階 80% 正確率即可收集星星；不熟悉可以再挑戰。</p><p>測試星星：<span class="pv-stars">'+stars(draft[u.id]||0)+'</span>　正式舊星：'+oldStars(u.id)+'/3（不變）</p><div class="pv-buttons"><button class="pv-btn" id="start">🎮 '+((draft[u.id]||0)===3?'重玩第三階':'開始第 '+(phase+1)+' 階')+'</button><button class="pv-btn secondary" id="back">← 八關地圖</button></div></section>');$('#start').onclick=()=>{asked=0;pass=0;ask();};$('#back').onclick=menu;}
function ask(){
 locked=false;const count=unit.stages[phase].length,q=unit.stages[phase][asked],labels=['📘 基礎','🛠️ 操作','🏆 挑戰'];
 set('<section class="pv-panel"><div class="pv-chip">'+unit.icon+' '+unit.name+' · '+labels[phase]+'</div><p class="pv-muted">第 '+(asked+1)+' / '+count+' 題　｜　已答對 '+pass+' 題</p><div class="pv-progress"><i style="width:'+(asked/count*100)+'%"></i></div><h2 style="margin-top:22px">'+(q.title||q[0])+'</h2><div class="pv-answers" id="answers"></div><p id="feedback" class="pv-good pv-hidden"></p><div class="pv-buttons"><button class="pv-btn pv-hidden" id="next">下一步 →</button><button class="pv-btn secondary" id="lesson">📖 回看教學</button></div></section>');
 $('#lesson').onclick=()=>lesson(unit);
 function submit(ok,explain){if(locked)return;locked=true;if(ok)pass++;const f=$('#feedback');f.classList.remove('pv-hidden');f.textContent=(ok?'🌟 操作正確！':'💡 一起看看正確概念：')+' '+explain;const next=$('#next');next.classList.remove('pv-hidden');next.textContent=asked===count-1?'⭐ 結算這一階':'下一題 →';next.onclick=()=>{asked++;if(asked<count)ask();else result();};}
 if(q.kind==='order'){
   const selected=[];const chosen=$('#answers');
   const guide=document.createElement('p');guide.className='pv-tip';guide.textContent='👆 依正確順序點選卡片。已選：尚未開始';chosen.before(guide);
   q.items.forEach(value=>{const b=document.createElement('button');b.textContent=value;b.onclick=()=>{if(locked||b.disabled)return;b.disabled=true;b.style.background='#dceaff';selected.push(value);guide.textContent='👆 已選：'+selected.join(' → ');if(selected.length===q.answer.length)submit(selected.every((x,i)=>x===q.answer[i]),q.why+' 正確順序：'+q.answer.join(' → '));};chosen.appendChild(b);});
 }else if(q.kind==='allocate'){
   const opts=['暫存器','快取','RAM','SSD／硬碟'],chosen=$('#answers');chosen.style.gridTemplateColumns='1fr';
   q.jobs.forEach((job,i)=>{const row=document.createElement('label');row.style.cssText='display:flex;gap:12px;flex-wrap:wrap;align-items:center;background:#f3faff;border:1px solid #bedced;border-radius:14px;padding:13px';const title=document.createElement('strong');title.textContent=(i+1)+'. '+job;title.style.flex='1 1 250px';const select=document.createElement('select');select.setAttribute('aria-label',job);select.style.cssText='padding:10px;border:2px solid #9ac5da;border-radius:10px;min-width:150px';select.innerHTML='<option value="">請選擇位置</option>'+opts.map(o=>'<option value="'+o+'">'+o+'</option>').join('');row.append(title,select);chosen.appendChild(row);});
   const btn=document.createElement('button');btn.className='pv-btn';btn.textContent='📦 完成配置並檢查';chosen.after(btn);btn.onclick=()=>{if(locked)return;const picks=Array.from(chosen.querySelectorAll('select')).map(s=>s.value);if(picks.some(v=>!v)){const f=$('#feedback');f.classList.remove('pv-hidden');f.textContent='請先替每一項工作選擇位置，才能進行檢查。';return;}chosen.querySelectorAll('select').forEach(s=>s.disabled=true);btn.disabled=true;submit(picks.every((x,i)=>x===q.answer[i]),q.why+' 建議配置：'+q.answer.join('、'));};
 }else{
   q[1].forEach((v,i)=>{const b=document.createElement('button');b.textContent=v;b.onclick=()=>{if(locked)return;$('#answers').querySelectorAll('button').forEach((x,j)=>{x.disabled=true;if(j===q[2])x.style.background='#c8f4dc';else if(j===i)x.style.background='#ffe1e6';});submit(i===q[2],q[3]);};$('#answers').appendChild(b);});
 }
}
function result(){const count=unit.stages[phase].length,need=Math.ceil(count*.8),gained=pass>=need;if(gained)draft[unit.id]=Math.max(draft[unit.id]||0,phase+1);const current=draft[unit.id]||0;set('<section class="pv-panel"><h2>'+(gained?'🎉 任務完成！':'🌱 再試一次就更熟練！')+'</h2><p>本階答對 '+pass+' / '+count+' 題（過關門檻 '+need+' 題）</p><p class="pv-stars">'+stars(current)+'</p><p class="pv-good">'+(gained?'成功收集測試星星！':'先回顧教學，再挑戰同一階。')+'</p><p class="pv-tip">這些是測試星星，沒有寫入 Firebase。原正式紀錄仍是 '+oldStars(unit.id)+' / 3 星。</p><div class="pv-buttons"><button class="pv-btn" id="continue">'+(gained&&current===3?'🏆 查看徽章':gained?'🚀 下一階':'🔄 再挑戰這一階')+'</button><button class="pv-btn secondary" id="back">← 八關地圖</button></div></section>');$('#continue').onclick=()=>{if(gained&&current===3){set('<section class="pv-panel"><h2>🏆 '+unit.name+' 三星達成！</h2><p class="pv-stars">★★★</p><p>恭喜完成三階任務！</p><p class="pv-tip">本頁目前只示範體驗，正式學生星星未變動。</p><button class="pv-btn" id="back">回八關地圖 →</button></section>');$('#back').onclick=menu;}else{phase=gained?current:phase;asked=0;pass=0;ask();}};$('#back').onclick=menu;}
menu();window.PLATFORM_V2_PREVIEW={units:units,oldStars:oldStars};
})();
