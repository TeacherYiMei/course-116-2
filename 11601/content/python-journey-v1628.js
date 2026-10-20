window.COURSE116_BUILD="v16.26";
const LEVELS=[{"id":"p1","icon":"👋","title":"第 1 關｜哈囉，旅伴！","concept":"print()：讓 Python 把文字顯示出來。","scratch":"🐱 Scratch 的「說 ___」積木 → Python 的 print()","steps":[{"title":"① 複製範例，再改一小部分","prompt":"先看黑框學會 print() 的寫法，再自己寫一句不同的招呼語。","demo":"print(\"哈囉，旅伴！\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 print()","招呼語要有內容","不能和黑框示範完全相同"],"rule":"p1_greeting","mode":"copy","ref":"print","hints":["先保留 print() 的外形，只思考引號裡要換成什麼。","🐱 想想 Scratch「說 ___」積木：你會把積木裡的文字換掉。","忘記 print() 的格式時，再開「📘 我想查指令」。"]},{"title":"② 再複製一次，改更多地方","prompt":"讓 Python 顯示兩行：第一行是「你想去的地方」，第二行是「你想做的事情」。兩行內容要不同。","demo":"print(\"台北\")\nprint(\"吃美食\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 2 次 print()","顯示 2 行有內容的文字","兩行文字不能完全相同"],"rule":"p1_two_distinct","mode":"copy","ref":"print","hints":["題目要求兩行，所以想想需要幾次 print()。","每個 print() 負責一行；兩行要表達不同資訊。","忘記寫法時，再查 print()。"]},{"title":"🚀 第 3 題：自己輸入兩行文字","prompt":"不複製範例，自己輸入兩個 print()。第一行寫一個地點，第二行寫一個活動，兩行內容要不同。","demo":"","starter":"# 這次自己輸入，不提供可複製程式\n","requirements":["使用 2 次 print()","兩行都有實際內容","兩行內容不同"],"rule":"p1_two_distinct","mode":"independent","ref":"print","hints":["想想前兩題的 print() 外形。","一個 print() 負責一行。","忘記格式時可以回顧已完成範例。"]}]},{"id":"p2","icon":"🚌","title":"第 2 關｜畢旅報名表","concept":"變數 + input()：讓電腦詢問資料，並把回答記住。","scratch":"🐱 Scratch 的「詢問並等待」＋變數 → Python 的 input()＋變數","steps":[{"title":"① 複製範例，再改一小部分","prompt":"黑框示範詢問食物。你的任務改成：詢問「最想去的城市」，把回答存進變數，再顯示那個變數。","demo":"food = input(\"你喜歡什麼食物？\")\nprint(food)","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 input() 詢問 1 次","把回答存進變數","使用 print() 顯示該變數"],"rule":"p2_one_input_var","mode":"copy","ref":"input","hints":["input() 的回答通常先放進一個變數。","🐱 Scratch「詢問並等待」得到回答；Python 可以直接把回答放進變數。","到小百科查 input() 與變數的範例。"]},{"title":"② 再複製一次，改更多地方","prompt":"詢問「姓名」和「班級」兩項資料，分別存進兩個不同變數，最後把兩項資料都顯示出來。","demo":"food = input(\"喜歡的食物：\")\ndrink = input(\"喜歡的飲料：\")\nprint(food, drink)","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 input() 詢問 2 次","使用 2 個不同變數保存回答","最後顯示兩項資料"],"rule":"p2_two_inputs","mode":"copy","ref":"input","hints":["先想好兩個盒子的名字，再分別把 input() 放進去。","兩個問題不要放進同一個變數，否則前一個回答會被蓋掉。","查 input() 與變數。"]},{"title":"🚀 自己完成：迷你旅行報名表","prompt":"詢問「目的地、天數、最期待的活動」三項資料，分別記住，最後至少用一個 print() 把三項資料一起顯示。","demo":"","starter":"# 自己設計三個變數完成報名表\n","requirements":["使用 input() 詢問 3 次","使用 3 個不同變數保存回答","輸出時使用到這 3 個變數"],"rule":"p2_three_inputs_print","mode":"independent","ref":"variable","hints":["把任務拆成三個問題，每個問題配一個變數。","最後的 print() 可以一次放進多個變數。","如果忘記變數與 input()，再查小百科。"]}]},{"id":"p3","icon":"💰","title":"第 3 關｜旅費計算器","concept":"int() + 運算：把輸入的文字轉成整數，再讓 Python 幫你算。","scratch":"🐱 Scratch 的運算積木 → Python 的 +、-、*、//、%","steps":[{"title":"① 複製範例，再改一小部分","prompt":"黑框示範兩個整數相加。你的任務是詢問「單張票價」和「張數」，用乘法算出總額並顯示。","demo":"a = int(input(\"第一個整數：\"))\nb = int(input(\"第二個整數：\"))\nprint(a + b)","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["兩次輸入都用 int() 轉成整數","使用乘法 *","顯示計算結果"],"rule":"p3_multiply_int","mode":"copy","ref":"int","hints":["input() 得到文字；要做整數計算要先轉型。","總額是「單價 × 數量」。","查 int() 和運算。"]},{"title":"② 再複製一次，改更多地方","prompt":"詢問「點心總數」和「人數」，算出每人可以拿幾個，以及最後剩幾個。","demo":"balls = int(input(\"球的總數：\"))\nboxes = int(input(\"盒子數：\"))\nprint(balls // boxes)\nprint(balls % boxes)","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 2 次 int(input())","使用 // 算每人幾個","使用 % 算剩幾個","把兩個結果都顯示"],"rule":"p3_divmod","mode":"copy","ref":"operator","hints":["「平均每人幾個整數」需要整除。","「分完還剩多少」需要餘數。","查 // 和 %。"]},{"title":"🚀 自己完成：旅行預算","prompt":"詢問「總預算、交通費、餐費」，算出扣掉交通費和餐費後還剩多少錢。","demo":"","starter":"# 剩餘預算 = 總預算 - 交通費 - 餐費\n","requirements":["使用 3 次 int(input())","使用減法 - 計算","顯示剩餘預算"],"rule":"p3_budget","mode":"independent","ref":"operator","hints":["先用三個變數把三筆金額記住。","算式可以連續減兩次。","忘記 int() 時再查小百科。"]}]},{"id":"p4","icon":"📐","title":"第 4 關｜旅行數字工具","concept":"float()、**、round()：處理小數、次方與整理小數位數。","scratch":"🐱 Scratch 的數學運算 → Python 可以組合小數、次方和四捨五入","steps":[{"title":"① 複製範例，再改一小部分","prompt":"黑框示範小數乘法。你的任務是詢問正方形邊長（可有小數），用 ** 2 算面積，再用 round(..., 2) 顯示到小數第 2 位。","demo":"length = float(input(\"長度：\"))\nprint(round(length * 2, 2))","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 float(input())","使用 ** 2","使用 round(..., 2)","顯示結果"],"rule":"p4_square","mode":"copy","ref":"round","hints":["小數輸入要用 float()。","平方可以寫成 ** 2。","round(數字, 2) 表示整理到小數第 2 位。"]},{"title":"② 再複製一次，改更多地方","prompt":"詢問「距離（公里）」和「時間（小時）」，計算平均速度＝距離 ÷ 時間，最後四捨五入到小數第 1 位。","demo":"pages = float(input(\"閱讀頁數：\"))\nhours = float(input(\"閱讀時間：\"))\nrate = pages / hours\nprint(round(rate, 1))","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["兩次輸入都使用 float()","使用除法 /","使用 round(..., 1)","顯示平均速度"],"rule":"p4_speed","mode":"copy","ref":"round","hints":["距離和時間都可能有小數。","先算距離 / 時間，再交給 round()。","查 float()、/、round()。"]},{"title":"🚀 第 3 題：自己完成平均速度","prompt":"不複製範例，自己詢問距離和時間，算出平均速度，並四捨五入到小數第 1 位。","demo":"","starter":"# 這次自己輸入完整程式\n","requirements":["兩次輸入都使用 float()","使用除法 /","使用 round(..., 1)","顯示結果"],"rule":"p4_speed","mode":"independent","ref":"round","hints":["先取得距離與時間。","平均速度＝距離 / 時間。","最後再使用 round(..., 1)。"]}]},{"id":"p5","icon":"🎢","title":"第 5 關｜條件判斷","concept":"比較 + if / else：讓程式依條件走不同路。","scratch":"🐱 Scratch 的「如果／否則」→ Python 的 if / else","steps":[{"title":"① 複製範例，再改一小部分","prompt":"黑框示範溫度判斷。你的任務是詢問一個分數：60 分以上顯示「通過」，否則顯示「再挑戰」。","demo":"temp = 30\nif temp >= 28:\n    print(\"很熱\")\nelse:\n    print(\"還好\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 int(input()) 取得分數","使用 if 和 else","條件中比較 60","兩個分支都要有輸出"],"rule":"p5_pass","mode":"copy","ref":"if","hints":["先取得分數，再判斷是否 >= 60。","if 後面的條件要加冒號；else 也要加冒號。","查 if / else 與縮排。"]},{"title":"② 再複製一次，改更多地方","prompt":"詢問降雨機率（0～100）。如果大於等於 50，顯示「帶傘」；否則顯示「不用帶傘」。","demo":"battery = int(input(\"電量：\"))\nif battery >= 20:\n    print(\"可以繼續使用\")\nelse:\n    print(\"需要充電\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 int(input())","使用 if / else","使用 >= 50 的比較","兩個分支都輸出"],"rule":"p5_rain","mode":"copy","ref":"if","hints":["條件的分界數字是 50。","兩種結果剛好適合 if / else。","需要時再查比較與 if。"]},{"title":"🚀 自己完成：自訂門檻","prompt":"自己選一個「數字門檻」情境，例如剩餘電量、作業完成數等。程式要詢問一個整數，並用 if / else 顯示兩種不同結果。","demo":"","starter":"# 自己決定情境與門檻\n","requirements":["使用 int(input())","使用 if / else","至少使用一個比較運算","兩個分支的輸出文字要不同"],"rule":"p5_custom_threshold","mode":"independent","ref":"if","hints":["先決定要問什麼數字，以及門檻是多少。","想清楚達到門檻和沒達到時要各說什麼。","查比較運算和 if / else。"]}]},{"id":"p6","icon":"🎫","title":"第 6 關｜多重選擇","concept":"if / elif / else：不只兩種情況時，用 elif 增加分支。","scratch":"🐱 Scratch 的多層「如果／否則」→ Python 的 if / elif / else","steps":[{"title":"① 複製範例，再改一小部分","prompt":"黑框示範三段分數分類。你的任務是詢問年齡：未滿 6 顯示「幼童」、未滿 18 顯示「學生」、其餘顯示「成人」。","demo":"score=75\nif score>=90:\n    print(\"A\")\nelif score>=60:\n    print(\"B\")\nelse:\n    print(\"C\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 int(input())","使用 if、至少 1 個 elif、else","使用 6 和 18 作為分界","三個分支都要有輸出"],"rule":"p6_age3","mode":"copy","ref":"elif","hints":["三種結果需要三條路。","先判斷最小的年齡區間通常比較容易。","查 if / elif / else。"]},{"title":"② 再複製一次，改更多地方","prompt":"詢問氣溫：低於 15 顯示「偏冷」、低於 25 顯示「舒適」、低於 32 顯示「偏熱」、其餘顯示「炎熱」。","demo":"score = int(input(\"分數：\"))\nif score < 60:\n    print(\"未通過\")\nelif score < 80:\n    print(\"通過\")\nelif score < 90:\n    print(\"很好\")\nelse:\n    print(\"很棒\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 int(input())","使用 if、至少 2 個 elif、else","條件中使用 15、25、32","四個分支都有輸出"],"rule":"p6_temp4","mode":"copy","ref":"elif","hints":["四種結果會需要 if + 2 個 elif + else。","條件可以由小到大排。","忘記 elif 格式時再查小百科。"]},{"title":"🚀 第 3 題：自己完成三種分類","prompt":"不複製範例，自己詢問年齡：未滿 6 顯示「幼童」、未滿 18 顯示「學生」、其餘顯示「成人」。","demo":"","starter":"# 這次自己輸入 if / elif / else\n","requirements":["使用 int(input())","使用 if、elif、else","使用 6 和 18 作為分界","三個分支都有輸出"],"rule":"p6_age3","mode":"independent","ref":"elif","hints":["三種結果需要三條路。","條件可以由小到大判斷。","可回顧前兩題範例。"]}]},{"id":"p7","icon":"🏎️","title":"第 7 關｜雙重條件","concept":"and / or：把兩個判斷條件組合起來。","scratch":"🐱 Scratch 的「且」「或」→ Python 的 and / or","steps":[{"title":"① 複製範例，再改一小部分","prompt":"黑框示範 and。你的任務是詢問「作業是否完成（1/0）」和「用品是否帶齊（1/0）」，兩者都等於 1 才顯示「可以出發」，否則顯示「先完成準備」。","demo":"sunny=True\nfree=True\nif sunny and free:\n    print(\"去公園\")\nelse:\n    print(\"留在家\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["取得 2 個整數輸入","使用 and","使用 if / else","兩個條件都要參與判斷"],"rule":"p7_and","mode":"copy","ref":"logic","hints":["題目說「兩者都」，對應的是 and。","可以用 == 1 比較每個輸入。","查 and。"]},{"title":"② 再複製一次，改更多地方","prompt":"詢問「有學生證（1/0）」和「有活動證（1/0）」。只要其中一個等於 1 就顯示「可以入場」，兩個都沒有才顯示「無法入場」。","demo":"member = int(input(\"有會員卡（1/0）：\"))\ncoupon = int(input(\"有優惠券（1/0）：\"))\nif member == 1 or coupon == 1:\n    print(\"可以折扣\")\nelse:\n    print(\"原價\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["取得 2 個整數輸入","使用 or","使用 if / else","兩個條件都要參與判斷"],"rule":"p7_or","mode":"copy","ref":"logic","hints":["題目說「其中一個即可」，對應 or。","兩個比較式放在 or 的左右兩邊。","需要時查 or。"]},{"title":"🚀 第 3 題：自己完成 and","prompt":"不複製範例，詢問「作業完成（1/0）」和「用品帶齊（1/0）」，兩個都等於 1 才顯示「可以出發」。","demo":"","starter":"# 這次自己輸入 and 判斷\n","requirements":["取得 2 個整數輸入","使用 and","使用 if / else","兩個條件都參與判斷"],"rule":"p7_and","mode":"independent","ref":"logic","hints":["題目說「兩個都」，要使用 and。","每個輸入可以和 1 比較。","可回顧前兩題範例。"]}]},{"id":"p8","icon":"🚌","title":"第 8 關｜規律重複","concept":"for + range()：按照數字規律重複執行。","scratch":"🐱 Scratch 的「重複指定次數」→ Python 的 for / range()","steps":[{"title":"① 複製範例，再改一小部分","prompt":"黑框示範 range(3)。你的任務用 for + range() 顯示 1、2、3、4、5。","demo":"for i in range(3):\n    print(i)","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 for","使用 range()","輸出 1～5 的數字"],"rule":"p8_1to5","mode":"copy","ref":"for","hints":["range() 可以設定開始與停止位置。","停止位置本身不會被包含。","查 range(start, stop)。"]},{"title":"② 再複製一次，改更多地方","prompt":"用 for + range() 依序顯示 5、4、3、2、1，最後再顯示一次「出發！」。","demo":"for n in range(3, 0, -1):\n    print(n)\nprint(\"完成！\")","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 for + range()","range() 使用負的步進","倒數 5 到 1","迴圈結束後顯示「出發！」"],"rule":"p8_countdown","mode":"copy","ref":"for","hints":["range() 第三個數字可以決定每次增加或減少多少。","倒數時步進是負數。","「出發！」只出現一次，所以想想它應不應該縮排。"]},{"title":"🚀 自己找規律：偶數","prompt":"用 for + range() 顯示 2、4、6、8、10。不要在程式中寫 5 個 print()。","demo":"","starter":"# 用 range() 的步進完成\n","requirements":["使用 for + range()","range() 的步進為 2","不能使用 5 個獨立 print()"],"rule":"p8_even","mode":"independent","ref":"for","hints":["這串數字每次增加多少？","range() 的第三個參數就是步進。","查 range(start, stop, step)。"]}]},{"id":"p9","icon":"🔐","title":"第 9 關｜while 重複","concept":"while：只練習「條件成立就繼續重複」。","scratch":"🐱 Scratch 的「重複直到」→ Python 常用 while 表達「還要繼續的條件」","steps":[{"title":"① 複製範例，再把 3 改成 5","prompt":"先複製範例。把程式改成依序顯示 1、2、3、4、5。","demo":"count = 1\nwhile count <= 3:\n    print(count)\n    count = count + 1","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 while","計數從 1 開始","讓迴圈執行到 5","每輪更新計數變數"],"rule":"p9_count5","mode":"copy","ref":"while","hints":["先找出範例裡控制結束的數字。","只要讓 5 也能進入迴圈。","注意 count 每次都要增加。"]},{"title":"② 複製另一個範例，再改變數名稱","prompt":"複製範例後，把變數名稱改成你喜歡的英文名稱，但功能仍要顯示 1～5。","demo":"number = 1\nwhile number <= 5:\n    print(number)\n    number = number + 1","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["使用 while","從 1 開始","執行到 5","每輪加 1"],"rule":"p9_count5","mode":"copy","ref":"while","hints":["變數前後要一起改名。","while 條件與更新那一行都要使用同一個變數。","可使用英文小幫手。"]},{"title":"③ 自己輸入 while 數到 5","prompt":"這次不複製。自己寫一個 while，依序顯示 1～5。","demo":"","starter":"# 自己輸入完整 while\n","requirements":["使用 while","從 1 開始","執行到 5","每輪更新計數變數"],"rule":"p9_count5","mode":"independent","ref":"while","hints":["需要一個從 1 開始的變數。","while 條件要讓 5 被執行。","每輪結束前要讓變數加 1。"]}]},{"id":"p10","icon":"🐉","title":"第 10 關｜random 隨機數","concept":"random.randint()：只練習產生指定範圍的隨機整數。","scratch":"🐱 Scratch 的「在 1 到 10 間取亂數」→ Python 的 random.randint(1, 10)","steps":[{"title":"① 複製骰子範例，再改成 1～10","prompt":"複製範例，把骰子的 1～6 改成產生 1～10 的隨機整數並顯示。","demo":"import random\ndice = random.randint(1, 6)\nprint(dice)","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["import random","使用 random.randint()","範圍是 1～10","顯示結果"],"rule":"p10_random10","mode":"copy","ref":"random","hints":["只要改 randint() 裡的範圍。","1 和 10 都有可能被抽到。","print() 顯示變數。"]},{"title":"② 複製幸運數字範例，再改變數名稱","prompt":"複製範例後，把變數 lucky 改成另一個英文名稱，仍然產生 1～10 的隨機整數並顯示。","demo":"import random\nlucky = random.randint(1, 10)\nprint(lucky)","starter":"# 可以先按「📋 複製範例」，再依任務修改\n","requirements":["import random","使用 random.randint(1, 10)","變數名稱前後一致","顯示結果"],"rule":"p10_random10","mode":"copy","ref":"random","hints":["變數改名時，print() 裡也要一起改。","範圍維持 1～10。","不要刪掉 import random。"]},{"title":"③ 自己輸入 1～10 隨機數","prompt":"這次不複製。自己寫出完整程式，產生 1～10 的隨機整數並顯示。","demo":"","starter":"# 自己輸入 import、randint 與 print\n","requirements":["import random","使用 random.randint(1, 10)","把結果存進變數","顯示結果"],"rule":"p10_random10","mode":"independent","ref":"random","hints":["第一行先載入 random。","再把 randint() 結果存進變數。","最後 print() 該變數。"]}]}];
const TOTAL_CHALLENGES=30;

const SAMPLE_SOLUTIONS={"p1_greeting": {"title": "自己的招呼語", "code": "print(\"嗨！準備一起學 Python！\")", "note": "print() 會把括號中的文字顯示出來。引號內可以換成自己的內容。"}, "p1_two_distinct": {"title": "旅行出發畫面", "code": "print(\"高雄港\")\nprint(\"搭船看夕陽\")", "note": "兩行資訊各用一次 print()，而且兩行內容不同。"}, "p2_one_input_var": {"title": "詢問城市並記住", "code": "city = input(\"最想去的城市：\")\nprint(city)", "note": "input() 的回答先存進變數 city，再用 print() 顯示變數。"}, "p2_two_inputs": {"title": "姓名與班級", "code": "name = input(\"姓名：\")\nclass_name = input(\"班級：\")\nprint(name, class_name)", "note": "兩次 input() 分別放進兩個不同變數，最後一起輸出。"}, "p2_three_inputs_print": {"title": "迷你旅行報名表", "code": "place = input(\"目的地：\")\ndays = input(\"旅行天數：\")\nactivity = input(\"最期待的活動：\")\nprint(place, days, activity)", "note": "三筆回答各自保存，最後的 print() 使用到三個變數。"}, "p3_multiply_int": {"title": "票價總額", "code": "price = int(input(\"單張票價：\"))\ncount = int(input(\"張數：\"))\ntotal = price * count\nprint(total)", "note": "input() 先用 int() 轉成整數，再用乘法算總額。"}, "p3_divmod": {"title": "平均分配", "code": "snacks = int(input(\"點心總數：\"))\npeople = int(input(\"人數：\"))\nprint(snacks // people)\nprint(snacks % people)", "note": "// 算完整分到幾個；% 算分完後剩下多少。"}, "p3_budget": {"title": "旅行預算", "code": "budget = int(input(\"總預算：\"))\ntraffic = int(input(\"交通費：\"))\nfood = int(input(\"餐費：\"))\nleft = budget - traffic - food\nprint(left)", "note": "把三筆金額轉成整數，再連續做兩次減法。"}, "p4_square": {"title": "正方形面積", "code": "side = float(input(\"正方形邊長：\"))\narea = side ** 2\nprint(round(area, 2))", "note": "** 2 表示平方；round(..., 2) 整理到小數第 2 位。"}, "p4_speed": {"title": "平均速度", "code": "distance = float(input(\"距離（公里）：\"))\ntime = float(input(\"時間（小時）：\"))\nspeed = distance / time\nprint(round(speed, 1))", "note": "平均速度＝距離 ÷ 時間，最後用 round(..., 1)。"}, "p5_pass": {"title": "是否達標", "code": "score = int(input(\"分數：\"))\nif score >= 60:\n    print(\"通過\")\nelse:\n    print(\"再挑戰\")", "note": "if 判斷 >= 60；沒有達到時走 else。"}, "p5_rain": {"title": "是否需要帶傘", "code": "rain = int(input(\"降雨機率：\"))\nif rain >= 50:\n    print(\"帶傘\")\nelse:\n    print(\"不用帶傘\")", "note": "以 50 為分界，條件成立與不成立各走一條路。"}, "p5_custom_threshold": {"title": "自訂門檻", "code": "battery = int(input(\"剩餘電量：\"))\nif battery >= 30:\n    print(\"電量足夠\")\nelse:\n    print(\"需要充電\")", "note": "這是一個可能的自訂情境；門檻與輸出內容可以有其他合理設計。"}, "p6_age3": {"title": "三種年齡分類", "code": "age = int(input(\"年齡：\"))\nif age < 6:\n    print(\"幼童\")\nelif age < 18:\n    print(\"學生\")\nelse:\n    print(\"成人\")", "note": "條件由小到大判斷；前面的條件沒成立才會進到 elif。"}, "p6_temp4": {"title": "四級天氣提醒", "code": "temp = int(input(\"氣溫：\"))\nif temp < 15:\n    print(\"偏冷\")\nelif temp < 25:\n    print(\"舒適\")\nelif temp < 32:\n    print(\"偏熱\")\nelse:\n    print(\"炎熱\")", "note": "四種結果使用 if + 2 個 elif + else。"}, "p7_and": {"title": "兩個條件都要成立", "code": "homework = int(input(\"作業完成（1/0）：\"))\nitems = int(input(\"用品帶齊（1/0）：\"))\nif homework == 1 and items == 1:\n    print(\"可以出發\")\nelse:\n    print(\"先完成準備\")", "note": "and 表示左右兩個條件都必須成立。"}, "p7_or": {"title": "其中一個成立即可", "code": "student_card = int(input(\"有學生證（1/0）：\"))\nactivity_card = int(input(\"有活動證（1/0）：\"))\nif student_card == 1 or activity_card == 1:\n    print(\"可以入場\")\nelse:\n    print(\"無法入場\")", "note": "or 表示左右條件只要其中一個成立即可。"}, "p8_1to5": {"title": "顯示 1～5", "code": "for n in range(1, 6):\n    print(n)", "note": "range(1, 6) 會產生 1、2、3、4、5；停止值 6 不包含。"}, "p8_countdown": {"title": "發車倒數", "code": "for n in range(5, 0, -1):\n    print(n)\nprint(\"出發！\")", "note": "第三個參數 -1 代表每次減 1；最後的 print() 不縮排。"}, "p8_even": {"title": "顯示偶數", "code": "for n in range(2, 11, 2):\n    print(n)", "note": "從 2 開始，每次增加 2，到 11 前停止。"}, "p9_count5": {"title": "while 數到 5", "code": "count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1", "note": "while 每一輪都要更新 count，才不會變成無限迴圈。"}, "p9_password": {"title": "密碼鎖", "code": "answer = 2468\nguess = 0\nwhile guess != answer:\n    guess = int(input(\"請輸入四位數密碼：\"))\nprint(\"解鎖！\")", "note": "只要 guess 還不等於答案就繼續詢問；答對後離開 while。"}, "p9_password_hint": {"title": "密碼高低提示", "code": "answer = 2468\nguess = 0\nwhile guess != answer:\n    guess = int(input(\"請輸入密碼：\"))\n    if guess > answer:\n        print(\"太大\")\n    elif guess < answer:\n        print(\"太小\")\nprint(\"解鎖！\")", "note": "while 負責重複，if / elif 負責提示目前猜得太大或太小。"}, "p10_random10": {"title": "1～10 隨機整數", "code": "import random\nnumber = random.randint(1, 10)\nprint(number)", "note": "randint(1, 10) 的 1 與 10 都有可能被抽到。"}, "p10_guess20": {"title": "1～20 猜數字", "code": "import random\nanswer = random.randint(1, 20)\nguess = 0\nwhile guess != answer:\n    guess = int(input(\"猜一個 1～20 的數字：\"))\n    if guess > answer:\n        print(\"太大\")\n    elif guess < answer:\n        print(\"太小\")\nprint(\"猜中了！\")", "note": "先產生答案，再用 while 重複猜；if / elif 提供大小提示。"}, "p10_boss": {"title": "完整猜數字遊戲", "code": "import random\nanswer = random.randint(1, 100)\nguess = 0\ncount = 0\nwhile guess != answer:\n    guess = int(input(\"猜一個 1～100 的數字：\"))\n    count = count + 1\n    if guess > answer:\n        print(\"太大\")\n    elif guess < answer:\n        print(\"太小\")\nprint(\"答對了！\")\nprint(\"你猜了\", count, \"次\")", "note": "計次變數從 0 開始，每猜一次就加 1；猜中後再顯示總次數。"}};

const KEY="course115_v3_progress", NAMEKEY="course115_v3_name";
const PROFILE_KEY="course115_student_profile_v6";
const FREE_DONE_KEY="course115_v3_free_done";
const SELECT_KEY="course115_v3_selected";
let state=JSON.parse(localStorage.getItem(KEY)||"{}"), engine="loading", hintN=0;
let freeDone=JSON.parse(localStorage.getItem(FREE_DONE_KEY)||"{}");
let selected=JSON.parse(localStorage.getItem(SELECT_KEY)||"null");
const $=s=>document.querySelector(s);
const stepsOf=l=>l.steps.length;
const challengeKey=(levelId,stepIndex)=>`${levelId}_${stepIndex}`;
function seedFreeDoneFromProgress(progress,target=freeDone){
  for(const l of LEVELS){
    const n=Math.max(0,Math.min(stepsOf(l),Number(progress?.[l.id]||0)));
    for(let j=0;j<n;j++)target[challengeKey(l.id,j)]=true;
  }
  return target;
}
function fillFlagsToStars(stars,target=freeDone){
  let need=Math.max(0,Math.min(TOTAL_CHALLENGES,Number(stars||0)));
  let have=Object.values(target).filter(Boolean).length;
  if(have>=need)return target;
  outer: for(const l of LEVELS){for(let j=0;j<stepsOf(l);j++){const k=challengeKey(l.id,j);if(!target[k]){target[k]=true;have++;if(have>=need)break outer;}}}
  return target;
}
function mergeFreeDone(a,b){const out={...(a||{})};Object.entries(b||{}).forEach(([k,v])=>{if(v)out[k]=true});return out;}
function isChallengeDone(levelId,stepIndex){return !!freeDone[challengeKey(levelId,stepIndex)];}
function done(id){const l=LEVELS.find(x=>x.id===id);if(!l)return 0;return l.steps.reduce((n,_,j)=>n+(isChallengeDone(id,j)?1:0),0);}
const total=()=>LEVELS.reduce((n,l)=>n+done(l.id),0);
seedFreeDoneFromProgress(state,freeDone);
localStorage.setItem(FREE_DONE_KEY,JSON.stringify(freeDone));
function firstIncomplete(){for(let i=0;i<LEVELS.length;i++){for(let j=0;j<stepsOf(LEVELS[i]);j++){if(!isChallengeDone(LEVELS[i].id,j))return {i,j};}}return {i:0,j:0};}
function validSelection(p){return p&&Number.isInteger(p.i)&&Number.isInteger(p.j)&&p.i>=0&&p.i<LEVELS.length&&p.j>=0&&p.j<stepsOf(LEVELS[p.i]);}
if(!validSelection(selected))selected=firstIncomplete();
function setSelected(i,j){
  selected={i:Number(i),j:Number(j)};
  localStorage.setItem(SELECT_KEY,JSON.stringify(selected));
  render();
  requestAnimationFrame(()=>{
    const mission=document.getElementById("mission");
    if(mission){
      mission.scrollIntoView({behavior:"smooth",block:"start"});
      mission.classList.remove("missionFlash");
      void mission.offsetWidth;
      mission.classList.add("missionFlash");
    }
  });
}
function pos(){return validSelection(selected)?selected:firstIncomplete();}

function nextIncompleteAfter(levelIndex,stepIndex){
  const all=[];
  LEVELS.forEach((level,i)=>{
    level.steps.forEach((step,j)=>all.push({i,j,level,step}));
  });
  const current=all.findIndex(x=>x.i===levelIndex&&x.j===stepIndex);
  if(current<0)return firstIncomplete();
  for(let k=current+1;k<all.length;k++){
    const x=all[k];
    if(!isChallengeDone(x.level.id,x.j))return {i:x.i,j:x.j};
  }
  for(let k=0;k<current;k++){
    const x=all[k];
    if(!isChallengeDone(x.level.id,x.j))return {i:x.i,j:x.j};
  }
  return null;
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
function rebuildProgressCounts(){const out={};for(const l of LEVELS)out[l.id]=done(l.id);state=out;localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem(FREE_DONE_KEY,JSON.stringify(freeDone));}
function save(){rebuildProgressCounts();syncCourse116HubProgress();syncCloudProgress();}
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
function inputPromptLiterals(code){
  const out=[];
  const rx=/input\s*\(\s*["']([^"']*)["']\s*\)/g;
  let m;
  while((m=rx.exec(String(code||"")))!==null){
    out.push(String(m[1]||"").trim());
  }
  return out;
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

// v16.20：文字只擋「非常明顯的亂碼」，不猜測語意。
// 高雄、義大、看風景、吃拉麵、jim、902 等合理內容都允許。
function looksLikeUsableText(value){
  const t=String(value??"").trim();
  if(t.length<2)return false;
  const compact=t.replace(/\s+/g,"");
  // ddddd / aaaaa / 11111 這種明顯重複填塞才擋。
  if(/^([A-Za-z0-9])\1{2,}$/.test(compact))return false;
  return true;
}
function meaningfulPrompt(value){
  return looksLikeUsableText(value);
}

function semanticValidate(rule,interactions){
  // v16.19：內容語意不再額外攔截。
  // 題目必要條件由 validate() 檢查；只要 Python 能正常執行即可進入過關判定。
  // 避免像「高雄／看風景」這類合理文字被錯誤阻擋。
  return ok();
}

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
      if(!looksLikeUsableText(place))
        return fail("第一行請輸入至少 2 個字的內容，不要使用 ddddd、aaaaa 這類明顯亂碼。");
      if(!looksLikeUsableText(activity))
        return fail("第二行請輸入至少 2 個字的內容，不要使用 ddddd、aaaaa 這類明顯亂碼。");
      if(place===activity)
        return fail("地點和活動不能完全一樣，請讓兩行內容不同。");
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



function feedbackExample(rule,msg=""){
  const examples={
    p1_greeting:{
      title:"print() 的正確概念範例",
      code:'print("今天一起加油！")',
      note:"print() 的括號裡放要顯示的文字；文字要放在引號中。"
    },
    p1_two_distinct:{
      title:"兩行不同內容的範例",
      code:'print("圖書館")\nprint("看漫畫")',
      note:"題目要兩行時，可以用兩次 print()；兩行內容要不同。"
    },
    p2_one_input_var:{
      title:"input() 存進變數的範例",
      code:'drink = input("你想喝什麼？")\nprint(drink)',
      note:"input() 的回答先存進變數，後面才能再次使用。"
    },
    p2_two_inputs:{
      title:"兩筆資料用兩個變數",
      code:'color = input("喜歡的顏色：")\nanimal = input("喜歡的動物：")\nprint(color, animal)',
      note:"不同資料放進不同變數，才不會互相覆蓋。"
    },
    p2_three_inputs_print:{
      title:"三筆資料分開保存",
      code:'food = input("食物：")\ndrink = input("飲料：")\nplace = input("用餐地點：")\nprint(food, drink, place)',
      note:"三次 input() 分別放入三個變數，輸出時再使用這三個變數。"
    },
    p3_multiply_int:{
      title:"整數輸入＋乘法範例",
      code:'price = int(input("鉛筆單價："))\ncount = int(input("買幾枝："))\ntotal = price * count\nprint(total)',
      note:"input() 得到文字；要做整數乘法時先用 int()。"
    },
    p3_divmod:{
      title:"整除與餘數範例",
      code:'balls = int(input("球的總數："))\nbox = int(input("每盒幾顆："))\nprint(balls // box)\nprint(balls % box)',
      note:"// 看完整分成幾份，% 看最後剩多少。"
    },
    p3_budget:{
      title:"連續減法範例",
      code:'money = int(input("原有金額："))\nbook = int(input("書本花費："))\npen = int(input("文具花費："))\nleft = money - book - pen\nprint(left)',
      note:"先保存各筆數字，再依問題建立算式。"
    },
    p4_square:{
      title:"小數、平方與 round() 範例",
      code:'side = float(input("邊長："))\narea = side ** 2\nprint(round(area, 2))',
      note:"float() 處理小數，** 2 是平方，round(..., 2) 整理到小數第 2 位。"
    },
    p4_speed:{
      title:"小數除法範例",
      code:'pages = float(input("閱讀頁數："))\nhours = float(input("花費小時："))\nrate = pages / hours\nprint(round(rate, 1))',
      note:"先做除法，再把結果交給 round()。"
    },
    p5_pass:{
      title:"if / else 兩條路的範例",
      code:'age = int(input("年齡："))\nif age >= 18:\n    print("成年")\nelse:\n    print("未成年")',
      note:"if 判斷條件；成立走第一條路，不成立走 else。"
    },
    p5_rain:{
      title:"門檻判斷範例",
      code:'battery = int(input("電量："))\nif battery >= 20:\n    print("可以繼續使用")\nelse:\n    print("需要充電")',
      note:"先決定分界值，再讓 if / else 顯示兩種不同結果。"
    },
    p5_custom_threshold:{
      title:"自訂門檻範例",
      code:'books = int(input("讀完幾本書："))\nif books >= 5:\n    print("達成目標")\nelse:\n    print("繼續努力")',
      note:"情境可以自己設計，但一定要有數值輸入、比較條件與兩種結果。"
    },
    p6_age3:{
      title:"三種分類範例",
      code:'score = int(input("分數："))\nif score < 60:\n    print("未通過")\nelif score < 80:\n    print("通過")\nelse:\n    print("表現很好")',
      note:"三種結果可用 if / elif / else；條件順序會影響分類。"
    },
    p6_temp4:{
      title:"四種分類範例",
      code:'level = int(input("等級："))\nif level < 10:\n    print("初級")\nelif level < 20:\n    print("中級")\nelif level < 30:\n    print("進階")\nelse:\n    print("高手")',
      note:"四種結果通常需要 if + 2 個 elif + else。"
    },
    p7_and:{
      title:"and 的範例",
      code:'homework = 1\nbag = 1\nif homework == 1 and bag == 1:\n    print("準備完成")\nelse:\n    print("還要準備")',
      note:"and 代表左右兩個條件都要成立。"
    },
    p7_or:{
      title:"or 的範例",
      code:'bus_card = 0\ncash = 1\nif bus_card == 1 or cash == 1:\n    print("可以搭車")\nelse:\n    print("目前不能搭車")',
      note:"or 代表至少一個條件成立即可。"
    },
    p8_1to5:{
      title:"for + range() 範例",
      code:'for n in range(2, 6):\n    print(n)',
      note:"range(開始, 停止前) 不包含停止值；這個例子會顯示 2、3、4、5。"
    },
    p8_countdown:{
      title:"負步進倒數範例",
      code:'for n in range(3, 0, -1):\n    print(n)\nprint("完成！")',
      note:"倒數時第三個參數用負數；迴圈外的訊息只出現一次。"
    },
    p8_even:{
      title:"固定步進範例",
      code:'for n in range(3, 13, 3):\n    print(n)',
      note:"第三個參數是步進；這個例子每次增加 3。"
    },
    p9_count5:{
      title:"while 計數範例",
      code:'count = 1\nwhile count <= 3:\n    print(count)\n    count = count + 1',
      note:"while 裡一定要讓計數變數改變，否則可能永遠停不下來。"
    },
    p9_password:{
      title:"while 重複詢問範例",
      code:'answer = 7\nguess = 0\nwhile guess != answer:\n    guess = int(input("猜數字："))\nprint("答對")',
      note:"只要條件仍成立就繼續；每一輪都要更新 guess。"
    },
    p9_password_hint:{
      title:"while 裡加入 if 的範例",
      code:'answer = 7\nguess = 0\nwhile guess != answer:\n    guess = int(input("猜數字："))\n    if guess > answer:\n        print("太大")\n    elif guess < answer:\n        print("太小")\nprint("答對")',
      note:"while 負責重複，if / elif 負責每一輪的判斷。"
    },
    p10_random:{
      title:"隨機數範例",
      code:'import random\nnumber = random.randint(1, 6)\nprint(number)',
      note:"先 import random，再用 randint(最小值, 最大值) 產生整數。"
    },
    p10_guess:{
      title:"猜數字邏輯範例",
      code:'answer = 5\nguess = 0\nwhile guess != answer:\n    guess = int(input("猜 1～9："))\n    if guess > answer:\n        print("太大")\n    elif guess < answer:\n        print("太小")\nprint("答對")',
      note:"答案放在迴圈外，while 重複輸入，if / elif 提供提示。"
    },
    p10_boss:{
      title:"計次變數範例",
      code:'count = 0\nfor i in range(3):\n    count += 1\nprint("共執行", count, "次")',
      note:"計次變數通常從 0 開始，每完成一次就 +1，最後再顯示。"
    }
  };

  let ex=examples[rule];
  if(ex) return ex;

  if(/int|整數|數字轉換/.test(msg)){
    return {title:"數字轉換範例",code:'age = int(input("年齡："))\nprint(age + 1)',note:"input() 是文字；要做整數計算時先用 int()。"};
  }
  if(/float|小數/.test(msg)){
    return {title:"小數轉換範例",code:'height = float(input("身高："))\nprint(height)',note:"可能有小數的輸入可使用 float()。"};
  }
  if(/if|else|elif|分支|條件/.test(msg)){
    return {title:"條件判斷範例",code:'number = 8\nif number >= 5:\n    print("較大")\nelse:\n    print("較小")',note:"冒號下一行要縮排，讓 Python 知道哪幾行屬於這個分支。"};
  }
  if(/while|迴圈/.test(msg)){
    return {title:"while 範例",code:'n = 1\nwhile n <= 3:\n    print(n)\n    n += 1',note:"while 裡要更新會影響條件的變數。"};
  }
  if(/for|range/.test(msg)){
    return {title:"for / range 範例",code:'for n in range(1, 4):\n    print(n)',note:"range 的停止值不包含在內。"};
  }
  if(/input|變數/.test(msg)){
    return {title:"input 與變數範例",code:'food = input("喜歡的食物：")\nprint(food)',note:"把 input() 的回答存進變數，再使用變數。"};
  }
  return {title:"參考寫法",code:'message = "先把問題拆成小步驟"\nprint(message)',note:"先完成一個小步驟，再逐步加入下一個功能。"};
}

function exampleHTML(ex){
  if(!ex) return "";
  return `<details class="correctExample" open>
    <summary>✅ 看一個不同情境的正確範例</summary>
    <div class="exampleTitle">${esc(ex.title||"正確概念範例")}</div>
    <pre><code>${esc(ex.code||"")}</code></pre>
    <div class="exampleNote">💡 ${esc(ex.note||"請觀察寫法，再回到自己的題目修改。")}</div>
    <small>這不是本題答案，請理解後再自己完成。</small>
  </details>`;
}

const PY_RESERVED=new Set([
"False","None","True","and","as","assert","async","await","break","class","continue","def","del",
"elif","else","except","finally","for","from","global","if","import","in","is","lambda","nonlocal",
"not","or","pass","raise","return","try","while","with","yield"
]);

function debugCoachBase(err, code){
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


function debugCoach(err, code){
  const info=debugCoachBase(err,code);
  const raw=String(err||"");
  let example=null;

  if(/IndentationError|unexpected indent|expected an indented block/i.test(raw)){
    example={
      title:"縮排正確範例",
      code:'score = 70\nif score >= 60:\n    print("通過")\nelse:\n    print("再試一次")',
      note:"if / else 下一行要縮排，而且同一區塊的縮排要一致。"
    };
  }else if(/NameError/i.test(raw)){
    example={
      title:"先建立變數，再使用",
      code:'city = "台南"\nprint(city)',
      note:"變數第一次使用前要先有值，而且前後拼字必須相同。"
    };
  }else if(/ValueError.*invalid literal for int/i.test(raw)){
    example={
      title:"int() 正確輸入範例",
      code:'age = int(input("請輸入整數年齡："))\nprint(age + 1)',
      note:"執行時可輸入 15；若輸入「十五」或 15.5，int() 會無法直接轉換。"
    };
  }else if(/TypeError/i.test(raw)){
    example={
      title:"先轉型再計算",
      code:'count = int(input("數量："))\nprint(count + 2)',
      note:"input() 得到字串；數字運算前要依需要轉成 int() 或 float()。"
    };
  }else if(/SyntaxError/i.test(raw)){
    example={
      title:"完整語法範例",
      code:'name = input("名字：")\nif name == "小明":\n    print("你好")',
      note:"檢查引號、括號、冒號是否完整成對。"
    };
  }else if(/timeout|timed out|時間|too long/i.test(raw)){
    example={
      title:"會停止的 while 範例",
      code:'n = 1\nwhile n <= 3:\n    print(n)\n    n = n + 1',
      note:"每一輪都更新 n，所以條件最後會變成 False，迴圈就會停止。"
    };
  }else{
    example={
      title:"先拆成小步驟",
      code:'value = 3\nprint(value)',
      note:"先確認最小版本能執行，再逐步加入 input、運算、判斷或迴圈。"
    };
  }

  return {...info,example};
}

function coachHTML(info){
  return `<div class="debugCoach">
    <b>${esc(info.title)}</b>
    <div class="debugRow"><strong>📍 哪裡：</strong>${esc(info.where)}</div>
    <div class="debugRow"><strong>🤔 原因：</strong>${esc(info.why)}</div>
    <div class="debugRow"><strong>➡️ 下一步：</strong>${esc(info.next)}</div>
    ${exampleHTML(info.example)}
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

function identityLocked(){
  return !!(window.CourseDB && CourseDB.state==="ready" && !CourseDB.isAnonymous());
}

function updateProfileStrip(){
  const p=getStudentProfile();
  const el=document.getElementById("studentProfileText");
  if(!el)return;
  el.textContent=profileIsValid(p)
    ?`班級 ${p.className}　｜　座號 ${p.seatNo}　｜　姓名 ${p.name}`
    :"尚未設定";

  const editBtn=document.getElementById("editProfileBtn");
  if(editBtn){
    if(identityLocked()){
      editBtn.textContent="🔒 身分由教師管理";
      editBtn.title="學習帳號建立後，班級、座號與姓名只能由教師端更正。";
    }else{
      editBtn.textContent="修改";
      editBtn.title="";
    }
  }
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
      ?"為避免關機還原後遺失進度，請先建立或登入學習帳號。舊版從未設定密碼的學生，請由老師使用「🔑 舊帳號救援」。"
      :"設定學習密碼後，以後重新登入會從雲端取回正式進度。舊版無密碼帳號可請老師救援。";
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

  if(remote?.progress){state=mergeProgress(localProgress,remote.progress);}else{state=localProgress;}
  freeDone=seedFreeDoneFromProgress(state,freeDone);
  if(remote?.challengeDone)freeDone=mergeFreeDone(freeDone,remote.challengeDone);
  fillFlagsToStars(Math.max(localStars,Number(remote?.stars||0)),freeDone);
  rebuildProgressCounts();

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
    await CourseDB.saveStudent(p);
    await adoptRemoteAndLocalProgress();
    updateAccountButton();
    updateProfileStrip();
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
    await CourseDB.saveStudent(p);
    state=localSnapshot;
    await adoptRemoteAndLocalProgress();
    updateAccountButton();
    updateProfileStrip();
    document.getElementById("accountDialog").close();
    updateCloudStatus("☁️ 已登入學習帳號，進度已合併","ok");
    await enforceTemporaryPasswordChange();
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
  const locked=identityLocked();

  const classInput=document.getElementById("profileClass");
  const seatInput=document.getElementById("profileSeatNo");
  const nameInput=document.getElementById("profileName");
  const saveBtn=document.getElementById("saveProfileBtn");
  const err=document.getElementById("profileError");

  classInput.value=p.className||"";
  seatInput.value=p.seatNo||"";
  nameInput.value=p.name||"";

  classInput.disabled=locked;
  seatInput.disabled=locked;
  nameInput.disabled=locked;

  if(saveBtn){
    saveBtn.disabled=locked;
    saveBtn.style.display=locked?"none":"";
  }

  if(err){
    err.textContent=locked
      ?"🔒 學習帳號已建立。班級、座號與姓名已鎖定；若資料有誤，請由教師端「更正學生資料」。"
      :"";
  }
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
  if(!profileIsValid(profile))return false;
  if(!window.CourseDB){updateCloudStatus("💾 僅儲存在本機","error");return false;}
  try{
    await CourseDB.ready;
    if(!CourseDB.configured||CourseDB.state!=="ready"){
      updateCloudStatus("⚠️ 資料庫尚未連線","error");return false;
    }
    if(CourseDB.isAnonymous()){
      updateCloudStatus("🔐 請建立／登入學習帳號","error");
      ensureStableStudentAccount();
      return false;
    }
    updateCloudStatus("☁️ 同步中…","syncing");
    const stars=Object.values(state).reduce((a,b)=>a+Number(b||0),0);
    await CourseDB.saveStudent({
      ...profile,
      courseId:"python",
      progress:{...state},
      challengeDone:{...freeDone},
      stars,
      totalStars:TOTAL_CHALLENGES,
      score:Math.round(stars/TOTAL_CHALLENGES*100),
      completed:stars>=TOTAL_CHALLENGES,
      certificateUnlocked:stars>=TOTAL_CHALLENGES,
      currentStation:stars>=TOTAL_CHALLENGES?"完成":LEVELS[Math.min(pos().i,LEVELS.length-1)]?.title||"",
      currentChallenge:stars>=TOTAL_CHALLENGES?0:pos().j+1
    });
    updateCloudStatus("☁️ 已同步教師資料庫","ok");
    return true;
  }catch(e){
    updateCloudStatus("⚠️ 同步失敗，進度目前只在本機","error");
    return false;
  }
}
async function saveStudentProfile(){
  if(identityLocked()){
    const err=document.getElementById("profileError");
    if(err)err.textContent="🔒 班級、座號與姓名只能由教師端更正。";
    return;
  }
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


async function enforceTemporaryPasswordChange(){
  try{
    if(!window.CourseDB)return;
    await CourseDB.ready;
    if(CourseDB.state!=="ready"||CourseDB.isAnonymous())return;
    const remote=await CourseDB.loadStudent();
    if(remote?.mustChangePassword){
      const dlg=document.getElementById("forcePasswordDialog");
      if(dlg&&!dlg.open)dlg.showModal();
    }
  }catch(e){
    console.warn("temporary password check failed",e);
  }
}

async function saveForcedPasswordChange(){
  const p1=document.getElementById("forceNewPassword").value;
  const p2=document.getElementById("forceNewPassword2").value;
  const err=document.getElementById("forcePasswordError");
  err.textContent="";

  if(p1.length<6){
    err.textContent="新密碼至少需要 6 個字元。";
    return;
  }
  if(p1!==p2){
    err.textContent="兩次輸入的密碼不一致。";
    return;
  }

  const btn=document.getElementById("forcePasswordSaveBtn");
  btn.disabled=true;
  btn.textContent="儲存中…";
  try{
    await CourseDB.changeOwnPassword(p1);
    document.getElementById("forceNewPassword").value="";
    document.getElementById("forceNewPassword2").value="";
    document.getElementById("forcePasswordDialog").close();
    alert("✅ 新密碼設定完成，請記住這組密碼。");
  }catch(e){
    err.textContent="修改失敗："+(e?.message||String(e));
  }finally{
    btn.disabled=false;
    btn.textContent="✅ 儲存新密碼並繼續";
  }
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
      if(remote.progress){state=mergeProgress(state,remote.progress);}
      freeDone=seedFreeDoneFromProgress(state,freeDone);
      if(remote.challengeDone)freeDone=mergeFreeDone(freeDone,remote.challengeDone);
      fillFlagsToStars(Number(remote.stars||0),freeDone);
      rebuildProgressCounts();
      render();
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
    await enforceTemporaryPasswordChange();
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


function flattenedChallenges(){
  const out=[];
  LEVELS.forEach((level,levelIndex)=>{
    level.steps.forEach((step,stepIndex)=>{
      out.push({level,levelIndex,step,stepIndex});
    });
  });
  return out;
}
function currentFlatIndex(){
  const p=pos();
  if(p.i>=LEVELS.length)return TOTAL_CHALLENGES;
  let n=0;
  for(let i=0;i<p.i;i++)n+=stepsOf(LEVELS[i]);
  return n+p.j;
}
function previousChallengeInfo(){const all=flattenedChallenges();const idx=currentFlatIndex()-1;if(idx<0)return null;const item=all[idx];return isChallengeDone(item.level.id,item.stepIndex)?item:null;}
function openPreviousExample(){
  const item=previousChallengeInfo();
  if(!item)return;
  const ex=SAMPLE_SOLUTIONS[item.step.rule];
  if(!ex)return;

  document.getElementById("prevExampleTitle").textContent=
    `${item.level.title}・挑戰 ${item.stepIndex+1}/${stepsOf(item.level)}｜${item.step.title}`;
  document.getElementById("prevExampleTask").innerHTML=
    `<b>🎯 題目</b><br>${item.step.prompt}`;
  document.getElementById("prevExampleRequirements").innerHTML=
    `<b>✅ 任務完成條件</b><ul>${item.step.requirements.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  document.getElementById("prevExampleCode").textContent=ex.code;
  document.getElementById("prevExampleNote").innerHTML=
    `<b>🧠 為什麼這樣寫</b><br>${esc(ex.note)}<br><small>這是參考解法，不是唯一答案。</small>`;
  document.getElementById("prevExampleDialog").showModal();
}

function render(){
  const p=pos();
  const l=LEVELS[p.i];
  const step=l.steps[p.j];
  $("#stars").textContent=total();
  $("#place").innerHTML=`🧭 <b>自由選關</b>｜${l.title}・第 ${p.j+1} 題｜${isChallengeDone(l.id,p.j)?"⭐ 已闖關成功":"○ 尚未完成"}｜⭐ ${total()}/${TOTAL_CHALLENGES}`;

  $("#map").innerHTML=LEVELS.map((level,i)=>`
    <div class="freeStation ${i===p.i?"currentStation":""}">
      <div class="freeStationTitle"><span>${level.icon} P${i+1}</span><small>⭐ ${done(level.id)}/3</small></div>
      <div class="freeChallengeRow">
        ${level.steps.map((st,j)=>{
          const complete=isChallengeDone(level.id,j);
          const active=i===p.i&&j===p.j;
          return `<button type="button" class="freeChallengeBtn ${complete?"done":""} ${active?"active":""}" data-level="${i}" data-step="${j}" title="${esc(st.title)}" aria-label="進入 P${i+1} 第 ${j+1} 題">${complete?"⭐":j+1}</button>`;
        }).join("")}
      </div>
    </div>`).join("");
  document.querySelectorAll('.freeChallengeBtn').forEach(btn=>{
    btn.onclick=()=>setSelected(Number(btn.dataset.level),Number(btn.dataset.step));
  });

  hintN=0;
  const demo=step.mode==="copy" && step.demo
    ? `<div class="demoLabel">👀 先看懂，再複製修改</div><pre class="demo">${esc(step.demo)}</pre><button id="copyDemoBtn" class="copyDemo" type="button">📋 複製範例到編輯區</button><div class="demoNote">前兩題可以複製。複製後一定要依「🎯 任務」修改；完全不改不能過關。</div>`
    : "";
  const label=step.mode==="copy"?"先複製、再修改":"第 3 題：自己輸入，不提供可複製程式";
  const criteria=`<div class="criteria"><b>✅ 任務完成條件</b><ul>${step.requirements.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;

  $("#mission").innerHTML=`<article class="card missionCard">
    <div class="head"><div class="ico">${l.icon}</div><div><small>${l.title}・第 ${p.j+1}/3 題</small><h1>${step.title}</h1><div>${l.concept}</div><div class="challengeCurrentState">${isChallengeDone(l.id,p.j)?"⭐ 這一題已闖關成功，可以再練一次。":"○ 這一題尚未完成。"}</div></div></div>

    <section class="missionTaskSection">
      <div class="sectionTitle taskTitle">🎯 今天的任務</div>
      <div class="task taskFocus">${step.prompt}</div>
      ${criteria}
    </section>

    <section class="supportSection">
      <div class="sectionTitle supportTitle">💡 找線索與學習工具</div>
      <div class="scratch"><b>${l.scratch}</b></div>
      <div class="actions supportActions">
        <button id="hintBtn" class="help">💡 我需要線索</button>
        <button id="varBtn" class="translate">🌐 變數英文小幫手</button>
        <a class="book" href="python-topics.html#${l.id}" target="_blank">📖 我想先弄懂觀念</a>
        <a class="book" href="python-guide.html#${step.ref}" target="_blank">📘 我只想查寫法</a>
        <button id="completedExamplesBtn" class="book" type="button">📚 已完成範例回顧</button>
        ${previousChallengeInfo()?`<button id="prevExampleBtn" class="book" type="button">⬅️ 前一關範例解答</button>`:""}
      </div>
      <div id="hint" class="hintArea"></div>
    </section>

    <section class="practiceSection">
      <div class="sectionTitle practiceTitle">⌨️ 動手寫程式</div>
      ${demo}
      <div class="editorLabel">${label}</div>
      <textarea id="code" class="editor" spellcheck="false">${esc(step.starter)}</textarea>
      <div class="actions primaryActions"><button id="tryRun" class="run tryRun" ${engine==="loading"?"disabled":""}>${engine==="ready"?"▶ 執行看看":"⏳ Python 準備中…"}</button><button id="checkChallenge" class="checkChallenge" ${engine==="loading"?"disabled":""}>✅ 檢查挑戰</button></div>
      <div class="runNote">「執行看看」只看自己的程式結果，不會判定闖關；覺得完成後再按「檢查挑戰」。</div>
      <div class="consoleLabel">🖥️ 執行結果</div>
      <pre id="out" class="output">按「▶ 執行看看」看看你的程式會輸出什麼。</pre>
      <div id="runInputArea" class="runInputArea" aria-live="polite"></div>
      <div class="consoleActions"><button id="clearOutput" type="button" class="clearOutput">🧹 清除結果</button></div>
      <div id="fb"></div>
    </section>
  </article>`;

  $("#tryRun").onclick=()=>tryRunOnly();
  $("#checkChallenge").onclick=()=>checkChallenge(l,p.j,step);
  if($("#copyDemoBtn")) $("#copyDemoBtn").onclick=()=>{$("#code").value=step.demo;$("#code").focus();$("#fb").innerHTML=`<div class="feedback runOnly">📋 已複製範例。現在請依題目修改後再檢查。</div>`;};
  $("#completedExamplesBtn").onclick=openCompletedExamples;
  if($("#prevExampleBtn")) $("#prevExampleBtn").onclick=openPreviousExample;
  $("#clearOutput").onclick=()=>{$("#out").textContent="執行結果已清除。";$("#runInputArea").innerHTML="";$("#fb").innerHTML="";};
  $("#hintBtn").onclick=()=>showHint(step);
  $("#varBtn").onclick=openVarHelper;
}
function showHint(step){
  hintN=Math.min(hintN+1,step.hints.length);
  $("#hint").innerHTML=`<div class="hint"><b>💡 線索 ${hintN}/${step.hints.length}</b><br>${step.hints[hintN-1]}${hintN<step.hints.length?"<br><small>還需要時，可以再按一次。</small>":""}</div>`;
}

function askInlineInput(promptText,partialText,isChecking=false){
  return new Promise(resolve=>{
    const area=document.getElementById("runInputArea");
    const out=document.getElementById("out");
    if(out && partialText) out.textContent=partialText;
    if(!area){
      const v=window.prompt(promptText||"請輸入資料：");
      resolve(v===null?null:String(v));
      return;
    }
    area.innerHTML=`
      <div class="inlineInputCard">
        <div class="inlineInputPrompt">⌨️ ${esc(promptText||"請輸入資料：")}</div>
        <div class="inlineInputRow">
          <input id="inlineInputValue" class="inlineInputValue" type="text" autocomplete="off" placeholder="在這裡輸入後按 Enter">
          <button id="inlineInputSubmit" type="button" class="inlineInputSubmit">送出</button>
          <button id="inlineInputCancel" type="button" class="inlineInputCancel">取消</button>
        </div>
        <div class="inlineInputNote">${isChecking?"這是正式檢查時程式要求的輸入。":"這是你的程式正在等待 input() 資料。"}</div>
      </div>`;
    const input=document.getElementById("inlineInputValue");
    const submit=document.getElementById("inlineInputSubmit");
    const cancel=document.getElementById("inlineInputCancel");
    let finished=false;
    const finish=value=>{ if(finished)return; finished=true; area.innerHTML=""; resolve(value); };
    submit.onclick=()=>finish(input.value);
    cancel.onclick=()=>finish(null);
    input.addEventListener("keydown",e=>{
      if(e.key==="Enter"){e.preventDefault();finish(input.value)}
      if(e.key==="Escape"){e.preventDefault();finish(null)}
    });
    setTimeout(()=>input.focus(),0);
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
    const msg=String(e?.message||"");
    const looksInternal=/is not defined|Cannot read|undefined|not a function|ReferenceError/i.test(msg);
    if(looksInternal){
      console.error("[course116 v16.26 internal]",e);
      o.textContent="⚠️ 網站檢查暫時發生問題。";
      f.innerHTML='<div class="feedback wait">這不是你的 Python 程式錯誤。請重新整理後再試；如果仍出現，請告訴老師。</div>';
    }else{
      const info=debugCoach(msg,c);
      o.textContent="程式目前還不能正常執行。";
      f.innerHTML=coachHTML(info);
    }
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
    if(s.mode==="copy" && s.demo){
      const normalize=x=>String(x||"").replace(/\s+/g,"").trim();
      if(normalize(c)===normalize(s.demo)){
        f.innerHTML=`<div class="feedback wait">✏️ <b>你已經成功複製範例，但還沒有修改。</b><br><small>請依「🎯 任務」至少改一個必要部分，再按檢查挑戰。</small></div>`;
        return;
      }
    }
    let check=validate(c,s);
    if(!check.ok){
      const ex=feedbackExample(s.rule,check.msg);
      f.innerHTML=`<div class="feedback wait">🔎 <b>目前問題：</b>${esc(check.msg)}
        <br><small>先修正這一點，再按「執行看看」測試。</small>
        ${exampleHTML(ex)}
      </div>`;
      return;
    }

    const result=await executeInteractive(c,true);
    o.textContent=result.text||"程式執行完成，但目前沒有輸出內容。";

    // v16.26：先完成本機過關，再做同步；同步失敗不能阻擋學生過關。
    freeDone[challengeKey(l.id,j)]=true;
    rebuildProgressCounts();
    try{ syncCourse116HubProgress(); }catch(syncErr){ console.warn("course116 sync skipped",syncErr); }
    try{ Promise.resolve(syncCloudProgress()).catch(syncErr=>console.warn("firebase sync skipped",syncErr)); }
    catch(syncErr){ console.warn("firebase sync skipped",syncErr); }
    let stationDone=done(l.id)>=stepsOf(l);
    let allDone=total()>=TOTAL_CHALLENGES;
    const currentLevelIndex=LEVELS.findIndex(x=>x.id===l.id);
    const nextTarget=allDone?null:nextIncompleteAfter(currentLevelIndex,j);
    reward(stationDone,allDone,nextTarget);
  }catch(e){
    showRunError(e,c,o,f);
  }finally{
    b.disabled=engine==="loading";
    runBtn.disabled=engine==="loading";
    b.textContent="✅ 檢查挑戰";
  }
}
function reward(stationDone,allDone,nextTarget){
  const starCount=total();
  $("#rewardBody").innerHTML=`<div class="pop">${allDone?"🏆":stationDone?"🎁":"⭐"}</div>
  <h2>${allDone?"全部完成！":stationDone?"這一站完成！":"挑戰成功！"}</h2>
  <p>${allDone
    ?`🎉 你已收集全部 ${TOTAL_CHALLENGES} 顆星！`
    :stationDone
      ?`🌟 很棒！這一站 3 題都完成了，目前共有 ${starCount}/${TOTAL_CHALLENGES} 顆星。`
      :`⭐ 成功！目前共有 ${starCount}/${TOTAL_CHALLENGES} 顆星。`}</p>
  <button id="next">${allDone?"🏅 領取證書":"下一題 →"}</button>`;
  $("#reward").showModal();
  $("#next").onclick=()=>{
    $("#reward").close();
    if(allDone){
      render();
      openCert();
      return;
    }
    if(nextTarget){
      setSelected(nextTarget.i,nextTarget.j);
    }else{
      render();
    }
  };
}


function completedItemsForReview(){
  const out=[];
  LEVELS.forEach((level,levelIndex)=>{for(let stepIndex=0;stepIndex<stepsOf(level);stepIndex++){if(isChallengeDone(level.id,stepIndex))out.push({level,levelIndex,step:level.steps[stepIndex],stepIndex});}});
  return out;
}
function openCompletedExamples(){
  const items=completedItemsForReview();
  const list=document.getElementById("completedExampleList");
  if(!items.length){
    list.innerHTML='<div class="reviewEmpty">目前還沒有已完成的挑戰。</div>';
    document.getElementById("completedExampleDetail").innerHTML='<div class="reviewWelcome">完成第一題後，就可以回來看正確參考範例。</div>';
  }else{
    list.innerHTML=items.map((x,i)=>`<button class="reviewItem" type="button" data-example-i="${i}">
      <span>✅</span><span><b>${esc(x.level.title)}</b><small>挑戰 ${x.stepIndex+1}/3｜${esc(x.step.title)}</small></span>
      <span class="reviewState">查看範例</span>
    </button>`).join("");
    list.querySelectorAll("[data-example-i]").forEach(btn=>{
      btn.onclick=()=>showCompletedExample(items[Number(btn.dataset.exampleI)]);
    });
    document.getElementById("completedExampleDetail").innerHTML='<div class="reviewWelcome">👈 選一個已完成的挑戰，就會直接顯示正確參考答案。</div>';
  }
  document.getElementById("completedExamplesDialog").showModal();
}
function showCompletedExample(item){
  const ex=feedbackExample(item.step.rule,"");
  const code=String(ex.code||"");
  document.getElementById("completedExampleDetail").innerHTML=`
    <div class="answerOnlyBox">
      <div class="answerOnlyTitle">✅ 正確參考答案</div>
      <pre class="savedAnswerCode"><code id="completedAnswerCode">${esc(code)}</code></pre>
      <button id="copyCompletedAnswerBtn" class="copyDemo" type="button">📋 複製答案</button>
      <div id="copyCompletedAnswerStatus" class="copyAnswerStatus"></div>
    </div>
  `;
  document.getElementById("copyCompletedAnswerBtn").onclick=async()=>{
    try{
      await navigator.clipboard.writeText(code);
      document.getElementById("copyCompletedAnswerStatus").textContent="✅ 已複製，可以貼到編輯區參考。";
    }catch(e){
      const range=document.createRange();
      const el=document.getElementById("completedAnswerCode");
      range.selectNodeContents(el);
      const sel=window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.getElementById("copyCompletedAnswerStatus").textContent="請按 Ctrl+C 複製已選取的答案。";
    }
  };
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
