const BONUS_KEY="course116_python_bonus_v1";
const MAIN_KEY="course115_v3_progress";

const QUESTS=[
{
 id:"b1",icon:"🪪",title:"魔法暱稱產生器",tags:["變數","input","字串"],
 concept:"把多筆輸入存進變數，再組合成一個新的輸出。重點是資料要真的從使用者輸入而來。",
 task:"詢問「名字」和「最喜歡的動物」，最後顯示一個包含這兩項資料的冒險暱稱。例如使用者輸入不同內容時，結果也要跟著改變。",
 req:["使用 2 次 input()","用 2 個不同變數保存","最後的 print() 要使用兩個變數"],
 hint:"可以先讓 name 保存名字、animal 保存動物，再想想 print() 如何同時使用兩個變數。",
 starter:'# 兩個 input() → 兩個變數 → 組合輸出\n',
 validate(code){
   const inputs=(code.match(/input\s*\(/g)||[]).length;
   const vars=[...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*input\s*\(/gm)].map(x=>x[1]);
   const prints=[...code.matchAll(/print\s*\(([^)]*)\)/g)].map(x=>x[1]);
   const used=new Set(vars.filter(v=>prints.some(p=>new RegExp("\\b"+v+"\\b").test(p))));
   if(inputs<2)return fail("需要 2 次 input()。");
   if(new Set(vars).size<2)return fail("兩筆回答要放進兩個不同變數。");
   if(used.size<2)return fail("最後輸出要真的使用兩個變數。");
   return ok();
 },
 tests:[{inputs:["小安","狐狸"]}]
},
{
 id:"b2",icon:"🍪",title:"零食補給站",tags:["int","//","%"],
 concept:"整除 // 可以算完整買幾份，餘數 % 可以找出分完後剩下多少。",
 task:"詢問「有多少元」和「每包餅乾多少元」。算出最多能買幾包，以及買完後還剩多少元，並把兩個結果都顯示。",
 req:["2 次 int(input())","同時使用 // 和 %","顯示兩個結果"],
 hint:"如果 money 是總金額、price 是單價：完整份數和剩餘量會用到兩種不同的除法符號。",
 starter:'# 最多買幾包？還剩多少元？\n',
 validate(code){
   if((code.match(/int\s*\(\s*input\s*\(/g)||[]).length<2)return fail("兩筆數字輸入都要用 int(input())。");
   if(!code.includes("//"))return fail("還沒有使用 // 算完整份數。");
   if(!code.includes("%"))return fail("還沒有使用 % 算餘數。");
   if((code.match(/print\s*\(/g)||[]).length<1)return fail("要把結果顯示出來。");
   return ok();
 },
 tests:[{inputs:["100","18"]}]
},
{
 id:"b3",icon:"🕵️",title:"奇偶偵探",tags:["%","if / else"],
 concept:"一個整數除以 2 的餘數只有 0 或 1；因此 % 很適合用來判斷奇偶。",
 task:"詢問一個整數。如果是偶數顯示「偶數」，否則顯示「奇數」。",
 req:["使用 int(input())","使用 % 2","使用 if / else","兩個分支文字不同"],
 hint:"想想：偶數除以 2 的餘數是多少？條件可以檢查這個餘數。",
 starter:'# 輸入一個整數，判斷奇數或偶數\n',
 validate(code){
   if(!/int\s*\(\s*input\s*\(/.test(code))return fail("需要用 int(input()) 取得整數。");
   if(!/%\s*2/.test(code))return fail("需要使用 % 2 判斷餘數。");
   if(!/\bif\b/.test(code)||!/\belse\s*:/.test(code))return fail("需要 if / else 兩條路。");
   return ok();
 },
 tests:[{inputs:["17"]}]
},
{
 id:"b4",icon:"🔐",title:"密碼守門員",tags:["len()","if / else"],
 concept:"len() 可以取得文字長度。這是一個新的小工具，但邏輯仍然是「取得資料 → 算出特徵 → 判斷」。",
 task:"詢問一組密碼。如果長度至少 6 個字元，顯示「長度合格」；否則顯示「太短」。",
 req:["使用 input()","使用 len()","比較 6","使用 if / else"],
 hint:"先把密碼存進變數，再用 len(變數) 得到它有幾個字元。",
 starter:'# 新工具：len(文字) 可以算文字長度\n',
 validate(code){
   if(!/input\s*\(/.test(code))return fail("需要先讓使用者輸入密碼。");
   if(!/len\s*\(/.test(code))return fail("需要使用 len() 計算長度。");
   if(!/[<>]=?\s*6|6\s*[<>]=?/.test(code))return fail("條件中需要以 6 為門檻。");
   if(!/\bif\b/.test(code)||!/\belse\s*:/.test(code))return fail("需要 if / else。");
   return ok();
 },
 tests:[{inputs:["abc12345"]}]
},
{
 id:"b5",icon:"🚀",title:"火箭發射控制台",tags:["for","range"],
 concept:"range(start, stop, step) 不只會往上數，也可以用負步進倒數。",
 task:"用 for + range() 顯示 10、9、8……一直到 1，最後在迴圈結束後顯示「🚀 發射！」。",
 req:["使用 for","range() 要有負步進","倒數 10 到 1","發射訊息只能在倒數後出現一次"],
 hint:"倒數的 step 是負數。停止值本身不會被包含，所以要想清楚 stop 應該寫多少。",
 starter:'# 10 → 1，最後發射\n',
 validate(code){
   if(!/\bfor\b/.test(code)||!/range\s*\(/.test(code))return fail("需要使用 for + range()。");
   if(!/range\s*\([^)]*,[^)]*,-\s*1\s*\)/.test(code))return fail("倒數要讓 range() 使用 -1 的步進。");
   if(!/10/.test(code))return fail("倒數要從 10 開始。");
   if(!/發射/.test(code))return fail("倒數結束後要顯示「發射」。");
   return ok();
 },
 tests:[{inputs:[]}]
},
{
 id:"b6",icon:"🎲",title:"骰子預言家",tags:["random","if"],
 concept:"隨機數會讓每次執行出現不同結果。程式可以再對隨機結果做條件判斷。",
 task:"產生 1～6 的隨機整數並顯示。如果點數 4 以上，再顯示「今天運氣不錯」；否則顯示「再試一次」。",
 req:["import random","random.randint(1, 6)","使用 if / else","兩個分支都輸出"],
 hint:"先把 randint() 的結果存進變數，再對這個變數做 >= 4 的比較。",
 starter:'# 骰子點數 1～6，再依點數判斷\n',
 validate(code){
   if(!/import\s+random/.test(code))return fail("需要 import random。");
   if(!/random\.randint\s*\(\s*1\s*,\s*6\s*\)/.test(code))return fail("亂數範圍要是 1～6。");
   if(!/\bif\b/.test(code)||!/\belse\s*:/.test(code))return fail("需要 if / else。");
   if(!/>=\s*4/.test(code))return fail("請用 >= 4 作為判斷門檻。");
   return ok();
 },
 tests:[{inputs:[]}]
},
{
 id:"b7",icon:"🔢",title:"終極猜數字・固定版",tags:["while","if / elif"],
 concept:"while 負責「猜錯就繼續」，if / elif 負責「這一次猜得太高或太低」。",
 task:"把答案設定成 7。重複詢問整數直到猜中；太大顯示「太大」，太小顯示「太小」，猜中後在迴圈外顯示「成功」。",
 req:["答案固定為 7","使用 while","迴圈裡 int(input())","if / elif 判斷大小","成功訊息在迴圈外"],
 hint:"先寫 answer = 7，再讓 guess 有初始值。while 的條件可以表示「還沒猜中」。",
 starter:'# 固定答案 7：猜錯繼續，猜中才離開\n',
 validate(code){
   if(!/=\s*7\b/.test(code))return fail("需要把答案設定為 7。");
   if(!/\bwhile\b/.test(code))return fail("需要 while 重複詢問。");
   if(!/int\s*\(\s*input\s*\(/.test(code))return fail("迴圈中要取得整數輸入。");
   if(!/\bif\b/.test(code)||!/\belif\b/.test(code))return fail("需要 if / elif 判斷太大與太小。");
   return ok();
 },
 tests:[{inputs:["3","9","7"]}]
},
{
 id:"b8",icon:"🏰",title:"迷你文字冒險",tags:["綜合應用","input","if / elif / else"],
 concept:"寫小遊戲的關鍵不是一次寫很多，而是把故事拆成「輸入 → 選擇 → 結果」。",
 task:"設計一個有 3 個選項的文字冒險。先用 input() 問玩家選 1、2 或 3，再用 if / elif / else 顯示三種不同結局。結局文字由你自己設計。",
 req:["至少 1 次 input()","使用 if / elif / else","比較 1、2、3 三種選擇","三個結局文字不能完全相同"],
 hint:"先想三個結局，再處理條件。輸入可以先用 int(input())，這樣比較 1、2、3 會比較清楚。",
 starter:'# 自己設計三條路、三個不同結局\n',
 validate(code){
   if(!/input\s*\(/.test(code))return fail("需要先讓玩家做選擇。");
   if(!/\bif\b/.test(code)||!/\belif\b/.test(code)||!/\belse\s*:/.test(code))return fail("需要 if / elif / else 三條以上的路。");
   const prints=[...code.matchAll(/print\s*\(\s*["']([^"']+)["']/g)].map(m=>m[1].trim());
   if(new Set(prints).size<3)return fail("至少設計三種不同的結局文字。");
   return ok();
 },
 tests:[{inputs:["2"]}]
}
];

let progress=JSON.parse(localStorage.getItem(BONUS_KEY)||"{}");
let current=0,engineReady=false;

const $=s=>document.querySelector(s);
const ok=()=>({ok:true,msg:""});
const fail=msg=>({ok:false,msg});

function mainStars(){
 const p=JSON.parse(localStorage.getItem(MAIN_KEY)||"{}");
 return Object.values(p||{}).reduce((a,b)=>a+Number(b||0),0);
}
function doneCount(){return QUESTS.filter(q=>progress[q.id]).length}

async function cloudStars(){
 try{
   if(window.CourseDB){
     await CourseDB.ready;
     const r=await CourseDB.loadStudent();
     if(r?.progress) return Object.values(r.progress).reduce((a,b)=>a+Number(b||0),0);
   }
 }catch(e){}
 return 0;
}

async function boot(){
 PYRUN.onStatus(st=>{
   engineReady=st==="ready";
   if(st==="loading")$("#output").textContent="Python 引擎載入中…";
 });
 try{await PYRUN.init(CONFIG.PYODIDE_URL)}catch(e){$("#output").textContent="Python 引擎載入失敗，請重新整理。";}
 const stars=Math.max(mainStars(),await cloudStars());
 $("#unlockInfo").innerHTML=`🧭 <b>自由選關模式</b>：8 個進階挑戰全部開放，可以依興趣自由選擇、反覆練習。主線目前完成 <b>${stars}</b> 個挑戰；這裡的徽章不會改變原本主線星星。`;
 $("#app").hidden=false;
 renderList();
 renderQuest();
 renderBadges();
}
function renderBadges(){
 $("#badges").innerHTML=QUESTS.map(q=>`<span class="badge ${progress[q.id]?"done":""}">${progress[q.id]?"✅":"⬜"} ${q.icon} ${q.id.toUpperCase()}</span>`).join("");
}
function renderList(){
 $("#questList").innerHTML=QUESTS.map((q,i)=>
   `<button class="questBtn ${i===current?"active":""} ${progress[q.id]?"done":""}" data-i="${i}">
      ${progress[q.id]?"✅":"🏝️"} ${q.icon} ${q.title}
    </button>`
 ).join("");
 document.querySelectorAll(".questBtn").forEach(b=>b.onclick=()=>{
   current=Number(b.dataset.i);
   renderList();
   renderQuest();
 });
}
function renderQuest(){
 const q=QUESTS[current];
 $("#questTag").innerHTML=q.tags.map(t=>`<span class="tag">${t}</span>`).join("");
 $("#questTitle").textContent=`${q.icon} ${q.title}`;
 $("#questConcept").innerHTML=`<b>🧠 觀念：</b>${q.concept}`;
 $("#questTask").innerHTML=`<b>🎯 任務：</b>${q.task}`;
 $("#questReq").innerHTML=`<b>✅ 完成條件：</b><ul>${q.req.map(x=>`<li>${x}</li>`).join("")}</ul>`;
 $("#questHint").textContent=q.hint;
 $("#code").value=q.starter;
 $("#output").textContent="尚未執行";
 $("#feedback").className="feedback";
 $("#feedback").textContent=progress[q.id]?"✅ 這個挑戰已完成，可以再玩一次或前往下一題。":"先自己思考，再執行測試。";
}
function simpleExample(q,msg){
 const ex={
  b1:'food = input("食物：")\\ncolor = input("顏色：")\\nprint(food, color)',
  b2:'total = 17\\nsize = 5\\nprint(total // size)\\nprint(total % size)',
  b3:'n = 10\\nif n % 2 == 0:\\n    print("可以整除")\\nelse:\\n    print("不能整除")',
  b4:'word = input("文字：")\\nif len(word) >= 4:\\n    print("夠長")\\nelse:\\n    print("較短")',
  b5:'for n in range(3, 0, -1):\\n    print(n)\\nprint("完成")',
  b6:'import random\\nn = random.randint(1, 3)\\nif n >= 2:\\n    print("較大")\\nelse:\\n    print("較小")',
  b7:'answer = 5\\nguess = 0\\nwhile guess != answer:\\n    guess = int(input("猜："))\\n    if guess > answer:\\n        print("高")\\n    elif guess < answer:\\n        print("低")\\nprint("完成")',
  b8:'choice = int(input("選 1 或 2："))\\nif choice == 1:\\n    print("走左邊")\\nelse:\\n    print("走右邊")'
 }[q.id];
 return `<div class="example"><b>✅ 不同情境的正確概念範例</b><pre><code>${escapeHtml(ex)}</code></pre><span class="small">這不是本題答案，請看懂結構後再回到自己的程式修改。</span></div>`;
}
function escapeHtml(x){return String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
async function execute(){
 const q=QUESTS[current],code=$("#code").value;
 $("#output").textContent="執行中…";
 try{
   const r=await PYRUN.run(code,(q.tests[0]?.inputs||[]),{timeout:3500,seed:167});
   if(r.timeout){$("#output").textContent="⏰ 程式沒有停止。請檢查 while 條件是否會改變。";return r}
   if(r.error){
     const info=PYRUN.explain(r.error,code);
     $("#output").textContent=(info?.title||"程式發生錯誤")+"\n"+(info?.tip||r.error.msg||"");
     return r;
   }
   $("#output").textContent=PYRUN.transcript(r.events,true)||"(沒有輸出)";
   return r;
 }catch(e){$("#output").textContent="執行失敗："+e.message;return null}
}
async function check(){
 const q=QUESTS[current],code=$("#code").value;
 const v=q.validate(code);
 if(!v.ok){
   $("#feedback").className="feedback bad";
   $("#feedback").innerHTML=`❌ <b>目前還差一點：</b>${escapeHtml(v.msg)}${simpleExample(q,v.msg)}`;
   return;
 }
 const r=await execute();
 if(!r || r.error || r.timeout)return;
 progress[q.id]=true;
 localStorage.setItem(BONUS_KEY,JSON.stringify(progress));
 $("#feedback").className="feedback ok";
 $("#feedback").innerHTML=`🎉 <b>挑戰完成！</b>你取得了「${q.icon} ${q.title}」徽章。`;
 renderBadges();renderList();
 try{
   if(window.CourseDB){
     await CourseDB.ready;
     if(CourseDB.state==="ready"&&!CourseDB.isAnonymous()){
       await CourseDB.saveStudent({bonusChallenges:{...progress},bonusBadges:doneCount()});
     }
   }
 }catch(e){}
}
$("#runBtn").onclick=execute;
$("#checkBtn").onclick=check;
$("#resetBtn").onclick=()=>renderQuest();
boot();
