# v16.26｜檢查挑戰穩定版

我重新檢查 v16.25 的實際程式後，P2-1 的 validate()、inputPromptLiterals()、looksLikeUsableText()、askInlineInput() 都可正常執行。

真正需要隔離的是「正式檢查成功後的 STORE / Firebase 同步」。這些同步只在「檢查挑戰」成功後執行，而「執行看看」不會執行，因此很符合「執行正常、檢查才出現網站錯誤」的現象。

本版修正：
- Python 與題目規則通過後，先直接記錄本機星星與完成狀態。
- STORE / Firebase 同步改為 best-effort，同步失敗不再阻擋過關。
- 同時覆蓋 python-journey.js、v1623、v1624、v1625、v1626，避免舊 HTML 指到舊檔。
- python.html 明確載入 python-journey-v1626.js。
- 頂端新增 v16.26 小字，讓老師一眼確認 GitHub Pages 是否真的更新。

如果頁面頂端看不到 v16.26，就代表 course-116-2/11601/python.html 並沒有被這次更新覆蓋；那是部署路徑問題，不是 Python 判定器。
