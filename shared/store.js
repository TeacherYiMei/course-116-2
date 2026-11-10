/* =====================================================================
   身分與進度（SSO 全自動雲端同步版）
   ---------------------------------------------------------------------
   ★ 所有頁面透過 window.STORE 讀寫進度。
   ★ [116 升級版] 每次寫入 localStorage 後，自動呼叫 Firebase 儲存。
   ===================================================================== */
(function () {
  var PREFIX = 'c116';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function safeDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function parse(s, fb) { try { return s ? JSON.parse(s) : fb; } catch (e) { return fb; } }

  function term() { return (window.CONFIG && window.CONFIG.TERM) || '11601'; }
  function profileKey() { return PREFIX + '-profile'; }
  function progressKey(p) { return PREFIX + '-' + term() + '-progress-' + p.cls + '-' + p.seat; }

  var STORE = {
    me: function () {
      var p = parse(safeGet(profileKey()), null);
      return p && p.cls && p.seat ? p : null;
    },

    login: function (cls, seat, name) {
      cls = String(cls || '').trim(); seat = String(seat || '').trim(); name = String(name || '').trim();
      if (!/^9\d{2}$/.test(cls)) return '班級請填三位數，例如 901';
      if (!/^\d{1,2}$/.test(seat) || +seat < 1 || +seat > 40) return '座號請填 1～40';
      if (!name) return '請填姓名';
      seat = String(+seat).padStart(2, '0');
      safeSet(profileKey(), JSON.stringify({ cls: cls, seat: seat, name: name.slice(0, 12) }));
      fire();
      return '';
    },

    logout: function () { 
      safeDel(profileKey()); 
      if(window.CourseDB && typeof CourseDB.signOutStudentAccount === 'function'){
         CourseDB.signOutStudentAccount();
      }
      fire(); 
    },

    load: function () {
      var p = this.me();
      if (!p) return { modules: {} };
      var d = parse(safeGet(progressKey(p)), null);
      return d && d.modules ? d : { modules: {} };
    },

    level: function (mod, id) {
      var m = this.load().modules[mod];
      return (m && m.levels && m.levels[id]) || null;
    },

    levels: function (mod) {
      var m = this.load().modules[mod];
      return (m && m.levels) || {};
    },

    saveLevel: function (mod, id, rec) {
      var p = this.me();
      if (!p) return { record: null, improved: false };
      var d = this.load();
      d.modules[mod] = d.modules[mod] || { levels: {} };
      d.modules[mod].levels = d.modules[mod].levels || {};
      var old = d.modules[mod].levels[id] || { stars: 0, tries: 0 };
      var next = Object.assign({}, old);
      next.tries = (old.tries || 0) + 1;
      next.lastAt = Date.now();
      var improved = false;
      if ((rec.stars || 0) > (old.stars || 0)) { next.stars = rec.stars; next.at = Date.now(); improved = true; if (rec.rc) { next.rc = rec.rc; next.ts = rec.ts; } }
      else if (rec.rc && (rec.stars || 0) === (old.stars || 0) && !old.rc) { next.rc = rec.rc; next.ts = rec.ts; }
      if (rec.score != null && (old.score == null || rec.score > old.score)) next.score = rec.score;
      if (rec.done && !old.done) { next.done = true; next.at = next.at || Date.now(); improved = true; }
      if (rec.extra) next.extra = Object.assign({}, old.extra || {}, rec.extra);
      if (rec.code != null) next.code = String(rec.code).slice(0, 8000);
      d.modules[mod].levels[id] = next;
      safeSet(progressKey(p), JSON.stringify(d));
      fire();
      
      this.syncToCloud();
      return { record: next, improved: improved };
    },
    
    // --- 🚀 全自動雲端同步函數 (完美封裝版) ---
    syncToCloud: async function() {
      if(!window.CourseDB || CourseDB.isAnonymous()) return;
      const p = this.me();
      if(!p) return;
      
      const d = this.load();
      const mods = d.modules || {};
      
      // 動態掃描所有單元，自動加總每一關的星星數，並掛載到 .stars 屬性上
      for (let mKey in mods) {
        if (Object.prototype.hasOwnProperty.call(mods, mKey)) {
          let m = mods[mKey];
          let sum = 0;
          if (m.levels) {
            for (let lKey in m.levels) {
              sum += (m.levels[lKey].stars || 0);
            }
          }
          m.stars = sum;
        }
      }
      
      let pyStars = 0;
      let pyState = {};
      let bonusStars = 0;
      let bonusState = {};
      try {
        pyState = JSON.parse(localStorage.getItem('course115_v3_progress') || '{}');
        pyStars = Object.values(pyState).reduce((a, b) => a + Number(b || 0), 0);
        bonusState = JSON.parse(localStorage.getItem('course116_python_bonus_v1') || '{}');
        bonusStars = Object.values(bonusState).filter(Boolean).length;
      } catch(e) {}
      
      const totalPyStars = pyStars + bonusStars;
      mods.python = mods.python || {};
      mods.python.stars = totalPyStars;
      mods.python.completed = pyStars >= 30;
      mods.python.progress = pyState;
      mods.python.bonusChallenges = bonusState;
      mods.python.bonusBadges = bonusStars;
      
      const payload = {
        className: p.cls,
        seatNo: p.seat,
        name: p.name,
        courseId: "python",
        stars: totalPyStars,     
        progress: pyState,
        modules: mods // 直接將包含所有星星總和的模組物件發送出去
      };
      
      try {
        await CourseDB.saveStudent(payload);
        console.log("☁️ 雲端存檔成功");
      } catch(e) {
        console.warn("☁️ 雲端存檔失敗", e);
      }
    },

    moduleStars: function (mod) {
      var lv = this.levels(mod), n = 0;
      for (var k in lv) if (Object.prototype.hasOwnProperty.call(lv, k)) n += (lv[k].stars || 0);
      return n;
    },

    partStars: function (p) {
      if (!p.mod) return this.moduleStars(p.id);
      var self = this; return (p.levels || []).reduce(function (a, id) { return a + ((self.level(p.mod, id) || {}).stars || 0); }, 0);
    },
    partDone: function (p) {
      if (!p.mod) return this.moduleDone(p.id);
      var self = this; return (p.levels || []).filter(function (id) { var r = self.level(p.mod, id); return r && ((r.stars || 0) > 0 || r.done); }).length;
    },

    moduleDone: function (mod) {
      var lv = this.levels(mod), n = 0;
      for (var k in lv) if (lv[k] && ((lv[k].stars || 0) > 0 || lv[k].done)) n++;
      return n;
    },

    draft: function (key, value) {
      var p = this.me(); if (!p) return null;
      var k = PREFIX + '-' + term() + '-draft-' + p.cls + '-' + p.seat + '-' + key;
      if (value === undefined) return safeGet(k);
      safeSet(k, value); return value;
    },

    exportJSON: function () {
      return JSON.stringify({ v: 1, term: term(), me: this.me(), data: this.load(), at: new Date().toISOString() }, null, 2);
    },
    importJSON: function (text) {
      var o = parse(text, null);
      if (!o || !o.data || !o.me) return '檔案格式不對';
      if (o.term !== term()) return '這是 ' + o.term + ' 的進度檔，現在是 ' + term();
      var p = this.me();
      if (!p || p.cls !== o.me.cls || p.seat !== o.me.seat) return '這份進度是 ' + o.me.cls + ' 班 ' + o.me.seat + ' 號的，和目前登入的人不同';
      safeSet(progressKey(p), JSON.stringify(o.data)); fire();
      this.syncToCloud();
      return '';
    }
  };

  function fire() { try { window.dispatchEvent(new CustomEvent('store:change')); } catch (e) {} }
  window.STORE = STORE;
})();