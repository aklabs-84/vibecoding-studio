/* 시안 공통 데이터·저장 로직 (시안 A/B가 같이 씀) */
const QUESTS = [
  {
    n: 1, key: 'PROBLEM', name: '위기 보고', mission: '우리 던전이 망해 가는 진짜 이유를 한 문장으로 마왕님께 보고하라.',
    before: '우리 던전의 가장 큰 위기는', after: '때문이다.',
    hint: '짧아도 돼요. "누가 / 무엇 때문에 / 곤란한지"가 들어가면 최고!',
    talk: ['요즘 용사들이 우리 던전을 얕보는 가장 창피한 이유는 뭘까?', '이 위기를 마왕님이 알면 번개를 몇 번 칠까? (1~10번)'],
    seeds: ['용사들의 유튜브 공략 유출로 함정이 전부 무력화된 것', '부하 몬스터들의 기강이 해이해져 통제가 안 되는 것', '던전 보물이 도난당해 금고가 텅 빈 것', '마왕군의 관리 시스템이 아직도 두루마리라는 것'],
    lesson: '문제 정의는 기획의 80%! 해결할 "불편함"이 분명해야 앱의 가치가 빛나요.',
    dice: ['용사가 던전 후기를 별점 1점으로 남긴 것', '슬라임이 근무 시간에 낮잠 자는 영상이 퍼진 것', '마왕님의 마법 지팡이 배터리가 방전된 것']
  },
  {
    n: 2, key: 'CONCEPT', name: '앱 컨셉', mission: '위기를 뒤집을 앱의 이름과 한 줄 컨셉을 정하라. 가장 사악하게!',
    before: '그래서 우리 앱은', after: '앱이다.', hasName: true,
    hint: '"누구에게 무엇을 해 주는 앱"인지 한 줄이면 충분해요.',
    talk: ['앱 이름만 들어도 용사가 소름 돋으려면 어떤 이름이어야 할까?', '이 앱을 한마디로 광고한다면? (10글자 이내)'],
    seeds: ['실시간으로 용사를 추적해 함정을 자동으로 맞춰 주는', '몬스터 성과급으로 던전을 관리하는', '블록체인으로 보물을 지키는', 'AI 비서 AIDEN이 던전 운영을 몽땅 맡아 주는'],
    nameSeeds: ['용사 지옥', '몬스터 잡스', '트레저 금고', '에이든 OS'],
    lesson: '컨셉은 앱의 정체성! 이름만 들어도 무슨 사악한 일을 하는지 떠올라야 해요.',
    dice: ['용사의 위치를 알려 주고 도망갈 길까지 막아 주는', '몬스터 출근 도장을 대신 찍어 주는', '용사가 쓰는 무기의 약점을 미리 알려 주는']
  },
  {
    n: 3, key: 'TARGET', name: '주 사용자', mission: '이 앱을 쓰게 될 "불쌍한 몬스터"가 누구인지 정하라.',
    before: '이 앱을 가장 많이 쓸 몬스터는', after: '이다.',
    hint: '"누가, 어디서, 뭐가 불편한지" 중 하나만 들어가도 좋아요.',
    talk: ['이 몬스터가 하루 중 가장 힘든 순간은 언제일까?', '이 몬스터는 스마트폰을 쓸 수 있을까? (글씨는 커야 할까?)'],
    seeds: ['현장에서 일하는 오크·고블린 경비부대', '중앙 제어실의 엘리트 스켈레톤 마법사단', '던전 청소를 전담하는 슬라임군', '마왕님께 직접 보고하는 고위 간부진'],
    lesson: '사용자를 모르면 기획은 고블린에게 지도를 주는 것과 같아요!',
    dice: ['야근에 지친 좀비 경비병', '길 잃은 용사를 안내하는 미믹 상자', '말이 많은 해골 안내원']
  },
  {
    n: 4, key: 'FEATURES', name: '핵심 기능', mission: '용사를 멘붕시킬 필살기를 딱 3가지만 골라라.',
    before: '이 앱의 필살기는', after: '이다.',
    hint: '"~하면 ~가 된다" 모양이면 기능이 또렷해져요.',
    talk: ['용사가 이 기능에 당하면 뭐라고 외칠까?', '기능이 5개면 많을까, 적을까? 하나만 지운다면 뭘 지울까?'],
    seeds: ['가짜 보물상자를 열면 폭발하고 용사 멘탈이 무너지는 알림', '몬스터 연장 근무를 자동 배정하고 위치를 감시하는 기능', '용사 장비를 자동 분해해 자금으로 환수하는 시스템', '침입자 등급별로 함정을 원격 발동하는 패널'],
    lesson: '핵심 기능(MVP)에 집중해요. 기능이 너무 많으면 앱이 오히려 멍청해져요!',
    dice: ['용사 신발끈을 몰래 묶어 넘어뜨리는 기능', '용사 파티 채팅방에 가짜 길 안내를 올리는 기능', '용사가 회복약을 마시려는 순간 알림을 울리는 기능']
  },
  {
    n: 5, key: 'UI DESIGN', name: '화면 분위기', mission: '몬스터들이 쓸 화면의 색과 분위기를 정하라.',
    before: '앱 화면은', after: '분위기로 만든다.',
    hint: '색 이름 + 느낌 한 단어면 충분해요. 예: 피빛 빨강 + 오싹함',
    talk: ['이 앱을 열자마자 몬스터가 느껴야 할 기분은?', '글씨는 크게 vs 멋있게, 둘 중 뭐가 먼저일까?'],
    seeds: ['피빛 빨강과 암흑색이 중심인 공포', '가독성을 살린 독성 초록 네온', '마법 서판 같은 고전적이고 권위적인', '간결하고 효율적인 미니멀 다크'],
    lesson: 'UI는 사용자와 대화하는 도구예요. 대상에 맞는 색과 아이콘이 완성도를 높여요.',
    dice: ['번쩍이는 보라색 번개', '촛불처럼 따뜻하고 어두운', '해골 이모티콘이 가득한']
  },
  {
    n: 6, key: 'FINAL', name: '출시 전략', mission: '이 계획을 세상(던전)에 어떻게 퍼뜨릴지 정하고 최종 승인하라.',
    before: '우리는 이 앱을', after: '방식으로 퍼뜨린다.',
    hint: '"누구에게 먼저, 어떻게" 순서로 쓰면 설득력이 생겨요.',
    talk: ['처음부터 모든 던전에 뿌리면 위험할까? 왜?', '경쟁 마왕군이 이 계획을 알면 어떻게 나올까?'],
    seeds: ['마왕님께 바로 보고하고 전 던전에 배포하는', '베타 테스트를 거쳐 소수 정예 던전부터 적용하는', '비밀 프로젝트로 숨기고 경쟁 마왕군에 가짜 정보를 흘리는'],
    lesson: '마무리는 설득이에요. 이 기획이 왜 세계 정복의 지름길인지 다시 각인시키세요!',
    dice: ['용사 길드 게시판에 몰래 광고를 붙이는', '오크 한 부대에게만 먼저 쓰게 하는', '출시 전날 밤 마왕님이 깜짝 발표하는']
  }
];

const Store = {
  KEY: 'monster_startup_mock_v1',
  data: { team: '마왕군 특공대', answers: {}, name: '', talked: {}, stamped: {}, at: 0, step: 1 },
  load() {
    try { const raw = localStorage.getItem(this.KEY); if (raw) Object.assign(this.data, JSON.parse(raw)); } catch (e) {}
    // 시안 확인용 예시: 처음 열면 1·2단계가 이미 채워진 상태로 보여 준다
    if (!Object.keys(this.data.answers).length && !localStorage.getItem(this.KEY + '_seen')) {
      this.data.answers = { 1: '용사들의 유튜브 공략 유출로 함정이 전부 무력화된 것', 2: '실시간으로 용사를 추적해 함정을 자동으로 맞춰 주는' };
      this.data.name = '용사 지옥'; this.data.stamped = { 1: true, 2: true }; this.data.step = 3;
    }
    return this.data;
  },
  save() {
    this.data.at = Date.now();
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); localStorage.setItem(this.KEY + '_seen', '1'); return true; }
    catch (e) { return false; }
  },
  reset() { try { localStorage.removeItem(this.KEY); localStorage.setItem(this.KEY + '_seen', '1'); } catch (e) {} location.reload(); }
};

function agoText(t) {
  if (!t) return '아직 저장 전';
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  return s < 5 ? '방금 전' : s < 60 ? s + '초 전' : Math.floor(s / 60) + '분 전';
}
function sentence(q, st) {
  const a = st.answers[q.n];
  if (!a) return null;
  return q.hasName && st.name ? `${q.before} 「${st.name}」 — ${a} ${q.after}` : `${q.before} ${a} ${q.after}`;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
