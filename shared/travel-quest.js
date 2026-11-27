/* Canva 校園微電影 v17.53：逐步說明與 Canva 實作雙頁配對。 */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id),mod='media';
  const tasks=[
    {icon:'🧭',title:'接續上學期企畫｜檢查缺鏡與補拍',goal:'上學期已經想過片名、核心價值和五段分鏡，這裡直接帶入；今天只找出還缺的畫面。',steps:['先看下方自動帶入的上學期企畫，不必重新填寫片名、拍攝地點或五段故事。','打開上學期約 180 秒粗剪，逐段核對：哪些已有照片或影片？哪裡需要補拍、補錄旁白或訪談？','觀察觀眾能否從人物行動看見核心價值；友情、尊重、成長或環境關懷都不需要硬套「發現問題→解決問題」。','記下最需要補充的畫面，再開始 Canva 精剪，逐步延伸到 280 秒。','如果這台電腦沒有上學期的企畫草稿，先用原本的學習裝置開啟；不會因此刪除已取得的星星。'],ask:'核對上學期作品，確認缺少的畫面',mode:'review'},
    {icon:'🎨',title:'開啟上學期的 Canva 剪輯專案',goal:'接續上學期 180 秒粗剪，不需要重新建立同一支作品。',steps:['登入上學期使用的 Canva 帳號，在「專案」找到自己的微電影。','開啟上學期的 180 秒粗剪，確認原始影片、照片、字幕與音訊還在。','保留原專案，想安全試剪可先複製一份，命名為「原片名_280秒精剪」。','在時間軸檢查原有畫面能否正常播放；如果找不到專案，先詢問老師或組員，不要把舊作品刪除。'],ask:'你已找到上學期的可編輯專案與時間軸嗎？',mode:'choice',options:['已開啟影片時間軸','只開啟帳號設定'],right:0},
    {icon:'📂',title:'核對既有素材、補充缺少的鏡頭',goal:'沿用上學期建好的資料夾，把新補拍的素材加入正確位置。',steps:['先開啟上學期已整理的 Canva 作品資料夾，不需要再建立一組相同資料夾。','檢查開場、場景、人物互動、特寫與片尾分類是否還保留原始素材。','對照第一關的缺鏡清單，把新拍的影片與照片先存到電腦備份資料夾，改成可辨識檔名。','Canva 左側「上傳」→「上傳檔案」，只補上新素材；等縮圖出現並確認可播放。','將補充素材放入對應分類，回到粗剪時間軸，試放到缺鏡位置並比較前後故事是否更清楚。'],ask:'記錄這次補充了哪些素材與鏡頭',mode:'form',fields:[['沿用的 Canva 作品名稱','例如：902_31_校園微電影'],['原有素材分類在哪個資料夾','例如：03_人物互動'],['這次新增的影片或照片檔名','例如：互相加油_特寫.mp4'],['新素材補到哪一段故事','例如：65–140 秒的事件發生前'],['補進去後核心價值更清楚嗎','例如：看得出同學互相鼓勵']]},
    {icon:'✂️',title:'剪掉多餘畫面',goal:'讓畫面一開始就吸引人。',steps:['點選第一段影片，拖曳片段左右邊緣來修剪。','把走到定位前的晃動畫面剪掉。','第二段也試著修剪，保留最有趣的部分。','播放比較修剪前後的節奏。'],ask:'完成後確認：至少修剪過兩段影片。',mode:'confirm'},
    {icon:'🧱',title:'加一個片頭分頁',goal:'讓旅拍先有自己的標題畫面。',steps:['把播放頭移到最前面。','在主軌點「＋」或「新增」，選「空白片段／Blank」。','設定片頭背景色，保持文字能閱讀。','播放檢查空白片段是否真的出現在開頭。'],ask:'片頭要獨立顯示，應加入哪個物件？',mode:'choice',options:['主軌的空白片段','只改檔案名稱'],right:0},
    {icon:'🔤',title:'寫下旅拍片名',goal:'加入一行真正會出現在影片裡的文字。',steps:['在 Canva 左側選「文字／Text」→「新增標題」。','輸入你的旅拍名稱，例如「港邊的午後」。','把文字放在片頭，調整大小與顏色，避免和背景混在一起。','在多軌時間軸檢查文字的出現位置；播放確認片頭看得到字。'],ask:'輸入你實際放到 Canva 片頭的名稱',mode:'text'},
    {icon:'🔀',title:'主軌交界處新增轉場',goal:'依手冊起步 6：讓 Blank 片頭自然接上第一段影片。',steps:['檢查 Blank 片頭與第一段影片都在最下方主影片軌。','將滑鼠移到這兩段的交界處，點「Add transition／新增轉場」。','先比較「直接切換」與「淡化／溶解」：直接切換像轉頭看下一件事；淡化像時間慢慢流過，適合白天變夜晚。','如有「滑動／推移」，可用在出發到抵達；它像新場景把舊場景推走，但每一段都推移會讓人頭暈。','試著將轉場時間設定短一些（例如約 0.3–0.8 秒），播放比較後再調整；太長會遮住精彩畫面。','看不到按鈕時，檢查是否切到舊版頁面縮圖或誤放到上方軌。'],ask:'轉場放在哪裡？',mode:'choice',options:['兩段相鄰主軌片段的交界','上方文字軌的字體名稱'],right:0},
    {icon:'🎞️',title:'剪輯節奏與直式素材',goal:'依手冊進階 1–2：快慢交錯，直式素材不要裁掉主角。',steps:['回到五段式創作故事，安排地點介紹、問題、實際行動、結果與呼籲的順序。','把精彩特寫剪成約 2–4 秒，訪談與關鍵行動則要留足時間讓觀眾理解。','直式素材要先選擇保留完整加背景，或裁切填滿橫式；預覽不可裁掉重要人物。','完整作品逐步調整到接近 280 秒，不必每個片段長度相同；避免只有風景而沒有問題及改善行動。'],ask:'填寫一段快鏡頭與一段慢鏡頭',mode:'form',fields:[['快鏡頭畫面及秒數','例如：市場垃圾特寫 3 秒'],['慢鏡頭畫面及秒數','例如：受訪者分享心得 12 秒'],['直式素材如何處理','例如：左右加背景；沒有直式素材就填無']]},
    {icon:'✨',title:'字幕、動畫與畫面特效實驗室',goal:'依手冊進階 3–5：親眼比較不同動畫，為自己的畫面選擇有理由的效果。',steps:['先在兩段精彩畫面上新增文字軌，各寫一句不超過兩行的字幕；播放確認字與畫面對齊。','選取「片頭標題文字」→ 點「動畫／Animate」。先試淡入，再換成滑入或上升，觀察文字從哪裡出現、速度是否影響閱讀。','再選取「一張照片或影片」→「動畫／Animate」。照片的輕微移動、放大感與文字動畫不同；可試著讓遠景緩慢移動，而不要讓人物一直晃動。','如果動畫面板有「進入／離開／兩者」與速度設定，片頭先選進入、片尾先選離開；選項依素材及帳號版本不同，沒有的效果不必強求。','試做「同一個畫面」的兩個版本：A 不加動畫，B 加一種動畫。各播放一次，挑選更能突出故事的版本。','選一段畫面再試「編輯／調整」中的亮度、對比或飽和度。這是修正畫面色調，不是讓物件移動的動畫。','完成後填入兩句字幕、效果實際套在哪一幕，以及你看到的前後差異。'],ask:'逐格寫下你的字幕、動畫選擇與畫面變化',mode:'form',effects:true,fields:[['第一句景點字幕','例如：轉進巷口，看到最熱鬧的早市'],['第二句景點字幕','例如：天空漸漸變成金黃色'],['套用動畫的畫面或物件','例如：片頭「我的街角小旅行」文字'],['實際選用的動畫及視覺效果','例如：文字淡入＋夕陽照片緩慢移動'],['加動畫前後看起來有何不同？為何選它？','例如：淡入比較溫柔，標題容易看清；不用一直跳動']]},
    {icon:'🎙️',title:'錄音與音訊製作小教室',goal:'先親手製作清楚的旁白、環境音或節奏，這一關還不匯入 Canva。',steps:['① 認識三種聲音：旁白＝告訴觀眾故事；環境音＝街道、腳步、鳥叫；配樂＝烘托輕快、溫暖或神祕的情緒。先從影片五段分鏡選一幕，決定最需要哪一種聲音。','② 寫下約 10–20 字的旁白，例如「走進轉角，發現一家香噴噴的麵包店」。先唸兩遍，找出語速及停頓位置。','③ 準備錄音：到安靜房間、關電扇或遠離風口，手機開「語音備忘錄／錄音機」，或用電腦的錄音程式；麥克風離嘴巴約一個手掌，不要碰觸麥克風。錄製時先靜音兩秒再開始說話。','④ 正式錄旁白：按紅色錄製鍵 → 等兩秒 → 清楚朗讀 → 停兩秒 → 按停止。播放戴耳機聽，確認沒有爆音、風聲與被切掉的字；不清楚就重錄。','⑤ 親手做一個音效：安全地拍手、輕敲桌面或錄下腳步聲；不得未經同意錄製同學談話。用另一個檔名保存，例如「腳步聲_01」。','⑥ 嘗試自製四拍配樂：數「1、2、3、4」，用拍手或敲擊做「咚、噠、咚咚、噠」；連續錄四次，讓節奏穩定。這可以當背景節奏，或日後搭配 Canva 授權音樂。','⑦ 簡單剪音訊：在手機錄音程式或其他可用編輯器找到「編輯／修剪」，剪掉頭尾等待的空白與失誤；播放檢查開頭、結尾是否自然。若裝置不支援剪輯，保留原檔，下一關匯入 Canva 再修剪。','⑧ 整理檔案：在「校園微電影」資料夾新增「06_聲音素材」，存放「旁白_開場」「音效_腳步」「節奏_四拍」等有意義的檔名。選能在 Canva 上傳的音訊格式，先在裝置上播放確認。','⑨ 最後檢查：播放自己的旁白或節奏，確認聲音清楚、沒有突然過大，而且素材是自行錄製或有合法使用權。這一關完成後，下一關才會教你將聲音匯入 Canva。'],ask:'完成實際錄音後，寫下自己的音訊製作紀錄',mode:'form',audioLab:true,fields:[['影片哪一幕要使用聲音？想營造什麼情緒？','例如：抵達夜市，想營造熱鬧感'],['我的旁白稿（至少一句）','例如：轉過街角，夜市的香味迎面而來'],['我用什麼裝置或程式錄音？','例如：手機語音備忘錄'],['錄製了哪種聲音？實際檔名是什麼？','例如：旁白_開場.m4a、音效_腳步.m4a'],['四拍節奏或自製音效的做法','例如：拍手、敲桌、拍手兩次、敲桌'],['重聽後修改了哪裡？','例如：去掉開頭兩秒空白，重新錄製太小聲的句子']]},
    {icon:'🎚️',title:'匯入音訊、剪接與混音',goal:'延續上一關自己錄好的素材，再把聲音放到影片正確的時間點。',steps:['① 先打開上關建立的電腦資料夾「06_聲音素材」，確認旁白與自製音效在電腦可以播放。','② 回 Canva 專案，從「上傳／Uploads」→「上傳檔案」，選剛才錄好的旁白或音效；如果有自製四拍節奏，也一起上傳。','③ 在 Canva 的影片時間軸找到「Add Audio／新增音訊」或上傳的音訊素材，將旁白放到獨立音訊軌，拖曳左右邊界調整開始與結束時間。','④ 在旁白開始說話的那一幕播放，比較聲音是不是太早／太晚；拖動整段音訊直到嘴巴動作或畫面內容對得上。','⑤ 加入自己的腳步、拍手等音效，放到另一個音訊軌；讓效果出現在畫面動作發生的瞬間。','⑥ 需要背景音樂時，先試自製四拍節奏，也可從 Canva 音訊庫挑合法素材。音樂放獨立音訊軌，與旁白分開控制。','⑦ 選背景音軌調低音量，確保旁白比音樂清楚；可用時加入淡入、淡出，避免突然開始或中斷。','⑧ 從片頭完整播放一次並戴耳機檢查：有沒有爆音、音效是否對位、背景配樂是否蓋住人聲。必要時回上一關重錄，再重新上傳。'],ask:'記錄你真正匯入的音訊與混音結果',mode:'form',fields:[['實際匯入 Canva 的旁白或音效檔名','例如：旁白_開場.m4a'],['聲音放在第幾段畫面？大約第幾秒開始？','例如：抵達段，約第 10 秒'],['用了哪個自製音效？對準什麼動作？','例如：腳步聲，對準人物走入畫面'],['配樂如何處理？','例如：自製節奏放背景音軌，旁白時降低音量'],['重播後修改了什麼？','例如：將音效向後移 1 秒，音樂降到不干擾說話']]},
    {icon:'🏁',title:'片尾、預覽與匯出創作 MP4',goal:'檢查 4 分 40 秒完整作品、教育意義與授權，再送最後技術檢測。',steps:['最後加入片尾 Blank，放一句邀請觀眾採取行動的話，例如「從今天開始一起減塑」，並列明授權來源與製作分工。','從頭播放接近 280 秒的完整影片，檢查觀眾是否看得出問題、實際行動和結果。','確認沒有 AI 生成影片畫面、未授權素材、未同意入鏡者的可辨識影像；前屆規則禁止 AI 生成分享影片。','右上「分享／Share」→「下載／Download」→選 MP4 影片，建議橫式 16:9，長度不得超過前屆 5 分鐘上限，檔案不得超過 1GB。','以電腦播放器完整看一次，再撰寫 200 字內的作品摘要；正式送件日期與規格以當屆公告為準。'],ask:'填寫片尾行動呼籲、匯出檔名與影片摘要',mode:'form',fields:[['片尾核心價值與行動呼籲','例如：不只看見街角，更要一起減塑'],['匯出的 MP4 檔名','例如：市場減塑小旅行.mp4'],['200 字內作品摘要草稿','例如：我們透過街角旅拍發現...並實際測試...'],['播放後的檢查結果','例如：4分40秒內、字幕清楚、音樂正常、來源已確認']]}
  ];
  const key='TRAVEL_PDF_',earned=i=>!!(window.STORE?.level(mod,key+String(i+1).padStart(2,'0'))?.stars);
  const effectExamples=[
    ['🌫️ 淡入／淡出','文字或畫面從透明慢慢出現／消失','開場片名、黃昏回憶、片尾「謝謝觀賞」','留給觀眾閱讀時間；過慢會像卡住'],
    ['⬆️ 上升／滑入','字幕由下往上，或從畫面側邊滑進來','抵達景點時顯示地名；路線、方向提示','文字不要飛過人臉；同一部影片盡量統一方向'],
    ['💥 彈跳／蹦出','文字快速放大、輕輕彈一下，營造驚喜','「超好吃！」、「發現祕密景點！」等短促重點','只用在少數驚喜瞬間，長字幕不適合'],
    ['⌨️ 打字／逐字出現','字像有人一個字一個字輸入','片頭日記、地址線索、簡短心情句','文字多會太慢；先確認觀眾能讀完'],
    ['🔍 緩慢放大／縮小','靜態照片像鏡頭往景物靠近或退後','遠景慢慢接近地標、特寫美食或建築','不要放大到裁掉人物頭部；影片本身有晃動就少用'],
    ['🛝 平移／漂移','照片彷彿鏡頭慢慢從左掃到右','街道全景、壁畫、風景照','移動太快會看不清，人物特寫不一定適合'],
    ['✨ 閃爍／霓虹／強烈效果','亮暗、光感或物件反覆變化，視覺很醒目','節慶招牌、夜市氣氛的短促強調','可能造成視覺疲勞；避免快速閃爍及整片濫用'],
    ['🎨 亮度／對比／飽和度調整','照片更明亮、輪廓更清楚、色彩更濃或更淡','陰天街景略提亮、不同鏡頭統一色調','這是色調調整不是動畫；過度加飽和度會失真']
  ];
  const filmTutorials=[
    {name:'🔎 平移到焦點，再放大（推薦先練）',where:'五段分鏡的「精彩內容」：街景 → 店家 → 招牌',prep:'同一地點的廣角照片一張，最好清楚包含目標商店或人物。',steps:['在 Canva 主軌放入街景照片，先讓它顯示約 3 秒。','點選照片，若顯示「動畫／Animate」，先試一種緩慢平移或漂移效果；預覽它是不是朝你要介紹的方向移動。','若可選「建立動畫／Create an Animation」，可以拖動照片錄製移動路徑；這是元素的移動，不等同於鏡頭的精準放大。','要明確放大到商店：複製同一張照片做第二個約 2 秒的畫面，點第二張照片的「裁切／Crop」，放大照片並拖曳至招牌位於畫面中央。','按播放：第 1 個畫面讓觀眾看到街景，第 2 個畫面讓招牌成為主角。兩段銜接太突兀可試短暫淡化。','注意：若想在同一鏡頭內平滑連續地同時改變位置與縮放，Canva 未必提供完整關鍵影格控制；先用「平移＋特寫剪接」完成可重現的效果。'],check:'最後放大的焦點是什麼？你是否仍看得清焦點？'},
    {name:'🎥 拉遠揭曉環境',where:'「抵達」：先看小吃，再揭曉熱鬧夜市',prep:'同一場景的特寫與全景各一段，或用同一張高畫質照片製作兩個不同裁切。',steps:['先把特寫放在主軌，保留約 2 秒。','再放入全景，保留約 3–4 秒。','播放時應先只看到食物／標誌，接著看出它所在的地點。','試一版直接切換，再試一版短淡化；選擇比較像「揭曉」的版本。','如果只有照片，也可以把特寫照片與完整照片依序排好，靠裁切完成由近到遠的效果。'],check:'觀眾一開始不知道什麼？第二鏡頭揭曉了什麼？'},
    {name:'✂️ 動作接剪：開門進店',where:'「抵達」或「精彩內容」：手推門 → 店內',prep:'拍攝 A：手碰到門把開始推門；拍攝 B：門打開後向室內走。',steps:['把 A、B 依序放入主軌。','選 A 片段，修剪右邊緣，讓它結束在「門剛開始打開」的瞬間。','選 B 片段，修剪左邊緣，讓畫面從「同一個開門動作繼續」開始。','先不要加轉場，直接播放兩段交界處。','如果看起來動作倒退，繼續修剪 B 的開頭；如果跳太快，就保留 A 多一點。'],check:'兩個鏡頭的門向同一方向打開嗎？動作有重複嗎？'},
    {name:'👀 視線接剪：主角看到了什麼',where:'「精彩內容」：人物抬頭 → 天空或建築',prep:'拍攝 A：人物往某個方向看；拍攝 B：人物看向的招牌、夕陽或景色。',steps:['將人物望向遠方的畫面放在主軌，約 2 秒。','接著放入他看到的景色，約 3 秒。','修剪人物畫面，停在他望向景色的瞬間。','兩鏡直接切換，不需要炫目的轉場。','播放後請同學猜：主角剛才在看什麼？猜得到才代表視線引導清楚。'],check:'觀眾是否能從兩段鏡頭理解人物在看什麼？'},
    {name:'🎶 蒙太奇：五個畫面濃縮旅程',where:'「精彩內容」：用短鏡頭快速帶過一天的旅行',prep:'準備五段：出發、路景、食物、活動、夕陽。',steps:['把五個素材依故事順序放到主軌。','先各保留約 2–3 秒，總共做出一段約 10–15 秒的短片。','播放一次，確定觀眾知道是「一天的旅程」，而不是隨機照片。','在後面的配樂任務挑選合法音樂或原創節奏，嘗試讓換鏡頭時間接近節拍。','比較快版與慢版；熱鬧畫面可短一點，回味畫面可以長一些。'],check:'五個鏡頭依序是什麼？哪個畫面應該停留最久？'},
    {name:'🎧 聲音先行：先聽到，才看到',where:'「精彩內容」進入「回味」：先聽夜市聲，畫面才切夜市',prep:'準備街景影片、夜市影片，以及自己錄製或授權可用的環境音。',steps:['在主軌依序放街景與夜市兩段影片。','到 Canva 的音訊軌匯入夜市環境音，把音效左邊界拖到夜市畫面出現前約 1 秒。','播放時先維持街景畫面，但已聽見夜市聲，再切入夜市畫面。','如果原影片人聲被蓋住，選取音訊軌降低音量；確認沒有尖銳或過大的聲響。','將環境音和畫面一起播放，檢查觀眾是否期待即將出現的新地方。'],check:'觀眾先聽到的是什麼聲音？比畫面早約幾秒？'}
  ];
  const tipsForTask=[[0,1,3],[0,1],[0,4],[2,3,4],[0,1],[0,3],[2,3],[2,3,4],[0,1,2,3,4,5],[4,5],[5,4],[0,1,5]];
  // 訪客練習進度只供畫面使用，正式星星以學生 STORE 為準。
  let guest=Array.from({length:tasks.length},(_,i)=>sessionStorage.getItem('travel_pdf_guest_'+i)==='1'),current=0;
  const canvaTask=i=>i!==0&&i!==9;
  const has=i=>earned(i)||guest[i],count=()=>tasks.filter((_,i)=>has(i)).length;
  window.travelQuestReady=()=>count()===tasks.length;
  function draftKey(i){const p=window.STORE?.me();return 'travel_quest_draft_'+(p?String(p.cls)+'_'+String(p.seat):'guest')+'_'+i;}
  function readDraft(i){try{return JSON.parse(sessionStorage.getItem(draftKey(i))||'{}');}catch(e){return {};}}
  function writeDraft(i,d){try{sessionStorage.setItem(draftKey(i),JSON.stringify(d));}catch(e){}}
  function firstSemesterPlan(){
    const p=window.STORE?.me?.();if(!p)return null;
    try{
      const plan=JSON.parse(localStorage.getItem('educase_11601_plan_'+p.cls+'_'+p.seat)||'null');
      return plan&&typeof plan==='object'&&!Array.isArray(plan)?plan:null;
    }catch(e){return null;}
  }
  function compiledFromLocal(){const p=firstSemesterPlan();return p?.compiledPlan?.storyText?p.compiledPlan:null;}
  async function compiledFromCloud(){
    const profile=window.STORE?.me?.(),db=window.CourseDB;
    if(!profile||!db)return null;
    await db.ready;
    if(!db.matchesStudentProfile?.(profile))return null;
    const data=await db.loadStudent();
    const candidates=[
      data?.courseProgress?.['11601']?.modules?.filmPrep?.levels?.FP_PLAN,
      data?.progress?._mods?.filmPrep?.levels?.FP_PLAN,
      data?.modules?.filmPrep?.levels?.FP_PLAN
    ];
    return candidates.map(x=>x?.extra?.compiledPlan).find(x=>x?.storyText)||null;
  }
  function renderCompiledPlan(box,plan,source){
    box.innerHTML='';
    const title=document.createElement('h3');title.textContent='🎬 已找到上學期整理版企畫';box.append(title);
    const desc=document.createElement('p');desc.textContent='已依原本填寫的答案整合故事定位、五段時間軸、鏡頭、聲音和待補拍清單。'+(source==='cloud'?'（已從學生雲端紀錄讀取）':'（此裝置的整理版）');box.append(desc);
    const open=document.createElement('button');open.type='button';open.className='btn';open.textContent='📖 開啟上學期企畫（整理版）';box.append(open);
    const content=document.createElement('pre');content.hidden=true;content.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;line-height:1.8;background:#f5fbff;border-radius:10px;padding:15px';content.textContent=plan.storyText;box.append(content);
    open.onclick=()=>{content.hidden=!content.hidden;open.textContent=content.hidden?'📖 開啟上學期企畫（整理版）':'📕 收起上學期整理版';};
    const link=document.createElement('a');link.href='../shared/educase-film.html#idea';link.textContent='✍️ 回上學期修改或重新整理企畫';link.style.fontWeight='800';box.append(link);
  }
  function unlocked(i){return i===0||Array.from({length:i},(_,k)=>k).every(has);}
  function draw(){
    const n=count();$('questStars').textContent=tasks.map((_,i)=>has(i)?'⭐':'☆').join(' ');
    $('questCounter').textContent=`已得到 ${n} / ${tasks.length} 顆學習星星｜${n===tasks.length?'所有技巧都完成，請往下進行最後檢測！':'每次專心完成一個操作就好。'}`;
    document.body.classList.toggle('quest-mode',n!==tasks.length);
    $('questTrack').innerHTML=tasks.map((t,i)=>`<button type="button" data-step="${i}" ${unlocked(i)?'':'disabled'} ${i===current?'aria-current="step"':''}>${has(i)?'⭐':i===current?'👉':'○'} ${i+1}</button>`).join('');
    $('questTrack').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{current=Number(b.dataset.step);draw();}));
    const t=tasks[current],needsCheck=t.mode!=='form'&&t.mode!=='storyboard',checkText=current===0?'我已核對上學期企畫或粗剪，知道需要補充哪些素材。':current===1?'我已成功建立 Canva 影片專案並找到時間軸。':current===2?'我已上傳素材，並在時間軸播放確認順序。':current===3?'我已實際修剪至少兩段影片並播放比較。':current===4?'我已在影片開頭加入空白片段並預覽。':current===5?'我已在 Canva 片頭放入文字並播放確認。':current===7?'我已套用文字動畫，並播放檢查效果。':current===8?'我已在兩段畫面之間試用轉場。':current===10?'我已放入音訊軌並調整過音量。':'我已在 Canva 完成上面的操作並播放確認。';
    $('questStep').innerHTML=`<div style="font-size:2.4rem">${t.icon}</div><p style="color:#145d81;font-weight:800">任務 ${current+1}／${tasks.length}</p><h2>${t.title}</h2><p><b>🎯 這次只做一件事：</b>${t.goal}</p><div id="canvaCompanion"></div><details><summary>📖 一次預覽本關全部操作說明</summary><ol>${t.steps.map(s=>`<li>${s}</li>`).join('')}</ol></details><p class="quest-hint">🎯 請完成：${t.ask}</p><div id="questAnswer"></div>${needsCheck?'<label class="quest-check"><input type="checkbox" id="questReally"> '+checkText+'</label>':'<p class="small">✏️ 每一格都要填寫；這些草稿只保留在本次瀏覽器分頁，不會上傳到教師資料庫。</p>'}<p id="questMessage" role="status" aria-live="polite"></p><div class="quest-actions"><button id="questClaim" type="button">${has(current)?'⭐ 已獲得這顆星星':'🌟 完成任務，領一顆星星'}</button><button id="questNext" class="secondary" type="button" ${unlocked(current+1)&&current<tasks.length-1?'':'disabled'}>下一關 →</button></div>${n===tasks.length?'<div class="quest-complete"><h3>🏆 12 顆星星收集完成！</h3><p>現在才進行最後 MP4 技術檢測。這些星星只記錄學習任務完成情形，作品內容仍須老師查看。</p><a class="btn" href="#travelSubmission">🚀 前往最後檢測</a></div>':''}`;
    {
      const wrapper=$('canvaCompanion'),state=readDraft(current),last=t.steps.length-1;
      let step=Math.max(0,Math.min(last,Number(state.walkthroughStep)||0));
      wrapper.className='canva-companion';
      const teach=document.createElement('div');teach.className='canva-teach';
      teach.innerHTML='<h3>📖 這一步怎麼做？</h3><p class="canva-step-meter" id="canvaStepMeter"></p><div class="canva-current-step" id="canvaCurrentStep"></div><div class="canva-step-actions"><button type="button" id="canvaPrevStep">上一步</button><button type="button" id="canvaNextStep">我看懂了，下一步</button></div><p class="small">先在右邊開 Canva 實作，再回來按下一步。可以重看，原本作品不會被修改。</p>';
      const work=document.createElement('div');work.className='canva-do';
      const actionName=canvaTask(current)?'🎨 開啟 Canva 實際操作':'🧭 開啟上學期企畫對照';
      const actionUrl=canvaTask(current)?'https://www.canva.com/':'../shared/educase-film.html#idea';
      const a=document.createElement('a');a.className='btn';a.href=actionUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent=actionName;
      const official=document.createElement('a');official.className='btn alt';official.href='https://www.canva.com/help/creating-and-editing-videos/';official.target='_blank';official.rel='noopener noreferrer';official.textContent='❔ Canva 官方影片操作說明';
      const check=document.createElement('label');check.className='canva-finish';const tick=document.createElement('input');tick.type='checkbox';tick.checked=!!state.canvaChecked;check.append(tick,document.createTextNode(canvaTask(current)?' 我已在 Canva 親手完成本關操作，並播放檢查':' 我已確認本關對照資料'));
      const small=document.createElement('p');small.className='small';small.textContent='這裡不會連線控制 Canva 或讀取私人作品；勾選只代表自行檢查，教師仍須核對作品。';
      work.append(Object.assign(document.createElement('h3'),{textContent:'🎨 換你在 Canva 做'}),a,official,check,small);
      wrapper.append(teach,work);
      function updateStep(){
        teach.querySelector('#canvaStepMeter').textContent='教學步驟 '+(step+1)+' / '+t.steps.length;
        teach.querySelector('#canvaCurrentStep').textContent=t.steps[step];
        teach.querySelector('#canvaPrevStep').disabled=step===0;
        teach.querySelector('#canvaNextStep').disabled=step===last;
        teach.querySelector('#canvaNextStep').textContent=step===last?'🎯 已看到最後一步':'我看懂了，下一步';
        check.style.display=step===last?'block':'none';
      }
      teach.querySelector('#canvaPrevStep').onclick=()=>{step--;writeDraft(current,{...readDraft(current),walkthroughStep:step});updateStep()};
      teach.querySelector('#canvaNextStep').onclick=()=>{step++;writeDraft(current,{...readDraft(current),walkthroughStep:step});updateStep()};
      tick.onchange=()=>{writeDraft(current,{...readDraft(current),canvaChecked:tick.checked})};
      updateStep();
    }
    const pageForTask=[8,2,3,5,6,6,7,8,10,13,14,15];
    const manualButton=document.createElement('button');manualButton.type='button';manualButton.className='btn alt';manualButton.textContent='📖 對照圖解手冊第 '+pageForTask[current]+' 頁';manualButton.style.margin='12px 0';manualButton.addEventListener('click',()=>{const panel=$('travelManual');panel.open=true;const viewer=panel.querySelector('iframe');viewer.src='90秒旅拍_Canva零基礎繁體中文圖解操作手冊.pdf#page='+pageForTask[current]+'&view=FitH';panel.scrollIntoView({behavior:'smooth',block:'start'});});$('questAnswer').before(manualButton);
    const tipButton=document.createElement('button');tipButton.type='button';tipButton.className='btn alt';tipButton.style.margin='12px 0 12px 8px';tipButton.textContent='🎬 影像魔法教室｜探索本關技巧';tipButton.setAttribute('aria-expanded','false');
    const film=document.createElement('section');film.id='questFilmTips';film.hidden=true;film.style.cssText='border:2px solid #efbf6e;border-radius:16px;padding:16px;margin:12px 0;background:#fff9ed';const fh=document.createElement('h3');fh.textContent='✨ 今天要學的電影魔法';film.append(fh);const explain=document.createElement('p');explain.textContent='這裡是本關推薦的延伸教學，可隨時打開、關閉；不影響領取原本的 12 顆星星。先選一種技巧，再一步步操作。';film.append(explain);
    const tipOrder=[...new Set([...tipsForTask[current],...filmTutorials.map((_,i)=>i)])];tipOrder.forEach(i=>{const item=filmTutorials[i],details=document.createElement('details');details.style.cssText='background:#fff;border:1px solid #e4c792;border-radius:12px;margin:10px 0;padding:12px';const summary=document.createElement('summary');summary.style.cssText='font-size:1.08rem;font-weight:800;cursor:pointer';summary.textContent=(tipsForTask[current].includes(i)?'⭐ 本關推薦｜':'其他技巧｜')+item.name;details.append(summary);const where=document.createElement('p');where.textContent='📍 適合放在影片哪一段：'+item.where;details.append(where);const prep=document.createElement('p');prep.textContent='🎒 先準備：'+item.prep;details.append(prep);const ol=document.createElement('ol');item.steps.forEach(step=>{const li=document.createElement('li');li.style.margin='10px 0';li.textContent=step;ol.append(li);});details.append(ol);const check=document.createElement('p');check.style.cssText='background:#dff5e8;border-radius:9px;padding:9px';check.textContent='✅ 播放後想一想：'+item.check;details.append(check);film.append(details);});
    tipButton.addEventListener('click',()=>{film.hidden=!film.hidden;tipButton.setAttribute('aria-expanded',String(!film.hidden));tipButton.textContent=film.hidden?'🎬 影像魔法教室｜探索本關技巧':'🎬 收起影像魔法教室';if(!film.hidden)film.scrollIntoView({behavior:'smooth',block:'nearest'});});$('questAnswer').before(tipButton,film);
    if(t.audioLab){
      const studio=document.createElement('section');studio.style.cssText='background:#eaf8f3;border:2px solid #89cdb7;border-radius:16px;padding:15px;margin:12px 0';const heading=document.createElement('h3');heading.textContent='🎧 錄音品質闖關｜先錄好，再上傳';studio.append(heading);
      [['安靜測試','先錄 5 秒環境音，重聽是否有電風扇、車聲或其他干擾。'],['旁白 A / B 比較','用正常音量錄一句，再用更慢、更清楚的速度錄一次；選比較好懂的一版。'],['節奏小實驗','拍手或敲桌做四拍，錄四輪，重聽每一輪的拍點是否穩定。'],['修剪與命名','保留原始錄音備份；剪掉多餘頭尾後，以旁白、音效、節奏分類命名。']].forEach(([name,desc],i)=>{const d=document.createElement('label');d.style.cssText='display:block;background:#fff;border-radius:10px;padding:11px;margin:9px 0';const check=document.createElement('input');check.type='checkbox';check.style.marginRight='9px';const draft=readDraft(current);check.checked=!!draft['audioCheck'+i];check.addEventListener('change',()=>{const state=readDraft(current);state['audioCheck'+i]=check.checked;writeDraft(current,state);});d.append(check,document.createTextNode(name+'｜'+desc));studio.append(d);});const note=document.createElement('p');note.textContent='🔐 網頁不會開啟麥克風或收集錄音檔。請使用自己裝置的錄音程式製作，下一關才上傳到 Canva。';studio.append(note);$('questAnswer').before(studio);
    }
    if(t.effects){
      const guide=document.createElement('section');guide.style.cssText='background:#eef8ff;border:2px solid #8dc7ed;border-radius:16px;padding:16px;margin:14px 0';
      const heading=document.createElement('h3');heading.textContent='🎬 動畫會帶來什麼畫面效果？先看比較，再選用';guide.append(heading);
      const tip=document.createElement('p');tip.textContent='先分清楚：動畫＝單一文字、照片或元素怎麼動；轉場＝兩個鏡頭怎麼交接；色調調整＝畫面亮暗與顏色怎麼改。效果名稱、是否免費、可調設定會依 Canva 版本與素材而不同；請挑你實際看得到的同類效果。';guide.append(tip);
      const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:10px';
      effectExamples.forEach(([name,appearance,scene,caution])=>{const card=document.createElement('article');card.style.cssText='background:#fff;border:1px solid #c4d9e6;border-radius:12px;padding:12px';const title=document.createElement('strong');title.textContent=name;card.append(title);[["👀 觀眾會看到：",appearance],["🎥 最適合畫面：",scene],["⚠️ 注意：",caution]].forEach(([label,value])=>{const p=document.createElement('p');p.style.margin='8px 0';const b=document.createElement('b');b.textContent=label;p.append(b,document.createTextNode(value));card.append(p);});grid.append(card);});guide.append(grid);
      const example=document.createElement('p');example.style.cssText='background:#d9f4e8;padding:12px;border-radius:10px;margin-top:12px';example.textContent='🧪 跟著試：① 點片頭文字 → 動畫 → 選淡入 → 播放；② 換成滑入 → 再播放；③ 兩種選一個。接著點一張街景照片 → 動畫 → 若有緩慢放大／平移就試用；④ 回到影片看前後效果，最後填下方五格。';guide.append(example);
      $('questAnswer').before(guide);
    }
    const ans=$('questAnswer'),draft=readDraft(current);
    if(t.mode==='review'){
      const plan=firstSemesterPlan();
      const compiled=compiledFromLocal();
      const box=document.createElement('section');box.style.cssText='background:white;border:2px solid #b4d9e6;border-radius:16px;padding:18px;margin:12px 0';
      if(compiled)renderCompiledPlan(box,compiled,'local');
      else{
        const title=document.createElement('h3');title.textContent='📚 正在尋找上學期整理版企畫…';box.append(title);
        const p=document.createElement('p');p.textContent=plan?'這台裝置找到原稿，但尚未整理成完整企畫。可以回上學期按「自動整理完整企畫與分鏡」。':'正在檢查已登入的學生雲端紀錄；如果沒有整理版，請到上學期頁面產生一次。';box.append(p);
      }
      ans.append(box);
      compiledFromCloud().then(cloud=>{
        if(current!==0||!box.isConnected)return;
        if(cloud&&(!compiled||Number(cloud.updatedAt||0)>Number(compiled.updatedAt||0)))renderCompiledPlan(box,cloud,'cloud');
        else if(!compiled){const link=document.createElement('a');link.href='../shared/educase-film.html#idea';link.textContent='🪄 前往上學期整理完整企畫與分鏡';link.style.fontWeight='800';box.append(link);}
      }).catch(()=>{if(!compiled&&box.isConnected){const note=document.createElement('p');note.textContent='目前無法確認雲端整理版，請確認使用相同學生帳號登入，或回上學期重新整理。';box.append(note);}});
      const prompt=document.createElement('p');prompt.style.cssText='background:#eaf7ed;padding:12px;border-radius:12px';prompt.textContent='🔎 這一站只要對照現有照片、影片與 180 秒粗剪，找出缺少的關鍵畫面；補鏡計畫會在後續操作站逐步完成。';ans.append(prompt);
    }
    if(t.mode==='text'){const inp=document.createElement('input');inp.id='questText';inp.className='quest-input';inp.placeholder='請輸入你的實際作品內容';inp.maxLength=80;inp.value=draft.answer||'';inp.addEventListener('input',()=>writeDraft(current,{...readDraft(current),answer:inp.value}));ans.append(inp);}
    if(t.mode==='form')t.fields.forEach(([label,placeholder],i)=>{const wrap=document.createElement('label');wrap.style.display='block';wrap.style.margin='15px 0';const heading=document.createElement('strong');heading.textContent=(i+1)+'. '+label;heading.style.display='block';const field=document.createElement('textarea');field.className='quest-input';field.rows=2;field.maxLength=180;field.placeholder=placeholder;field.setAttribute('aria-label',label);field.dataset.field=i;field.value=draft[i]||'';field.addEventListener('input',()=>{const d=readDraft(current);d[i]=field.value;writeDraft(current,d);});wrap.append(heading,field);ans.append(wrap);});
    if(t.mode==='choice')t.options.forEach((o,i)=>{const label=document.createElement('label');label.className='quest-check';const radio=document.createElement('input');radio.type='radio';radio.name='questChoice';radio.value=i;label.append(radio,document.createTextNode(' '+o));ans.append(label);});
    $('questClaim').addEventListener('click',()=>{if(!has(current)&&(!readDraft(current).canvaChecked||Number(readDraft(current).walkthroughStep)!==t.steps.length-1)){$('questMessage').textContent='請先依序看完教學，到 Canva 親手實作，再勾選右側的完成確認。';$('canvaCompanion').scrollIntoView({behavior:'smooth',block:'center'});return;}
      if(needsCheck&&!document.getElementById('questReally').checked){$('questMessage').textContent='請先完成上面的實作，再勾選具體完成項目。';return;}
      if(t.mode==='text'&&($('questText').value.trim().length<2)){ $('questMessage').textContent='請填寫你實際製作的內容。';return;}
      if(t.mode==='form'){const fields=[...document.querySelectorAll('#questAnswer textarea')];if(fields.some(f=>f.value.trim().length<2)||(current===0&&fields[0].value.trim().length<4)){$('questMessage').textContent='還有欄位尚未完成。請逐格填寫；旅拍主題至少四個字。';return;}}
      if(t.mode==='choice'&&Number(document.querySelector('input[name="questChoice"]:checked')?.value)!==t.right){$('questMessage').textContent='這一步還需要再想想，回到上方操作指示看看。';return;}
      if(!has(current)){const save=window.STORE?.saveLevel(mod,key+String(current+1).padStart(2,'0'),{stars:1,done:true,extra:{kind:'canva-travel-pdf-guided',selfDeclared:true}});if(!save?.record){guest[current]=true;sessionStorage.setItem('travel_pdf_guest_'+current,'1');}}
      const next=current+1;if(next<tasks.length)current=next;draw();});
    $('questNext').addEventListener('click',()=>{if(current+1<tasks.length&&unlocked(current+1)){current++;draw();}});
  }
  draw();window.addEventListener('store:change',()=>draw());window.addEventListener('courseauth:stable',()=>draw());
})();
