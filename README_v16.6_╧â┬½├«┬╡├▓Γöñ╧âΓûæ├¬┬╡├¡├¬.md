# course-116-2 完整專案 v16.6｜Python 教學加強版

這是一份可直接作為 GitHub repository 根目錄使用的完整專案。

## 已整合
- Python P1～P10 闖關
- 學生班級／座號／姓名鎖定
- 穩定學習帳號與 Firestore 同步
- 教師後台與 Excel 匯出
- 教師「🔎 異常檢查」
- 🌐 變數英文小幫手
- 📘 Python 指令小百科
- 📖 Python 主題學習站
- 每一關「📖 先理解這一關」
- P1～P2 地名／活動寬鬆判定
- str / int / float / bool 資料類型
- + - * / // % ** 詳細運算說明
- 運算優先順序、=、+= 等
- 循序／選擇／重複等程式邏輯
- if / elif / else、for、while、random 範例
- 錯誤回饋：錯在哪裡 → 為什麼 → 下一步 → 不同情境正確範例

## 學生網址
- Python 學習冒險：`11601/python.html`
- Python 主題學習站：`11601/python-topics.html`
- Python 指令小百科：`11601/python-guide.html`

若 GitHub repository 是 `teacheryimei/course-116-2`：
- https://teacheryimei.github.io/course-116-2/11601/python.html
- https://teacheryimei.github.io/course-116-2/11601/python-topics.html
- https://teacheryimei.github.io/course-116-2/11601/python-guide.html

## 教師端
- `teacher.html`
- `teacher-audit.html`

## Firebase
本版為免 Cloud Functions 穩定版。
請使用專案根目錄的 `firestore.rules`，並在 Firebase Console → Firestore Database → Rules 發布。

## 重要限制
免 Functions 架構下，學生仍可更新自己的學習進度欄位；教師異常檢查可以抓出一般星星／關卡不一致，但不是伺服器等級的完全防竄改。
