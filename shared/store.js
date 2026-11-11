/* =====================================================================
   身分與進度（單一來源）── 本機快取＋Firebase 雲端同步
   ---------------------------------------------------------------------
   ★ 所有頁面只透過 window.STORE 讀寫進度，不直接碰 localStorage。
     日後換成 course_115 的 Firebase（學校 Google 帳號＋Firestore），
     只要重寫這一支、API 名稱不變，各單元頁面一行都不用改。

   雲端同步：穩定 Firebase 學生帳號登入後，所有單元共用同一份學生文件；
   本機紀錄會先與雲端逐關合併，再上傳，保留既有較高星數。匿名登入時只暫存本機。

   資料形狀（和日後 Firestore 文件 {學期}-progress/{學號} 同一個樣子）：
     {
       modules: {
         python: { levels: { P1: { stars: 3, score: 100, tries: 2, at: 1690000000000 } } },
         arduino: { levels: { S1: { done: true, at: … } } }
       }
     }
   ===================================================================== */
(function () {
  var PREFIX = 'c116';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function safeDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function parse(s, fb) { try { return s ? JSON.parse(s) : fb; } catch (e) { return fb; } }

  function term() { return (window.CONFIG && window.CONFIG.TERM) || '11601'; }
  function profileKey() { return PREFIX + '-profile'; }            // 名冊跨學期共用（同一批學生）
  function progressKey(p) { return PREFIX + '-' + term() + '-progress-' + p.cls + '-' + p.seat; }

  var STORE = {
    /** 目前登入的學生，沒有就回 null */
    me: function () {
      var p = parse(safeGet(profileKey()), null);
      return p && p.cls && p.seat ? p : null;
    },

    /** 登入（本機版：班級＋座號＋姓名）。回傳錯誤訊息或 '' */
    login: function (cls, seat, name) {
      cls = String(cls || '').trim(); seat = String(seat || '').trim(); name = String(name || '').trim();
      if (!/^9\d{2}$/.test(cls)) return '班級請填三位數，例如 901';
      if (!/^\d{1,2}$/.test(seat) || +seat < 1 || +seat > 40) return '座號請填 1～40';
      if (!name) return '請填姓名';
      seat = String(+seat).padStart(2, '0');
      safeSet(profileKey(), JSON.stringify({ cls: cls, seat: seat, name: name.slice(0, 12) }));
      fire();
      // 若穩定 Firebase 帳號已登入，學生在單元一／三等頁面完成本機身分登入後，立即合併舊紀錄。
      if(window.CourseDB && typeof STORE.syncCloud === "function"){
        Promise.resolve(CourseDB.ready).then(function(){
          if(typeof CourseDB.isAnonymous!=="function" || !CourseDB.isAnonymous()) return STORE.syncCloud();
          return null;
        }).catch(function(e){console.warn("116 local progress sync after profile login failed",e);});
      }
      return '';
    },

    logout: function () { safeDel(profileKey()); fire(); },

    /** 讀整份進度 */
    load: function () {
      var p = this.me();
      if (!p) return { modules: {} };
      var d = parse(safeGet(progressKey(p)), null);
      return d && d.modules ? d : { modules: {} };
    },

    /** 某一關的紀錄 */
    level: function (mod, id) {
      var m = this.load().modules[mod];
      return (m && m.levels && m.levels[id]) || null;
    },

    /** 某模組所有關卡紀錄 */
    levels: function (mod) {
      var m = this.load().modules[mod];
      return (m && m.levels) || {};
    },

    /**
     * 寫入一關的成績。★ 星星只會變多不會變少（取最佳），tries 累加。
     * 回傳 { record, improved }
     */
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
      if ((rec.stars || 0) > (old.stars || 0)) { next.stars = rec.stars; next.at = Date.now(); improved = true; if (rec.rc) { next.rc = rec.rc; next.ts = rec.ts; } }   // rc：伺服器簽發的收據（老師可以驗證這顆星是真的）
      else if (rec.rc && (rec.stars || 0) === (old.stars || 0) && !old.rc) { next.rc = rec.rc; next.ts = rec.ts; }
      if (rec.score != null && (old.score == null || rec.score > old.score)) next.score = rec.score;
      if (rec.done && !old.done) { next.done = true; next.at = next.at || Date.now(); improved = true; }
      if (rec.extra) next.extra = Object.assign({}, old.extra || {}, rec.extra);
      if (rec.code != null) next.code = String(rec.code).slice(0, 8000);   // Python：保留最後一次送出的程式
      d.modules[mod].levels[id] = next;
      safeSet(progressKey(p), JSON.stringify(d));
      fire();
      cloudLevel(mod,id,next,p);
      return { record: next, improved: improved };
    },

    /** 將本機舊紀錄合併上傳至目前 Firebase 學生 UID；不覆蓋雲端較高星數。 */
    syncCloud: async function () {
      var p=this.me();
      if(!p || !window.CourseDB || typeof CourseDB.saveCourseSnapshot!=="function") return {ok:false,reason:"NO_PROFILE_OR_COURSEDB"};
      try {
        await CourseDB.ready;
        if(typeof CourseDB.isAnonymous==="function" && CourseDB.isAnonymous()) return {ok:false,reason:"NO_STABLE_ACCOUNT"};
        // 先下載雲端，再與本機舊資料逐關合併；星星取較高值，保留舊 extra/code 等欄位。
        var local=this.load();
        var remote=typeof CourseDB.loadCourseSnapshot==="function" ? await CourseDB.loadCourseSnapshot(term(),p) : null;
        var merged={modules:{}};
        function mergeModules(src){
          Object.keys((src&&src.modules)||{}).forEach(function(mod){
            var from=src.modules[mod]||{}, to=merged.modules[mod]||(merged.modules[mod]={levels:{}});
            Object.keys(from.levels||{}).forEach(function(id){
              var a=to.levels[id]||{}, b=from.levels[id]||{};
              to.levels[id]=Object.assign({},a,b,{stars:Math.max(Number(a.stars||0),Number(b.stars||0)),done:!!(a.done||b.done),tries:Math.max(Number(a.tries||0),Number(b.tries||0)),extra:Object.assign({},a.extra||{},b.extra||{})});
            });
          });
        }
        mergeModules(remote); mergeModules(local);
        safeSet(progressKey(p),JSON.stringify(merged));
        fire();
        return await CourseDB.saveCourseSnapshot(term(),merged,p);
      }
      catch(e){ console.warn("116 course progress sync failed",e); return {ok:false,error:e}; }
    },

    /** 模組總星數 */
    moduleStars: function (mod) {
      var lv = this.levels(mod), n = 0;
      for (var k in lv) if (Object.prototype.hasOwnProperty.call(lv, k)) n += (lv[k].stars || 0);
      return n;
    },

    /** 單元的一個部分（config.js 的 parts）：有 mod 就只算那幾關，沒有就算整個 id 模組 */
    partStars: function (p) {
      if (!p.mod) return this.moduleStars(p.id);
      var self = this; return (p.levels || []).reduce(function (a, id) { return a + ((self.level(p.mod, id) || {}).stars || 0); }, 0);
    },
    partDone: function (p) {
      if (!p.mod) return this.moduleDone(p.id);
      var self = this; return (p.levels || []).filter(function (id) { var r = self.level(p.mod, id); return r && ((r.stars || 0) > 0 || r.done); }).length;
    },

    /** 模組完成幾關（stars ≥ 1 或 done） */
    moduleDone: function (mod) {
      var lv = this.levels(mod), n = 0;
      for (var k in lv) if (lv[k] && ((lv[k].stars || 0) > 0 || lv[k].done)) n++;
      return n;
    },

    /** 暫存草稿（Python 編輯器用；不算進度） */
    draft: function (key, value) {
      var p = this.me(); if (!p) return null;
      var k = PREFIX + '-' + term() + '-draft-' + p.cls + '-' + p.seat + '-' + key;
      if (value === undefined) return safeGet(k);
      safeSet(k, value); return value;
    },

    /** 匯出／匯入（仍保留作為舊資料救援與離線備份） */
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
      return '';
    }
  };

  function cloudLevel(mod,id,record,profile) {
    if(!window.CourseDB || typeof CourseDB.saveCourseLevel!=="function") return;
    Promise.resolve(CourseDB.ready).then(function(){
      return CourseDB.saveCourseLevel(term(),mod,id,record,profile);
    }).then(function(r){ if(r && r.ok) window.dispatchEvent(new CustomEvent("coursecloud:synced",{detail:{mod:mod,id:id}})); })
      .catch(function(e){ console.warn("116 course level cloud sync failed",e); });
  }
  function fire() { try { window.dispatchEvent(new CustomEvent('store:change')); } catch (e) {} }
  window.STORE = STORE;
  window.addEventListener("coursedb:ready",function(){ if(STORE.me()) STORE.syncCloud(); });
  // Firebase 穩定帳號可能是在 Python 頁稍後才登入；不能只在 SDK 初始 ready 時同步一次。
  window.addEventListener("courseauth:stable",function(){
    if(STORE.me()) STORE.syncCloud().then(function(r){
      if(!r || !r.ok) console.warn("116 legacy progress migration not completed",r);
    }).catch(function(e){console.warn("116 legacy progress migration failed",e);});
  });
})();
