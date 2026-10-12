# v16.2 學生身分鎖定版

## 修改
- 學生第一次建立學習帳號前可輸入班級、座號、姓名。
- 學習帳號一旦登入／建立，學生端的班級、座號、姓名立即鎖定。
- 學生即使用瀏覽器開發工具呼叫儲存，Firestore Rules 也禁止修改上述身分欄位。
- 教師端「✏️ 更正資料」仍可修改授權班級學生的班級、座號、姓名。
- Python 的 stars / score / progress 仍由 v16.1 免 Functions 架構同步。
- 期中複習資料也採相同身分欄位鎖定。

## 免 Functions 版本限制
班級＋座號目前也是 Firebase Authentication 的合成登入帳號的一部分。
教師若在 Firestore 更正「班級或座號」，Firebase Auth 的登入 email 不會跟著改。
因此既有學習帳號更正班級／座號後，學生可能仍需使用原班級／座號登入。
若要讓教師更正後連登入識別也一起變更，需要 Firebase Admin / Cloud Functions。
