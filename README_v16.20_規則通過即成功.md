# v16.20｜規則通過即成功

## 修正
- 修正 `looksLikeUsableText is not defined`。這是網站 JavaScript 錯誤，不是學生 Python 錯誤。
- 正式檢查只判斷該題必要的 Python 結構與能否正常執行。
- 不再用語意字典判斷「是不是地點／活動／姓名」。
- 合理內容如「高雄」「看風景」「義大」「吃拉麵」均可通過。
- 只阻擋非常明顯的填塞亂碼，例如 `ddddd`、`aaaaa`、`11111`。
- 網站自己的 JavaScript 內部錯誤不再偽裝成 Python 錯誤給學生看。

## 不變
- 每題仍要符合該題必要指令，例如 print 次數、input、運算、if、for、while 等。
- 前兩題複製後仍需依任務修改，不能完全原樣提交。
- 自由選關、星星與已完成狀態保留。
- 不需要修改 Firestore Rules。
