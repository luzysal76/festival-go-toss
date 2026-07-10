/**
 * FG.planner — AI 축제 여행 플래너 사용자 입력 상태관리 (Phase 1)
 * 입력값과 마지막 생성 결과를 localStorage에 보관해 새로고침/재방문 시 복원한다.
 */
window.FG = window.FG || {};
(function (FG) {
  function cloneTimeline(timeline) {
    return timeline.map((item) => [...item]);
  }

  function getSavedInput() {
    return FG.storage.getState().planner.lastInput;
  }

  // 저장된 마지막 타임라인이 있으면 복원, 없으면 기본 목업 타임라인 사용
  function getTimelineToRender() {
    const state = FG.storage.getState();
    const saved = state.planner.savedTimelines[0];
    return saved ? cloneTimeline(saved.timeline) : cloneTimeline(FG.data.planItems);
  }

  function generateTimeline(inputText) {
    const timeline = cloneTimeline(FG.data.planItems);
    timeline[0][2] = `"${inputText}" 일정으로 다시 최적화 완료`;

    FG.storage.updateState((s) => {
      s.planner.lastInput = inputText;
      s.planner.savedTimelines = [
        { input: inputText, timeline, savedAt: new Date().toISOString() },
        ...s.planner.savedTimelines,
      ].slice(0, 5);
    });

    return timeline;
  }

  FG.planner = { getSavedInput, getTimelineToRender, generateTimeline };
})(window.FG);
