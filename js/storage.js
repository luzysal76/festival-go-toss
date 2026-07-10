/**
 * FG.storage — localStorage 기반 상태관리 (Phase 1)
 * 토스 인앱 WebView 환경에서는 localStorage가 예고 없이 초기화될 수 있으므로
 * 모든 읽기/쓰기를 safeGet/safeSet으로 감싸 에러 대신 기본 상태로 폴백한다.
 */
window.FG = window.FG || {};
(function (FG) {
  const STORAGE_KEY = "festivalGo_v1";

  function defaultState() {
    return {
      user: { visitCount: 0, lastVisitAt: null, preferredTags: [] },
      planner: { lastInput: "", savedTimelines: [] },
      parking: { favoriteLotId: null },
      settlement: { sessions: [] },
      coupons: { usedIds: [], savedIds: [] },
      album: { photos: [] },
    };
  }

  function safeGet() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // 스키마가 추가/변경돼도 누락 필드는 기본값으로 채워 안전하게 병합
      const base = defaultState();
      return {
        user: { ...base.user, ...parsed.user },
        planner: { ...base.planner, ...parsed.planner },
        parking: { ...base.parking, ...parsed.parking },
        settlement: { ...base.settlement, ...parsed.settlement },
        coupons: { ...base.coupons, ...parsed.coupons },
        album: { ...base.album, ...parsed.album },
      };
    } catch (error) {
      console.warn("[FG.storage] 저장된 데이터를 읽지 못해 기본 상태로 시작합니다.", error);
      return defaultState();
    }
  }

  function safeSet(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.warn("[FG.storage] 상태 저장에 실패했습니다. (용량 초과 또는 비공개 모드일 수 있음)", error);
      return false;
    }
  }

  let state = safeGet();

  function getState() {
    return state;
  }

  function updateState(mutator) {
    mutator(state);
    safeSet(state);
    return state;
  }

  function isFirstVisit() {
    return state.user.visitCount === 0;
  }

  function recordVisit() {
    updateState((s) => {
      s.user.visitCount += 1;
      s.user.lastVisitAt = new Date().toISOString();
    });
  }

  FG.storage = {
    STORAGE_KEY,
    safeGet,
    safeSet,
    getState,
    updateState,
    isFirstVisit,
    recordVisit,
  };
})(window.FG);
