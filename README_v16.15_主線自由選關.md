# v16.15｜主線自由選關

- 30 個主線挑戰全部可直接點選，不再鎖關。
- 已完成顯示 ⭐，未完成也可直接進入。
- 原本 progress 與 stars 會轉成自由選關完成紀錄。
- 若 stars 比 progress 高，優先保留原本星星數，避免學生被送回第一關。
- Firestore 新增 `challengeDone` 保存每一題完成狀態，同時維持舊 `progress` 欄位相容。
- 教師異常檢查不再把跳關或目前位置不同視為異常。
- 不需要修改 Firestore Rules。
