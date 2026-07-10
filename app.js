/**
 * main.js 역할 — 탭 네비게이션, 렌더링 오케스트레이션, 이벤트 바인딩만 담당.
 * 실제 로직은 js/storage.js, js/data.js, js/settleGroup.js, js/planner.js 로 분리됨.
 */
const { storage, data, settleGroup, planner } = window.FG;

const appShareText = [
  "축제고(Festival GO)",
  "축제 번거로움은 제로, 즐거움은 배로!",
  "",
  "AI가 축제 일정, 주차, 맛집, 숙소, 쿠폰, 토스 정산까지 한 번에 추천해줘요.",
  "예시: 진주 남강유등축제 친구 5명 일정 생성 → 주차 확인 → 맛집 저장 → 정산 요청",
  "",
  "#축제고 #FestivalGO #지역축제 #여름축제 #토스정산",
].join("\n");

async function shareContent(title, text) {
  const payload = { title, text, url: location.protocol === "file:" ? "" : location.href };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText([payload.text, payload.url].filter(Boolean).join("\n"));
    alert("공유 문구가 복사됐어요.");
  } catch (error) {
    if (error.name !== "AbortError") {
      alert("공유 문구를 복사하지 못했어요. 다시 시도해 주세요.");
    }
  }
}

function renderTimeline(timeline) {
  const timelineEl = document.querySelector("#timeline");
  timelineEl.innerHTML = timeline.map(([time, title, desc]) => `
    <li>
      <div class="time">${time}</div>
      <div>
        <p class="title">${title}</p>
        <p class="desc">${desc}</p>
      </div>
    </li>
  `).join("");
}

function statusClass(status) {
  if (status === "busy") return "status warn";
  if (status === "full") return "status full";
  return "status";
}

function renderParking() {
  const list = document.querySelector("#parkingList");
  list.innerHTML = data.parking.map((lot) => `
    <article class="info-card">
      <p class="title">${lot.name}</p>
      <p class="desc">${lot.desc}</p>
      <div class="meta-row">
        <span>AI 추천</span>
        <strong class="${statusClass(lot.status)}">${lot.statusLabel}</strong>
      </div>
    </article>
  `).join("");
}

function renderFoods() {
  const list = document.querySelector("#foodList");
  list.innerHTML = data.foods.map((food) => `
    <article class="info-card">
      <p class="title">${food.name}</p>
      <p class="desc">${food.desc}</p>
      <div class="meta-row">
        <span>AI 추천</span>
        <strong class="status">웨이팅 ${food.waitMin}분</strong>
      </div>
    </article>
  `).join("");
}

function renderStays() {
  const list = document.querySelector("#stayList");
  list.innerHTML = data.stays.map((stay) => `
    <article class="info-card">
      <p class="title">${stay.name}</p>
      <p class="desc">${stay.desc}</p>
      <div class="meta-row">
        <span>AI 추천</span>
        <strong class="status">${settleGroup.formatWon(stay.price)}</strong>
      </div>
    </article>
  `).join("");
}

function renderCoupons() {
  const list = document.querySelector("#couponList");
  list.innerHTML = data.coupons.map((coupon) => `
    <article class="coupon">
      <span>${coupon.name}</span>
      <strong>${coupon.value}</strong>
    </article>
  `).join("");
}

let activeSession = settleGroup.getActiveSession();

const settleStatusLabel = {
  draft: "정산 준비중",
  requested: "정산 요청됨",
  completed: "정산 완료",
};

function renderSettlement() {
  const { total, perMember } = settleGroup.calcSplit(activeSession);

  document.querySelector("#settleTitle").textContent = `${activeSession.members.length}명 모임 경비`;
  document.querySelector("#settleStatusPill").textContent = settleStatusLabel[activeSession.status] || "1/N";

  const memberRow = document.querySelector("#memberRow");
  memberRow.innerHTML = perMember.map((m, index) => `
    <div class="member-chip">
      <span>${m.name}</span>
      <strong>${settleGroup.formatWon(m.amount)}</strong>
      ${activeSession.members.length > 1 ? `<button type="button" data-remove-member="${index}" aria-label="${m.name} 삭제">×</button>` : ""}
    </div>
  `).join("");

  const expenseList = document.querySelector("#expenseList");
  expenseList.innerHTML = activeSession.items.map((item) => `
    <div class="expense-row">
      <span>${item.name}</span>
      <strong>${settleGroup.formatWon(item.amount)}</strong>
    </div>
  `).join("");

  document.querySelector("#totalAmount").textContent = settleGroup.formatWon(total);
  document.querySelector("#perAmount").textContent = settleGroup.formatWon(total / activeSession.members.length);
}

function showTab(tab, updatePath = true) {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tab);
  });
  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  if (updatePath && location.protocol !== "file:") {
    const path = tab === "plan" ? "/" : `/${tab}`;
    history.replaceState(null, "", path);
  }
}

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => showTab(button.dataset.tab));
});

document.querySelector("#plannerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  showTab("plan");
  const input = document.querySelector("#plannerInput");
  input.blur();
  const timeline = planner.generateTimeline(input.value);
  renderTimeline(timeline);
});

document.querySelector("#memberRow").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-member]");
  if (!button) return;
  settleGroup.removeMember(activeSession, Number(button.dataset.removeMember));
  renderSettlement();
});

document.querySelector("#memberAddForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#memberNameInput");
  settleGroup.addMember(activeSession, input.value);
  input.value = "";
  renderSettlement();
});

document.querySelector("#tossButton").addEventListener("click", () => {
  settleGroup.updateStatus(activeSession, "requested");
  renderSettlement();
  alert("토스 정산 요청이 준비됐어요. 실제 토스 연동 시 송금 화면으로 이동합니다.");
});

document.querySelector("#settleShareButton").addEventListener("click", () => {
  settleGroup.updateStatus(activeSession, "requested");
  renderSettlement();
  shareContent("축제고 정산", settleGroup.generateShareText(activeSession));
});

document.querySelector("#heroShareButton").addEventListener("click", () => shareContent("축제고", appShareText));
document.querySelector("#quickShareButton").addEventListener("click", () => shareContent("축제고", appShareText));

function init() {
  const firstVisit = storage.isFirstVisit();
  storage.recordVisit();

  const savedInput = planner.getSavedInput();
  if (savedInput) {
    document.querySelector("#plannerInput").value = savedInput;
  }

  renderTimeline(planner.getTimelineToRender());
  renderParking();
  renderFoods();
  renderStays();
  renderCoupons();
  renderSettlement();

  if (firstVisit) {
    const banner = document.querySelector("#onboardBanner");
    banner.hidden = false;
    document.querySelector("#onboardCloseButton").addEventListener("click", () => {
      banner.hidden = true;
    });
  }

  // 딥링크(plan/parking/food/stay/settle/coupon/memory) 복원 — file:// 등
  // pathname이 예상치 못한 값일 때 잘못된 셀렉터로 크래시하지 않도록 화이트리스트 검증
  const validTabs = ["plan", "parking", "food", "stay", "settle", "coupon", "memory"];
  const initialTab = location.pathname.replace(/^\//, "") || "plan";
  if (validTabs.includes(initialTab)) {
    showTab(initialTab, false);
  }
}

init();
