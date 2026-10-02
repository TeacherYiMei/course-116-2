/* 🧪 多媒體概念 M1～M4（前端：shared/media-labs.js） */
(function () {
  var rnd = svRnd, pick = svPick, shuffle = svShuffle;

  /* 📺 解析度與影格（M1） */
  var RES = [{ n: 'SD 480p', w: 720, h: 480 }, { n: 'HD 720p', w: 1280, h: 720 }, { n: 'Full HD 1080p', w: 1920, h: 1080 }, { n: '4K 2160p', w: 3840, h: 2160 }, { n: '8K 4320p', w: 7680, h: 4320 }];
  var PAIRS = [[1, 2, 2.25], [2, 3, 4], [3, 4, 4], [1, 3, 9], [2, 4, 16]];
  SV.labs.resFrame = {
    make: function (hard) {
      var q, boxes = null;
      if (!hard) {
        var a = rnd(4), b = a + 1 + rnd(4 - a), sec = 2 + rnd(5), fps = pick([24, 30, 60]), opts = shuffle([a, b]);
        q = [{ k: 'wh', t: '「' + RES[a].n + '」的畫面是 水平 × 垂直 多少像素？', w: RES[a].w, h: RES[a].h, r: a },
          { k: 'fr', t: '一段 ' + sec + ' 秒的影片，每秒 ' + fps + ' 格（' + fps + 'fps），一共有幾張畫面？', v: sec * fps },
          { k: 'hi', t: '「' + RES[b].n + '」和「' + RES[a].n + '」比，哪一個畫面比較細緻？', v: opts.indexOf(b), opts: opts.map(function (o) { return RES[o].n; }) }];
      } else {
        var p = pick(PAIRS), m = pick([0, 1]), s = 5 + rnd(50), fps2 = pick([24, 30, 60]), ir = pick([1, 2]);
        q = [{ k: 'x', t: '「' + RES[p[1]].n + '」的像素數量，是「' + RES[p[0]].n + '」的幾倍？', v: p[2] },
          { k: 'fr', t: '一段 ' + m + ' 分 ' + s + ' 秒的影片，' + fps2 + 'fps，一共有幾張畫面？', v: (m * 60 + s) * fps2 },
          { k: 'il', t: '「' + RES[ir].h + 'i」隔行掃描：每一格畫面只有奇數或偶數行，一格有幾行？', v: RES[ir].h / 2 }];
        boxes = [RES[p[0]], RES[p[1]]];
      }
      return { pub: { q: q.map(function (x) { return { k: x.k, t: x.t, opts: x.opts }; }), boxes: boxes }, sec: { q: q, hard: hard } };
    },
    check: function (s, v) {
      var q = s.q, a = v.a || [];
      for (var i = 0; i < q.length; i++) {
        var x = q[i], g = a[i] || {};
        if (x.k === 'wh' && (+g.w !== x.w || +g.h !== x.h)) return svNo('第 ' + (i + 1) + ' 題：' + RES[x.r].n + ' 不是 ' + g.w + '×' + g.h + '。', '480p＝720×480、720p＝1280×720、1080p＝1920×1080、2160p（4K）＝3840×2160。');
        if (x.k === 'hi' && +g.o !== x.v) return svNo('第 ' + (i + 1) + ' 題：解析度的數字越大，像素越多、畫面越細緻。', '比比看垂直的數字：480 < 720 < 1080 < 2160 < 4320。');
        if (x.k !== 'wh' && x.k !== 'hi' && !(Math.abs(parseFloat(g.v) - x.v) <= 1e-9)) {
          var h = { fr: '影格數＝總秒數 × fps' + (s.hard ? '（先把分鐘換成秒：1 分 ＝ 60 秒）' : ''), x: '像素數量＝水平 × 垂直；兩個相除。例：1080p 是 1920×1080。', il: '隔行掃描一格只掃一半的行（奇數行或偶數行）。' }[x.k];
          return svNo('第 ' + (i + 1) + ' 題算得不對。', h);
        }
      }
      return svYes(s.hard ? '全對！像素多幾倍、檔案就大幾倍；影格越多動作越流暢。' : '全對！解析度越高畫面越細緻；fps 越高動作越流暢，檔案也越大。');
    }
  };

  /* 🎞️ 翻頁動畫（M2）：畫面打亂送出，前端只知道「畫面上的第幾張」 */
  SV.labs.flipbook = {
    make: function (hard) {
      var N = hard ? pick([8, 10]) : pick([6, 8]), T = hard ? pick([0.25, 0.5, 2]) : pick([0.5, 1]);
      var frames = []; for (var i = 0; i < N; i++) frames.push({ x: Math.round((10 + i * (80 / (N - 1))) * 10) / 10, y: 70 - Math.round(Math.sin(i / (N - 1) * Math.PI) * 45) });
      var order = shuffle(frames.map(function (_, k) { return k; }));   // order[畫面上的第 k 張] ＝ 真正的第幾格
      var extra = hard ? { m: rnd(2), s: 10 + rnd(49), f: pick([24, 30, 60]) } : null;
      return { pub: { N: N, T: T, frames: order.map(function (k) { return frames[k]; }), extra: extra }, sec: { N: N, T: T, order: order, extra: extra } };
    },
    check: function (s, v) {
      var seq = (v.seq || []).map(Number);
      if (seq.length !== s.N || seq.some(function (k, i) { return s.order[k] !== i; })) return svNo('順序不對，球會跳來跳去。', '球越往右，時間越晚。從最左邊那張開始點。', null, { reset: true });
      if (!(Math.abs(parseFloat(v.fps) - s.N / s.T) <= 1e-9)) return svNo('fps 算得不對：' + s.N + ' 張要在 ' + s.T + ' 秒內播完。', 'fps ＝ 張數 ÷ 秒數。');
      var x = s.extra;
      if (x && +v.tot !== (x.m * 60 + x.s) * x.f) return svNo('最後一題的影格數不對。', '先換成秒：' + x.m + ' 分 ' + x.s + ' 秒 ＝ ' + x.m + '×60＋' + x.s + ' 秒，再乘 fps。');
      return svYes('一張張靜止的畫面快速播放，眼睛來不及分辨，就覺得在動 —— 這就是「視覺暫留」。');
    }
  };

  /* 🎚️ 多重軌道（M3）：哪一段是畫面、哪一段要疊在上層，只有伺服器知道 */
  var CLIPS = [
    { id: 'bg', t: '🎞️ 主角全景影片', kind: 'base', len: 10 },
    { id: 'title', t: '🔤 標題文字', kind: 'over', len: 3 },
    { id: 'pip', t: '🖼️ 子母畫面（小畫面）', kind: 'over', len: 4 },
    { id: 'logo', t: '🏷️ 去背貼圖', kind: 'over', len: 3 },
    { id: 'music', t: '🎵 配樂', kind: 'audio', len: 10 },
    { id: 'voice', t: '🗣️ 旁白', kind: 'audio', len: 4 }
  ];
  SV.labs.timeline = {
    make: function (hard) {
      var clips = [CLIPS[0]].concat(hard ? shuffle(CLIPS.slice(1, 4)).slice(0, 2) : [pick(CLIPS.slice(1, 4))]).concat(hard ? [CLIPS[4], CLIPS[5]] : [pick(CLIPS.slice(4))]), want = {};
      if (hard) { var ov = clips.filter(function (c) { return c.kind === 'over'; }), s1 = rnd(2), s2 = s1 + ov[0].len + 1 + rnd(2); want[ov[0].id] = s1; want[ov[1].id] = s2; want.bg = 0; want.music = 0; want.voice = 2 + rnd(4); }
      clips = shuffle(clips);
      return { pub: { hard: hard, clips: clips.map(function (c) { return { id: c.id, t: c.t, len: c.len, at: want[c.id] }; }) }, sec: { hard: hard, clips: clips, want: want } };
    },
    check: function (s, v) {
      var place = v.place || {}, start = v.start || {}, clips = s.clips, i;
      for (i = 0; i < clips.length; i++) {
        var c = clips[i], tr = place[c.id];
        if (c.kind === 'audio' && !/^A/.test(tr)) return svNo(c.t + ' 是聲音，要放在音訊軌。', '影像軌放畫面，音訊軌放聲音。');
        if (c.kind !== 'audio' && /^A/.test(tr)) return svNo(c.t + ' 是畫面，要放在影像軌。', '影像軌放畫面，音訊軌放聲音。');
        if (c.kind === 'base' && tr !== 'V1') return svNo('全景影片放在上層，會把其他畫面整個蓋住！', '上層蓋下層：全景影片放下層 V1，文字、小畫面、貼圖放上層 V2。');
        if (c.kind === 'over' && tr !== 'V2') return svNo(c.t + ' 放在下層，會被全景影片蓋住，看不到。', '要疊在畫面上的東西，放上層 V2。');
        if (s.hard && +start[c.id] !== s.want[c.id]) return svNo(c.t + ' 要在第 ' + s.want[c.id] + ' 秒出現。', '把開始秒數填成它要出現的時間。');
      }
      if (!s.hard) {
        var au = clips.filter(function (c) { return c.kind === 'audio'; });
        if (au.length > 1 && place[au[0].id] === place[au[1].id]) return svNo('兩段聲音同時播，放在同一條音軌會重疊。', '同時播放的聲音，分開放兩條音軌。');
      } else {
        for (i = 0; i < clips.length; i++) for (var j = i + 1; j < clips.length; j++) {
          var a = clips[i], b = clips[j];
          if (place[a.id] === place[b.id] && +start[a.id] < +start[b.id] + b.len && +start[b.id] < +start[a.id] + a.len)
            return svNo(a.t + ' 和 ' + b.t + ' 在同一條軌道上時間重疊了。', '同一條軌道同一時間只能有一段；時間重疊的聲音分到兩條音軌。');
        }
      }
      return svYes('拖動預覽看看：上層的文字、小畫面疊在全景影片上面，聲音一起播放 —— 這就是多重軌道。');
    }
  };

  /* 📜 素材授權檢查（M4） */
  var MATS = [
    { id: 'own', t: '🎥 自己拍的主角影片', lic: '自己拍的', rule: 'free' },
    { id: 'pixa', t: '🎵 Pixabay 的配樂', lic: 'Pixabay：免費使用、可商用、不用標示', rule: 'free' },
    { id: 'pop', t: '🎤 最新的流行歌', lic: '唱片公司所有，沒有授權', rule: 'no' },
    { id: 'ccby', t: '📷 CC BY 的風景照片', lic: '創用 CC 姓名標示（CC BY）', rule: 'credit' },
    { id: 'ccnc', t: '🔔 CC BY-NC 的音效', lic: '創用 CC 姓名標示－非商業性（CC BY-NC）', rule: 'nc' },
    { id: 'ccnd', t: '🎨 CC BY-ND 的插圖', lic: '創用 CC 姓名標示－禁止改作（CC BY-ND）', rule: 'nd' },
    { id: 'web', t: '🖼️ 網路搜尋到的漂亮圖片', lic: '沒有寫授權', rule: 'no' },
    { id: 'yt', t: '📺 YouTuber 影片的片段', lic: '創作者所有，沒有授權', rule: 'no' }
  ];
  function verdict(m, commercial, edit) {
    if (m.rule === 'free') return 'ok';
    if (m.rule === 'no') return 'no';
    if (m.rule === 'credit') return 'credit';
    if (m.rule === 'nc') return commercial ? 'no' : 'credit';
    if (m.rule === 'nd') return edit ? 'no' : 'credit';
  }
  SV.labs.licenseCheck = {
    make: function (hard) {
      var commercial = !!hard, edit = !!hard || rnd(2) === 0;
      var mats = shuffle(MATS.filter(function (m) { return hard ? true : m.rule !== 'nd' || !edit; })).slice(0, hard ? 6 : 5);
      if (hard && !mats.some(function (m) { return m.rule === 'nc'; })) mats[0] = MATS[4];
      if (hard && !mats.some(function (m) { return m.rule === 'nd'; })) mats[1] = MATS[5];
      return { pub: { commercial: commercial, edit: edit, mats: mats.map(function (m) { return { id: m.id, t: m.t, lic: m.lic }; }) }, sec: { commercial: commercial, edit: edit, mats: mats } };
    },
    check: function (s, v) {
      var ans = v.ans || {}, wrong = s.mats.filter(function (m) { return ans[m.id] !== verdict(m, s.commercial, s.edit); });
      if (wrong.length) {
        var m = wrong[0], x = verdict(m, s.commercial, s.edit);
        var why = { ok: '這項可以直接使用。', credit: '可以用，但要在片尾標示作者和授權。', no: m.rule === 'nc' ? '這是商業廣告，NC（非商業性）的素材不能用。' : m.rule === 'nd' ? '素材要剪輯、加字，ND（禁止改作）的素材不能改。' : '沒有授權的素材不能放進要公開的影片。' }[x];
        return svNo(wrong.length + ' 項判斷得不對，例如「' + m.t + '」：' + why, '一項一項看授權：BY 要標示、NC 不能商業、ND 不能修改、沒寫授權就不能用。');
      }
      return svYes('素材都合法！自己拍的最安全；用別人的素材，要照授權的規定（標示作者、能不能商業、能不能修改）。');
    }
  };
  SV._media = { RES: RES, MATS: MATS, verdict: verdict, CLIPS: CLIPS };
})();
