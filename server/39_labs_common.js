/* =====================================================================
   🧪 實驗站（伺服器端）的共用寫法
   ---------------------------------------------------------------------
   SV.labs[名稱] = {
     make(hard, practice) → { pub: 畫面要用的資料（會送到前端）, sec: 伺服器留著的完整情境（含隱藏資訊） }
     check(sec, v, ctx)   → 學生送出的操作 v 對不對：
                            { ok:true, why }                     過關
                            { ok:false, why, hint, hint2 }       扣 ❤️（第 2 次錯給 hint2）
                            { ok:true, partial:true, say, data }  多步驟實驗站的中間步驟對了（不算過關）
                            { act:true, out, sec }                只是操作（例如教機器、測試），不算對錯
   }
   前端（shared/*-labs.js）只負責畫面：用 pub 畫出情境、把學生的操作 v 送上來。
   ===================================================================== */
function svYes(why, extra) { var o = { ok: true, why: why }; for (var k in extra || {}) o[k] = extra[k]; return o; }
function svNo(why, hint, hint2, extra) { var o = { ok: false, why: why, hint: hint, hint2: hint2 }; for (var k in extra || {}) o[k] = extra[k]; return o; }
function svPart(say, data) { return { ok: true, partial: true, say: say, data: data }; }
