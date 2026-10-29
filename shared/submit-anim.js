// 제출 진행 상태 애니메이션 (제출 중 → 성공/실패). CSS는 스스로 넣는다.
// 사용: const ok = await SubmitAnim.run({ statusEl, btnEl, task: () => 제출함수(), doneLabel: '✅ 제출 완료 · 다시 제출하기' })
const SubmitAnim = (() => {
  const CSS = `
.sa-box{display:flex;align-items:center;gap:12px;margin-top:12px;padding:12px 14px;border-radius:12px;font-size:14px;font-weight:600;line-height:1.5}
.sa-sending{background:#eef4ff;color:#1d4ed8}
.sa-ok{background:#e9f9ef;color:#15803d;animation:sa-pop .5s cubic-bezier(.2,1.6,.4,1) both}
.sa-err{background:#fdecec;color:#b91c1c;animation:sa-shake .45s ease both}
.sa-icon{flex:0 0 36px;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.sa-spin{width:26px;height:26px;border:3px solid currentColor;border-right-color:transparent;border-radius:50%;animation:sa-rot .8s linear infinite}
.sa-plane{display:inline-block;font-size:20px;animation:sa-fly 1.1s ease-in-out infinite}
.sa-check circle{fill:none;stroke:currentColor;stroke-width:3;stroke-dasharray:101;stroke-dashoffset:101;animation:sa-draw .5s ease forwards}
.sa-check path{fill:none;stroke:currentColor;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:30;stroke-dashoffset:30;animation:sa-draw .35s .4s ease forwards}
.sa-retry{margin-left:auto;border:1.5px solid currentColor;background:#fff;color:inherit;border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer;font-size:13px}
@keyframes sa-rot{to{transform:rotate(360deg)}}
@keyframes sa-fly{0%{transform:translate(-6px,4px) rotate(-8deg);opacity:.4}50%{transform:translate(6px,-4px) rotate(8deg);opacity:1}100%{transform:translate(-6px,4px) rotate(-8deg);opacity:.4}}
@keyframes sa-draw{to{stroke-dashoffset:0}}
@keyframes sa-pop{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes sa-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@media (prefers-reduced-motion:reduce){.sa-box,.sa-spin,.sa-plane,.sa-check circle,.sa-check path{animation:none!important;stroke-dashoffset:0!important}}`;
  let injected = false;
  function inject() {
    if (injected) return;
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    injected = true;
  }
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function show(el, cls, icon, text, retry) {
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `<div class="sa-box ${cls}"><span class="sa-icon">${icon}</span><span>${esc(text)}</span>${retry ? '<button type="button" class="sa-retry">다시 보내기</button>' : ''}</div>`;
  }

  async function run({ statusEl, btnEl, task, doneLabel }) {
    inject();
    const idleLabel = btnEl ? btnEl.innerHTML : '';
    if (btnEl) btnEl.disabled = true;
    show(statusEl, 'sa-sending', '<span class="sa-plane">📨</span>', '선생님께 보내는 중이에요… 창을 닫지 마세요');
    const started = Date.now();
    try {
      await task();
      // 너무 빨리 끝나도 "보내는 중"이 눈에 보이도록 잠깐 보여 준다
      const wait = 700 - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      show(statusEl, 'sa-ok',
        '<svg class="sa-check" viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="16"/><path d="M10.5 18.5l5 5 10-11"/></svg>',
        '선생님께 도착했어요!');
      if (btnEl) { btnEl.innerHTML = doneLabel || '✅ 제출 완료 · 다시 제출하기'; btnEl.disabled = false; }
      return true;
    } catch (e) {
      show(statusEl, 'sa-err', '<span style="font-size:24px">⚠️</span>', (e && e.message) || '제출하지 못했어요', true);
      const retry = statusEl.querySelector('.sa-retry');
      if (retry && btnEl) retry.onclick = () => btnEl.click();
      if (btnEl) { btnEl.innerHTML = idleLabel; btnEl.disabled = false; }
      return false;
    }
  }
  return { run };
})();
