# v16.31｜學生救援與回收桶

## 新增功能

1. **移到回收桶**：教師刪除學生時，不再直接永久刪除。完整 Firestore 學生資料會移到 `deletedStudents/{UID}`，Firebase Authentication 帳號保留。
2. **回收桶復原**：教師可從回收桶恢復完整學生資料，沿用原 UID，並取得臨時密碼。
3. **永久刪除**：只有在回收桶按「永久刪除」並輸入確認文字後，才會刪除 Firestore 與 Firebase Authentication。
4. **救援已刪除學生**：適用舊版已直接刪除 Firestore、但 Authentication 尚存在的學生。例如 905 班 20 號。輸入班級、座號、姓名後，系統會找回原 UID、重建學生資料並產生臨時密碼。

## 905-20 建議操作

教師版 → **🛟 救援已刪除學生** → 輸入 905、20、姓名 → 開始救援。

如果原學生瀏覽器仍保留本機星星／挑戰進度，學生使用臨時密碼登入後，學生端可再把本機進度同步回雲端。舊版刪除前若 Firestore 資料已不存在且本機也已清除，v16.31 無法憑空重建已遺失的歷史進度。

## 部署

- GitHub：更新 `teacher.html`、`shared/teacher-dashboard.js`。
- Cloudflare Worker：必須重新部署 `worker-password-reset/src/index.js`。
- Worker 的既有 Secrets/Variables 不需更名。
- Firestore Rules 不需修改，回收桶操作由已驗證教師身分的 Worker 後端執行。
