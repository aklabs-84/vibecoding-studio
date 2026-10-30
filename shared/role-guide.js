// 역할 가이드: 모든 학생 화면에 "🧭 내 역할" 버튼을 띄우고, 5가지 역할이 하는 일을 보여준다.
// 읽기 전용 도움말이다. 아무것도 저장하지 않고 진행 보고에도 영향을 주지 않는다.
// 역할 설명은 아래 ROLES 한 곳에서만 고친다.
(function () {
  const ROLES = [
    { id: 'leader', emoji: '👑', name: '팀장', duty: '문제 정의 이끌기 · 전체 방향 맞추기 · 마지막에 합치기',
      line: '팀이 같은 곳을 보게 이끌고, 마지막에 조각을 하나로 합쳐요.' },
    { id: 'researcher', emoji: '🔍', name: '리서처', duty: '사용자',
      line: '이 앱을 쓸 사람이 누구인지 파고들어요.' },
    { id: 'builder', emoji: '🛠', name: '빌더', duty: '기능 설계',
      line: '앱이 어떤 일을 해야 하는지 정해요.' },
    { id: 'maker', emoji: '🎨', name: '메이커', duty: '화면 구성',
      line: '화면을 예쁘고 쉽게 짜요.' },
    { id: 'storyteller', emoji: '🎤', name: '스토리텔러', duty: '앱 이름',
      line: '앱 이름과 한 줄 소개로 사람을 설득해요.' },
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // 내 역할: 직접 고른 역할 > AI가 추천한 역할 > 없음
  function myRoleId() {
    try {
      const d = window.StudioBridge ? StudioBridge.load() : {};
      const id = d.preferredRole || (d.teamProfile && d.teamProfile.detectedRole) || '';
      return ROLES.some(function (r) { return r.id === id; }) ? id : '';
    } catch (e) { return ''; }
  }
  function myRoleIsChosen() {
    try {
      const d = StudioBridge.load();
      return !!d.preferredRole;
    } catch (e) { return false; }
  }
  function byId(id) { return ROLES.filter(function (r) { return r.id === id; })[0] || null; }

  var css = [
    '.rg-fab{position:fixed;left:14px;bottom:14px;z-index:9990;display:flex;align-items:center;gap:8px;',
    'height:46px;padding:0 18px;border:0;border-radius:23px;background:#1b2340;color:#fff;',
    'font:700 15px/1 Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;cursor:pointer;',
    'box-shadow:0 6px 20px rgba(27,35,64,.28);transition:transform .15s,box-shadow .15s}',
    '.rg-fab:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(27,35,64,.34)}',
    '.rg-fab:focus-visible{outline:3px solid #3b82f6;outline-offset:3px}',
    '.rg-fab small{font-weight:600;font-size:13px;opacity:.8}',
    '.rg-back{position:fixed;inset:0;z-index:9995;background:rgba(27,35,64,.45);display:none;',
    'align-items:flex-end;justify-content:flex-start;padding:14px}',
    '.rg-back.on{display:flex}',
    '.rg-pop{width:min(440px,100%);max-height:calc(100vh - 28px);overflow:auto;background:#fff;border-radius:18px;',
    'box-shadow:0 18px 50px rgba(15,23,60,.3);font-family:Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;color:#1b2340}',
    '.rg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:20px 22px 12px}',
    '.rg-head h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.3px}',
    '.rg-head p{margin:6px 0 0;font-size:15px;line-height:1.55;color:#6b7690}',
    '.rg-x{flex:none;width:38px;height:38px;border:0;border-radius:10px;background:#eef2fb;color:#1b2340;font-size:20px;cursor:pointer}',
    '.rg-x:hover{background:#dfe6f5}',
    '.rg-list{list-style:none;margin:0;padding:6px 12px 14px}',
    '.rg-row{display:grid;grid-template-columns:44px 1fr;gap:12px;padding:13px 10px;border-radius:12px;align-items:start}',
    '.rg-row+.rg-row{border-top:1px solid #eef2fb}',
    '.rg-row .em{font-size:28px;line-height:1.2;text-align:center}',
    '.rg-row b{display:block;font-size:17px;font-weight:800}',
    '.rg-row .duty{display:block;margin-top:2px;font-size:15px;font-weight:700;color:#2563eb;line-height:1.5}',
    '.rg-row .line{display:block;margin-top:3px;font-size:14.5px;line-height:1.55;color:#6b7690}',
    '.rg-row.me{background:#eaf1ff;border-top-color:transparent}',
    '.rg-row.me+.rg-row{border-top-color:transparent}',
    '.rg-row .tag{display:inline-block;margin-left:8px;font-size:13px;font-weight:700;color:#2563eb;vertical-align:1px}',
    '.rg-foot{padding:0 22px 20px;font-size:14px;line-height:1.55;color:#6b7690}',
    '.rg-box{border:1.5px solid #bfd3ff;border-radius:14px;background:#f4f8ff;padding:16px 18px;',
    'font-family:Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;color:#1b2340;text-align:left}',
    '.rg-box .t{font-size:14px;font-weight:700;color:#2563eb;margin-bottom:6px}',
    '.rg-box .n{font-size:20px;font-weight:800;margin-bottom:4px}',
    '.rg-box .d{font-size:16px;font-weight:700;line-height:1.55}',
    '.rg-box .l{margin-top:4px;font-size:15px;line-height:1.6;color:#4a5573}',
    '.rg-box button{margin-top:12px;border:0;background:none;padding:0;font:700 15px Pretendard,sans-serif;color:#2563eb;cursor:pointer;text-decoration:underline}',
    '@media(max-width:640px){.rg-fab{height:44px;padding:0 15px}.rg-fab small{display:none}.rg-back{padding:0;align-items:flex-end}',
    '.rg-pop{width:100%;border-radius:18px 18px 0 0;max-height:86vh}}',
    '@media print{.rg-fab,.rg-back{display:none!important}}',
  ].join('');

  var back, pop, lastFocus;

  function build() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'rg-fab';
    fab.id = 'rgFab';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.innerHTML = '<span aria-hidden="true">🧭</span>내 역할<small id="rgFabSub"></small>';
    fab.addEventListener('click', open);
    document.body.appendChild(fab);

    back = document.createElement('div');
    back.className = 'rg-back';
    back.innerHTML = '<div class="rg-pop" role="dialog" aria-modal="true" aria-labelledby="rgTitle"></div>';
    pop = back.firstChild;
    back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });
    document.body.appendChild(back);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && back.classList.contains('on')) close();
    });
    refreshFab();
  }

  function refreshFab() {
    var sub = document.getElementById('rgFabSub');
    if (!sub) return;
    var r = byId(myRoleId());
    sub.textContent = r ? '· ' + r.emoji + ' ' + r.name : '';
  }

  function render() {
    var me = myRoleId();
    var mr = byId(me);
    var intro = mr
      ? (myRoleIsChosen()
        ? '내가 고른 역할은 <b>' + esc(mr.name) + '</b>이에요. 우리 팀이 함께 만들 앱에서 내가 맡는 부분이에요.'
        : 'AI가 추천한 내 역할은 <b>' + esc(mr.name) + '</b>이에요. 오후 첫 시간에 팀과 이야기하며 정해요.')
      : '아직 내 역할을 정하지 않았어요. 오후 첫 시간에 팀과 이야기하며 정해요. 아래에서 5가지 역할을 미리 읽어 봐요.';
    var rows = ROLES.map(function (r) {
      return '<li class="rg-row' + (r.id === me ? ' me' : '') + '"><span class="em" aria-hidden="true">' + r.emoji + '</span><span>' +
        '<b>' + esc(r.name) + (r.id === me ? '<span class="tag">← 내 역할</span>' : '') + '</b>' +
        '<span class="duty">' + esc(r.duty) + '</span>' +
        '<span class="line">' + esc(r.line) + '</span></span></li>';
    }).join('');
    pop.innerHTML =
      '<div class="rg-head"><div><h2 id="rgTitle">🧭 우리 팀 5가지 역할</h2><p>' + intro + '</p></div>' +
      '<button type="button" class="rg-x" aria-label="닫기" id="rgClose">×</button></div>' +
      '<ul class="rg-list">' + rows + '</ul>' +
      '<div class="rg-foot">앱을 만들다가 "내가 뭘 해야 하지?" 싶을 때 언제든 이 버튼을 눌러 보세요. 역할은 서로 도우며 함께 만드는 약속이에요.</div>';
    document.getElementById('rgClose').addEventListener('click', close);
  }

  function open() {
    if (!back) return;
    lastFocus = document.activeElement;
    render();
    back.classList.add('on');
    document.getElementById('rgClose').focus();
  }
  function close() {
    back.classList.remove('on');
    refreshFab();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // 화면 안에 넣는 안내 박스. target 요소 안에 내 역할이 하는 일을 보여 준다.
  // roleId를 넘기면 그 역할, 안 넘기면 저장된 내 역할을 쓴다.
  function renderBox(target, roleId, title) {
    if (typeof target === 'string') target = document.querySelector(target);
    if (!target) return;
    var r = byId(roleId || myRoleId());
    if (!r) { target.innerHTML = ''; target.style.display = 'none'; return; }
    target.style.display = '';
    target.innerHTML = '<div class="rg-box"><div class="t">' + esc(title || '이 역할은 앞으로 이런 일을 해요') + '</div>' +
      '<div class="n">' + r.emoji + ' ' + esc(r.name) + '</div>' +
      '<div class="d">' + esc(r.duty) + '</div>' +
      '<div class="l">' + esc(r.line) + '</div>' +
      '<button type="button" data-rg-open>5가지 역할 모두 보기</button></div>';
    target.querySelector('[data-rg-open]').addEventListener('click', open);
  }

  window.RoleGuide = { ROLES: ROLES, open: open, close: close, renderBox: renderBox, myRoleId: myRoleId, refresh: refreshFab };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
