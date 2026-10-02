/* =====================================================================
   學期界線（單一來源）
   ---------------------------------------------------------------------
   ★ 「現在算哪個學期」只看這裡的日期區間，不要在別的頁面用月份猜。
   ★ 學年開始前（準備期）算上學期；學年結束後算下學期。
   ⚠️ 這是「學期界線」，和 config.js 的 TERM_START（第 1 週星期一）是兩回事。
   ⚠️ 日後接上 Firestore 時，firestore.rules 的寫入期間也要跟這裡一致
      （做法同 course_115：check.py 比對兩邊）。
   ===================================================================== */
window.SEMESTER = {
  TERMS: [
    { term: '11601', name: '上學期', short: '116-1', start: '2027-08-01', end: '2028-01-31' },
    { term: '11602', name: '下學期', short: '116-2', start: '2028-02-01', end: '2028-07-31' }
  ],

  /** 今天（或指定日期）屬於哪個學期 */
  current: function (date) {
    var d = date ? new Date(date) : new Date();
    var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    var t = this.TERMS;
    if (iso < t[0].start) return t[0].term;              // 學年還沒開始 → 上學期（備課期）
    for (var i = 0; i < t.length; i++) {
      if (iso >= t[i].start && iso <= t[i].end) return t[i].term;
    }
    return t[t.length - 1].term;                          // 學年結束後 → 下學期
  },

  name: function (term) {
    var hit = this.TERMS.filter(function (x) { return x.term === term; })[0];
    return hit ? hit.name : term;
  },

  isTerm: function (term) {
    return this.TERMS.some(function (x) { return x.term === term; });
  }
};
