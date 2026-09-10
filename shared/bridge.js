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

  function sendToCodeCanvas(prdText, title) {
    const data = load();
    const resolvedTitle = title || data.appName || defaultTitle(data);
    const html = [
      '<!DOCTYPE html>',
      '<html lang="ko">',
      '<head>',
      '<meta charset="UTF-8">',
      '<title>' + resolvedTitle + '</title>',
      '<!--',
      prdText || '',
      '-->',
      '</head>',
      '<body>',
      '  <h1>Hello, ' + resolvedTitle + '!</h1>',
      '</body>',
      '</html>',
    ].join('\n');

    const project = {
      id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : ('id_' + Date.now()),
      title: resolvedTitle,
      code: {
        html: html,
        css: 'body {\n  font-family: sans-serif;\n  padding: 40px;\n}',
        js: 'console.log("Hello, CodeCanvas!");',
      },
      isPublic: false,
      shareId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('codecanvas_current_project', JSON.stringify(project));

    const qs = new URLSearchParams();
    if (data.classlogEntryCode) qs.set('entryCode', data.classlogEntryCode);
    if (data.studentName) qs.set('studentName', data.studentName);
    const url = qs.toString() ? `${CODECANVAS_URL}?${qs.toString()}` : CODECANVAS_URL;
    window.open(url, '_blank');
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

  global.StudioBridge = { load, save, clear, captureEntryFromURL, buildCodePrompt, sendToCodeCanvas, submitResult, defaultTitle, CODECANVAS_URL };
})(window);
