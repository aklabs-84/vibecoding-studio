/**
 * 바이브코딩 스튜디오 - 단계 간 데이터 브릿지
 * localStorage 키: "vcs_studio_data"
 */
(function (global) {
  const STORAGE_KEY = 'vcs_studio_data';
  const CODECANVAS_URL = 'https://code-canvas-fawn.vercel.app';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function save(patch) {
    const current = load();
    const next = Object.assign({}, current, patch, { updatedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ClassLog 교실에서 진입할 때 URL 쿼리(?entryCode=...&studentName=...)로
  // 넘어온 값을 저장한다. entryCode가 있어야 submitResult()로 제출 가능하다.
  function captureEntryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const entryCode = params.get('entryCode');
    const studentName = params.get('studentName');
    if (!entryCode) return load();
    return save({
      classlogEntryCode: entryCode,
      studentName: studentName || load().studentName || '',
    });
  }

  function buildCodePrompt(data) {
    const lines = [];
    lines.push('아래 기획서(PRD)를 바탕으로 실행 가능한 단일 HTML 파일(HTML/CSS/JS 포함)을 만들어줘.');
    lines.push('');
    if (data.simulationPRD) {
      lines.push('[기획 시뮬레이션 결과]');
      lines.push(data.simulationPRD);
      lines.push('');
    }
    if (data.plannerText) {
      lines.push('[상세 기획서]');
      lines.push(data.plannerText);
      lines.push('');
    }
    lines.push('요구사항:');
    lines.push('- 하나의 HTML 파일 안에 <style>과 <script>를 포함해서 작성');
    lines.push('- 위 기획서의 핵심 기능(MVP)을 실제로 동작하게 구현');
    lines.push('- 별도 서버 없이 바로 브라우저에서 실행 가능하도록 작성');
    return lines.join('\n');
  }

  // 학생이 앱 이름을 정하지 않은 경우("새 프로젝트" 같은 의미 없는 값 대신) 학생 이름으로 기본 제목을 만든다.
  function defaultTitle(data) {
    return data.studentName ? `${data.studentName}의 프로젝트` : '새 프로젝트';
  }

  // 0-team-profile.html: 학생의 객관식 답변을 외부 AI에게 물어볼 프롬프트로 변환.
  function buildTeamProfilePrompt(answers) {
    const a = answers || {};
    const lines = [];
    lines.push('너는 청소년 해커톤 팀빌딩 도우미야. 아래 학생의 답변을 보고, 이 학생과 협업할 팀원들에게 도움이 되는 "협업 프로필 카드"를 만들어줘.');
    lines.push('');
    lines.push('[학생 답변]');
    lines.push(`- 조별과제할 때 나는: ${a.q1 || ''}`);
    lines.push(`- 집중이 잘되는 때: ${a.q2 || ''}`);
    lines.push(`- 새로운 걸 배울 때: ${a.q3 || ''}`);
    lines.push(`- 편한 피드백 방식: ${a.q4 || ''}`);
    lines.push(`- 사람들 앞에 서는 것: ${a.q5 || ''}`);
    lines.push(`- 요즘 관심있는 것: ${a.q6 || ''}`);
    lines.push('');
    lines.push('[출력 형식]');
    lines.push('1. 이 사람과 협업할 때 알아두면 좋은 점 2~3줄 요약');
    lines.push('2. 아래 4가지 중 이 사람에게 어울리는 역할 1가지를 추천하고 이유 한 줄');
    lines.push('   - 리서처(문제를 깊이 파고드는 사람)');
    lines.push('   - 빌더(직접 만들고 구현하는 사람)');
    lines.push('   - 스토리텔러(기획을 정리하고 발표하는 사람)');
    lines.push('   - 메이커(디자인/결과물을 예쁘게 완성하는 사람)');
    lines.push('');
    lines.push('친근한 존댓말로, 짧고 이해하기 쉽게 작성해줘.');
    return lines.join('\n');
  }

  // AI가 돌려준 텍스트에서 4가지 역할 중 언급된 것을 감지한다.
  function detectRole(text) {
    if (!text) return null;
    if (text.includes('리서처')) return 'researcher';
    if (text.includes('빌더')) return 'builder';
    if (text.includes('스토리텔러')) return 'storyteller';
    if (text.includes('메이커')) return 'maker';
    return null;
  }

  const ROLE_LABELS = {
    researcher: { emoji: '🔍', name: '리서처' },
    builder: { emoji: '🛠', name: '빌더' },
    storyteller: { emoji: '🎤', name: '스토리텔러' },
    maker: { emoji: '🎨', name: '메이커' },
  };

  // localStorage는 오리진별로 격리되어 있어 여기서 저장해도 CodeCanvas(다른 오리진)는 읽을 수 없다.
  // 그래서 PRD/제목을 URL 쿼리 파라미터로 실어 보내고, CodeCanvas 쪽에서 이를 읽어 프로젝트를 만든다.
  function sendToCodeCanvas(prdText, title) {
    const data = load();
    const resolvedTitle = title || data.appName || defaultTitle(data);

    const qs = new URLSearchParams();
    qs.set('studioTitle', resolvedTitle);
    qs.set('studioPrompt', prdText || '');
    if (data.classlogEntryCode) qs.set('entryCode', data.classlogEntryCode);
    if (data.studentName) qs.set('studentName', data.studentName);
    window.open(`${CODECANVAS_URL}?${qs.toString()}`, '_blank');
  }

  // 학생 결과물을 ClassLog에 제출한다. 키는 /api/submit(서버) 안에만 있고
  // 여기서는 그냥 같은 origin의 프록시를 호출한다.
  async function submitResult(params) {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && (data.error || data.message)) || `제출 실패 (${res.status})`);
    }
    return data;
  }

  // ClassLog로 입장한 학생이 실수로 창을 닫아 작성 중인 내용을 잃지 않도록 닫기 전에 브라우저 경고를 띄운다.
  // (브라우저가 문구는 정해진 것만 보여주며, 사용자가 화면을 한 번도 건드리지 않았다면 뜨지 않는다)
  // 앱 안의 단계 이동(링크, location.href)은 경고 없이 통과시킨다.
  const guard = (function () {
    let dirty = false;
    let bypass = false;
    let started = false;

    function onBeforeUnload(e) {
      if (!dirty || bypass) return;
      e.preventDefault();
      e.returnValue = '';
    }
    function markDirty() { dirty = true; }
    function allowLeave() {
      bypass = true;
      setTimeout(function () { bypass = false; }, 1500);
    }
    function showBanner() {
      if (document.getElementById('classlog-guard-banner')) return;
      const bar = document.createElement('div');
      bar.id = 'classlog-guard-banner';
      bar.textContent = '✏️ 작성 중에는 창을 닫지 마세요. 내용은 자동 저장돼요.';
      bar.style.cssText = 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:9999;' +
        'background:#1e293b;color:#fff;font-size:13px;padding:8px 14px;border-radius:999px;' +
        'box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:.92;pointer-events:none;max-width:90vw;text-align:center;';
      document.body.appendChild(bar);
    }
    function init() {
      if (started || !load().classlogEntryCode) return;
      started = true;
      window.addEventListener('beforeunload', onBeforeUnload);
      document.addEventListener('input', markDirty, true);
      document.addEventListener('change', markDirty, true);
      document.addEventListener('click', function (e) {
        const a = e.target.closest && e.target.closest('a[href]');
        if (a && a.origin === location.origin && a.target !== '_blank') allowLeave();
      }, true);
      if (document.body) showBanner();
      else document.addEventListener('DOMContentLoaded', showBanner);
    }
    return { init: init, markDirty: markDirty, markClean: function () { dirty = false; }, allowLeave: allowLeave };
  })();

  global.StudioBridge = { guard, load, save, clear, captureEntryFromURL, buildCodePrompt, sendToCodeCanvas, submitResult, defaultTitle, buildTeamProfilePrompt, detectRole, ROLE_LABELS, CODECANVAS_URL };
})(window);
