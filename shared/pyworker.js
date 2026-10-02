/* =====================================================================
   Python 執行環境（Web Worker，跑在背景執行緒）
   ---------------------------------------------------------------------
   ★ 為什麼要放在 Worker：學生寫出 while True 停不下來時，
     主畫面不會跟著當掉 —— pyrunner.js 等 3 秒沒回應就直接把這個 Worker 砍掉重開。
   ★ input() 不是真的等使用者：每次執行都事先給好一串「輸入」，
     用完了就回報 need=true，由主畫面問使用者、再「從頭重跑一次」（重播法）。
     random 每次重跑都用同一個種子，所以重播的結果和剛才一模一樣。
   ★ time.sleep() 不會真的等（只記下來，畫面上用動畫表現）。

   訊息格式
     → { type:'init', url }
     ← { type:'ready', version } ／ { type:'fail', msg }
     → { type:'run', id, code, inputs:[...], seed }
     ← { type:'result', id, events:[[kind,text]...], error, need, used, features }
        kind：out（print 輸出）、prompt（input 的提示字）、in（使用者輸入）、sleep
   ===================================================================== */
/* global importScripts, loadPyodide */
var py = null;

var HARNESS = [
  'import sys, builtins, random, time, ast, json, traceback',
  '',
  'class _NeedInput(Exception): pass',
  'class _TooMuchOutput(Exception): pass',
  '',
  'def __c116_run(src, inputs, seed):',
  '    events = []',
  '    size = [0]',
  '    class W:',
  '        def write(self, s):',
  '            if not s: return 0',
  '            size[0] += len(s)',
  '            if size[0] > 20000: raise _TooMuchOutput()',
  '            if events and events[-1][0] == "out": events[-1][1] += s',
  '            else: events.append(["out", s])',
  '            return len(s)',
  '        def flush(self): pass',
  '    feed = list(inputs)',
  '    state = {"used": 0, "need": False}',
  '    def _input(prompt=""):',
  '        p = str(prompt)',
  '        if p: events.append(["prompt", p])',
  '        if state["used"] >= len(feed):',
  '            state["need"] = True',
  '            raise _NeedInput()',
  '        v = str(feed[state["used"]])',
  '        state["used"] += 1',
  '        events.append(["in", v])',
  '        return v',
  '    def _sleep(s=0):',
  '        events.append(["sleep", str(s)])',
  '    old = (sys.stdout, sys.stderr, builtins.input, time.sleep)',
  '    sys.stdout = sys.stderr = W()',
  '    builtins.input = _input',
  '    time.sleep = _sleep',
  '    random.seed(seed)',
  '    err = None',
  '    g = {"__name__": "__main__"}',
  '    try:',
  '        code = compile(src, "<你的程式>", "exec")',
  '        exec(code, g)',
  '    except _NeedInput:',
  '        pass',
  '    except _TooMuchOutput:',
  '        err = {"type": "TooMuchOutput", "msg": "", "line": None}',
  '    except SystemExit:',
  '        pass',
  '    except SyntaxError as e:',
  '        err = {"type": type(e).__name__, "msg": e.msg or "", "line": e.lineno, "text": (e.text or "").rstrip("\\n"), "col": e.offset}',
  '    except BaseException as e:',
  '        line = None',
  '        for f in traceback.extract_tb(e.__traceback__):',
  '            if f.filename == "<你的程式>": line = f.lineno',
  '        err = {"type": type(e).__name__, "msg": str(e), "line": line}',
  '    finally:',
  '        sys.stdout, sys.stderr, builtins.input, time.sleep = old',
  '    return json.dumps({"events": events, "error": err, "need": state["need"], "used": state["used"]}, ensure_ascii=False)',
  '',
  'def __c116_features(src):',
  '    try:',
  '        tree = ast.parse(src)',
  '    except BaseException:',
  '        return "null"',
  '    f = {"for": 0, "while": 0, "if": 0, "elif": 0, "else": 0, "and": 0, "or": 0, "not": 0,',
  '         "branches": 0, "calls": {}, "binops": {}, "compare": {}, "assign": 0, "fstring": 0, "lines": 0}',
  '    f["lines"] = len([l for l in src.splitlines() if l.strip() and not l.strip().startswith("#")])',
  '    elif_nodes = set()',
  '    for n in ast.walk(tree):',
  '        if isinstance(n, ast.For): f["for"] += 1',
  '        elif isinstance(n, ast.While): f["while"] += 1',
  '        elif isinstance(n, ast.If):',
  '            if id(n) in elif_nodes: continue',
  '            f["if"] += 1',
  '            chain, cur = 1, n',
  '            while len(cur.orelse) == 1 and isinstance(cur.orelse[0], ast.If) and cur.orelse[0].col_offset == cur.col_offset:',
  '                cur = cur.orelse[0]; elif_nodes.add(id(cur)); f["elif"] += 1; chain += 1',
  '            if cur.orelse: f["else"] += 1; chain += 1',
  '            f["branches"] = max(f["branches"], chain)',
  '        elif isinstance(n, ast.BoolOp):',
  '            k = "and" if isinstance(n.op, ast.And) else "or"',
  '            f[k] += len(n.values) - 1',
  '        elif isinstance(n, ast.UnaryOp) and isinstance(n.op, ast.Not): f["not"] += 1',
  '        elif isinstance(n, ast.Call):',
  '            fn = n.func',
  '            if isinstance(fn, ast.Name): name = fn.id',
  '            elif isinstance(fn, ast.Attribute) and isinstance(fn.value, ast.Name): name = fn.value.id + "." + fn.attr',
  '            else: name = None',
  '            if name: f["calls"][name] = f["calls"].get(name, 0) + 1',
  '        elif isinstance(n, ast.BinOp):',
  '            k = type(n.op).__name__; f["binops"][k] = f["binops"].get(k, 0) + 1',
  '        elif isinstance(n, ast.Compare):',
  '            for op in n.ops:',
  '                k = type(op).__name__; f["compare"][k] = f["compare"].get(k, 0) + 1',
  '        elif isinstance(n, (ast.Assign, ast.AugAssign)): f["assign"] += 1',
  '        elif isinstance(n, ast.JoinedStr): f["fstring"] += 1',
  '    return json.dumps(f)'
].join('\n');

self.onmessage = async function (e) {
  var m = e.data || {};
  if (m.type === 'init') {
    try {
      importScripts(m.url + 'pyodide.js');
      py = await loadPyodide({ indexURL: m.url });
      py.runPython(HARNESS);
      self.postMessage({ type: 'ready', version: py.version });
    } catch (err) {
      self.postMessage({ type: 'fail', msg: String(err && err.message || err) });
    }
    return;
  }
  if (m.type === 'run') {
    if (!py) { self.postMessage({ type: 'result', id: m.id, events: [], error: { type: 'EngineNotReady', msg: '' } }); return; }
    try {
      var run = py.globals.get('__c116_run');
      var feat = py.globals.get('__c116_features');
      var inputs = py.toPy(m.inputs || []);
      var res = JSON.parse(run(m.code, inputs, m.seed || 116));
      inputs.destroy();
      res.features = JSON.parse(feat(m.code));
      run.destroy(); feat.destroy();
      res.type = 'result'; res.id = m.id;
      self.postMessage(res);
    } catch (err) {
      self.postMessage({ type: 'result', id: m.id, events: [], error: { type: 'EngineError', msg: String(err && err.message || err) } });
    }
  }
};
