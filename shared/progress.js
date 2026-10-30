/**
 * 바이브코딩 스튜디오 - 진행 상황 보고 (선생님 화면용)
 * 쓰는 법: StudioProgress.report({ page: 0, pageLabel: '팀 프로필', stepNo: 2, stepTotal: 4, stepLabel: 'AI에게 물어보기' })
 *  - 단계가 바뀔 때 바로 한 번, 켜져 있는 동안 20초마다 한 번 "아직 여기 있어요" 신호를 보낸다.
 *  - 창을 닫거나 다른 화면으로 가면 "나갔어요" 신호를 보낸다.
 *  - 어떤 이유로든 보내기에 실패해도 학생 화면은 아무 영향 없이 계속 동작한다. (오류를 밖으로 내지 않음)
 *  - ClassLog에서 입장(entryCode)한 학생만 보낸다. 혼자 연습하는 경우는 아무것도 보내지 않는다.
 */
(function (global) {
  const STATE_KEY = 'vcs_progress_state';
  const NAME_KEY = 'vcs_progress_name';
  const ENTRY_KEY = 'vcs_classlog_entry_code';
  const HEARTBEAT_MS = 20000;
  const DEBOUNCE_MS = 300;

  let current = null;
  let timer = null;
  let debounce = null;
  let started = false;

  function safeGet(store, key) { try { return store.getItem(key); } catch (e) { return null; } }
  function safeSet(store, key, val) { try { store.setItem(key, val); } catch (e) {} }

  function entryCode() { return safeGet(sessionStorage, ENTRY_KEY) || ''; }

  // 입장할 때 URL로 넘어온 이름을 따로 기억한다. (학생이 화면에서 이름칸을 고쳐도 반 명단과 맞게)
  function studentName() {
    try {
      const fromUrl = new URLSearchParams(location.search).get('studentName');
      if (fromUrl) safeSet(sessionStorage, NAME_KEY, fromUrl);
    } catch (e) {}
    if (safeGet(sessionStorage, NAME_KEY)) return safeGet(sessionStorage, NAME_KEY);
    try { return (global.StudioBridge && global.StudioBridge.load().studentName) || ''; } catch (e) { return ''; }
  }

  function readState() {
    try { return JSON.parse(safeGet(sessionStorage, STATE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function addPage(listName, page) {
    const st = readState();
    const list = new Set(st[listName] || []);
    list.add(page);
    st[listName] = Array.from(list).sort();
    safeSet(sessionStorage, STATE_KEY, JSON.stringify(st));
  }
  function teamName() {
    try {
      const d = global.StudioBridge && global.StudioBridge.load();
      return (d && (d.teamName || (d.teamProfile && d.teamProfile.teamName))) || '';
    } catch (e) { return ''; }
  }

  function payload(online) {
    const st = readState();
    return Object.assign({}, current, {
      entryCode: entryCode(),
      studentName: studentName(),
      teamName: teamName(),
      completedPages: st.completed || [],
      submittedPages: st.submitted || [],
      online: online !== false,
    });
  }

  function send(online, leaving) {
    if (!current || !entryCode() || !studentName()) return;
    try {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(online)),
        keepalive: !!leaving,
      }).catch(function () {});
    } catch (e) {}
  }

  function sendSoon() {
    clearTimeout(debounce);
    debounce = setTimeout(function () { send(true, false); }, DEBOUNCE_MS);
  }

  function start() {
    if (started) return;
    started = true;
    // 40명이 동시에 신호를 보내지 않도록 시작 시점을 조금씩 흩는다.
    timer = setInterval(function () {
      if (document.visibilityState === 'visible') send(true, false);
    }, HEARTBEAT_MS + Math.floor(Math.random() * 3000));
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') send(true, false);
    });
    window.addEventListener('pagehide', function () { send(false, true); });
    watchVersion();
  }

  // 새 버전이 올라오면 안내만 띄운다. 쓰던 내용이 날아가지 않도록 저절로 새로고침하지는 않는다.
  var PAGE_VERSION = '2026-10-30-c';
  function watchVersion() {
    var shown = false;
    function check() {
      if (shown) return;
      fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || !j.v || j.v === PAGE_VERSION || shown) return;
          shown = true;
          var bar = document.createElement('div');
          bar.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;background:#1b2340;color:#fff;padding:12px 16px;border-radius:12px;font:600 14px/1.4 sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);display:flex;gap:12px;align-items:center;max-width:92vw';
          bar.innerHTML = '<span>새 버전이 나왔어요. 쓰던 내용을 저장한 뒤 새로고침해 주세요.</span>';
          var b = document.createElement('button');
          b.textContent = '새로고침';
          b.style.cssText = 'border:0;border-radius:8px;padding:8px 12px;background:#3b82f6;color:#fff;font:800 14px sans-serif;cursor:pointer';
          b.onclick = function () { location.reload(); };
          bar.appendChild(b);
          document.body.appendChild(bar);
        }).catch(function () {});
    }
    setTimeout(check, 5000 + Math.floor(Math.random() * 5000));
    setInterval(check, 120000 + Math.floor(Math.random() * 20000));
  }

  global.StudioProgress = {
    // 지금 있는 위치를 알린다. 같은 위치를 연달아 불러도 괜찮다.
    report: function (info) {
      try {
        if (!entryCode()) return;
        current = {
          page: info.page,
          pageLabel: info.pageLabel || '',
          stepNo: info.stepNo == null ? undefined : info.stepNo,
          stepTotal: info.stepTotal == null ? undefined : info.stepTotal,
          stepLabel: info.stepLabel || '',
        };
        start();
        sendSoon();
      } catch (e) {}
    },
    // 한 화면(0~4)을 끝까지 마쳤을 때
    complete: function (page) { try { addPage('completed', page); sendSoon(); } catch (e) {} },
    // 한 화면의 결과를 제출했을 때
    submitted: function (page) { try { addPage('submitted', page); addPage('completed', page); sendSoon(); } catch (e) {} },
  };
})(window);
