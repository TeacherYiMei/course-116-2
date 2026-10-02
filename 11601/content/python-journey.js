const LEVELS=[{"id": "p1", "icon": "👋", "title": "第 1 關｜哈囉，旅伴！", "concept": "print()：讓 Python 把文字顯示出來。", "scratch": "🐱 Scratch 的「說 ___」積木 → Python 的 print()", "steps": [{"title": "👀 看懂再改：自己的招呼語", "prompt": "先看黑框學會 print() 的寫法，再自己寫一句不同的招呼語。", "demo": "print(\"哈囉，旅伴！\")", "starter": "# 看懂黑框後，在下面自己寫\n", "requirements": ["使用 print()", "招呼語要有內容", "不能和黑框示範完全相同"], "rule": "p1_greeting", "mode": "demo", "ref": "print", "hints": ["先保留 print() 的外形，只思考引號裡要換成什麼。", "🐱 想想 Scratch「說 ___」積木：你會把積木裡的文字換掉。", "忘記 print() 的格式時，再開「📘 我想查指令」。"]}, {"title": "🚀 自己完成：旅行出發畫面", "prompt": "讓 Python 顯示兩行：第一行是「你想去的地方」，第二行是「你想做的事情」。兩行內容要不同。", "demo": "", "starter": "# 第一行：想去的地方\n# 第二行：想做的事情\n", "requirements": ["使用 2 次 print()", "顯示 2 行有內容的文字", "兩行文字不能完全相同"], "rule": "p1_two_distinct", "mode": "independent", "ref": "print", "hints": ["題目要求兩行，所以想想需要幾次 print()。", "每個 print() 負責一行；兩行要表達不同資訊。", "忘記寫法時，再查 print()。"]}]}, {"id": "p2", "icon": "🚌", "title": "第 2 關｜畢旅報名表", "concept": "變數 + input()：讓電腦詢問資料，並把回答記住。", "scratch": "🐱 Scratch 的「詢問並等待」＋變數 → Python 的 input()＋變數", "steps": [{"title": "👀 看懂再做：問一個問題並記住", "prompt": "黑框示範詢問食物。你的任務改成：詢問「最想去的城市」，把回答存進變數，再顯示那個變數。", "demo": "food = input(\"你喜歡什麼食物？\")\nprint(food)", "starter": "# 改成詢問最想去的城市\n", "requirements": ["使用 input() 詢問 1 次", "把回答存進變數", "使用 print() 顯示該變數"], "rule": "p2_one_input_var", "mode": "demo", "ref": "input", "hints": ["input() 的回答通常先放進一個變數。", "🐱 Scratch「詢問並等待」得到回答；Python 可以直接把回答放進變數。", "到小百科查 input() 與變數的範例。"]}, {"title": "🧩 兩份資料：姓名與班級", "prompt": "詢問「姓名」和「班級」兩項資料，分別存進兩個不同變數，最後把兩項資料都顯示出來。", "demo": "", "starter": "# 需要兩次詢問、兩個不同變數\n", "requirements": ["使用 input() 詢問 2 次", "使用 2 個不同變數保存回答", "最後顯示兩項資料"], "rule": "p2_two_inputs", "mode": "guided", "ref": "input", "hints": ["先想好兩個盒子的名字，再分別把 input() 放進去。", "兩個問題不要放進同一個變數，否則前一個回答會被蓋掉。", "查 input() 與變數。"]}, {"title": "🚀 自己完成：迷你旅行報名表", "prompt": "詢問「目的地、天數、最期待的活動」三項資料，分別記住，最後至少用一個 print() 把三項資料一起顯示。", "demo": "", "starter": "# 自己設計三個變數完成報名表\n", "requirements": ["使用 input() 詢問 3 次", "使用 3 個不同變數保存回答", "輸出時使用到這 3 個變數"], "rule": "p2_three_inputs_print", "mode": "independent", "ref": "variable", "hints": ["把任務拆成三個問題，每個問題配一個變數。", "最後的 print() 可以一次放進多個變數。", "如果忘記變數與 input()，再查小百科。"]}]}, {"id": "p3", "icon": "💰", "title": "第 3 關｜旅費計算器", "concept": "int() + 運算：把輸入的文字轉成整數，再讓 Python 幫你算。", "scratch": "🐱 Scratch 的運算積木 → Python 的 +、-、*、//、%", "steps": [{"title": "👀 看懂再算：票價總額", "prompt": "黑框示範兩個整數相加。你的任務是詢問「單張票價」和「張數」，用乘法算出總額並顯示。", "demo": "a = int(input(\"第一個整數：\"))\nb = int(input(\"第二個整數：\"))\nprint(a + b)", "starter": "# 單張票價 × 張數\n", "requirements": ["兩次輸入都用 int() 轉成整數", "使用乘法 *", "顯示計算結果"], "rule": "p3_multiply_int", "mode": "demo", "ref": "int", "hints": ["input() 得到文字；要做整數計算要先轉型。", "總額是「單價 × 數量」。", "查 int() 和運算。"]}, {"title": "🧩 平均分配：每人多少、剩多少", "prompt": "詢問「點心總數」和「人數」，算出每人可以拿幾個，以及最後剩幾個。", "demo": "", "starter": "# 需要用到整除 // 和餘數 %\n", "requirements": ["使用 2 次 int(input())", "使用 // 算每人幾個", "使用 % 算剩幾個", "把兩個結果都顯示"], "rule": "p3_divmod", "mode": "guided", "ref": "operator", "hints": ["「平均每人幾個整數」需要整除。", "「分完還剩多少」需要餘數。", "查 // 和 %。"]}, {"title": "🚀 自己完成：旅行預算", "prompt": "詢問「總預算、交通費、餐費」，算出扣掉交通費和餐費後還剩多少錢。", "demo": "", "starter": "# 剩餘預算 = 總預算 - 交通費 - 餐費\n", "requirements": ["使用 3 次 int(input())", "使用減法 - 計算", "顯示剩餘預算"], "rule": "p3_budget", "mode": "independent", "ref": "operator", "hints": ["先用三個變數把三筆金額記住。", "算式可以連續減兩次。", "忘記 int() 時再查小百科。"]}]}, {"id": "p4", "icon": "📐", "title": "第 4 關｜旅行數字工具", "concept": "float()、**、round()：處理小數、次方與整理小數位數。", "scratch": "🐱 Scratch 的數學運算 → Python 可以組合小數、次方和四捨五入", "steps": [{"title": "👀 看懂再做：正方形面積", "prompt": "黑框示範小數乘法。你的任務是詢問正方形邊長（可有小數），用 ** 2 算面積，再用 round(..., 2) 顯示到小數第 2 位。", "demo": "length = float(input(\"長度：\"))\nprint(round(length * 2, 2))", "starter": "# 面積 = 邊長 ** 2\n", "requirements": ["使用 float(input())", "使用 ** 2", "使用 round(..., 2)", "顯示結果"], "rule": "p4_square", "mode": "demo", "ref": "round", "hints": ["小數輸入要用 float()。", "平方可以寫成 ** 2。", "round(數字, 2) 表示整理到小數第 2 位。"]}, {"title": "🚀 自己完成：平均速度", "prompt": "詢問「距離（公里）」和「時間（小時）」，計算平均速度＝距離 ÷ 時間，最後四捨五入到小數第 1 位。", "demo": "", "starter": "# 平均速度 = 距離 / 時間\n", "requirements": ["兩次輸入都使用 float()", "使用除法 /", "使用 round(..., 1)", "顯示平均速度"], "rule": "p4_speed", "mode": "independent", "ref": "round", "hints": ["距離和時間都可能有小數。", "先算距離 / 時間，再交給 round()。", "查 float()、/、round()。"]}]}, {"id": "p5", "icon": "🎢", "title": "第 5 關｜條件判斷", "concept": "比較 + if / else：讓程式依條件走不同路。", "scratch": "🐱 Scratch 的「如果／否則」→ Python 的 if / else", "steps": [{"title": "👀 看懂再判斷：是否達標", "prompt": "黑框示範溫度判斷。你的任務是詢問一個分數：60 分以上顯示「通過」，否則顯示「再挑戰」。", "demo": "temp = 30\nif temp >= 28:\n    print(\"很熱\")\nelse:\n    print(\"還好\")", "starter": "# 60 分以上通過，否則再挑戰\n", "requirements": ["使用 int(input()) 取得分數", "使用 if 和 else", "條件中比較 60", "兩個分支都要有輸出"], "rule": "p5_pass", "mode": "demo", "ref": "if", "hints": ["先取得分數，再判斷是否 >= 60。", "if 後面的條件要加冒號；else 也要加冒號。", "查 if / else 與縮排。"]}, {"title": "🧩 反方向條件：是否需要帶傘", "prompt": "詢問降雨機率（0～100）。如果大於等於 50，顯示「帶傘」；否則顯示「不用帶傘」。", "demo": "", "starter": "# 以 50 為分界\n", "requirements": ["使用 int(input())", "使用 if / else", "使用 >= 50 的比較", "兩個分支都輸出"], "rule": "p5_rain", "mode": "guided", "ref": "if", "hints": ["條件的分界數字是 50。", "兩種結果剛好適合 if / else。", "需要時再查比較與 if。"]}, {"title": "🚀 自己完成：自訂門檻", "prompt": "自己選一個「數字門檻」情境，例如剩餘電量、作業完成數等。程式要詢問一個整數，並用 if / else 顯示兩種不同結果。", "demo": "", "starter": "# 自己決定情境與門檻\n", "requirements": ["使用 int(input())", "使用 if / else", "至少使用一個比較運算", "兩個分支的輸出文字要不同"], "rule": "p5_custom_threshold", "mode": "independent", "ref": "if", "hints": ["先決定要問什麼數字，以及門檻是多少。", "想清楚達到門檻和沒達到時要各說什麼。", "查比較運算和 if / else。"]}]}, {"id": "p6", "icon": "🎫", "title": "第 6 關｜多重選擇", "concept": "if / elif / else：不只兩種情況時，用 elif 增加分支。", "scratch": "🐱 Scratch 的多層「如果／否則」→ Python 的 if / elif / else", "steps": [{"title": "👀 看懂再分類：三種結果", "prompt": "黑框示範三段分數分類。你的任務是詢問年齡：未滿 6 顯示「幼童」、未滿 18 顯示「學生」、其餘顯示「成人」。", "demo": "score=75\nif score>=90:\n    print(\"A\")\nelif score>=60:\n    print(\"B\")\nelse:\n    print(\"C\")", "starter": "# 三種年齡分類\n", "requirements": ["使用 int(input())", "使用 if、至少 1 個 elif、else", "使用 6 和 18 作為分界", "三個分支都要有輸出"], "rule": "p6_age3", "mode": "demo", "ref": "elif", "hints": ["三種結果需要三條路。", "先判斷最小的年齡區間通常比較容易。", "查 if / elif / else。"]}, {"title": "🚀 自己完成：四級天氣提醒", "prompt": "詢問氣溫：低於 15 顯示「偏冷」、低於 25 顯示「舒適」、低於 32 顯示「偏熱」、其餘顯示「炎熱」。", "demo": "", "starter": "# 需要四種結果\n", "requirements": ["使用 int(input())", "使用 if、至少 2 個 elif、else", "條件中使用 15、25、32", "四個分支都有輸出"], "rule": "p6_temp4", "mode": "independent", "ref": "elif", "hints": ["四種結果會需要 if + 2 個 elif + else。", "條件可以由小到大排。", "忘記 elif 格式時再查小百科。"]}]}, {"id": "p7", "icon": "🏎️", "title": "第 7 關｜雙重條件", "concept": "and / or：把兩個判斷條件組合起來。", "scratch": "🐱 Scratch 的「且」「或」→ Python 的 and / or", "steps": [{"title": "👀 兩個都要：and", "prompt": "黑框示範 and。你的任務是詢問「作業是否完成（1/0）」和「用品是否帶齊（1/0）」，兩者都等於 1 才顯示「可以出發」，否則顯示「先完成準備」。", "demo": "sunny=True\nfree=True\nif sunny and free:\n    print(\"去公園\")\nelse:\n    print(\"留在家\")", "starter": "# 兩個條件都成立才可以出發\n", "requirements": ["取得 2 個整數輸入", "使用 and", "使用 if / else", "兩個條件都要參與判斷"], "rule": "p7_and", "mode": "demo", "ref": "logic", "hints": ["題目說「兩者都」，對應的是 and。", "可以用 == 1 比較每個輸入。", "查 and。"]}, {"title": "🚀 其中一個即可：or", "prompt": "詢問「有學生證（1/0）」和「有活動證（1/0）」。只要其中一個等於 1 就顯示「可以入場」，兩個都沒有才顯示「無法入場」。", "demo": "", "starter": "# 其中一個成立即可\n", "requirements": ["取得 2 個整數輸入", "使用 or", "使用 if / else", "兩個條件都要參與判斷"], "rule": "p7_or", "mode": "independent", "ref": "logic", "hints": ["題目說「其中一個即可」，對應 or。", "兩個比較式放在 or 的左右兩邊。", "需要時查 or。"]}]}, {"id": "p8", "icon": "🚌", "title": "第 8 關｜規律重複", "concept": "for + range()：按照數字規律重複執行。", "scratch": "🐱 Scratch 的「重複指定次數」→ Python 的 for / range()", "steps": [{"title": "👀 看懂 range：顯示 1～5", "prompt": "黑框示範 range(3)。你的任務用 for + range() 顯示 1、2、3、4、5。", "demo": "for i in range(3):\n    print(i)", "starter": "# 顯示 1 到 5\n", "requirements": ["使用 for", "使用 range()", "輸出 1～5 的數字"], "rule": "p8_1to5", "mode": "demo", "ref": "for", "hints": ["range() 可以設定開始與停止位置。", "停止位置本身不會被包含。", "查 range(start, stop)。"]}, {"title": "🧩 發車倒數：5～1", "prompt": "用 for + range() 依序顯示 5、4、3、2、1，最後再顯示一次「出發！」。", "demo": "", "starter": "# 倒數時每次要 -1\n", "requirements": ["使用 for + range()", "range() 使用負的步進", "倒數 5 到 1", "迴圈結束後顯示「出發！」"], "rule": "p8_countdown", "mode": "guided", "ref": "for", "hints": ["range() 第三個數字可以決定每次增加或減少多少。", "倒數時步進是負數。", "「出發！」只出現一次，所以想想它應不應該縮排。"]}, {"title": "🚀 自己找規律：偶數", "prompt": "用 for + range() 顯示 2、4、6、8、10。不要在程式中寫 5 個 print()。", "demo": "", "starter": "# 用 range() 的步進完成\n", "requirements": ["使用 for + range()", "range() 的步進為 2", "不能使用 5 個獨立 print()"], "rule": "p8_even", "mode": "independent", "ref": "for", "hints": ["這串數字每次增加多少？", "range() 的第三個參數就是步進。", "查 range(start, stop, step)。"]}]}, {"id": "p9", "icon": "🔐", "title": "第 9 關｜條件式重複", "concept": "while：只要條件仍成立，就繼續重複。", "scratch": "🐱 Scratch 的「重複直到」→ Python 常用 while 表達「還要繼續的條件」", "steps": [{"title": "👀 看懂 while：數到 5", "prompt": "黑框示範數到 3。你的任務改成依序顯示 1、2、3、4、5，而且要用 while。", "demo": "count=1\nwhile count<=3:\n    print(count)\n    count=count+1", "starter": "# 改成數到 5\n", "requirements": ["使用 while", "計數從 1 開始", "條件讓迴圈做到 5", "每次迴圈更新計數變數"], "rule": "p9_count5", "mode": "demo", "ref": "while", "hints": ["while 後面的條件要允許 5 被執行。", "每一輪都要讓計數器改變，否則可能無限重複。", "查 while。"]}, {"title": "🧩 密碼鎖：答對才停止", "prompt": "先設定一個你自己決定的四位數密碼。使用 while 重複詢問密碼；輸入不正確時繼續問，正確後才顯示「解鎖！」。", "demo": "", "starter": "# 設定答案，再用 while 重複詢問\n", "requirements": ["先設定一個四位數整數答案", "使用 while", "迴圈中使用 int(input())", "正確後在迴圈外顯示「解鎖！」"], "rule": "p9_password", "mode": "guided", "ref": "while", "hints": ["while 的條件可以寫成「輸入的密碼 != 正確答案」。", "輸入值每一輪都要更新。", "「解鎖！」應該等迴圈結束才顯示。"]}, {"title": "🚀 自己完成：密碼高低提示", "prompt": "延續密碼鎖：密碼猜錯時，用 if / elif 顯示「太大」或「太小」；猜中後離開 while 並顯示「解鎖！」。", "demo": "", "starter": "# while 裡加入 if / elif 提示\n", "requirements": ["使用 while", "迴圈中使用 if 與 elif", "至少比較 > 和 <", "答對後離開迴圈並顯示解鎖訊息"], "rule": "p9_password_hint", "mode": "independent", "ref": "while", "hints": ["先讓 while 負責『猜錯就繼續』。", "再在 while 裡比較目前輸入和答案的大小。", "可以同時查 while 與 if / elif。"]}]}, {"id": "p10", "icon": "🐉", "title": "第 10 關｜魔王關：猜數字", "concept": "random + while + if：把前面學過的工具組合成完整小遊戲。", "scratch": "🐱 Scratch 的隨機數＋重複＋判斷 → Python 的 random＋while＋if", "steps": [{"title": "👀 先學隨機：1～10", "prompt": "黑框示範骰子 1～6。你的任務改成產生 1～10 的隨機整數並顯示。", "demo": "import random\ndice = random.randint(1, 6)\nprint(dice)", "starter": "# 產生 1 到 10 的隨機整數\n", "requirements": ["import random", "使用 random.randint()", "範圍是 1 到 10", "顯示產生的數字"], "rule": "p10_random10", "mode": "demo", "ref": "random", "hints": ["randint() 的兩個數字都可能被抽到。", "把黑框的 1～6 改成任務需要的範圍。", "查 random.randint()。"]}, {"title": "🧩 猜數字：太大／太小", "prompt": "讓電腦隨機選 1～20 的答案。玩家一直猜到正確為止；太大顯示「太大」，太小顯示「太小」。", "demo": "", "starter": "# random + while + if / elif\n", "requirements": ["隨機答案範圍 1～20", "使用 while 重複輸入", "使用 if / elif 提示太大或太小", "猜中後能結束迴圈"], "rule": "p10_guess20", "mode": "guided", "ref": "random", "hints": ["先完成隨機答案，再處理 while。", "while 裡每次取得新的 guess，再用 if / elif 比較。", "把問題拆成 random、while、if 三小塊。"]}, {"title": "🐉 魔王挑戰：完整猜數字遊戲", "prompt": "完成 1～100 猜數字遊戲。除了太大／太小提示，還要用一個變數記錄猜了幾次，答對時顯示總次數。", "demo": "", "starter": "# 不提供骨架：自己組合已學過的工具\n", "requirements": ["隨機答案範圍 1～100", "使用 while", "使用 if / elif 做大小提示", "使用一個計次變數，每猜一次增加 1", "答對後顯示猜測次數"], "rule": "p10_boss", "mode": "independent", "ref": "random", "hints": ["先完成『能猜到答案』，最後再加計次功能。", "計次變數可以從 0 開始，每次 input() 後增加 1。", "卡住時分別查 random、while、if，不要直接找整題答案。"]}]}];
const TOTAL_CHALLENGES=26;

const KEY="course115_v3_progress", NAMEKEY="course115_v3_name";
const PROFILE_KEY="course115_student_profile_v6";
let state=JSON.parse(localStorage.getItem(KEY)||"{}"), engine="loading", hintN=0;
const $=s=>document.querySelector(s);
const stepsOf=l=>l.steps.length;
const done=id=>{
  let l=LEVELS.find(x=>x.id===id);
  return Math.min(stepsOf(l), Number(state[id]||0));
};
const total=()=>LEVELS.reduce((n,l)=>n+done(l.id),0);
function pos(){
  for(let i=0;i<LEVELS.length;i++){
    let n=done(LEVELS[i].id);
    if(n<stepsOf(LEVELS[i])) return {i,j:n};
  }
  return {i:LEVELS.length,j:0};
}
function syncCourse116HubProgress(){
  if(!(window.STORE&&typeof STORE.saveLevel==="function"&&STORE.me&&STORE.me()))return;
  for(const l of LEVELS){
    const n=done(l.id);
    const courseId=l.id.toUpperCase();
    const complete=n>=stepsOf(l);
    const oldRec=STORE.level("python",courseId);
    const oldStars=Number(oldRec?.stars||0);
    if(n>oldStars || (complete && !oldRec?.done)){
      STORE.saveLevel("python",courseId,{
        stars:n,
        done:complete,
        score:Math.round(n/stepsOf(l)*100),
        extra:{challengesDone:n,challengesTotal:stepsOf(l)}
      });
    }
  }
}
function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
  syncCourse116HubProgress();
  syncCloudProgress();
}
function esc(s){return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function norm(s){return String(s||"").replace(/\s+/g," ").trim()}
function countRx(code,rx){return (code.match(rx)||[]).length}
function printedLiterals(code){
  let out=[],m,rx=/print\s*\(\s*["']([^"']*)["']\s*\)/g;
  while((m=rx.exec(code))!==null) out.push(m[1].trim());
  return out;
}
function inputVars(code){
  let out=[],lines=code.split(/\n/);
  for(const line of lines){
    let m=line.match(/^\s*([A-Za-z_]\w*)\s*=\s*(?:(?:int|float)\s*\(\s*)?input\s*\(/);
    if(m) out.push(m[1]);
  }
  return [...new Set(out)];
}
function outputUsesVars(code,vars,min=1){
  const prints=[...code.matchAll(/print\s*\(([^)]*)\)/g)].map(m=>m[1]);
  const used=new Set();
  for(const v of vars) if(prints.some(p=>new RegExp("\\b"+v+"\\b").test(p))) used.add(v);
  return used.size>=min;
}
function hasDistinctBranchStrings(code,min=2){
  const arr=printedLiterals(code);
  return new Set(arr).size>=min;
}
function fail(msg){return {ok:false,msg}}
function ok(){return {ok:true,msg:""}}

function validate(code,step){
  const n=code.toLowerCase(), rule=step.rule;
  switch(rule){
    case "p1_greeting":{
      let p=printedLiterals(code), d=printedLiterals(step.demo);
      if(countRx(n,/print\s*\(/g)<1) return fail("還沒有使用 print()。");
      if(!p.length || p.every(x=>x.length<2)) return fail("招呼語需要有實際文字內容。");
      if(d.length && p.some(x=>d.includes(x))) return fail("目前文字和黑框示範相同，請改成自己的招呼語。");
      return ok();
    }
    case "p1_two_distinct":{
      let p=printedLiterals(code);
      if(countRx(n,/print\s*\(/g)<2) return fail("題目要求顯示兩行，所以需要 2 次 print()。");
      if(p.length<2 || p.some(x=>x.length<2)) return fail("兩行都要有實際文字內容。");
      if(new Set(p.slice(0,2)).size<2) return fail("兩行內容目前相同；第一行是地點，第二行是活動，請寫成不同內容。");
      const place=p[0], activity=p[1];
      if(!looksLikePlace(place))
        return fail(`第一行「${place}」不像實際地點。請輸入例如「高雄」、「台北」、「東京」等想去的地方。`);
      if(!looksLikeActivity(activity))
        return fail(`第二行「${activity}」不像旅行活動。請寫例如「拍照」、「逛夜市」、「看風景」等想做的事情。`);
      return ok();
    }
    case "p2_one_input_var":{
      let vars=inputVars(code);
      if(countRx(n,/input\s*\(/g)<1) return fail("還沒有使用 input() 詢問資料。");
      if(vars.length<1) return fail("需要把 input() 的回答存進變數。");
      if(!outputUsesVars(code,vars,1)) return fail("最後要用 print() 顯示剛才保存的變數。");
      const prompts=inputPromptLiterals(code);
      if(!prompts.length || !meaningfulPrompt(prompts[0],"place"))
        return fail("input() 裡的提示要清楚詢問城市／地點／目的地，不要用 ddddd 這類無意義文字。");
      return ok();
    }
    case "p2_two_inputs":{
      let vars=inputVars(code);
      if(countRx(n,/input\s*\(/g)<2) return fail("題目要求詢問姓名和班級兩項資料，需要 2 次 input()。");
      if(vars.length<2) return fail("兩項回答要放進 2 個不同變數。");
      if(!outputUsesVars(code,vars,2)) return fail("最後要把兩項資料都顯示出來。");
      const prompts=inputPromptLiterals(code);
      if(prompts.length<2) return fail("兩次 input() 都要有清楚的提示文字。");
      if(!meaningfulPrompt(prompts[0],"name")) return fail("第一個 input() 的提示要清楚詢問姓名。");
      if(!meaningfulPrompt(prompts[1],"className")) return fail("第二個 input() 的提示要清楚詢問班級。");
      return ok();
    }
    case "p2_three_inputs_print":{
      let vars=inputVars(code);
      if(countRx(n,/input\s*\(/g)<3) return fail("題目要求目的地、天數、活動三項資料，需要 3 次 input()。");
      if(vars.length<3) return fail("三項回答要分別存進 3 個不同變數。");
      if(!outputUsesVars(code,vars,3)) return fail("輸出時還沒有使用到全部 3 個變數。");
      const prompts=inputPromptLiterals(code);
      if(prompts.length<3) return fail("三次 input() 都要有清楚的提示文字。");
      if(!meaningfulPrompt(prompts[0],"place")) return fail("第一個 input() 要清楚詢問目的地。");
      if(!meaningfulPrompt(prompts[1],"days")) return fail("第二個 input() 要清楚詢問旅行天數。");
      if(!meaningfulPrompt(prompts[2],"activity")) return fail("第三個 input() 要清楚詢問想做的活動。");
      return ok();
    }
    case "p3_multiply_int":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<2) return fail("票價和張數兩次輸入都要用 int() 轉成整數。");
      if(!n.includes("*")) return fail("總額需要使用乘法 *。");
      if(countRx(n,/print\s*\(/g)<1) return fail("要把計算結果顯示出來。");
      return ok();
    case "p3_divmod":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<2) return fail("總數和人數都要使用 int(input())。");
      if(!n.includes("//")) return fail("還沒有使用 // 計算每人可以拿幾個。");
      if(!n.includes("%")) return fail("還沒有使用 % 計算最後剩幾個。");
      if(countRx(n,/print\s*\(/g)<2) return fail("每人數量和剩餘數量都要顯示。");
      return ok();
    case "p3_budget":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<3) return fail("總預算、交通費、餐費都要使用 int(input())。");
      if(countRx(n,/-/g)<2) return fail("要從總預算扣掉兩筆費用，需要完成兩次減法。");
      if(countRx(n,/print\s*\(/g)<1) return fail("最後要顯示剩餘預算。");
      return ok();
    case "p4_square":
      if(countRx(n,/float\s*\(\s*input\s*\(/g)<1) return fail("邊長可能有小數，需要 float(input())。");
      if(!/\*\*\s*2/.test(n)) return fail("面積需要使用 ** 2 計算平方。");
      if(!/round\s*\([^,\n]+,\s*2\s*\)/.test(n)) return fail("結果需要用 round(..., 2) 整理到小數第 2 位。");
      if(countRx(n,/print\s*\(/g)<1) return fail("最後要顯示面積。");
      return ok();
    case "p4_speed":
      if(countRx(n,/float\s*\(\s*input\s*\(/g)<2) return fail("距離和時間兩次輸入都需要 float()。");
      if(!n.includes("/")) return fail("平均速度需要使用除法 /。");
      if(!/round\s*\([^,\n]+,\s*1\s*\)/.test(n)) return fail("結果需要用 round(..., 1) 整理到小數第 1 位。");
      if(countRx(n,/print\s*\(/g)<1) return fail("最後要顯示平均速度。");
      return ok();
    case "p5_pass":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<1) return fail("先用 int(input()) 取得分數。");
      if(!/\bif\b/.test(n)||!/\belse\b/.test(n)) return fail("需要使用 if 和 else 形成兩個分支。");
      if(!/[<>]=?\s*60|60\s*[<>]=?/.test(n)) return fail("條件中還沒有使用 60 作為分界。");
      if(countRx(n,/print\s*\(/g)<2) return fail("兩個分支都要有輸出。");
      return ok();
    case "p5_rain":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<1) return fail("先用 int(input()) 取得降雨機率。");
      if(!/\bif\b/.test(n)||!/\belse\b/.test(n)) return fail("需要使用 if / else。");
      if(!/(>=\s*50|50\s*<=)/.test(n)) return fail("題目指定以 >= 50 作為判斷。");
      if(countRx(n,/print\s*\(/g)<2) return fail("兩個分支都要有輸出。");
      return ok();
    case "p5_custom_threshold":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<1) return fail("要先詢問一個整數。");
      if(!/\bif\b/.test(n)||!/\belse\b/.test(n)) return fail("需要使用 if / else。");
      if(!/(>=|<=|==|!=|>|<)/.test(n)) return fail("if 條件中要有比較運算。");
      if(!hasDistinctBranchStrings(code,2)) return fail("兩個結果的輸出文字要不同。");
      return ok();
    case "p6_age3":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<1) return fail("先用 int(input()) 取得年齡。");
      if(!/\bif\b/.test(n)||countRx(n,/\belif\b/g)<1||!/\belse\b/.test(n)) return fail("三種結果需要 if、elif、else。");
      if(!n.includes("6")||!n.includes("18")) return fail("條件中需要使用 6 和 18 作為分界。");
      if(countRx(n,/print\s*\(/g)<3) return fail("三個分支都要有輸出。");
      return ok();
    case "p6_temp4":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<1) return fail("先用 int(input()) 取得氣溫。");
      if(!/\bif\b/.test(n)||countRx(n,/\belif\b/g)<2||!/\belse\b/.test(n)) return fail("四種結果需要 if、至少 2 個 elif、else。");
      if(!["15","25","32"].every(x=>n.includes(x))) return fail("條件中需要使用 15、25、32 三個分界。");
      if(countRx(n,/print\s*\(/g)<4) return fail("四個分支都要有輸出。");
      return ok();
    case "p7_and":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<2) return fail("需要取得兩個整數輸入。");
      if(!/\band\b/.test(n)) return fail("題目要求兩個條件都成立，需要使用 and。");
      if(!/\bif\b/.test(n)||!/\belse\b/.test(n)) return fail("需要使用 if / else。");
      return ok();
    case "p7_or":
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<2) return fail("需要取得兩個整數輸入。");
      if(!/\bor\b/.test(n)) return fail("題目要求其中一個成立即可，需要使用 or。");
      if(!/\bif\b/.test(n)||!/\belse\b/.test(n)) return fail("需要使用 if / else。");
      return ok();
    case "p8_1to5":
      if(!/\bfor\b/.test(n)||!/\brange\s*\(/.test(n)) return fail("需要使用 for + range()。");
      if(!/range\s*\(\s*1\s*,\s*6\s*\)/.test(n)) return fail("要顯示 1～5，可以讓 range() 從 1 走到 6 前停止。");
      if(countRx(n,/print\s*\(/g)<1) return fail("迴圈裡要把數字顯示出來。");
      return ok();
    case "p8_countdown":
      if(!/\bfor\b/.test(n)||!/\brange\s*\(/.test(n)) return fail("需要使用 for + range()。");
      if(!/range\s*\(\s*5\s*,\s*0\s*,\s*-1\s*\)/.test(n)) return fail("倒數 5～1 時，range() 應使用 5、0、-1。");
      if(!/print\s*\(\s*["']出發！?["']\s*\)/.test(code)) return fail("迴圈結束後還要顯示「出發！」。");
      return ok();
    case "p8_even":
      if(!/\bfor\b/.test(n)||!/\brange\s*\(/.test(n)) return fail("需要使用 for + range()。");
      if(!/range\s*\(\s*2\s*,\s*11\s*,\s*2\s*\)/.test(n)) return fail("顯示 2、4、6、8、10 時，range() 可使用 2、11、2。");
      if(countRx(n,/print\s*\(/g)>2) return fail("這題要利用迴圈規律，不要寫 5 個獨立 print()。");
      return ok();
    case "p9_count5":
      if(!/\bwhile\b/.test(n)) return fail("這題要求使用 while。");
      if(!/=\s*1\b/.test(n)) return fail("計數要從 1 開始。");
      if(!/(<=\s*5|<\s*6)/.test(n)) return fail("while 條件要讓 5 也被執行。");
      if(!/(\+=\s*1|=\s*\w+\s*\+\s*1)/.test(n)) return fail("每輪都要更新計數變數，否則可能無限重複。");
      return ok();
    case "p9_password":
      if(!/\bwhile\b/.test(n)) return fail("密碼不正確時要繼續詢問，需要 while。");
      if(countRx(n,/int\s*\(\s*input\s*\(/g)<1) return fail("while 中要取得整數密碼輸入。");
      if(!/!=/.test(n)) return fail("可以用 != 表示『還沒猜中』。");
      if(!/print\s*\(\s*["']解鎖！?["']\s*\)/.test(code)) return fail("答對後要顯示「解鎖！」。");
      let nums=[...code.matchAll(/\b(\d{4})\b/g)].map(m=>m[1]);
      if(!nums.length) return fail("請先設定一個四位數整數答案。");
      return ok();
    case "p9_password_hint":
      if(!/\bwhile\b/.test(n)) return fail("需要使用 while。");
      if(!/\bif\b/.test(n)||!/\belif\b/.test(n)) return fail("太大／太小提示需要 if 和 elif。");
      if(!n.includes(">")||!n.includes("<")) return fail("大小提示需要同時比較 > 和 <。");
      if(!/print\s*\(\s*["']解鎖！?["']\s*\)/.test(code)) return fail("答對後要顯示「解鎖！」。");
      return ok();
    case "p10_random10":
      if(!/import\s+random/.test(n)) return fail("要先 import random。");
      if(!/random\.randint\s*\(\s*1\s*,\s*10\s*\)/.test(n)) return fail("隨機範圍要設定為 1～10。");
      if(countRx(n,/print\s*\(/g)<1) return fail("要顯示產生的隨機數。");
      return ok();
    case "p10_guess20":
      if(!/random\.randint\s*\(\s*1\s*,\s*20\s*\)/.test(n)) return fail("隨機答案範圍要是 1～20。");
      if(!/\bwhile\b/.test(n)) return fail("要使用 while 讓玩家持續猜。");
      if(!/\bif\b/.test(n)||!/\belif\b/.test(n)) return fail("要使用 if / elif 提示太大或太小。");
      if(!n.includes(">")||!n.includes("<")) return fail("大小提示要比較 > 和 <。");
      return ok();
    case "p10_boss":
      if(!/random\.randint\s*\(\s*1\s*,\s*100\s*\)/.test(n)) return fail("魔王關的隨機答案範圍要是 1～100。");
      if(!/\bwhile\b/.test(n)) return fail("需要 while 讓玩家猜到正確為止。");
      if(!/\bif\b/.test(n)||!/\belif\b/.test(n)) return fail("需要 if / elif 做太大、太小提示。");
      if(!/(\+=\s*1|=\s*\w+\s*\+\s*1)/.test(n)) return fail("還沒有看到『每猜一次，計次變數增加 1』。");
      let vars=[...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*0\s*$/gm)].map(m=>m[1]);
      if(!vars.length) return fail("需要一個從 0 開始的計次變數。");
      if(!outputUsesVars(code,vars,1)) return fail("答對後要把猜測次數顯示出來。");
      return ok();
  }
  return fail("這題的驗證規則尚未設定。");
}


const PY_RESERVED=new Set([
"False","None","True","and","as","assert","async","await","break","class","continue","def","del",
"elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal",
"not","or","pass","raise","return","try","while","with","yield"
]);

function debugCoach(err, code){
  const raw=String(err||"");
  const lines=String(code||"").split(/\n/);
  let lineNo=null;
  const lm=raw.match(/line\s+(\d+)/i);
  if(lm) lineNo=Number(lm[1]);
  const badLine=(lineNo && lines[lineNo-1]) ? lines[lineNo-1].trim() : "";

  // Reserved word used as variable: e.g. class = ...
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/^\s*([A-Za-z_]\w*)\s*=/);
    if(m && PY_RESERVED.has(m[1])){
      return {
        title:"🐍 Python 語法問題",
        where:`第 ${i+1} 行：${lines[i].trim()}`,
        why:`「${m[1]}」是 Python 已經有特殊用途的保留字，不能拿來當變數名稱。`,
        next:"請替這筆資料換一個變數名稱。可以按「🌐 變數英文小幫手」找合適的英文名稱。"
      };
    }
  }

  if(/IndentationError|unexpected indent|expected an indented block/i.test(raw)){
    return {
      title:"🐍 縮排問題",
      where:badLine?`可能在第 ${lineNo} 行：${badLine}`:"請檢查 if、elif、else、for、while 後面的程式。",
      why:"Python 用縮排表示哪些程式屬於同一個區塊。",
      next:"看看冒號下一行是否有一致的縮排，通常使用 4 個空格。"
    };
  }

  if(/NameError/i.test(raw)){
    const nm=raw.match(/name ['"]([^'"]+)['"] is not defined/i);
    return {
      title:"🐍 找不到變數",
      where:badLine?`可能在第 ${lineNo} 行：${badLine}`:"檢查錯誤訊息附近的變數名稱。",
      why:nm?`Python 找不到「${nm[1]}」。可能還沒建立，或前後拼法不一樣。`:"可能使用了還沒建立的變數，或變數名稱前後拼法不同。",
      next:"從變數第一次出現的位置開始，比對每一次拼字。"
    };
  }

  if(/ValueError.*invalid literal for int/i.test(raw)){
    return {
      title:"🐍 數字轉換問題",
      where:badLine?`可能在第 ${lineNo} 行：${badLine}`:"檢查 int() 接收到的內容。",
      why:"int() 只能把像 12、300 這類整數文字轉成整數。",
      next:"執行時請輸入整數；如果題目允許小數，要想想是否應使用 float()。"
    };
  }

  if(/TypeError/i.test(raw)){
    return {
      title:"🐍 資料型態問題",
      where:badLine?`可能在第 ${lineNo} 行：${badLine}`:"檢查運算兩邊的資料。",
      why:"這個運算使用了不相容的資料型態，例如文字和數字直接運算。",
      next:"想想 input() 得到的是文字；需要算數時，是否要先用 int() 或 float() 轉換。"
    };
  }

  if(/SyntaxError/i.test(raw)){
    return {
      title:"🐍 Python 語法問題",
      where:badLine?`可能在第 ${lineNo} 行：${badLine}`:"Python 無法讀懂某一行的寫法。",
      why:"常見原因是括號、引號、冒號沒有成對，或指令寫法不完整。",
      next:"從錯誤行開始檢查 ()、引號、冒號，也可以順便看上一行。"
    };
  }

  if(/timeout|timed out|時間|too long/i.test(raw)){
    return {
      title:"🐍 迴圈可能沒有停止",
      where:"程式執行時間過久。",
      why:"while 的條件可能一直成立。",
      next:"檢查迴圈裡是否有更新會影響 while 條件的變數。"
    };
  }

  return {
    title:"🐍 Python 還不能執行",
    where:badLine?`可能在第 ${lineNo} 行：${badLine}`:"Python 回報了錯誤。",
    why:raw.replace(/\n/g," ").slice(0,180),
    next:"先檢查錯誤附近的拼字、括號、引號、冒號與縮排；需要時再使用求助工具。"
  };
}

function coachHTML(info){
  return `<div class="debugCoach">
    <b>${esc(info.title)}</b>
    <div class="debugRow"><strong>📍 哪裡：</strong>${esc(info.where)}</div>
    <div class="debugRow"><strong>🤔 原因：</strong>${esc(info.why)}</div>
    <div class="debugRow"><strong>➡️ 下一步：</strong>${esc(info.next)}</div>
  </div>`;
}

const VAR_WORDS={
"姓名":["name","student_name"],
"名字":["name","student_name"],
"班級":["class_name","my_class"],
"座號":["seat_no","student_no"],
"年齡":["age"],
"身高":["height"],
"體重":["weight"],
"分數":["score"],
"成績":["score"],
"目的地":["destination"],
"城市":["city"],
"地點":["place"],
"天數":["days"],
"活動":["activity"],
"票價":["ticket_price"],
"張數":["ticket_count"],
"數量":["count","quantity"],
"人數":["people_count"],
"總數":["total"],
"總額":["total_amount"],
"預算":["budget"],
"總預算":["total_budget"],
"交通費":["transport_cost"],
"餐費":["meal_cost"],
"剩餘預算":["remaining_budget"],
"距離":["distance"],
"時間":["time"],
"速度":["speed"],
"氣溫":["temperature"],
"溫度":["temperature"],
"降雨機率":["rain_chance"],
"密碼":["password"],
"答案":["answer"],
"猜測":["guess"],
"次數":["attempts","count"],
"邊長":["side_length"],
"面積":["area"],
"電量":["battery_level"]
};

function variableSuggestions(q){
  q=String(q||"").trim();
  if(!q){
    return {items:[],note:"先輸入你想命名的中文資料，例如：班級、體重、剩餘預算。"};
  }
  let items=VAR_WORDS[q]||[];
  if(!items.length){
    return {items:[],note:"目前小字典還沒有這個詞。可以換一個較簡單的中文關鍵字，或自己用小寫英文＋底線命名。"};
  }
  return {
    items,
    note:"這些是變數命名建議，不是闖關答案。點一下可以複製名稱，再由你決定放在哪裡。"
  };
}

function openVarHelper(){
  $("#varQuery").value="";
  $("#varResult").innerHTML='<p><b>隨時都可以查變數英文名稱。</b><br>例如輸入「班級」，會避開 Python 保留字 <code>class</code>，建議使用 <code>class_name</code>。</p>';
  $("#varDialog").showModal();
}

function searchVar(){
  const r=variableSuggestions($("#varQuery").value);
  $("#varResult").innerHTML=
    (r.items.length
      ? `<div class="varChoices">${r.items.map(x=>`<button class="varChoice" data-name="${x}"><code>${x}</code></button>`).join("")}</div>`
      : "")
    + `<p>${esc(r.note)}</p>
       <div class="namingRules">
       <b>Python 變數命名提醒</b><br>
       ✓ 建議使用小寫英文　✓ 多個單字用 _ 連接<br>
       ✗ 不可有空格　✗ 不可以數字開頭　✗ 不可使用 class、if、for、while 等保留字
       </div>`;

  document.querySelectorAll(".varChoice").forEach(b=>{
    b.onclick=async()=>{
      const name=b.dataset.name;
      try{
        await navigator.clipboard.writeText(name);
        b.innerHTML=`✓ 已複製 <code>${name}</code>`;
      }catch(e){
        b.innerHTML=`<code>${name}</code>`;
      }
    };
  });
}


function getStudentProfile(){
  try{
    let p=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");
    if(profileIsValidLocalShape(p)) return p;

    // 完整 course116 整合：若學生已在 116-1 闖關地圖登入，
    // 第一次進 Python 時直接承接班級、座號、姓名，避免再填一次。
    if(window.STORE&&typeof STORE.me==="function"){
      const me=STORE.me();
      if(me&&me.cls&&me.seat&&me.name){
        const imported={
          className:String(me.cls),
          seatNo:String(Number(me.seat)),
          name:String(me.name),
          courseId:"python",
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString()
        };
        localStorage.setItem(PROFILE_KEY,JSON.stringify(imported));
        localStorage.setItem(NAMEKEY,imported.name);
        return imported;
      }
    }
    return p;
  }catch(e){return null}
}

function profileIsValidLocalShape(p){
  if(!p)return false;
  const c=String(p.className||"").trim();
  const s=String(p.seatNo||"").trim();
  const n=String(p.name||"").trim();
  return /^[1-9][0-9]{2}$/.test(c) &&
         /^(?:[1-9]|[1-9][0-9])$/.test(s) &&
         n.length>=2 && n.length<=20;
}

function validateStudentProfile(className,seatNo,name){
  const errors={className:"",seatNo:"",name:""};
  if(!className) errors.className="請輸入班級。";
  else if(!/^[1-9][0-9]{2}$/.test(className))
    errors.className="班級格式請輸入 3 位數字，例如 701、802、901。";

  if(!seatNo) errors.seatNo="請輸入座號。";
  else if(!/^(?:[1-9]|[1-9][0-9])$/.test(seatNo))
    errors.seatNo="座號請輸入 1～99 的數字，不要加「號」或前置 0。";

  const cleanName=String(name||"").trim();
  if(!cleanName) errors.name="請輸入姓名。";
  else if(cleanName.length<2||cleanName.length>20)
    errors.name="姓名請輸入 2～20 個字。";
  else if(!/^[\u3400-\u9FFF A-Za-z·・．'’-]+$/.test(cleanName))
    errors.name="姓名只能使用中文、英文字母、空格、連字號或間隔點，不要輸入數字與其他符號。";

  return {ok:!errors.className&&!errors.seatNo&&!errors.name,errors};
}

function profileIsValid(p){
  if(!p)return false;
  return validateStudentProfile(
    String(p.className||"").trim(),
    String(p.seatNo||"").trim(),
    String(p.name||"").trim()
  ).ok;
}

function showProfileErrors(errors={}){
  const c=document.getElementById("profileClassError");
  const s=document.getElementById("profileSeatError");
  const n=document.getElementById("profileNameError");
  if(c)c.textContent=errors.className||"";
  if(s)s.textContent=errors.seatNo||"";
  if(n)n.textContent=errors.name||"";
}

function updateProfileStrip(){
  const p=getStudentProfile();
  const el=document.getElementById("studentProfileText");
  if(!el)return;
  el.textContent=profileIsValid(p)
    ?`班級 ${p.className}　｜　座號 ${p.seatNo}　｜　姓名 ${p.name}`
    :"尚未設定";
}

function updateAccountButton(){
  const btn=document.getElementById("accountBtn");
  if(!btn)return;
  if(window.CourseDB&&CourseDB.state==="ready"&&!CourseDB.isAnonymous()){
    btn.textContent="🔐 學習帳號已連結";
    btn.classList.add("linked");
  }else{
    btn.textContent="🔐 學習帳號";
    btn.classList.remove("linked");
  }
}

function mergeProgress(a,b){
  const out={...(a||{})};
  Object.entries(b||{}).forEach(([k,v])=>{
    out[k]=Math.max(Number(out[k]||0),Number(v||0));
  });
  return out;
}

function starsOfProgress(progress){
  return Object.values(progress||{}).reduce((n,v)=>n+Number(v||0),0);
}

function openAccountDialog(required=false){
  const p=getStudentProfile();
  if(!profileIsValid(p)){
    openProfileDialog(true);
    return;
  }
  const dlg=document.getElementById("accountDialog");
  const identity=document.getElementById("accountIdentity");
  const err=document.getElementById("accountError");
  const intro=document.getElementById("accountIntro");
  const pass=document.getElementById("accountPassword");
  if(identity)identity.textContent=`班級 ${p.className}｜座號 ${p.seatNo}｜${p.name}`;
  if(err)err.textContent="";
  if(pass)pass.value="";
  if(intro){
    intro.textContent=required
      ?"為避免同一位學生產生多筆紀錄，請建立或登入學習帳號後繼續。"
      :"設定一次學習密碼後，以後換版本或重新進入，都可以回到同一筆學習紀錄。";
  }
  dlg.dataset.required=required?"1":"0";
  dlg.showModal();
}

function accountPassword(){
  return String(document.getElementById("accountPassword")?.value||"");
}

function validLearningPassword(pw){
  return pw.length>=6&&pw.length<=40;
}

async function adoptRemoteAndLocalProgress(){
  const localProgress={...state};
  const localStars=total();
  const localProfile=getStudentProfile();
  const remote=await CourseDB.loadStudent();

  if(remote?.progress){
    state=mergeProgress(localProgress,remote.progress);
  }else{
    state=localProgress;
  }
  localStorage.setItem(KEY,JSON.stringify(state));

  if(remote?.name&&remote?.className&&remote?.seatNo){
    const sameSeat=String(remote.className)===String(localProfile.className)
      && String(remote.seatNo)===String(localProfile.seatNo);
    if(sameSeat){
      const restored={
        ...localProfile,
        name:String(remote.name||localProfile.name),
        updatedAt:new Date().toISOString()
      };
      localStorage.setItem(PROFILE_KEY,JSON.stringify(restored));
      localStorage.setItem(NAMEKEY,restored.name);
    }
  }

  render();
  updateProfileStrip();
  await syncCloudProgress();
  return Math.max(localStars,Number(remote?.stars||0),starsOfProgress(state));
}

async function linkLearningAccount(){
  const p=getStudentProfile();
  const err=document.getElementById("accountError");
  const pw=accountPassword();
  if(!profileIsValid(p)){openProfileDialog(true);return;}
  if(!validLearningPassword(pw)){
    err.textContent="學習密碼至少需要 6 個字元。";
    return;
  }
  try{
    err.textContent="正在建立學習帳號…";
    await CourseDB.ready;
    if(!CourseDB.isAnonymous()){
      err.textContent="這台瀏覽器已經登入學習帳號。";
      updateAccountButton();
      return;
    }
    await CourseDB.linkStudentAccount(p.className,p.seatNo,pw);
    await adoptRemoteAndLocalProgress();
    updateAccountButton();
    document.getElementById("accountDialog").close();
    updateCloudStatus("☁️ 學習帳號已連結，進度已保留","ok");
  }catch(e){
    if(e?.code==="auth/email-already-in-use"||e?.code==="auth/credential-already-in-use"){
      err.textContent="這個班級與座號已經有學習帳號。請輸入原本的學習密碼，再按「已有帳號，登入並取回進度」。";
    }else{
      err.textContent="帳號建立失敗："+(e?.message||"請稍後再試");
    }
  }
}

async function loginLearningAccount(){
  const p=getStudentProfile();
  const err=document.getElementById("accountError");
  const pw=accountPassword();
  if(!profileIsValid(p)){openProfileDialog(true);return;}
  if(!validLearningPassword(pw)){
    err.textContent="請輸入至少 6 個字元的學習密碼。";
    return;
  }

  // 先保留目前瀏覽器上的進度；登入既有帳號後再與雲端取較完整的進度。
  const localSnapshot={...state};
  try{
    err.textContent="正在登入並取回進度…";
    await CourseDB.signInStudentAccount(p.className,p.seatNo,pw);
    state=localSnapshot;
    await adoptRemoteAndLocalProgress();
    updateAccountButton();
    document.getElementById("accountDialog").close();
    updateCloudStatus("☁️ 已登入學習帳號，進度已合併","ok");
  }catch(e){
    if(e?.code==="auth/invalid-credential"||e?.code==="auth/wrong-password"||e?.code==="auth/user-not-found"){
      err.textContent="學習密碼不正確，或這個班級座號尚未建立帳號。";
    }else{
      err.textContent="登入失敗："+(e?.message||"請稍後再試");
    }
  }
}

function ensureStableStudentAccount(){
  updateAccountButton();
  if(
    window.CourseDB &&
    CourseDB.state==="ready" &&
    CourseDB.isAnonymous() &&
    profileIsValid(getStudentProfile())
  ){
    openAccountDialog(true);
  }
}

function updateCloudStatus(text,kind=""){
  const el=document.getElementById("cloudStatus");
  if(!el)return;
  el.textContent=text;
  el.className="cloudStatus "+kind;
}

function openProfileDialog(required=true){
  const p=getStudentProfile()||{};
  document.getElementById("profileClass").value=p.className||"";
  document.getElementById("profileSeatNo").value=p.seatNo||"";
  document.getElementById("profileName").value=p.name||"";
  document.getElementById("profileError").textContent="";
  showProfileErrors({});
  const dlg=document.getElementById("profileDialog");
  dlg.dataset.required=required?"1":"0";
  dlg.showModal();
}

function currentProgressInfo(){
  const p=pos();
  if(p.i>=LEVELS.length)return {station:"完成",challenge:0};
  return {station:LEVELS[p.i].title,challenge:p.j+1};
}


function firebaseDiagnosticHTML(){
  if(!window.CourseDB){
    return `<div class="diagBox"><b>狀態：</b>CourseDB 尚未載入。</div>`;
  }
  const d=CourseDB.diagnostic?CourseDB.diagnostic():{};
  return `<div class="diagBox">
    <div><b>狀態：</b>${esc(d.state||"")}</div>
    <div><b>階段：</b>${esc(d.stage||"")}</div>
    <div><b>錯誤碼：</b><code>${esc(d.errorCode||"（沒有錯誤碼）")}</code></div>
    <div><b>錯誤訊息：</b><div class="diagMessage">${esc(d.errorMessage||"（沒有錯誤訊息）")}</div></div>
    <div><b>Project ID：</b><code>${esc(d.projectId||"")}</code></div>
    <div><b>Auth Domain：</b><code>${esc(d.authDomain||"")}</code></div>
  </div>
  <p class="diagNote">請把這個畫面截圖傳給老師／開發者，就能直接判斷是哪一步失敗。</p>`;
}
function openFirebaseDiagnostic(){
  document.getElementById("firebaseDiagBody").innerHTML=firebaseDiagnosticHTML();
  document.getElementById("firebaseDiagDialog").showModal();
}
async function retryFirebaseConnection(){
  const btn=document.getElementById("retryFirebaseBtn");
  btn.disabled=true;btn.textContent="重新連線中…";
  try{
    if(window.CourseDB&&CourseDB.reconnect){
      await CourseDB.reconnect();
      document.getElementById("firebaseDiagBody").innerHTML=firebaseDiagnosticHTML();
      if(CourseDB.state==="ready"){
        updateCloudStatus("☁️ 已連接教師資料庫","ok");
        await syncCloudProgress();
      }else{
        updateCloudStatus("⚠️ 資料庫連線失敗（點此查看原因）","error");
      }
    }
  }finally{
    btn.disabled=false;btn.textContent="重新連線";
  }
}
async function syncCloudProgress(){
  const profile=getStudentProfile();
  if(!profileIsValid(profile))return;
  if(!window.CourseDB){updateCloudStatus("💾 僅儲存在本機","local");return;}
  try{
    await CourseDB.ready;
    if(!CourseDB.configured||CourseDB.state==="disabled"){
      updateCloudStatus("💾 本機模式","local");return;
    }
    if(CourseDB.state!=="ready"){
      updateCloudStatus("⚠️ 資料庫連線失敗（點此查看原因）","error");return;
    }
    updateCloudStatus("☁️ 同步中…","syncing");
    const cur=currentProgressInfo();
    await CourseDB.saveStudent({
      ...profile,
      progress:state,
      stars:total(),
      totalStars:TOTAL_CHALLENGES,
      completed:total()>=TOTAL_CHALLENGES,
      currentStation:cur.station,
      currentChallenge:cur.challenge
    });
    updateCloudStatus("☁️ 已同步教師資料庫","ok");
  }catch(e){
    updateCloudStatus("⚠️ 同步失敗（點此查看原因）","error");
  }
}

async function saveStudentProfile(){
  const className=document.getElementById("profileClass").value.trim();
  const seatNo=document.getElementById("profileSeatNo").value.trim();
  const name=document.getElementById("profileName").value.trim();
  const err=document.getElementById("profileError");
  const check=validateStudentProfile(className,seatNo,name);
  showProfileErrors(check.errors);
  if(!check.ok){
    err.textContent="請先修正上方欄位，再開始挑戰。";
    return;
  }
  err.textContent="";
  const old=getStudentProfile()||{};
  const now=new Date().toISOString();
  const profile={
    className,seatNo,name,courseId:"python",
    createdAt:old.createdAt||now,updatedAt:now
  };
  localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
  localStorage.setItem(NAMEKEY,name);
  updateProfileStrip();
  document.getElementById("profileDialog").close();
  await syncCloudProgress();
  ensureStableStudentAccount();
}

function ensureStudentProfile(){
  updateProfileStrip();
  if(!profileIsValid(getStudentProfile()))openProfileDialog(true);
}

async function restoreCloudState(){
  updateProfileStrip();
  if(!window.CourseDB){
    updateCloudStatus("💾 本機模式","local");ensureStudentProfile();return;
  }
  try{
    await CourseDB.ready;
    if(!CourseDB.configured||CourseDB.state==="disabled"){
      updateCloudStatus("💾 本機模式","local");ensureStudentProfile();return;
    }
    if(CourseDB.state!=="ready"){
      updateCloudStatus("⚠️ 資料庫連線失敗（點此查看原因）","error");ensureStudentProfile();return;
    }
    const remote=await CourseDB.loadStudent();
    if(remote){
      const localProfile=getStudentProfile();
      if(!profileIsValid(localProfile)&&remote.className&&remote.seatNo&&remote.name){
        const restored={
          className:String(remote.className),seatNo:String(remote.seatNo),name:String(remote.name),
          courseId:"python",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
        };
        if(profileIsValid(restored)){
          localStorage.setItem(PROFILE_KEY,JSON.stringify(restored));
          localStorage.setItem(NAMEKEY,restored.name);
        }
      }
      if(remote.progress){
        state=mergeProgress(state,remote.progress);
        localStorage.setItem(KEY,JSON.stringify(state));
        render();
      }
    }
    updateProfileStrip();
    updateAccountButton();
    syncCourse116HubProgress();
    updateCloudStatus("☁️ 已連接教師資料庫","ok");
    ensureStudentProfile();
    if(profileIsValid(getStudentProfile())){
      await syncCloudProgress();
      ensureStableStudentAccount();
    }
  }catch(e){
    updateCloudStatus("⚠️ 資料庫連線失敗（點此查看原因）","error");
    ensureStudentProfile();
  }
}
if(window.PYRUN){
  PYRUN.onStatus(s=>{engine=s;render()});
  try{PYRUN.init(CONFIG.PYODIDE_URL).catch(()=>{engine="fail";render()})}
  catch(e){engine="fail"}
}else engine="fail";

function render(){
  let p=pos();
  $("#stars").textContent=total();
  if(p.i>=LEVELS.length){
    $("#place").innerHTML=`🏆 <b>全部完成</b>・${TOTAL_CHALLENGES}/${TOTAL_CHALLENGES}`;
  }else{
    let l=LEVELS[p.i];
    $("#place").innerHTML=`📍 <b>${l.title}</b>・挑戰 ${p.j+1}/${stepsOf(l)}`;
  }
  $("#map").innerHTML=LEVELS.map((l,i)=>`<div class="node ${done(l.id)>=stepsOf(l)?"done":i===p.i?"now":""}">${done(l.id)>=stepsOf(l)?"⭐":i===p.i?l.icon:"☁️"}</div>`).join("");

  if(p.i>=LEVELS.length){
    $("#mission").innerHTML=`<article class="card final"><div class="pop">🏆</div><h1>Python 冒險完成！</h1><p>你已完成全部 ${TOTAL_CHALLENGES} 個挑戰。</p><button id="certBtn">🏅 領取完成證書</button></article>`;
    $("#certBtn").onclick=openCert;
    return;
  }

  let l=LEVELS[p.i], s=l.steps[p.j];
  hintN=0;
  let demo=s.mode==="demo"
    ? `<div class="demoLabel">👀 先看黑框，理解寫法</div><pre class="demo">${esc(s.demo)}</pre><div class="demoNote">黑框是不同情境的示範。真正的任務請看下方「🎯 任務」，不要直接複製黑框。</div>`
    : "";
  let label=s.mode==="demo"?"理解示範後自己完成":s.mode==="guided"?"自己先想；卡住再求助":"不提供完整答案，自己組合";
  let criteria=`<div class="criteria"><b>✅ 任務完成條件</b><ul>${s.requirements.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;

  $("#mission").innerHTML=`<article class="card">
    <div class="head"><div class="ico">${l.icon}</div><div><small>${l.title}・挑戰 ${p.j+1}/${stepsOf(l)}</small><h1>${s.title}</h1><div>${l.concept}</div></div></div>
    <div class="scratch"><b>${l.scratch}</b></div>
    ${demo}
    <div class="task"><b>🎯 任務</b><br>${s.prompt}</div>
    ${criteria}
    <div class="editorLabel">⌨️ ${label}</div>
    <textarea id="code" class="editor" spellcheck="false">${esc(s.starter)}</textarea>
    <div class="actions primaryActions">
      <button id="tryRun" class="run tryRun" ${engine==="loading"?"disabled":""}>${engine==="ready"?"▶ 執行看看":"⏳ Python 準備中…"}</button>
      <button id="checkChallenge" class="checkChallenge" ${engine==="loading"?"disabled":""}>✅ 檢查挑戰</button>
    </div>
    <div class="actions">
      <button id="hintBtn" class="help">💡 我需要線索</button><button id="varBtn" class="translate">🌐 變數英文小幫手</button>
      <a class="book" href="python-guide.html#${s.ref}" target="_blank">📘 我想查指令</a>
    </div>
    <div class="runNote">「執行看看」只看自己的程式結果，不會判定闖關；覺得完成後再按「檢查挑戰」。</div>
    <div class="consoleLabel">🖥️ 執行結果</div>
    <pre id="out" class="output">按「▶ 執行看看」看看你的程式會輸出什麼。</pre>
    <div id="runInputArea" class="runInputArea" aria-live="polite"></div>
    <div class="consoleActions"><button id="clearOutput" type="button" class="clearOutput">🧹 清除結果</button></div>
    <div id="hint"></div><div id="fb"></div>
  </article>`;
  $("#tryRun").onclick=()=>tryRunOnly();
  $("#checkChallenge").onclick=()=>checkChallenge(l,p.j,s);
  $("#clearOutput").onclick=()=>{
    $("#out").textContent="執行結果已清除。";
    $("#runInputArea").innerHTML="";
    $("#fb").innerHTML="";
  };
  $("#hintBtn").onclick=()=>showHint(s); $("#varBtn").onclick=openVarHelper;
}
function showHint(s){
  hintN=Math.min(hintN+1,s.hints.length);
  $("#hint").innerHTML=`<div class="hint"><b>💡 線索 ${hintN}/${s.hints.length}</b><br>${s.hints[hintN-1]}${hintN<s.hints.length?"<br><small>還需要時，可以再按一次。</small>":""}</div>`;
}

const PLACE_WORDS=[
  "台北","臺北","新北","桃園","台中","臺中","台南","臺南","高雄","基隆","新竹","苗栗",
  "彰化","南投","雲林","嘉義","屏東","宜蘭","花蓮","台東","臺東","澎湖","金門","馬祖",
  "東京","大阪","京都","北海道","沖繩","首爾","釜山","巴黎","倫敦","紐約","洛杉磯",
  "新加坡","曼谷","雪梨","墨爾本","香港","澳門","上海","北京","福岡","名古屋","神戶",
  "Tokyo","Osaka","Kyoto","Seoul","Busan","Paris","London","New York","Singapore","Bangkok",
  "Sydney","Melbourne","Hong Kong","Macau","Shanghai","Beijing","Taipei","Kaohsiung"
];
const ACTIVITY_WORDS=[
  "拍照","攝影","逛街","逛夜市","購物","吃美食","吃東西","看風景","看夜景","看海","爬山",
  "登山","散步","騎車","騎腳踏車","游泳","泡溫泉","參觀","遊覽","玩水","搭船","搭纜車",
  "看展","看電影","唱歌","露營","野餐","滑雪","浮潛","潛水","衝浪","賞花","賞雪","看日出",
  "看夕陽","逛博物館","逛園區","坐摩天輪","玩遊樂設施","吃小吃","旅遊","旅行"
];
const ENGLISH_ACTIVITY_WORDS=[
  "take photos","take pictures","shopping","swimming","hiking","camping","sightseeing",
  "eat food","visit museum","visit museums","cycling","skiing","surfing","snorkeling"
];
const OBVIOUS_NON_PLACE=[
  "香蕉","蘋果","西瓜","橘子","芒果","葡萄","便當","雞排","珍珠奶茶","漢堡","薯條",
  "鉛筆","橡皮擦","桌子","椅子","手機","電腦","作業","數學","英文","哈哈","不知道","隨便"
];

function cleanAnswer(v){
  return String(v??"").trim();
}
function inputPromptLiterals(code){
  const out=[];
  const rx=/input\s*\(\s*(["'])(.*?)\1\s*\)/g;
  let m;
  while((m=rx.exec(String(code||"")))!==null) out.push(m[2].trim());
  return out;
}
function meaningfulPrompt(text,kind){
  const x=String(text||"").trim();
  if(x.length<2 || looksLikeGibberish(x)) return false;
  const groups={
    place:["城市","地點","地方","目的地","想去","哪裡","where","city","destination"],
    name:["姓名","名字","name"],
    className:["班級","class"],
    days:["天數","幾天","days","day"],
    activity:["活動","事情","想做","期待","activity"]
  };
  const words=groups[kind]||[];
  const lower=x.toLowerCase();
  return words.some(w=>lower.includes(String(w).toLowerCase()));
}
function looksLikeGibberish(v){
  const x=cleanAnswer(v);
  if(!x) return true;
  if(/^(.)\1{3,}$/i.test(x)) return true; // ddddd、aaaaa
  if(/^[A-Za-z]{5,}$/.test(x)){
    const lower=x.toLowerCase();
    const vowels=(lower.match(/[aeiou]/g)||[]).length;
    const knownPlace=PLACE_WORDS.some(w=>String(w).toLowerCase()===lower);
    const knownActivity=ENGLISH_ACTIVITY_WORDS.some(w=>w===lower);
    if(!knownPlace&&!knownActivity&&(vowels===0 || vowels/x.length<0.18)) return true;
  }
  return false;
}
function looksLikePlace(v){
  const x=cleanAnswer(v);
  if(x.length<2 || looksLikeGibberish(x)) return false;
  if(OBVIOUS_NON_PLACE.some(w=>x===w||x.includes(w))) return false;
  if(PLACE_WORDS.some(w=>x.toLowerCase().includes(String(w).toLowerCase()))) return true;
  if(/[市縣區鄉鎮村國島山湖海港站館園機場樂園景區校園夜市老街]$/.test(x)) return true;
  return false;
}
function looksLikeActivity(v){
  const x=cleanAnswer(v);
  if(x.length<2 || looksLikeGibberish(x)) return false;
  if(OBVIOUS_NON_PLACE.some(w=>x===w)) return false;
  if(ACTIVITY_WORDS.some(w=>x.includes(w))) return true;
  if(ENGLISH_ACTIVITY_WORDS.some(w=>x.toLowerCase().includes(w))) return true;
  // 中文活動通常包含動作詞；避免任意名詞或亂碼直接過關。
  if(/[去看吃玩逛拍買游泳爬登騎搭坐泡參觀賞唱走跑露營滑潛衝]/.test(x) &&
     /[\u3400-\u9FFF]/.test(x)) return true;
  return false;
}
function looksLikePersonName(v){
  const x=cleanAnswer(v);
  return x.length>=2 && x.length<=20 &&
    /^[\u3400-\u9FFF A-Za-z·・．'’-]+$/.test(x) &&
    !OBVIOUS_NON_PLACE.includes(x);
}
function validNumber(v,min,max,integer=true){
  const x=cleanAnswer(v);
  if(x==="")return false;
  const n=Number(x);
  if(!Number.isFinite(n))return false;
  if(integer&&!Number.isInteger(n))return false;
  return n>=min&&n<=max;
}
function interactionValue(interactions,keywords,fallbackIndex){
  for(const it of interactions||[]){
    const p=String(it.prompt||"");
    if(keywords.some(k=>p.includes(k))) return cleanAnswer(it.value);
  }
  return cleanAnswer(interactions?.[fallbackIndex]?.value);
}
function semanticValidate(rule,interactions){
  if(!Array.isArray(interactions)||!interactions.length) return ok();

  if(rule==="p2_one_input_var"){
    const city=interactionValue(interactions,["城市","地點","目的地"],0);
    if(!looksLikePlace(city))
      return fail(`「${city||"空白"}」不像實際的城市或地點。請輸入例如「高雄」、「台北」、「東京」等地點。`);
  }

  if(rule==="p2_two_inputs"){
    const name=interactionValue(interactions,["姓名","名字"],0);
    const cls=interactionValue(interactions,["班級"],1);
    if(!looksLikePersonName(name))
      return fail("姓名欄請輸入合理的姓名文字，不要用食物、數字或無關內容代替。");
    if(!/^[1-9][0-9]{2}$/.test(cls))
      return fail("班級請輸入 3 位數，例如 701、802、910。");
  }

  if(rule==="p2_three_inputs_print"){
    const destination=interactionValue(interactions,["目的地","城市","地點"],0);
    const days=interactionValue(interactions,["天數","幾天"],1);
    const activity=interactionValue(interactions,["活動","期待"],2);
    if(!looksLikePlace(destination))
      return fail(`目的地「${destination||"空白"}」不像實際地點。請輸入真實城市或旅遊地點。`);
    if(!validNumber(days,1,30,true))
      return fail("旅行天數請輸入 1～30 的整數。");
    if(activity.length<2 || /^(不知道|隨便|無|沒有|123|abc)$/i.test(activity))
      return fail("「最期待的活動」請輸入有意義的活動內容，例如參觀、拍照、逛夜市等。");
  }

  if(rule==="p3_multiply_int"){
    const price=interactionValue(interactions,["票價","單張","價格"],0);
    const count=interactionValue(interactions,["張數","幾張","數量"],1);
    if(!validNumber(price,1,100000,true)) return fail("單張票價要輸入大於 0 的整數。");
    if(!validNumber(count,1,1000,true)) return fail("張數要輸入大於 0 的整數。");
  }

  if(rule==="p3_divmod"){
    const total=interactionValue(interactions,["總數","點心"],0);
    const people=interactionValue(interactions,["人數","幾人"],1);
    if(!validNumber(total,0,100000,true)) return fail("點心總數請輸入 0 以上的整數。");
    if(!validNumber(people,1,10000,true)) return fail("人數必須是大於 0 的整數。");
  }

  if(rule==="p3_budget"){
    for(const [idx,label] of [["總預算",0],["交通費",1],["餐費",2]]){
      const v=interactionValue(interactions,[idx],label);
      if(!validNumber(v,0,10000000,true)) return fail(`${idx}請輸入 0 以上的整數。`);
    }
  }

  if(rule==="p4_square"){
    const side=interactionValue(interactions,["邊長","長度"],0);
    if(!validNumber(side,0.01,100000,false)) return fail("邊長要輸入大於 0 的數字。");
  }

  if(rule==="p4_speed"){
    const distance=interactionValue(interactions,["距離"],0);
    const time=interactionValue(interactions,["時間","小時"],1);
    if(!validNumber(distance,0,1000000,false)) return fail("距離請輸入 0 以上的數字。");
    if(!validNumber(time,0.01,100000,false)) return fail("時間必須大於 0，否則無法計算平均速度。");
  }

  if(rule==="p5_pass"){
    const score=interactionValue(interactions,["分數","成績"],0);
    if(!validNumber(score,0,100,true)) return fail("分數請輸入 0～100 的整數。");
  }

  if(rule==="p5_rain"){
    const rain=interactionValue(interactions,["降雨","機率"],0);
    if(!validNumber(rain,0,100,true)) return fail("降雨機率請輸入 0～100 的整數。");
  }

  if(rule==="p6_age3"){
    const age=interactionValue(interactions,["年齡","歲"],0);
    if(!validNumber(age,0,120,true)) return fail("年齡請輸入 0～120 的整數。");
  }

  if(rule==="p6_temp4"){
    const temp=interactionValue(interactions,["氣溫","溫度"],0);
    if(!validNumber(temp,-50,60,true)) return fail("氣溫請輸入合理範圍內的整數，例如 -10～40。");
  }

  if(rule==="p7_and"||rule==="p7_or"){
    for(let i=0;i<Math.min(2,interactions.length);i++){
      const v=cleanAnswer(interactions[i].value);
      if(v!=="0"&&v!=="1") return fail("這一題指定使用 1／0 回答，請只輸入 1 或 0。");
    }
  }

  return ok();
}

function askInlineInput(promptText, partialText, isChecking=false){
  return new Promise(resolve=>{
    const area=$("#runInputArea");
    const out=$("#out");
    const checkBtn=$("#checkChallenge");
    if(isChecking&&checkBtn) checkBtn.textContent="⌨️ 等待你輸入…";
    if(out && partialText!==undefined){
      out.textContent=partialText||"程式正在等待輸入…";
    }
    if(!area){ resolve(null); return; }

    area.innerHTML=`
      <div class="inputPrompt">
        <div class="inputPromptText">⌨️ ${esc(promptText||"請輸入資料：")}</div>
        <form id="runtimeInputForm" class="runtimeInputForm">
          <input id="runtimeInput" class="runtimeInput" autocomplete="off"
                 aria-label="${esc(promptText||"請輸入資料")}" placeholder="在這裡輸入…" />
          <button type="submit" class="sendInput">送出</button>
          <button type="button" id="cancelRuntimeInput" class="cancelInput">取消執行</button>
        </form>
      </div>`;

    const form=$("#runtimeInputForm");
    const input=$("#runtimeInput");
    const cancel=$("#cancelRuntimeInput");
    input.focus();

    let finished=false;
    let timer=null;
    const finish=value=>{
      if(finished)return;
      finished=true;
      if(timer) clearTimeout(timer);
      if(isChecking&&checkBtn) checkBtn.textContent="🔎 檢查中…";
      resolve(value);
    };

    form.addEventListener("submit",e=>{
      e.preventDefault();
      const value=input.value;
      area.innerHTML=`<div class="inputHistory">↳ 你輸入：<b>${esc(value)}</b></div>`;
      finish(value);
    },{once:true});

    cancel.addEventListener("click",()=>{
      area.innerHTML="";
      finish(null);
    },{once:true});

    timer=setTimeout(()=>{
      if(finished)return;
      area.innerHTML='<div class="feedback wait">⌛ 等待輸入已逾時，這次檢查已取消。請重新按「檢查挑戰」。</div>';
      finish(null);
    },90000);
  });
}

async function executeInteractive(c,isChecking=false){
  if(!window.PYRUN||engine!=="ready") throw Error("ENGINE");
  const inputs=[];
  const interactions=[];
  let rounds=0;
  const area=$("#runInputArea");
  if(area) area.innerHTML="";

  while(rounds<30){
    rounds++;
    let r=await PYRUN.run(c,inputs,{timeout:3000});
    if(r.error){
      let x=PYRUN.explain(r.error,c);
      throw Error(x?.tip||r.error.msg||"程式有錯");
    }

    const partial=PYRUN.transcript(r.events,true);
    if(!r.need){
      if(area) area.innerHTML="";
      return {text:partial,inputs:[...inputs],interactions:[...interactions]};
    }

    let promptText="請輸入資料：";
    const evs=r.events||[];
    for(let i=evs.length-1;i>=0;i--){
      if(evs[i][0]==="prompt"){
        promptText=evs[i][1]||promptText;
        break;
      }
    }

    const value=await askInlineInput(promptText,partial,isChecking);
    if(value===null){
      const cancelErr=new Error("INPUT_CANCELLED");
      throw cancelErr;
    }
    inputs.push(value);
    interactions.push({prompt:promptText,value});
  }
  throw Error("輸入次數太多，請檢查迴圈是否會正常結束。");
}

function showRunError(e,c,o,f){
  const area=$("#runInputArea");
  if(area && e.message!=="INPUT_CANCELLED") area.innerHTML="";
  if(e.message==="INPUT_CANCELLED"){
    o.textContent="已取消這次執行。";
    f.innerHTML='<div class="feedback wait">你可以修改程式後再按「執行看看」。</div>';
  }else if(e.message==="ENGINE"){
    o.textContent="⚠️ Python 尚未準備完成。";
    f.innerHTML='<div class="feedback wait">這不是你的程式錯誤，請稍後再試或重新整理。</div>';
  }else{
    const info=debugCoach(e.message,c);
    o.textContent="程式目前還不能正常執行。";
    f.innerHTML=coachHTML(info)+`<details class="rawError"><summary>🔧 查看 Python 原始錯誤訊息</summary><pre>${esc(e.message)}</pre></details>`;
  }
}

async function tryRunOnly(){
  const b=$("#tryRun"),checkBtn=$("#checkChallenge"),o=$("#out"),f=$("#fb"),c=$("#code").value;
  b.disabled=true;
  checkBtn.disabled=true;
  b.textContent="🐍 執行中…";
  f.innerHTML="";
  try{
    const result=await executeInteractive(c);
    o.textContent=result.text||"程式執行完成，但目前沒有輸出內容。";
    f.innerHTML='<div class="feedback runOnly">👀 這是你這次程式的執行結果。自由測試不會檢查你輸入的內容；準備好後再按「✅ 檢查挑戰」。</div>';
  }catch(e){
    showRunError(e,c,o,f);
  }finally{
    b.disabled=engine==="loading";
    checkBtn.disabled=engine==="loading";
    b.textContent=engine==="ready"?"▶ 再執行一次":"⏳ Python 準備中…";
  }
}

async function checkChallenge(l,j,s){
  const b=$("#checkChallenge"),runBtn=$("#tryRun"),o=$("#out"),f=$("#fb"),c=$("#code").value;
  b.disabled=true;
  runBtn.disabled=true;
  b.textContent="🔎 檢查中…";
  f.innerHTML="";
  try{
    let check=validate(c,s);
    if(!check.ok){
      f.innerHTML=`<div class="feedback wait">🔎 ${esc(check.msg)}<br><small>先修正這一點，再按「執行看看」測試。</small></div>`;
      return;
    }

    const result=await executeInteractive(c,true);
    o.textContent=result.text||"程式執行完成，但目前沒有輸出內容。";

    const meaning=semanticValidate(s.rule,result.interactions);
    if(!meaning.ok){
      f.innerHTML=`<div class="feedback meaning">🧭 情境內容還要再確認：${esc(meaning.msg)}<br><small>程式寫法可能已經正確，但輸入內容也要符合題目的情境。</small></div>`;
      return;
    }

    if(done(l.id)<j+1){state[l.id]=j+1;save()}
    let stationDone=(j+1===stepsOf(l));
    let allDone=(pos().i>=LEVELS.length);
    reward(stationDone,allDone);
  }catch(e){
    showRunError(e,c,o,f);
  }finally{
    b.disabled=engine==="loading";
    runBtn.disabled=engine==="loading";
    b.textContent="✅ 檢查挑戰";
  }
}
function reward(stationDone,allDone){
  $("#rewardBody").innerHTML=`<div class="pop">${allDone?"🏆":stationDone?"🎁":"⭐"}</div>
  <h2>${allDone?"全部完成！":stationDone?"寶箱打開了！":"挑戰成功！"}</h2>
  <p>${allDone?"所有 Python 挑戰完成，證書解鎖。":stationDone?"這一關真正需要的挑戰已完成，新區域解鎖！":"得到一顆星，下一個挑戰解鎖！"}</p>
  <button id="next">${allDone?"🏅 領證書":"繼續冒險 →"}</button>`;
  $("#reward").showModal();
  $("#next").onclick=()=>{$("#reward").close();render();if(allDone)openCert()};
}
function openCert(){
  let profile=getStudentProfile(); let n=(profile&&profile.name)||localStorage.getItem(NAMEKEY)||"Python 冒險家";
  $("#certName").textContent=n;
  $("#studentName").value=n==="Python 冒險家"?"":n;
  $("#date").textContent=new Date().toLocaleDateString("zh-TW");
  $("#cert").showModal();
}
$("#closeCert").onclick=()=>$("#cert").close();
$("#applyName").onclick=()=>{
  let n=$("#studentName").value.trim()||"Python 冒險家";
  localStorage.setItem(NAMEKEY,n);$("#certName").textContent=n;
};
$("#printCert").onclick=()=>window.print();
render();
restoreCloudState();
