// 앱 공통 푸터(AKLABS · 클래스로그AI · 아크의 실험실). 페이지 맨 아래에 붙인다.
// 링크 원본: ~/.claude/skills/aklabs-footer/links.json — 주소가 바뀌면 아래 LINKS도 같이 고친다.
// 스크립트 태그에 data-theme="retro"를 주면 몬스터 스타트업처럼 어두운 화면용 색으로 바뀐다.
(function () {
  var LINKS = [
    { label: '클래스로그AI', url: 'https://classlog-ai.vercel.app/' },
    { label: '아크의 실험실', url: 'https://ai-service-hub.vercel.app/' },
  ];
  var script = document.currentScript;
  var retro = script && script.getAttribute('data-theme') === 'retro';

  var css = [
    '.aklabs-foot{',
    retro
      ? '--f-bg:#1a0b2a;--f-ink:#f0e0b8;--f-sub:#b9a6d6;--f-line:#3b1d5c;--f-accent:#c9951c;font-family:Galmuri11,var(--kr,sans-serif);'
      : '--f-bg:#f4f7ff;--f-ink:#1b2340;--f-sub:#6b7690;--f-line:#dfe6f5;--f-accent:#2563eb;font-family:Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;',
    'display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:4px 24px;',
    'margin:48px 0 0;min-height:56px;box-sizing:border-box;padding:16px 28px;border-top:1px solid var(--f-line);background:var(--f-bg);',
    'font-size:14px;line-height:1.5;color:var(--f-sub);text-align:left;clear:both}',
    '.aklabs-foot b{color:var(--f-ink);font-weight:700;letter-spacing:.04em}',
    '.aklabs-foot nav{display:flex;gap:4px 24px;flex-wrap:wrap;border:0;padding:0;margin:0}',
    '.aklabs-foot a{color:var(--f-sub);text-decoration:none;display:inline-flex;align-items:center;min-height:40px;border-bottom:1px solid transparent}',
    '.aklabs-foot a:hover,.aklabs-foot a:focus-visible{color:var(--f-accent);border-bottom-color:var(--f-accent)}',
    /* 모바일: 왼쪽 아래 떠 있는 "내 역할" 버튼이 글자를 가리지 않게 아래 여백을 둔다 */
    '@media(max-width:820px){.aklabs-foot{padding:16px 16px 68px;flex-direction:column;align-items:center;text-align:center;gap:2px}',
    '.aklabs-foot nav{justify-content:center}}',
    '@media print{.aklabs-foot{display:none!important}}',
  ].join('');

  function build() {
    if (document.querySelector('.aklabs-foot')) return;
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    var f = document.createElement('footer');
    f.className = 'aklabs-foot';
    f.innerHTML = '<b>AKLABS</b><nav aria-label="관련 사이트">' + LINKS.map(function (l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + '</a>';
    }).join('') + '</nav>';
    document.body.appendChild(f);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
