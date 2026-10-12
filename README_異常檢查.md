# Python 教師端 v15｜異常檢查

新增：
- `teacher-audit.html`
- `shared/teacher-audit.js`
- `teacher.html` 加入「🔎 異常檢查」連結

## 自動檢查
1. `stars` 是否等於 `progress` 各關完成挑戰數總和
2. `score` 是否等於 `round(關卡完成數 / 26 × 100)`
3. `completed` 是否只有在 26/26 時才成立
4. `currentStation/currentChallenge` 是否與第一個未完成挑戰一致
5. P1～P10 是否有超過各關最大挑戰數
6. 是否有跳關（前一關未完成但後面已有紀錄）
7. 同班同座號是否有重複 Firestore 紀錄

## 重要限制
這是一個「偵測」工具。若學生同時竄改 `progress`、`stars`、`score`、目前關卡，使所有欄位彼此一致，單靠目前的前端資料無法證明作弊。

要真正防止自行加星星，後續需把「過關寫入」改成伺服器端可信寫入（Cloud Function / Admin SDK），並收緊 Firestore Rules，讓學生不能直接任意改 `stars/progress/score`。
