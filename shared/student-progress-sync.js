/**
 * shared/student-progress-sync.js
 * 供學生端闖關頁面引入，統一將四大單元進度寫入 Firestore
 * 
 * 引入與使用方式：
 * import { saveModuleProgress } from './shared/student-progress-sync.js';
 * await saveModuleProgress(db, studentUid, 'unit1', {
 *   stars: 12,
 *   currentLevel: '第 4 關｜聲音取樣實驗',
 *   completed: false
 * });
 */

import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

export async function saveModuleProgress(db, studentDocId, moduleKey, { stars, currentLevel, completed = false }) {
  if (!db || !studentDocId) {
    console.warn("缺少資料庫實例或 studentDocId，無法存檔");
    return;
  }

  const studentRef = doc(db, "students", studentDocId);
  const nowStr = new Date().toLocaleString("zh-TW", { hour12: true });

  const payload = {
    updatedAt: nowStr,
    lastActiveTimestamp: serverTimestamp(),
    modules: {
      [moduleKey]: {
        stars: Number(stars || 0),
        currentLevel: currentLevel || "進行中",
        completed: Boolean(completed),
        updatedAt: nowStr
      }
    }
  };

  // 若為單元二 Python，同步寫入頂層欄位以保持向後相容
  if (moduleKey === "python") {
    payload.stars = Number(stars || 0);
    payload.currentLevel = currentLevel || "進行中";
    payload.completed = Boolean(completed);
  }

  try {
    await setDoc(studentRef, payload, { merge: true });
    console.log(`單元 [${moduleKey}] 成績已成功寫入 Firestore`);
  } catch (error) {
    console.error(`單元 [${moduleKey}] 寫入失敗:`, error);
    throw error;
  }
}
