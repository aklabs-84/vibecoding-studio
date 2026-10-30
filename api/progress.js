// 학생 화면의 "지금 여기 있어요" 신호를 AIServiceHub 경유로 ClassLog에 전달하는 프록시.
// 키는 이 함수(서버) 안에서만 쓰이며, 실패해도 학생 작업에는 영향이 없다.

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const int = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : undefined);
const pages = (v) => (Array.isArray(v) ? v.filter((n) => Number.isInteger(n) && n >= 0 && n <= 3).slice(0, 4) : []);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const baseUrl = process.env.AISERVICEHUB_BASE_URL;
  const apiKey = process.env.STUDIO_API_KEY;
  if (!baseUrl || !apiKey) {
    res.status(500).json({ error: '서버 설정이 필요해요' });
    return;
  }
  const origin = req.headers.origin;
  if (origin && req.headers.host && new URL(origin).host !== req.headers.host) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const raw = req.body && typeof req.body === 'object' ? req.body : {};
  const body = {
    entryCode: str(raw.entryCode, 100),
    studentId: str(raw.studentId, 100) || undefined,
    studentName: str(raw.studentName, 100) || undefined,
    teamName: str(raw.teamName, 40) || undefined,
    page: int(raw.page, 0, 3),
    pageLabel: str(raw.pageLabel, 40) || undefined,
    stepNo: int(raw.stepNo, 0, 99),
    stepTotal: int(raw.stepTotal, 0, 99),
    stepLabel: str(raw.stepLabel, 60) || undefined,
    completedPages: pages(raw.completedPages),
    submittedPages: pages(raw.submittedPages),
    online: raw.online !== false,
  };
  if (!body.entryCode || body.page === undefined || (!body.studentId && !body.studentName)) {
    res.status(400).json({ error: '필수 값이 빠졌어요' });
    return;
  }

  try {
    const upstream = await fetch(`${baseUrl}/api/classlog/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body),
    });
    const data = await upstream.json().catch(() => null);
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('progress proxy failed', err);
    res.status(502).json({ error: '진행 서버에 연결하지 못했어요.' });
  }
};
