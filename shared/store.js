/* =====================================================================
   身分與進度（v16.49 座號補零修正版）
   ---------------------------------------------------------------------
   ★ 完美保留 v16.48 的防崩潰上傳機制 (NaN / 深度拷貝)。
   ★ 恢復座號補零邏輯，解決 1~9 號因為格式不符被 Firebase 拒絕的問題。
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
      
      // 🔴 關鍵修復：恢復補零邏輯！Firebase 規則要求 1~9 號必須是 "01"~"09" 才能放行
      seat = String(Number(seat)).padStart(2, '0');
      
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
      // v16.52: before the leading-zero fix, 1-9 used keys ending in -1 ... -9.
      // Read both variants and merge only the same class/seat, preserving
      // the highest star count for each level. Never remove the legacy key.
      if (Number(p.seat) >= 1 && Number(p.seat) <= 9) {
        var oldKey = PREFIX + '-' + term() + '-progress-' + p.cls + '-' + String(Number(p.seat));
        var legacy = parse(safeGet(oldKey), null);
        if (legacy && legacy.modules) {
          if (!d || !d.modules) d = {modules:{}};
          Object.keys(legacy.modules).forEach(function(mod){
            var source = legacy.modules[mod] || {};
            var target = d.modules[mod] || (d.modules[mod]={levels:{}});
            target.levels = target.levels || {};
            Object.keys(source.levels||{}).forEach(function(id){
              var prev=target.levels[id]||{};
              var incoming=source.levels[id]||{};
              target.levels[id]=Object.assign({},incoming,prev,{
                stars:Math.max(Number(incoming.stars)||0,Number(prev.stars)||0),
                done:!!(incoming.done||prev.done)
              });
            });
          });
        }
      }
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
    
    syncFromCloud: async function() {
      if(!window.CourseDB || CourseDB.isAnonymous()) return;
      if(!CourseDB.matchesStudentProfile || !CourseDB.matchesStudentProfile(this.me())) return;
      try {
        const r = await CourseDB.loadStudent();
        if (r) {
          const p = this.me();
          if(!p) return;
          
          let localData = this.load();
          // 先合併舊版紀錄，再合併 courseProgress；同一關僅保留最高星數。
          const legacyMods = Object.assign({}, (r.progress && r.progress._mods)||{}, r.modules||{});
          const modernMods = (r.courseProgress && r.courseProgress[term()] && r.courseProgress[term()].modules)||{};
          const cloudMods = Object.assign({}, legacyMods);
          for (const [mk,mv] of Object.entries(modernMods)) {
            const prior = cloudMods[mk] || {};
            cloudMods[mk] = Object.assign({}, prior, mv, {levels:Object.assign({},prior.levels||{},mv.levels||{})});
            for(const [lk,lr] of Object.entries((prior.levels)||{})){
              const newer = cloudMods[mk].levels[lk]||{};
              cloudMods[mk].levels[lk] = {...lr,...newer,stars:Math.max(Number(lr.stars)||0,Number(newer.stars)||0)};
            }
          } 
          
          for(let mKey in cloudMods) {
            if(!localData.modules[mKey]) localData.modules[mKey] = { levels: {} };
            const cMod = cloudMods[mKey];
            const lMod = localData.modules[mKey];
            if (cMod.levels) {
              for(let lKey in cMod.levels) {
                const cLevel = cMod.levels[lKey];
                const lLevel = lMod.levels[lKey] || { stars: 0, tries: 0 };
                
                const bestStars = Math.max(cLevel.stars || 0, lLevel.stars || 0);
                const bestTries = Math.max(cLevel.tries || 0, lLevel.tries || 0);
                const bestDone = cLevel.done || lLevel.done || false;
                
                lMod.levels[lKey] = {
                   ...cLevel, 
                   ...lLevel, 
                   stars: bestStars,
                   tries: bestTries,
                   done: bestDone
                };
              }
            }
          }
          
          if (r.progress) {
             let pyState = {};
             try { pyState = JSON.parse(localStorage.getItem('course115_v3_progress') || '{}'); } catch(e){}
             for (let pyKey in r.progress) {
                if (pyKey !== '_mods') {
                    let val = Number(r.progress[pyKey]);
                    if (!isNaN(val)) {
                       pyState[pyKey] = Math.max(Number(pyState[pyKey]||0), val);
                    }
                }
             }
             localStorage.setItem('course115_v3_progress', JSON.stringify(pyState));
          }
          
          safeSet(progressKey(p), JSON.stringify(localData));
          fire();
          window.dispatchEvent(new CustomEvent('sync:status', { detail: 'MERGED_OK' }));
        }
      } catch (e) {
        console.warn("☁️ 雲端還原失敗", e);
        window.dispatchEvent(new CustomEvent('sync:status', { detail: 'MERGE_FAIL' }));
      }
    },

    syncToCloud: async function() {
      if(!window.CourseDB || CourseDB.isAnonymous() || !CourseDB.matchesStudentProfile || !CourseDB.matchesStudentProfile(this.me())) {
         window.dispatchEvent(new CustomEvent('sync:status', { detail: 'ANONYMOUS' }));
         if(window.UI && typeof window.UI.requireLogin === 'function') window.UI.requireLogin();
         return;
      }
      
      window.dispatchEvent(new CustomEvent('sync:status', { detail: 'SYNCING' }));
      
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

      let pyStars = 0;
      let pyState = {};
      let bonusStars = 0;
      let bonusState = {};
      
      try {
        pyState = JSON.parse(localStorage.getItem('course115_v3_progress') || '{}');
        for (let k in pyState) {
           if (/^p(?:10|[1-9])$/.test(k)) {
              let val = Number(pyState[k]);
              if (!isNaN(val)) pyStars += val;
           }
        }
        
        bonusState = JSON.parse(localStorage.getItem('course116_python_bonus_v1') || '{}');
        bonusStars = Object.values(bonusState).filter(Boolean).length;
      } catch(e) {}
      
      const totalPyStars = (pyStars || 0) + (bonusStars || 0);
      mods.python = mods.python || {};
      mods.python.stars = Math.max(Number(mods.python.stars) || 0, totalPyStars);
      mods.python.completed = mods.python.stars >= 30;
      mods.python.progress = pyState;
      mods.python.bonusChallenges = bonusState;
      mods.python.bonusBadges = bonusStars;
      
      const uploadProgress = Object.assign({}, pyState);
      uploadProgress._u1 = Math.max(Number(pyState._u1)||0, Number(mods.unit1?.stars || mods.digital?.stars)||0);
      uploadProgress._u3 = Math.max(Number(pyState._u3)||0, Number(mods.unit3?.stars || mods.platform?.stars || mods.system?.stars)||0);
      uploadProgress._aiot = Math.max(Number(pyState._aiot)||0, Number(mods.aiot?.stars || mods.arduino?.stars)||0);
      uploadProgress._mods = mods;
      
      const payload = {
        className: String(p.cls),
        seatNo: String(p.seat), // 這裡會是補零後的座號，例如 "05"
        name: String(p.name),
        courseId: "python",
        stars: Number(mods.python.stars) || 0,     
        progress: uploadProgress
      };
      
      // v16.51 non-destructive fallback: merge cloud legacy progress before writing.
      // The cloud can contain Python attempts and earlier unit metadata absent locally.
      try {
        const remoteBefore = await CourseDB.loadStudent();
        if (remoteBefore && remoteBefore.progress) {
          const rp = remoteBefore.progress;
          for (const [key, value] of Object.entries(rp)) {
            if (key === '_mods') {
              const oldMods = value || {};
              for (const [modKey, modData] of Object.entries(oldMods)) {
                if (!uploadProgress._mods[modKey]) uploadProgress._mods[modKey] = modData;
                else if (modData && modData.levels) {
                  const dest = uploadProgress._mods[modKey];
                  dest.levels = dest.levels || {};
                  for (const [id, rec] of Object.entries(modData.levels)) {
                    const current = dest.levels[id] || {};
                    dest.levels[id] = {...rec, ...current,
                      stars: Math.max(Number(rec.stars)||0,Number(current.stars)||0)};
                  }
                }
              }
            } else if (typeof value === 'number' && Number.isFinite(value)) {
              uploadProgress[key] = Math.max(Number(uploadProgress[key])||0, value);
            } else if (!(key in uploadProgress)) uploadProgress[key] = value;
          }
        }
      } catch(e) { console.warn('Legacy progress pre-merge unavailable; upload skipped to protect history',e); return; }
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      
      try {
        await CourseDB.saveStudent(cleanPayload);
        // 正式統一進度：保存整個學期的各關卡紀錄，不覆蓋其他學期；
        // Firebase 端合併每關最高星數。舊版欄位繼續保留供歷史版本讀取。
        await CourseDB.saveCourseSnapshot(term(), {modules:mods}, p);
        window.dispatchEvent(new CustomEvent('sync:status', { detail: 'SYNC_OK' }));
      } catch(e) {
        console.warn("☁️ 雲端存檔失敗", e);
        window.dispatchEvent(new CustomEvent('sync:status', { detail: 'SYNC_FAIL' }));
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
