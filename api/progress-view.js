// 선생님 전용: 입장 코드의 반 전체 진행 현황을 돌려준다.
// 선생님 비밀번호(TEACHER_VIEW_KEY)는 서버 환경변수에만 있고, 맞아야만 목록을 준다.
const { timingSafeEqual } = require('crypto');

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function keyMatches(given, expected) {
  const a = Buffer.from(given || '');
  const b = Buffer.from(expected || '');
  return expected && a.length === b.length && timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const baseUrl = process.env.AISERVICEHUB_BASE_URL;
  const apiKey = process.env.STUDIO_API_KEY;
  const teacherKey = process.env.TEACHER_VIEW_KEY;
  if (!baseUrl || !apiKey || !teacherKey) {
    res.status(500).json({ error: '서버 설정이 필요해요' });
    return;
  }
  const origin = req.headers.origin;
  if (origin && req.headers.host && new URL(origin).host !== req.headers.host) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const raw = req.body && typeof req.body === 'object' ? req.body : {};
  const entryCode = str(raw.entryCode, 100);
  if (!keyMatches(str(raw.teacherKey, 200), teacherKey)) {
    // 틀린 비밀번호를 빠르게 계속 넣어 보는 것을 늦춘다.
    await new Promise((r) => setTimeout(r, 800));
    res.status(401).json({ error: '비밀번호가 맞지 않아요' });
    return;
  }
  if (!entryCode) {
    res.status(400).json({ error: '입장 코드를 입력해 주세요' });
    return;
  }

  try {
    const upstream = await fetch(`${baseUrl}/api/classlog/progress?entryCode=${encodeURIComponent(entryCode)}`, {
      headers: { 'x-api-key': apiKey },
      cache: 'no-store',
    });
    const data = await upstream.json().catch(() => null);
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('progress-view failed', err);
    res.status(502).json({ error: '진행 서버에 연결하지 못했어요.' });
  }
};
