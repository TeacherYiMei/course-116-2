/**
 * teacher-dashboard.js
 * 116 資訊科技闖關地圖 - 教師管理後台（支援四大單元切換 + 跨單元匯出 + 詳細登入診斷）
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================================
// 1. Firebase 專案設定 (與原本專案相同，若放同一資料夾亦可改為 import)
// ==========================================
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. 116 闖關地圖四大單元設定常數
// ==========================================
export const MODULE_CONFIG = {
  all: {
    key: "all",
    title: "全學期四單元總覽",
    maxStars: 93, // 24 + 30 + 24 + 15
    totalLevels: 31
  },
  digital: {
    key: "digital",
    title: "單元一：數位時代 (0與1的藝術)",
    maxStars: 24,
    totalLevels: 8,
    fieldKeys: ["digital", "unit1", "ch1", "digitalEra"]
  },
  python: {
    key: "python",
    title: "單元二：進入 Python 的世界",
    maxStars: 30,
    totalLevels: 10,
    fieldKeys: ["python", "unit2", "ch2"]
  },
  system: {
    key: "system",
    title: "單元三：系統平臺大冒險",
    maxStars: 24,
    totalLevels: 8,
    fieldKeys: ["system", "unit3", "ch3", "systemPlatform"]
  },
  aiot: {
    key: "aiot",
    title: "延伸專題：5016B AIoT 智慧教室守護站",
    maxStars: 15,
    totalLevels: 5,
    fieldKeys: ["aiot", "project5016B", "unit4", "ch4"]
  }
};

let currentModule = "python";
let currentClassId = "911";
let currentStudents = [];

// ==========================================
// 3. 解析各單元進度 (向下相容原有的 Python 單一結構)
// ==========================================
function extractModuleData(studentDoc, moduleKey) {
  if (moduleKey === "all") {
    const d1 = extractModuleData(studentDoc, "digital");
    const d2 = extractModuleData(studentDoc, "python");
    const d3 = extractModuleData(studentDoc, "system");
    const d4 = extractModuleData(studentDoc, "aiot");
    const totalStars = d1.stars + d2.stars + d3.stars + d4.stars;
    const maxStars = MODULE_CONFIG.all.maxStars;
    const score = Math.round((totalStars / maxStars) * 100);
    const allCompleted = d1.completed && d2.completed && d3.completed && d4.completed;
    return {
      stars: totalStars,
      maxStars,
      score,
      currentLevel: `數位:${d1.stars}★ | Py:${d2.stars}★ | 系統:${d3.stars}★ | AIoT:${d4.stars}★`,
      completed: allCompleted,
      updatedAt: d2.updatedAt || d1.updatedAt || d3.updatedAt || d4.updatedAt,
      recordsCount: (d1.recordsCount || 0) + (d2.recordsCount || 0) + (d3.recordsCount || 0) + (d4.recordsCount || 0)
    };
  }

  const cfg = MODULE_CONFIG[moduleKey];
  let subData = null;

  // 檢查 studentDoc.modules[moduleKey] 或特定欄位名稱
  if (studentDoc.modules && studentDoc.modules[moduleKey]) {
    subData = studentDoc.modules[moduleKey];
  } else {
    for (const k of cfg.fieldKeys) {
      if (studentDoc[k] && typeof studentDoc[k] === "object") {
        subData = studentDoc[k];
        break;
      }
    }
  }

  // 相容舊版：如果是 python 模組，且頂層直接存放 stars / currentLevel
  if (!subData && moduleKey === "python" && (studentDoc.stars !== undefined || studentDoc.currentLevel !== undefined)) {
    subData = {
      stars: Number(studentDoc.stars || 0),
      currentLevel: studentDoc.currentLevel || "第 1 關 | 哈囉，旅伴！",
      completed: Boolean(studentDoc.completed),
      updatedAt: studentDoc.updatedAt || null,
      recordsCount: Number(studentDoc.recordsCount || 1)
    };
  }

  const stars = Number(subData?.stars || 0);
  const maxStars = cfg.maxStars;
  const score = Math.min(100, Math.round((stars / maxStars) * 100));
  const completed = Boolean(subData?.completed || stars >= maxStars);
  const currentLevel = subData?.currentLevel || (stars > 0 ? "進行中" : "尚未開始");

  return {
    stars,
    maxStars,
    score,
    currentLevel,
    completed,
    updatedAt: subData?.updatedAt || studentDoc.updatedAt || "-",
    recordsCount: Number(subData?.recordsCount || (stars > 0 ? 1 : 0))
  };
}

// ==========================================
// 4. 畫面渲染與統計更新
// ==========================================
function renderDashboard() {
  const tbody = document.getElementById("studentTableBody");
  const cfg = MODULE_CONFIG[currentModule];
  document.getElementById("statStarLabel").textContent = `平均星星 (上限 ${cfg.maxStars}★)`;
  document.getElementById("thStars").textContent = `星星 (/${cfg.maxStars})`;

  if (!currentStudents.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:#94a3b8;">此班級 (${currentClassId}) 尚無學生資料</td></tr>`;
    document.getElementById("statStudentCount").textContent = "0";
    document.getElementById("statAvgStars").textContent = "0";
    document.getElementById("statAvgScore").textContent = "0";
    document.getElementById("statCompletedCount").textContent = "0";
    return;
  }

  let sumStars = 0;
  let sumScore = 0;
  let completedCount = 0;

  const rowsHtml = currentStudents.map((stu) => {
    const prog = extractModuleData(stu, currentModule);
    sumStars += prog.stars;
    sumScore += prog.score;
    if (prog.completed) completedCount++;

    const statusBadge = prog.completed
      ? `<span class="badge badge-done">已完成</span>`
      : `<span class="badge badge-progress">${prog.stars > 0 ? "進行中" : "未開始"}</span>`;

    return `
      <tr>
        <td>${stu.classId || currentClassId}</td>
        <td>${stu.seatNumber || "-"}</td>
        <td><strong>${stu.name || "未命名"}</strong></td>
        <td><button class="btn btn-gray" onclick="window.editStudent('${stu.id}')">🛠️ 維護</button></td>
        <td>⭐ ${prog.stars}/${prog.maxStars}</td>
        <td><strong>${prog.score}</strong></td>
        <td>${prog.currentLevel}</td>
        <td>${statusBadge}</td>
        <td>${prog.updatedAt || "-"}</td>
        <td>${prog.recordsCount} 筆</td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rowsHtml;

  const count = currentStudents.length;
  document.getElementById("statStudentCount").textContent = String(count);
  document.getElementById("statAvgStars").textContent = (sumStars / count).toFixed(1);
  document.getElementById("statAvgScore").textContent = String(Math.round(sumScore / count));
  document.getElementById("statCompletedCount").textContent = String(completedCount);
  document.getElementById("lastUpdateText").textContent = `最後更新：${new Date().toLocaleTimeString()}`;
}

// ==========================================
// 5. 載入班級資料
// ==========================================
async function loadClassData(classId) {
  currentClassId = classId;
  const q = query(collection(db, "students"), where("classId", "==", String(classId)));
  const snap = await getDocs(q);
  const list = [];
  snap.forEach((docSnap) => {
    list.push({ id: docSnap.id, ...docSnap.data() });
  });
  list.sort((a, b) => Number(a.seatNumber || 0) - Number(b.seatNumber || 0));
  currentStudents = list;
  renderDashboard();
}

// ==========================================
// 6. 登入與錯誤具體診斷 (解決模糊錯誤訊息)
// ==========================================
const loginBtn = document.getElementById("loginBtn");
const resetPwdBtn = document.getElementById("resetPwdBtn");
const loginError = document.getElementById("loginError");

function showError(msg) {
  loginError.style.display = "block";
  loginError.textContent = msg;
}

loginBtn.addEventListener("click", async () => {
  loginError.style.display = "none";
  const email = document.getElementById("teacherEmail").value.trim();
  const password = document.getElementById("teacherPassword").value;

  if (!email || !password) {
    showError("請輸入 Email 與密碼。");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Login Error:", err);
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      showError(`密碼或帳號不符 (${err.code})。請點右側「發送重設密碼信」並確保輸入最新密碼（請避免瀏覽器自動填入舊密碼）。`);
    } else if (err.code === "auth/too-many-requests") {
      showError("短時間嘗試次數過多，已被 Firebase 暫時鎖定，請稍候 15 分鐘或點擊「發送重設密碼信」解鎖。");
    } else {
      showError(`登入失敗：${err.message}`);
    }
  }
});

resetPwdBtn.addEventListener("click", async () => {
  const email = document.getElementById("teacherEmail").value.trim();
  if (!email) {
    showError("請先在 Email 欄位輸入教師信箱。");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alert(`已寄出重設密碼信至 ${email}！\n請至信箱點擊最新一封信件設定新密碼，完成後手動輸入新密碼登入。`);
  } catch (err) {
    showError(`寄送重設信失敗：${err.message}`);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";
    await loadClassData(document.getElementById("classSelect").value);
  } else {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("dashboardSection").style.display = "none";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));

// ==========================================
// 7. 模組切換與 Excel 匯出 (單一單元 & 四單元總表)
// ==========================================
document.querySelectorAll(".module-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".module-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentModule = btn.dataset.module;
    renderDashboard();
  });
});

document.getElementById("classSelect").addEventListener("change", (e) => {
  loadClassData(e.target.value);
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  loadClassData(currentClassId);
});

// 下載目前單元 Excel
document.getElementById("exportCurrentBtn").addEventListener("click", () => {
  const cfg = MODULE_CONFIG[currentModule];
  const rows = currentStudents.map((stu) => {
    const p = extractModuleData(stu, currentModule);
    return {
      "班級": stu.classId || currentClassId,
      "座號": stu.seatNumber,
      "姓名": stu.name,
      "單元名稱": cfg.title,
      "星星數": p.stars,
      "星星上限": p.maxStars,
      "單元評分": p.score,
      "目前進度": p.currentLevel,
      "是否完成": p.completed ? "已完成" : "進行中",
      "最近更新": p.updatedAt
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, cfg.key);
  XLSX.writeFile(wb, `${currentClassId}班_${cfg.key}_進度表.xlsx`);
});

// 下載四單元整合總表 Excel
document.getElementById("exportAllBtn").addEventListener("click", () => {
  const rows = currentStudents.map((stu) => {
    const d1 = extractModuleData(stu, "digital");
    const d2 = extractModuleData(stu, "python");
    const d3 = extractModuleData(stu, "system");
    const d4 = extractModuleData(stu, "aiot");
    const total = extractModuleData(stu, "all");
    return {
      "班級": stu.classId || currentClassId,
      "座號": stu.seatNumber,
      "姓名": stu.name,
      "單元一：數位時代(24★)": d1.stars,
      "單元一評分": d1.score,
      "單元二：Python世界(30★)": d2.stars,
      "單元二評分": d2.score,
      "單元三：系統平臺(24★)": d3.stars,
      "單元三評分": d3.score,
      "專題：AIoT守護站(15★)": d4.stars,
      "專題評分": d4.score,
      "總星星數(93★)": total.stars,
      "學期總評分": total.score
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "四單元總成績");
  XLSX.writeFile(wb, `${currentClassId}班_116資訊科技_四單元總成績表.xlsx`);
});
