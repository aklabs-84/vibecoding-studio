// 학생 결과물을 AIServiceHub 경유로 ClassLog에 제출하는 프록시.
// STUDIO_API_KEY는 이 함수(서버) 안에서만 사용되며 클라이언트에는 절대 내려가지 않는다.

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

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

  // 같은 사이트에서 보낸 요청인지 확인 (보조 수단)
  const origin = req.headers.origin;
  if (origin && req.headers.host && new URL(origin).host !== req.headers.host) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const raw = req.body && typeof req.body === 'object' ? req.body : {};
  // 허용한 필드만 골라서 길이 제한
  const body = {
    entryCode: str(raw.entryCode, 100),
    studentId: str(raw.studentId, 100) || undefined,
    studentName: str(raw.studentName, 100) || undefined,
    title: str(raw.title, 200),
    resultType: raw.resultType,
    linkUrl: str(raw.linkUrl, 2000) || undefined,
    textContent: str(raw.textContent, 20000) || undefined,
  };
  if (!body.entryCode || !body.title) {
    res.status(400).json({ error: 'entryCode, title은 필수예요' });
    return;
  }
  if (body.resultType !== 'link' && body.resultType !== 'text') {
    res.status(400).json({ error: 'resultType은 link 또는 text여야 해요' });
    return;
  }
  if (body.linkUrl && !/^https:\/\//i.test(body.linkUrl)) {
    res.status(400).json({ error: '링크는 https:// 로 시작해야 해요' });
    return;
  }

  try {
    const upstream = await fetch(`${baseUrl}/api/classlog/submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
    const data = await upstream.json().catch(() => null);
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('submit proxy failed', err); // 자세한 내용은 서버 로그에만
    res.status(502).json({ error: '제출 서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.' });
  }
};
