// 학생 결과물을 AIServiceHub 경유로 ClassLog에 제출하는 프록시.
// STUDIO_API_KEY는 이 함수(서버) 안에서만 사용되며 클라이언트에는 절대 내려가지 않는다.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const baseUrl = process.env.AISERVICEHUB_BASE_URL;
  const apiKey = process.env.STUDIO_API_KEY;
  if (!baseUrl || !apiKey) {
    res.status(500).json({ error: 'AISERVICEHUB_BASE_URL / STUDIO_API_KEY 환경변수가 설정되지 않았습니다.' });
    return;
  }

  const { entryCode, studentId, studentName, title, resultType, linkUrl, textContent } = req.body || {};
  if (!entryCode || !title || !resultType) {
    res.status(400).json({ error: 'entryCode, title, resultType은 필수입니다' });
    return;
  }

  try {
    const upstream = await fetch(`${baseUrl}/api/classlog/submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ entryCode, studentId, studentName, title, resultType, linkUrl, textContent }),
    });
    const data = await upstream.json().catch(() => null);
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
