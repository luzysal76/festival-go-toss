/**
 * FG.settleGroup — 토스 정산 로직 (Phase 1)
 * 실제 토스 송금 API 연동은 하지 않음(범위 밖). 대신
 * - 인원별 가중치(ratio) 기반 다중 분담 계산
 * - 정산 상태(draft/requested/completed) 로컬 추적
 * - 공유 텍스트 생성
 * 을 담당한다.
 */
window.FG = window.FG || {};
(function (FG) {
  function formatWon(value) {
    return `${Math.round(value).toLocaleString("ko-KR")}원`;
  }

  function createDefaultSession() {
    const { defaultExpenses, defaultMembers } = FG.data;
    return {
      id: `session-${Date.now()}`,
      title: "축제 모임 정산",
      members: defaultMembers.map((name) => ({ name, ratio: 1 })),
      items: defaultExpenses.map((expense) => ({ ...expense })),
      status: "draft",
      createdAt: new Date().toISOString(),
    };
  }

  function getActiveSession() {
    const state = FG.storage.getState();
    if (!state.settlement.sessions.length) {
      const session = createDefaultSession();
      FG.storage.updateState((s) => {
        s.settlement.sessions = [session];
      });
      return session;
    }
    return state.settlement.sessions[0];
  }

  function persistSession(session) {
    FG.storage.updateState((s) => {
      s.settlement.sessions[0] = session;
    });
  }

  // 인원별 ratio 가중치 기반 분담 계산. 전원 ratio=1이면 1/N 균등분담과 동일.
  function calcSplit(session) {
    const total = session.items.reduce((sum, item) => sum + item.amount, 0);
    const totalWeight = session.members.reduce((sum, m) => sum + (m.ratio || 1), 0) || 1;
    const perMember = session.members.map((m) => ({
      name: m.name,
      amount: Math.round((total * (m.ratio || 1)) / totalWeight),
    }));
    return { total, perMember };
  }

  function addMember(session, name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return session;
    session.members.push({ name: trimmed, ratio: 1 });
    persistSession(session);
    return session;
  }

  function removeMember(session, index) {
    if (session.members.length <= 1) return session;
    session.members.splice(index, 1);
    persistSession(session);
    return session;
  }

  function updateStatus(session, status) {
    session.status = status;
    persistSession(session);
    return session;
  }

  function generateShareText(session) {
    const { total, perMember } = calcSplit(session);
    const lines = [
      `축제고(Festival GO) 정산 요청 - ${session.title}`,
      `총 금액: ${formatWon(total)}`,
      "",
      ...perMember.map((m) => `${m.name}: ${formatWon(m.amount)}`),
      "",
      "토스로 정산 부탁드려요!",
    ];
    return lines.join("\n");
  }

  FG.settleGroup = {
    createDefaultSession,
    getActiveSession,
    persistSession,
    calcSplit,
    addMember,
    removeMember,
    updateStatus,
    generateShareText,
    formatWon,
  };
})(window.FG);
