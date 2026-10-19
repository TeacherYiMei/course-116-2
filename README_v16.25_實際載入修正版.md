# v16.25｜實際載入修正版

## 這次真正找到的原因
v16.24 的 ZIP 裡雖然已經有修好的 `python-journey-v1624.js`，
但 `11601/python.html` 仍然載入舊的：

`content/python-journey-v1623.js`

因此學生實際執行的仍是舊版；v16.24 新增的 `inputPromptLiterals()` 根本沒有被網站載入。
這就是為什麼「執行看看」可以，但「檢查挑戰」仍出現同樣網站錯誤。

## v16.25 修正
- 建立全新檔名：`11601/content/python-journey-v1625.js`
- `python.html` 明確改為載入 `python-journey-v1625.js`
- 保留 `askInlineInput()`
- 保留 `inputPromptLiterals()`
- 保留 `looksLikeUsableText()`
- 保留前兩題完全照抄範例不可通過
- 保留自由選關、星星、成功後下一題

## 驗證
上傳後直接查看 GitHub 的 `11601/python.html`，應能搜尋到：

`python-journey-v1625.js`

如果仍看到 `v1623`，表示 GitHub 尚未覆蓋成功。

不需要修改 Firestore Rules。
