(function(){
  const STATIONS = [{"id": "R1", "icon": "🔢", "name": "複習站 1", "title": "二進位與數位化基礎", "desc": "二進位、位元與位元組、ASCII、RGB、取樣量化與儲存容量。", "questions": [{"topic": "二進位", "q": "電腦內部底層之所以使用「二進位（Binary）」來儲存與運算資料，主要硬體原因是什麼？", "o": ["二進位比十進位更容易讓人閱讀", "電晶體只有「通電（高電位 1）」與「斷電（低電位 0）」兩種穩定狀態", "早期發明電腦的科學家只有兩隻手指", "二進位計算速度較十進位慢"], "a": 1, "e": "數位電路最容易用兩個穩定電位狀態表示 0 與 1，因此二進位非常適合電子電路。"}, {"topic": "位元組", "q": "電腦中最小的資料計量單位是「位元（Bit）」，請問 1 位元組（Byte）等於多少位元？", "o": ["2 bits", "4 bits", "8 bits", "16 bits"], "a": 2, "e": "1 Byte = 8 bits，是電腦資料容量的基本換算。"}, {"topic": "位元", "q": "5 個位元（Bits）總共可以表示出多少種不同的數值或狀態組合？", "o": ["5 種", "10 種", "16 種（2^4）", "32 種（2^5）"], "a": 3, "e": "n 個位元可以表示 2^n 種組合，因此 5 bits = 2^5 = 32 種。"}, {"topic": "進位轉換", "q": "二進位數值 1011₂ 轉換為十進位數值是多少？", "o": ["7", "9", "11", "13"], "a": 2, "e": "1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11。"}, {"topic": "進位轉換", "q": "將十進位數值 13 轉換為二進位數值為何？", "o": ["1011₂", "1101₂", "1110₂", "0111₂"], "a": 1, "e": "13 = 8 + 4 + 1，因此二進位為 1101₂。"}, {"topic": "ASCII", "q": "在電腦字元編碼中，已知英文字母 A 的 ASCII 碼是 65，請問字母 C 的 ASCII 碼是多少？", "o": ["66", "67", "68", "69"], "a": 1, "e": "ASCII 英文字母依序排列：A=65、B=66、C=67。"}, {"topic": "RGB", "q": "螢光三原色以二進位滿格通道混合：紅色(1)＋綠色(1)＋藍色(0)，在螢幕上會混合出什麼顏色？", "o": ["青色（Cyan）", "洋紅色（Magenta）", "黃色（Yellow）", "純白色（White）"], "a": 2, "e": "RGB 加色混合中，紅 + 綠 = 黃色。"}, {"topic": "數位化", "q": "將連續變化的現實「類比訊號」轉換為電腦「數位訊號」的核心三步驟順序為何？", "o": ["取樣（Sampling）→ 量化（Quantization）→ 編碼（Encoding）", "編碼 → 取樣 → 量化", "量化 → 編碼 → 取樣", "壓縮 → 取樣 → 播放"], "a": 0, "e": "數位化通常依序為取樣、量化，再將量化結果編碼成數位資料。"}, {"topic": "音訊", "q": "音訊數位化中的「量化深度（Bit Depth）」指的是什麼？", "o": ["每秒鐘對聲音切片的次數", "測量振幅高度時的刻度精細度，例如 16-bit 具有 65,536 個刻度階層", "音樂播放時的音量分貝上限", "麥克風錄音時的靈敏度"], "a": 1, "e": "位元深度決定每次取樣的振幅可分成多少階，例如 16-bit 可表示 2^16 = 65,536 個階層。"}, {"topic": "容量", "q": "電腦儲存容量單位換算中，1 KB（Kilobyte）等於多少 Bytes？", "o": ["100 Bytes", "512 Bytes", "1024 Bytes（2^10）", "2048 Bytes"], "a": 2, "e": "傳統二進位換算中 1 KB = 1024 Bytes。"}]}, {"id": "R2", "icon": "🔤", "name": "複習站 2", "title": "資料數位化與文字編碼", "desc": "固定長度儲存、ASCII、Big-5、Unicode、十六進位與表情符號。", "questions": [{"topic": "固定長度", "q": "十進位整數 23 的二進位為 10111（共 5 個位元）。若以 8 個位元（1 Byte）儲存，記憶體中實際記錄的內容為何？", "o": ["10111000（往右側補 0）", "00010111（在高位／左側補足 3 個 0）", "00001011", "11110111（在高位補 1）"], "a": 1, "e": "固定 8 位元時要在左側補 0，10111 變成 00010111。"}, {"topic": "無號整數", "q": "若電腦使用 16 個位元（2 Bytes）的空間來儲存無號正整數，總共可以表示多少個相異的正整數與 0？", "o": ["256 個（0～255）", "1,024 個（0～1023）", "65,536 個（2^16，0～65535）", "16,777,216 個"], "a": 2, "e": "16 個位元共有 2^16 = 65,536 種組合，無號範圍為 0～65535。"}, {"topic": "固定長度", "q": "十進位數字 147 轉換為二進位是 10010011（8 位元）。若改以 16 位元（2 Bytes）儲存，結果應為何？", "o": ["0000000010010011（左側補足 8 個 0）", "1001001100000000（右側補足 8 個 0）", "0000000110010011", "1111111110010011"], "a": 0, "e": "數值本身不變，增加儲存長度時在高位（左側）補 0。"}, {"topic": "ASCII", "q": "將鍵盤輸入的英文字母、數字與符號轉換成電腦二進位數值的對照規則稱為「編碼」。西方最廣泛使用的 ASCII 編碼，最初是以幾個位元表示單一字元？", "o": ["4 個位元", "7～8 個位元（可表示 128～256 個字元）", "16 個位元", "32 個位元"], "a": 1, "e": "標準 ASCII 核心是 7-bit、共 128 個碼位；早期系統也常以 8-bit 儲存或擴充，因此題目選項以 7～8 位元為正確敘述。"}, {"topic": "ASCII", "q": "已知大寫字母 A 的十進位 ASCII 編碼為 65，且大小寫字母的編碼數值剛好相差 32，請問小寫字母 c 的十進位 ASCII 編碼是多少？", "o": ["97", "98", "99", "101"], "a": 2, "e": "小寫 a = 65 + 32 = 97，因此 c = 99。"}, {"topic": "Big-5", "q": "臺灣資策會制定的繁體中文編碼標準 Big-5（大五碼），通常使用多大的容量單位來儲存單一個中文字？", "o": ["1 個位元組（8 bits）", "2 個位元組（16 bits）", "3 個位元組（24 bits）", "4 個位元組（32 bits）"], "a": 1, "e": "Big-5 中文字通常以雙位元組編碼，因此一般以 2 Bytes 表示。"}, {"topic": "亂碼", "q": "早期臺灣電腦軟體在處理繁體中文時，常出現「許、功、蓋、育」等字無法正常儲存或變成亂碼的「衝碼現象」，主要成因為何？", "o": ["這些中文字筆畫太多，超出 16 位元上限", "這些字在 Big-5 碼的第二位元組剛好等於反斜線 \\（0x5C），與程式語言控制字元衝突", "早期電腦螢幕無法顯示橫向中文字元", "這些字未被收錄在 Big-5 常用字庫中"], "a": 1, "e": "Big-5 某些雙位元組的第二個 byte 可能落在 0x5C，與反斜線控制用途衝突，造成早期軟體的處理問題。"}, {"topic": "Unicode", "q": "現代作業系統全面採用 Unicode（萬國碼）作為文字核心，相較於早期各自為政的編碼，它的最大優勢是什麼？", "o": ["將世界上大部分語言文字、特殊符號與 Emoji 統一整理編碼，解決各國語言共存時的亂碼問題", "讓所有文字檔案容量無條件減少 90%", "打字時不再需要依賴輸入法", "只能在美國生產的電腦上執行"], "a": 0, "e": "Unicode 的重點是提供跨語言、跨平台的統一字元編碼空間。"}, {"topic": "十六進位", "q": "因為 2^4 = 16，電腦工程中常將每 4 個二進位位元切成一組，換算為 1 個十六進位符號。請問二進位 1011 0101₂ 轉換為十六進位為何？", "o": ["A5₁₆", "B5₁₆", "C5₁₆", "D5₁₆"], "a": 1, "e": "1011₂ = B，0101₂ = 5，所以結果是 B5₁₆。"}, {"topic": "表情符號", "q": "西元 1982 年，美國卡內基美隆大學教授 Scott Fahlman 在網路討論區中首次提出哪一組符號代表「笑臉」，成為現代 Emoji／顏文字的始祖之一？", "o": [":-)", "^^", "XD", "Q_Q"], "a": 0, "e": "Fahlman 在 1982 年提出 :-) 作為玩笑或輕鬆訊息的標記。"}]}, {"id": "R3", "icon": "🖼️", "name": "複習站 3", "title": "影像數位化與向量繪圖", "desc": "點陣與向量、DPI、色彩量化、HSV、PhotoCap、Inkscape 與 AI 向量化。", "questions": [{"topic": "向量圖", "q": "關於「點陣圖（Bitmap）」與「向量圖（Vector）」的特性比較，下列敘述何者完全正確？", "o": ["點陣圖以數學公式記錄路徑，放大永不失真", "向量圖由像素網格排列組成，適合呈現豐富的生活照片細節", "向量圖透過數學幾何公式記錄，無論放大幾倍邊緣依然平滑無損", "點陣圖檔案容量通常比向量圖更小，且列印絕不產生鋸齒"], "a": 2, "e": "向量圖以路徑、節點與幾何公式描述圖形，縮放時可重新計算，因此不會像點陣圖那樣出現像素鋸齒。"}, {"topic": "檔案格式", "q": "小明繪製完成一張學校活動的向量標誌（Logo），若要保留無損縮放的向量特徵，最應該將檔案儲存或匯出為哪一種副檔名？", "o": [".jpg", ".svg", ".bmp", ".webp"], "a": 1, "e": "SVG 是可縮放向量圖形格式，適合 Logo、圖示與向量插圖。"}, {"topic": "DPI", "q": "在影像數位化過程中，解析度單位「DPI」代表的正確中文涵義與定義為何？", "o": ["Dots Per Inch：每 1 英吋長度內所包含的像素／取樣點數量", "Data Per Image：每張圖片在硬碟中所佔用的總容量大小", "Display Pixel Index：螢幕每秒鐘重新整理畫面的頻率", "Digital Photo Integration：相機感光元件感應光線的強度級數"], "a": 0, "e": "DPI = Dots Per Inch，表示每英吋中安排多少點，常用於掃描或列印解析度。"}, {"topic": "解析度", "q": "若想要沖洗一張實體規格為 4 × 6 英吋的模式照片，且輸出品質要求達到 300 DPI，請問相片在寬度方向（4 英吋）會被取樣切割成多少像素？", "o": ["75 像素", "300 像素", "1200 像素", "1800 像素"], "a": 2, "e": "4 英吋 × 300 dots/inch = 1200 dots／像素。"}, {"topic": "量化", "q": "在影像量化過程中，若採用 8 個位元（8 bits）來記錄一個像素的灰階亮度，最多可以呈現出幾種不同明暗層次的灰色階？", "o": ["2 種（純黑與純白）", "8 種", "256 種", "65,536 種"], "a": 2, "e": "8 bits 可表示 2^8 = 256 種數值，因此有 256 階灰階。"}, {"topic": "影像容量", "q": "電腦螢幕採用 RGB 光學三原色模型，若紅、綠、藍各使用 8 位元量化，合成一個全彩像素共需 24 位元。請問一張未經壓縮且解析度為 1000 × 1000 像素的 24 位元全彩圖檔，其原始容量約為多少？", "o": ["約 100 KB", "約 3 MB", "約 24 MB", "約 3 GB"], "a": 1, "e": "1000×1000×24 bits = 24,000,000 bits = 3,000,000 Bytes，約 3 MB。"}, {"topic": "HSV", "q": "相較於電腦底層的 RGB 數值，人類直覺更習慣使用 HSV 模型描述色彩。請問 HSV 模型中的「S」代表哪一個要素？", "o": ["色相（Hue，顏色的基本種類）", "飽和度（Saturation，色彩的鮮豔度與純度）", "明度（Value，光影的明暗程度）", "銳利度（Sharpness，圖形邊緣的清晰度）"], "a": 1, "e": "HSV 中 H=Hue、S=Saturation、V=Value。"}, {"topic": "PhotoCap", "q": "在使用 PhotoCap 進行照片修圖時，若發現風景照的草地上有一處垃圾想要消除，最適合透過哪一項工具「在鄰近乾淨的草皮取樣後覆蓋消除雜物」？", "o": ["仿製筆刷（Clone Brush）", "油漆桶填色工具", "魔術棒選取工具", "文字藝術師工具"], "a": 0, "e": "仿製筆刷會從附近乾淨區域取樣，再塗到目標區域，適合移除小型雜物。"}, {"topic": "Inkscape", "q": "在向量繪圖軟體 Inkscape 中，若想要把繪製好的「長方形」與數個「小圓形」結合成一張具有鋸齒邊緣的郵票外框，應該使用哪一種功能？", "o": ["高斯模糊濾鏡", "路徑布林運算（如聯集、差集）", "像素仿製塗抹", "色階對比調整"], "a": 1, "e": "向量圖形的聯集、交集、差集等布林運算可組合或挖除形狀。"}, {"topic": "AI 向量化", "q": "關於現代免安裝網頁工具與「Text-to-Vector」技術的應用，下列敘述何者最恰當？", "o": ["Photopea 是線上版 Illustrator，專門用來繪製貝茲曲線向量路徑", "Text-to-Vector 只能產生有鋸齒的點陣 JPG 圖片，無法輸出 SVG", "使用 Recraft 輸入提示詞可由 AI 直接演算出可無限縮放的 SVG 向量圖檔", "Vectorpea 只能在手機安裝 App 執行，不支援在電腦瀏覽器開啟檔案"], "a": 2, "e": "Text-to-Vector 的核心價值是直接產生向量結果，例如 SVG，可無損縮放並進一步編修。"}]}, {"id": "R4", "icon": "🖥️", "name": "複習站 4", "title": "電腦硬體核心與記憶體", "desc": "馮紐曼五大單元、CPU、記憶體階層、SSD、ENIAC 與科技趨勢。", "questions": [{"topic": "五大單元", "q": "依據馮紐曼電腦架構，在五大單元中負責「發出控制訊號、指揮協調各單元運作、決定指令執行順序」的指揮中樞是哪一個單元？", "o": ["算術與邏輯單元（ALU）", "控制單元（Control Unit, CU）", "輸入單元（Input Unit）", "輔助記憶體（Storage）"], "a": 1, "e": "控制單元 CU 負責解碼指令、發出控制訊號並協調整體運作。"}, {"topic": "CPU", "q": "現代電腦的中央處理器（CPU）是整部系統的運算心臟。請問 CPU 主要由馮紐曼五大單元中的哪兩個單元共同組合而成？", "o": ["控制單元（CU）＋算術與邏輯單元（ALU）", "輸入單元＋輸出單元", "記憶單元＋控制單元", "暫存器＋主記憶體"], "a": 0, "e": "CPU 的核心概念是 CU（控制）與 ALU（算術邏輯）共同完成指令控制與運算。"}, {"topic": "輸出單元", "q": "電腦硬體周邊設備繁多，下列哪一組設備的歸類「完全屬於輸出單元（Output Unit）」？", "o": ["滑鼠、鍵盤、麥克風", "液晶螢幕、彩色印表機、喇叭音響", "視訊攝影機、條碼閱讀機、耳機", "掃描器、觸控板、投影機"], "a": 1, "e": "螢幕、印表機、喇叭都把電腦處理結果輸出給使用者。"}, {"topic": "儲存裝置", "q": "平日我們常將 USB 隨身碟插到電腦上複製檔案，或使用外接光碟機讀取光碟。請問隨身碟與光碟在五大單元的正式歸類中，屬於哪一個單元？", "o": ["輸入單元", "記憶單元（屬於輔助記憶體／外部儲存設備）", "輸出單元", "控制單元"], "a": 1, "e": "隨身碟、光碟、SSD/HDD 都屬於儲存資料的輔助記憶體。"}, {"topic": "記憶體階層", "q": "依據階層式記憶體金字塔的運作規律，下列記憶體按照「存取速度由最快到最慢」排序，何者完全正確？", "o": ["暫存器（Register）＞快取（Cache）＞主記憶體（RAM）＞輔助記憶體（SSD/HDD）", "輔助記憶體＞RAM＞Cache＞Register", "Cache＞Register＞RAM＞SSD/HDD", "RAM＞Cache＞Register＞SSD/HDD"], "a": 0, "e": "越靠近 CPU 的儲存層速度越快、容量通常越小：Register → Cache → RAM → SSD/HDD。"}, {"topic": "RAM", "q": "學生在電腦教室編輯報告時，若未養成存檔習慣而突然遇到停電關機，重新開機後未儲存內容全數遺失。這是因為編輯中的暫態資料當時存放在哪一個「具揮發性」的記憶單元中？", "o": ["固態硬碟（SSD）", "隨機存取記憶體（RAM／主記憶體）", "傳統機械硬碟（HDD）", "雲端備份硬碟"], "a": 1, "e": "RAM 是揮發性記憶體，斷電後資料會消失；未存檔的編輯內容通常暫存在 RAM。"}, {"topic": "Cache", "q": "為了配合 CPU 運算，記憶單元各司其職。若把「記在大腦中的思緒」比喻為暫存器，把「圖書館的倉庫藏書」比喻為輔助記憶體，那麼「桌上隨手抄寫、記錄最近剛使用過資料的便條紙」最適合用來形容哪種記憶體？", "o": ["主記憶體（RAM）", "快取記憶體（Cache）", "唯讀記憶體（ROM）", "固態硬碟（SSD）"], "a": 1, "e": "Cache 用來暫存 CPU 最近或常用的資料，概念上像手邊隨時可取用的便條。"}, {"topic": "SSD", "q": "現代筆記型電腦普遍淘汰傳統機械硬碟（HDD），全面改採固態硬碟（SSD）。下列關於 SSD 的特性敘述，何者正確？", "o": ["內部由高速旋轉的磁碟與讀寫頭組成，價格非常便宜", "採用快閃記憶體晶片讀寫，速度極快、完全靜音且運作中耐晃動碰撞", "損壞前通常會發出喀喀異音，容易提早發現並備份", "斷電後資料會立即消失，開機時需重新安裝系統"], "a": 1, "e": "SSD 沒有機械轉盤，使用快閃記憶體，因此速度快、安靜，也較耐震。"}, {"topic": "電腦世代", "q": "西元 1946 年問世的第一代電子計算機 ENIAC 重達 30 噸、占地 42 坪，主要是因為採用了哪一種體積龐大且燈絲易燒斷的電子元件作為核心？", "o": ["電晶體（Transistor）", "真空管（Vacuum Tube）", "積體電路（IC）", "超大型積體電路（VLSI）"], "a": 1, "e": "第一代電子計算機主要使用真空管，因此體積大、耗電高且容易故障。"}, {"topic": "科技趨勢", "q": "英特爾創始人之一 Gordon Moore 提出「摩爾定律」，預言積體電路上的電晶體數目約每隔兩年增加一倍。現代資訊科技發展所聚焦的「大、人、物」黃金三角，分別代表哪三項技術？", "o": ["大型電腦、人工操作、物流快遞", "大數據（Big Data）、人工智慧（AI）、物聯網（IoT）", "大容量磁碟、人形機器人、物理感測", "大眾傳播、人才培育、生物科技"], "a": 1, "e": "「大、人、物」常用來指 Big Data、AI、IoT，是現代資訊科技的重要發展方向。"}]}];
  const MOD="midterm", KEY="course116_midterm_review_v1";
  let stationIndex=0, questionIndex=0, selected=null, locked=false, session=null, activeQuestionIndexes=[];
  const $=s=>document.querySelector(s);
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){return {}}}
  function saveState(s){localStorage.setItem(KEY,JSON.stringify(s))}
  function student(){return window.STORE&&STORE.me?STORE.me():null}
  function stationRecord(id){return state()[id]||null}
  function isUnlocked(i){if(i===0)return true;return !!stationRecord(STATIONS[i-1].id)?.completed}
  function allCompleted(){return STATIONS.every(s=>stationRecord(s.id)?.completed)}
  function renderStudent(){const p=student();$("#studentTag").textContent=p?`${p.cls} 班｜${Number(p.seat)} 號｜${p.name}`:"尚未登入"}
  function renderMap(){
    $("#mapView").classList.remove("hidden");$("#quizView").classList.add("hidden");
    const grid=$("#stationGrid");
    grid.innerHTML=STATIONS.map((s,i)=>{
      const rec=stationRecord(s.id), unlocked=isUnlocked(i);
      let status="尚未開始";
      if(rec?.completed)status=`已完成｜10 / 10 全部答對`;
      else if(!unlocked)status="完成前一站後解鎖";
      return `<article class="stationCard ${unlocked?"":"locked"}"><div class="stationHead"><div><div class="stationNo">${s.name}</div><h3>${s.icon} ${s.title}</h3></div><div class="stationIcon">${rec?.completed?"✅":(unlocked?s.icon:"🔒")}</div></div><p>${s.desc}</p><div class="stationFooter"><span class="stationState">${status}</span><button class="startBtn" data-station="${i}" ${unlocked?"":"disabled"}>${rec?.completed?"重新複習":"開始挑戰"}</button></div></article>`;
    }).join("");
    grid.querySelectorAll(".startBtn").forEach(b=>b.addEventListener("click",()=>startStation(Number(b.dataset.station))));
    $("#finalTreasure").classList.toggle("hidden",!allCompleted());
  }
  function startStation(i){
    if(!isUnlocked(i))return;
    stationIndex=i;questionIndex=0;selected=null;locked=false;
    activeQuestionIndexes=STATIONS[i].questions.map((_,idx)=>idx);
    session={round:1,wrongTopics:[],answers:[],wrongIndexes:[]};
    $("#mapView").classList.add("hidden");$("#quizView").classList.remove("hidden");renderQuestion();
  }
  function renderQuestion(){
    const st=STATIONS[stationIndex],realIndex=activeQuestionIndexes[questionIndex],q=st.questions[realIndex];
    selected=null;locked=false;
    $("#stationName").textContent=st.name;$("#stationTitle").textContent=`${st.icon} ${st.title}`;
    $("#progressPill").textContent=`第 ${session.round} 輪｜${questionIndex+1} / ${activeQuestionIndexes.length}`;
    $("#progressFill").style.width=`${questionIndex/activeQuestionIndexes.length*100}%`;
    $("#questionNo").textContent=`原題第 ${realIndex+1} 題`;$("#topicTag").textContent=q.topic;$("#questionText").textContent=q.q;
    $("#feedback").className="feedback hidden";$("#feedback").innerHTML="";
    $("#checkBtn").classList.remove("hidden");$("#checkBtn").disabled=true;$("#nextBtn").classList.add("hidden");
    $("#options").innerHTML=q.o.map((o,idx)=>`<button type="button" class="optionBtn" data-option="${idx}"><b>${String.fromCharCode(65+idx)}.</b> ${o}</button>`).join("");
    $("#options").querySelectorAll(".optionBtn").forEach(btn=>btn.addEventListener("click",()=>{
      if(locked)return;selected=Number(btn.dataset.option);
      $("#options").querySelectorAll(".optionBtn").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");$("#checkBtn").disabled=false;
    }));
  }
  function checkAnswer(){
    if(selected===null||locked)return;
    locked=true;
    const st=STATIONS[stationIndex],realIndex=activeQuestionIndexes[questionIndex],q=st.questions[realIndex],good=selected===q.a;
    if(!good){
      if(!session.wrongTopics.includes(q.topic))session.wrongTopics.push(q.topic);
      if(!session.wrongIndexes.includes(realIndex))session.wrongIndexes.push(realIndex);
    }
    session.answers.push({round:session.round,q:realIndex,selected:selected,correct:q.a,good:good});
    $("#options").querySelectorAll(".optionBtn").forEach((b,idx)=>{b.disabled=true;if(idx===q.a)b.classList.add("correct");if(idx===selected&&idx!==q.a)b.classList.add("wrong")});
    const fb=$("#feedback");fb.className=`feedback ${good?"good":"bad"}`;
    fb.innerHTML=`<div class="answerLine">${good?"✅ 答對了！":"🔎 這題要再注意"} 正確答案：${String.fromCharCode(65+q.a)}. ${q.o[q.a]}</div><div>${q.e}</div>`;
    $("#checkBtn").classList.add("hidden");$("#nextBtn").classList.remove("hidden");
    $("#nextBtn").textContent=questionIndex===activeQuestionIndexes.length-1?"完成本輪檢查":"下一題 →";
    $("#progressFill").style.width=`${(questionIndex+1)/activeQuestionIndexes.length*100}%`;
  }
  function nextQuestion(){
    if(questionIndex<activeQuestionIndexes.length-1){
      questionIndex++;
      renderQuestion();
    }else{
      finishRound();
    }
  }
  function finishRound(){
    const st=STATIONS[stationIndex];

    if(session.wrongIndexes.length===0){
      completeStation();
      return;
    }

    const missed=[...session.wrongIndexes];
    const missedTopics=[...session.wrongTopics];

    $("#doneTitle").textContent=`🔁 第 ${session.round} 輪完成`;
    $("#doneSummary").textContent=`這一輪還有 ${missed.length} 題需要再練。下一輪只會重做剛才答錯的題目。`;
    $("#wrongTopics").innerHTML=`<b>需要再複習：</b> ${missedTopics.join("、")}`;
    $("#retryStationBtn").classList.add("hidden");
    $("#continueBtn").textContent="重練錯題 →";
    $("#stationDoneDialog").showModal();

    $("#continueBtn").onclick=()=>{
      $("#stationDoneDialog").close();
      activeQuestionIndexes=missed;
      questionIndex=0;
      selected=null;
      locked=false;
      session={
        round:session.round+1,
        wrongTopics:[],
        answers:session.answers,
        wrongIndexes:[]
      };
      renderQuestion();
    };
  }

  function completeStation(){
    const st=STATIONS[stationIndex],s=state();
    s[st.id]={
      completed:true,
      correct:10,
      lastCorrect:10,
      completedAt:new Date().toISOString(),
      wrongTopics:[]
    };
    saveState(s);

    if(window.STORE&&STORE.saveLevel){
      STORE.saveLevel(MOD,st.id,{
        stars:10,
        score:100,
        done:true,
        extra:{
          correct:10,
          total:10,
          mastered:true,
          attempts:session.round
        }
      });
    }

    $("#doneTitle").textContent=`🏆 ${st.title} 全部答對！`;
    $("#doneSummary").textContent=`你已經把這一站所有題目都答對，正式解鎖下一站。`;
    $("#wrongTopics").innerHTML=`<b>完成：</b> 10 / 10 題全部正確。`;
    $("#retryStationBtn").classList.remove("hidden");
    $("#continueBtn").textContent=stationIndex===STATIONS.length-1?"回複習地圖 🎁":"前往下一站 →";
    $("#continueBtn").onclick=continueAdventure;
    $("#stationDoneDialog").showModal();
  }

  function retryStation(){
    $("#stationDoneDialog").close();
    startStation(stationIndex);
  }
  function continueAdventure(){$("#stationDoneDialog").close();if(stationIndex<STATIONS.length-1)startStation(stationIndex+1);else renderMap()}
  function init(){
    renderStudent();renderMap();
    $("#backToMap").onclick=renderMap;$("#checkBtn").onclick=checkAnswer;$("#nextBtn").onclick=nextQuestion;
    $("#retryStationBtn").onclick=retryStation;$("#continueBtn").onclick=continueAdventure;
  }
  window.MIDTERM={init:init};
})();