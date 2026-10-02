/* =====================================================================
   🎲 密碼特務・隨機出題器（CARDGAME.gens）── 伺服器端
   ---------------------------------------------------------------------
   關卡裡寫 { type: 'gen', gen: '出題器名稱', n: 題數, prompt, tool }，
   每次「開始挑戰」都重新出題 → 每位學生、每一次的題目都不一樣，背答案沒有用。

   ⭐ 只在驗證伺服器（Google Apps Script）上執行：出題、檢查都在伺服器，網頁拿到的只有題目（見 server/30_cards.js 的 SV_PUB）。
     · 題目是當場隨機產生的（有種子，驗證時重新產生同一題），原始碼裡沒有「題目＋答案」的清單
     · 檢查答案時，是把學生的答案「照規則算回去」，看看是不是和題目對得上
   出題器回傳：[{ t, sub, icon, ph, hint, check(答案)→true/false, why(答案)→答對後的解說, tool, … }]
   ===================================================================== */
(function () {
  var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // 單字庫：國中生認得的英文單字（大寫，3～6 個字母）
  var WORDS = ('CAT DOG SUN MOON STAR BOOK CODE FISH GAME BIRD RAIN TREE SNOW MILK RICE CAKE BEAR LION FROG DUCK KITE SHIP ' +
    'BEACH CLOUD APPLE MANGO PIZZA ROBOT MUSIC PHONE TIGER PANDA HAPPY SMILE LIGHT WATER PLANT TRAIN CHAIR BREAD SPACE EARTH ' +
    'OCEAN CANDY HELLO WORLD SCHOOL FRIEND TAIWAN SECRET AGENT CLASS MOUSE HORSE SHEEP LEMON GRAPE PEACH JUICE DREAM ' +
    'RIVER HOUSE GREEN QUEEN TEACH LEARN PAPER PENCIL WINDOW GARDEN ORANGE BANANA MONKEY RABBIT DRAGON SUMMER WINTER').split(' ');
  var DICT = {}; WORDS.forEach(function (w) { DICT[w] = 1; });

  /* 亂數：伺服器出題時用 CARDGAME.rand（有種子、可以重現：驗證答案時重新產生同一題） */
  function rnd(n) { return Math.floor((CARDGAME.rand || Math.random)() * n); }
  function pick(arr) { return arr[rnd(arr.length)]; }
  function picks(arr, n) { var a = arr.slice(), out = []; while (out.length < n && a.length) out.push(a.splice(rnd(a.length), 1)[0]); return out; }
  function between(lo, hi) { return lo + rnd(hi - lo + 1); }

  function num(c) { return A.indexOf(c); }
  function shift(word, k) { return word.split('').map(function (c) { var i = num(c); return i < 0 ? c : A[((i + k) % 26 + 26) % 26]; }).join(''); }
  function vig(word, keys, dir) { return word.split('').map(function (c, i) { return A[((num(c) + dir * keys[i % keys.length]) % 26 + 26) % 26]; }).join(''); }
  function pairs(a, b, n) { return a.split('').slice(0, n || 3).map(function (c, i) { return c + '→' + b[i]; }).join('、') + (a.length > (n || 3) ? '…' : ''); }

  var G = {
    /* 字母 ↔ 編號（A＝0 … Z＝25） */
    letterNum: function (rd) {
      if (rd.hard) {   // 挑戰：整個單字 ↔ 編號串
        return picks(WORDS.filter(function (w) { return w.length >= 4 && w.length <= 5; }), rd.n || 2).map(function (w, i) {
          var nums = w.split('').map(num);
          if (i % 2 === 0) return { t: w, sub: '把整個單字換成編號（用逗號隔開）', icon: '🔤', ph: '例如 2,0,19',
            check: function (v) { return v.split(/[,、]+/).filter(Boolean).join(' ') === nums.join(' '); }, why: w.split('').map(function (c, k) { return c + '＝' + nums[k]; }).join('、') + '。', hint: '一個字母一個字母換，A＝0。' };
          var code = nums.join(' '); w = null;
          return { t: code, sub: '這串編號是哪一個英文單字？', icon: '🔢', ph: '輸入單字',
            check: function (v) { return v.split('').map(num).join(' ') === code; }, why: '每個編號換回字母就是答案。', hint: '0＝A、1＝B …… 25＝Z。' };
        });
      }
      var n = rd.n || 4, letters = picks(A.split(''), n);
      return letters.map(function (c, i) {
        var idx = num(c);
        if (i % 2 === 0) return { t: c, sub: 'A＝0，這個字母的編號是？', icon: '🔤', ph: '輸入數字',
          check: function (v) { return v === String(idx); }, why: c + ' 前面有 ' + idx + ' 個字母，從 0 開始數 → ' + idx + '。', hint: '從 A＝0 開始數，第一個字母是 0 不是 1。' };
        return { t: '編號 ' + idx, sub: '是哪一個字母？', icon: '🔢', ph: '輸入字母',
          check: function (v) { return v === c; }, why: '編號 ' + idx + ' → ' + c + '。', hint: 'A＝0、B＝1、C＝2…' };
      });
    },

    /* 轉盤繞圈：(編號 ± 位移) 超過就繞回來 */
    wrap: function (rd) {
      if (rd.hard) {   // 挑戰：字母直接繞圈、連續移兩次
        return [0, 1, 2, 3].slice(0, rd.n || 4).map(function (i) {
          if (i % 2 === 0) {
            var a = between(18, 25), s = between(26 - a, 15), c = A[a], ans = A[(a + s) % 26];
            return { t: '字母 ' + c + ' 往後移 ' + s + ' 格', sub: '是哪一個字母？', icon: '🎡', ph: '輸入字母',
              check: function (v) { return v === ans; }, why: c + '＝' + a + '，(' + a + ' + ' + s + ') % 26 ＝ ' + ((a + s) % 26) + ' → ' + ans + '。', hint: '先換成編號，加完超過 25 就減 26，再換回字母。' };
          }
          var b = between(0, 25), f = between(10, 25), k = between(3, 20), r2 = ((b + f - k) % 26 + 26) % 26;
          return { t: '編號 ' + b + ' 先往後移 ' + f + ' 格，再往前移 ' + k + ' 格', sub: '最後的編號是？', icon: '🔁', ph: '新的編號',
            check: function (v) { return v === String(r2); }, why: '(' + b + ' + ' + f + ' − ' + k + ') % 26 ＝ ' + r2 + '：往後 ' + f + '、往前 ' + k + '，等於一次移 ' + (f - k) + ' 格。', hint: '可以一步一步繞，也可以先算「總共移幾格」。' };
        });
      }
      var n = rd.n || 4, out = [];
      for (var i = 0; i < n; i++) {
        var back = i === n - 1, a, s, ans;
        if (back) { a = between(0, 5); s = between(a + 1, a + 9); ans = (a - s + 26) % 26; }
        else if (i % 2 === 0) { a = between(19, 25); s = between(26 - a, 12); ans = (a + s) % 26; }   // 一定會繞圈
        else { a = between(0, 14); s = between(2, 9); ans = (a + s) % 26; }                          // 不會繞圈
        out.push((function (a, s, ans, back) {
          return { t: '編號 ' + a + (back ? ' 往前移 ' : ' 往後移 ') + s + ' 格', sub: back ? '小於 0 就從 25 繞回來' : '超過 25 就從 0 繞回來', icon: '🎡', ph: '新的編號',
            check: function (v) { return v === String(ans); },
            why: back ? '(' + a + ' − ' + s + ' + 26) % 26 ＝ ' + ans + '：往前走過 A 就繞到 Z。' : (a + s > 25 ? '(' + a + ' + ' + s + ') % 26 ＝ ' + ans + '：超過 25，減掉 26 繞回來。' : a + ' + ' + s + ' ＝ ' + ans + '，沒有超過 25，不用繞。'),
            hint: back ? '先減，如果變成負的就再加 26。' : '先加，如果超過 25 就再減 26。' };
        })(a, s, ans, back));
      }
      return out;
    },

    /* 凱薩加密：隨機單字＋隨機金鑰 */
    caesarEnc: function (rd) {
      return picks(WORDS.filter(function (w) { return w.length <= (rd.max || 6) && w.length >= (rd.min || 3); }), rd.n || 3).map(function (w, i) {
        var k = rd.hard ? (i % 2 ? 26 + between(1, 9) : between(14, 25)) : between(1, rd.kmax || 25);
        return { t: w, sub: '加密，金鑰 ' + k + '（每個字母往後移 ' + k + ' 格）' + (k > 25 ? '　💡 金鑰比 26 大？繞一整圈等於沒動' : ''), icon: '🔒', ph: '輸入密文', toolShift: 0,
          check: function (v) { return v.length === w.length && shift(v, -k) === w; },
          why: function (v) { return pairs(w, v) + ' —— 每個字母都往後移 ' + k + ' 格' + (k > 25 ? '，也就是 ' + k + ' % 26 ＝ ' + (k % 26) + ' 格' : '') + '。'; },
          hint: k > 25 ? '移 26 格會回到原來的字母，所以只要移 ' + k + ' − 26 格。' : rd.tool === 'caesar' ? '轉動轉盤到位移 ' + k + '，上排找明文、下排讀密文。' : '查編號表：編號 + ' + k + '，超過 25 就減 26。' };
      });
    },

    /* 凱薩解密：只保留密文和金鑰；檢查時把學生的答案再加密一次比對 */
    caesarDec: function (rd) {
      return picks(WORDS, rd.n || 2).map(function (w) {
        var k = between(1, 25), c = shift(w, k); w = null;
        return { t: c, sub: '解密，金鑰 ' + k + '（每個字母往前移 ' + k + ' 格）', icon: '🔓', ph: '輸入明文', toolShift: 0,
          check: function (v) { return v.length === c.length && shift(v, k) === c; },
          why: function (v) { return pairs(c, v) + ' —— 解密就是往回移 ' + k + ' 格。'; },
          hint: '解密要反過來：在轉盤下排找密文，讀上排的明文。' };
      });
    },

    /* 暴力破解：不知道金鑰，只知道原文是一個英文單字 */
    bruteForce: function (rd) {
      if (rd.hard) {   // 挑戰：兩個單字用同一把金鑰，答案要兩個都對
        return [0, 1].slice(0, rd.n || 2).map(function () {
          var ws = picks(WORDS.filter(function (w) { return w.length >= 3 && w.length <= 5; }), 2), k = between(1, 25);
          var c = ws.map(function (w) { return shift(w, k); }).join(' '); ws = null;
          return { t: c, sub: '攔截到兩個單字（同一把金鑰）！把兩個單字都破解出來，用空格隔開', icon: '🕵️', ph: '例如 CAT DOG', toolShift: 0,
            check: function (v) { v = v.replace(/[^A-Z]/g, ''); var cs = c.split(' '), p = [v.slice(0, cs[0].length), v.slice(cs[0].length)]; if (p[1].length !== cs[1].length) return false;
              var k2 = (num(cs[0][0]) - num(p[0][0]) + 26) % 26; return p.every(function (w, i) { return !!DICT[w] && w.length === cs[i].length && shift(w, k2) === cs[i]; }); },
            why: function () { return '同一把金鑰，第一個單字試出來，第二個就直接解開了 —— 金鑰一旦被破解，所有密文都不安全。'; },
            hint: '先專心破解比較短的那個單字，找到金鑰後，用同一個位移解另一個。' };
        });
      }
      return picks(WORDS.filter(function (w) { return w.length >= 4; }), rd.n || 2).map(function (w) {
        var c = shift(w, between(1, 25)); w = null;
        return { t: c, sub: '攔截到的密文！金鑰不知道，只知道原文是一個英文單字', icon: '🕵️', ph: '輸入破解出的單字', toolShift: 0,
          check: function (v) { return !!DICT[v] && v.length === c.length && shift(v, (num(c[0]) - num(v[0]) + 26) % 26) === c; },
          why: function (v) { var k = (num(c[0]) - num(v[0]) + 26) % 26; return '金鑰是 ' + k + '！凱薩密碼只有 25 種金鑰，一個一個試完就破解了 —— 這叫「暴力破解」，電腦一眨眼就能做完。'; },
          hint: '轉動轉盤，一格一格試，看哪一個位移會讓密文變成一個英文單字。' };
      });
    },

    /* 維吉尼亞加密：每個位置用不同金鑰 */
    vigEnc: function (rd) {
      return picks(WORDS.filter(function (w) { return w.length >= 4 && w.length <= 6; }), rd.n || 2).map(function (w) {
        var keys = [], nk = rd.keys || 3;
        for (var j = 0; j < (rd.seq ? w.length : nk); j++) keys.push(rd.seq ? j + 1 : between(1, 9));
        return { t: w, sub: rd.seq ? '加密法 1：第 1 個字母金鑰 1、第 2 個金鑰 2 ……' : '維吉尼亞加密，金鑰依序 ' + keys.join('、') + '（用完再從頭）', icon: '📜', ph: '輸入密文',
          check: function (v) { return v.length === w.length && vig(v, keys, -1) === w; },
          why: function (v) { return w.split('').map(function (ch, i) { return ch + '+' + keys[i % keys.length] + '＝' + v[i]; }).join('、') + '。同一個字母可能變成不同的密文，比凱薩難破解。'; },
          hint: rd.seq ? '第 n 個字母往後移 n 格。' : keys.map(function (x, i) { return '第 ' + (i + 1) + ' 個字母移 ' + x + ' 格'; }).join('、') + '，第 ' + (keys.length + 1) + ' 個又從 ' + keys[0] + ' 開始。' };
      });
    },

    /* 維吉尼亞解密（挑戰）：每個位置往前移不同格數；檢查時把答案再加密一次比對 */
    vigDec: function (rd) {
      return picks(WORDS.filter(function (w) { return w.length >= 4 && w.length <= 6; }), rd.n || 2).map(function (w) {
        var keys = [], nk = rd.keys || (2 + rnd(3));
        for (var j = 0; j < nk; j++) keys.push(between(1, 12));
        var c = vig(w, keys, 1); w = null;
        return { t: c, sub: '維吉尼亞解密，金鑰依序 ' + keys.join('、') + '（每個字母往前移）', icon: '🗝️', ph: '輸入明文',
          check: function (v) { return v.length === c.length && vig(v, keys, 1) === c; },
          why: function (v) { return c.split('').map(function (ch, i) { return ch + '−' + keys[i % keys.length] + '＝' + v[i]; }).join('、') + '。解密就是每個位置往前移回去。'; },
          hint: '第 1 個字母往前 ' + keys[0] + ' 格、第 2 個往前 ' + keys[1] + ' 格……小於 A 就從 Z 繞回來。' };
      });
    },

    /* 答題統計：隨機產生全班的作答，問答對人數、選某個選項的人數、答對率 */
    tally: function (rd) {
      if (rd.hard) return tallyHard();
      var n = between(10, 14), key = pick(['A', 'B', 'C', 'D']), ans = [];
      for (var i = 0; i < n; i++) ans.push(rnd(100) < 55 ? key : pick(['A', 'B', 'C', 'D']));
      var right = ans.filter(function (x) { return x === key; }).length;
      var other = pick(['A', 'B', 'C', 'D'].filter(function (x) { return x !== key; })), cnt = ans.filter(function (x) { return x === other; }).length;
      var rate = Math.round(right / n * 100), data = { ans: ans, key: key };
      var sub = '全班 ' + n + ' 人作答，正解是 ' + key;
      return [
        { t: '答對的有幾人？', sub: sub, icon: '✅', ph: '輸入人數', data: data, tool: 'tally',
          check: function (v) { return v === String(right); }, why: '一個一個看，是 ' + key + ' 就 +1 —— 這就是 COUNTIF 在做的事。', hint: '用下面的表，把選 ' + key + ' 的點起來。' },
        { t: '選 ' + other + ' 的有幾人？', sub: sub, icon: '🔍', ph: '輸入人數', data: data, tool: 'tally',
          check: function (v) { return v === String(cnt); }, why: '換一個條件（' + other + '）再數一次。錯最多的選項，就是大家最容易誤會的地方。', hint: '這次數的是 ' + other + '，不是正解。' },
        { t: '答對率是幾 %？', sub: sub + '（四捨五入到整數）', icon: '📊', ph: '輸入數字（不用打 %）', data: data, tool: 'tally',
          check: function (v) { return v.replace('%', '') === String(rate); }, why: '答對率 ＝ 答對人數 ÷ 作答人數 × 100 ＝ ' + right + ' ÷ ' + n + ' × 100 ≈ ' + rate + '%。', hint: '答對人數 ÷ 作答人數 × 100，再四捨五入。' }
      ];
    }
  };

  /* 答題統計挑戰：人數更多，還要找出「錯最多的選項」（最容易誤會的地方） */
  function tallyHard() {
    var n, key, ans, wrong, top;
    for (;;) {
      n = between(18, 24); key = pick(['A', 'B', 'C', 'D']); ans = [];
      for (var i = 0; i < n; i++) ans.push(rnd(100) < 45 ? key : pick(['A', 'B', 'C', 'D']));
      wrong = ['A', 'B', 'C', 'D'].filter(function (x) { return x !== key; }).map(function (x) { return [x, ans.filter(function (y) { return y === x; }).length]; }).sort(function (a, b) { return b[1] - a[1]; });
      if (wrong[0][1] > wrong[1][1]) break;   // 錯最多的只能有一個
    }
    top = wrong[0][0];
    var right = ans.filter(function (x) { return x === key; }).length, wr = n - right, rate = Math.round(right / n * 100);
    var data = { ans: ans, key: key }, sub = '全班 ' + n + ' 人作答，正解是 ' + key;
    return [
      { t: '答錯的有幾人？', sub: sub, icon: '❌', ph: '輸入人數', data: data, tool: 'tally',
        check: function (v) { return v === String(wr); }, why: '答錯人數 ＝ 作答人數 − 答對人數。', hint: '先數答對的，再用全班人數減掉。' },
      { t: '哪一個「錯誤選項」最多人選？', sub: sub, icon: '🔍', ph: '輸入 A～D', data: data, tool: 'tally',
        check: function (v) { return v === top; }, why: '錯最多的是 ' + top + '（' + wrong[0][1] + ' 人）—— 老師下次上課要特別說明 ' + top + ' 為什麼不對。', hint: '三個錯誤選項各數一次，比比看。' },
      { t: '答對率是幾 %？', sub: sub + '（四捨五入到整數）', icon: '📊', ph: '輸入數字（不用打 %）', data: data, tool: 'tally',
        check: function (v) { return v.replace('%', '') === String(rate); }, why: '答對率 ＝ ' + right + ' ÷ ' + n + ' × 100 ≈ ' + rate + '%。', hint: '答對人數 ÷ 作答人數 × 100，再四捨五入。' }
    ];
  }

  window.CARDGAME = window.CARDGAME || {};
  CARDGAME.gens = Object.assign(CARDGAME.gens || {}, G);
  CARDGAME.cipher = { shift: shift, vig: vig, WORDS: WORDS };      // 給測試與其他頁面用

})();
