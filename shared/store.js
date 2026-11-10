/* =====================================================================
   身分與進度（SSO 全自動雲端同步版 - 終極防護版）
   ---------------------------------------------------------------------
   ★ 加入 syncFromCloud，防止還原卡清空本機後上傳 0 分覆蓋雲端！
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
    
    // --- 🚀 還原卡防護：登入時先從雲端把舊成績抓下來 ---
    syncFromCloud: async function() {
      if(!window.CourseDB || CourseDB.isAnonymous()) return;
      try {
        const r = await CourseDB.loadStudent();
        if (r && r.modules) {
          const p = this.me();
          if(!p) return;
          
          let localData = this.load();
          for(let mKey in r.modules) {
            if(!localData.modules[mKey]) localData.modules[mKey] = { levels: {} };
            const cMod = r.modules[mKey];
            const lMod = localData.modules[mKey];
            if (cMod.levels) {
              for(let lKey in cMod.levels) {
                const cLevel = cMod.levels[lKey];
                const lLevel = lMod.levels[lKey];
                // 只有當雲端星星大於本機時才覆蓋 (保護還原卡造成的0分)
                if (!lLevel || (cLevel.stars || 0) > (lLevel.stars || 0)) {
                  lMod.levels[lKey] = cLevel;
                }
              }
            }
          }
          safeSet(progressKey(p), JSON.stringify(localData));
          fire();
          console.log("☁️ 已成功從雲端還原本機進度");
        }
      } catch (e) {
        console.warn("☁️ 雲端還原失敗", e);
      }
    },

    // --- 🚀 全自動雲端同步函數 ---
    syncToCloud: async function() {
      if(!window.CourseDB || CourseDB.isAnonymous()) return;
      const p = this.me();
      if(!p) return;
      
      const d = this.load();
      const mods = d.modules || {};
      
      for (let mKey in mods) {
        if (Object.prototype.hasOwnProperty.call(mods, mKey)) {
          let m = mods[mKey];
          let sum = 0;
          if (m.levels) {
            for (let lKey in m.levels) { sum += (m.levels[lKey].stars || 0); }
          }
          m.stars = sum;
        }
      }

      if (window.CONFIG && window.CONFIG.MODULES) {
        window.CONFIG.MODULES.forEach(unit => {
          let unitStars = 0;
          if (unit.parts) {
            unit.parts.forEach(part => { unitStars += STORE.partStars(part); });
          } else {
            unitStars = STORE.moduleStars(unit.id);
          }
          mods[unit.id] = mods[unit.id] || {};
          mods[unit.id].stars = unitStars;
          mods[unit.id].completed = unitStars >= (unit.maxStars || 999);
        });
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
      mods.python.stars = Math.max(mods.python.stars || 0, totalPyStars);
      mods.python.completed = mods.python.stars >= 30;
      mods.python.progress = pyState;
      mods.python.bonusChallenges = bonusState;
      mods.python.bonusBadges = bonusStars;
      
      const payload = {
        className: p.cls,
        seatNo: p.seat,
        name: p.name,
        courseId: "python",
        stars: mods.python.stars,     
        progress: pyState,
        modules: mods,
        // 終極防呆機制：強制寫入頂層屬性，就算 Firebase 同步腳本忽略 modules 也能抓到分數！
        unit1Stars: mods.unit1?.stars || mods.digital?.stars || 0,
        unit3Stars: mods.unit3?.stars || mods.platform?.stars || mods.system?.stars || 0,
        aiotStars: mods.aiot?.stars || mods.arduino?.stars || 0
      };
      
      try {
        await CourseDB.saveStudent(payload);
        console.log("☁️ 雲端存檔成功 (終極防護)");
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
