const planItems = [
  ["10:30", "진주역 도착", "셔틀버스 2번 승강장까지 도보 4분"],
  ["11:10", "공영주차장 입차", "남강둔치 제2주차장 여유, 예상 요금 6,000원"],
  ["12:00", "현지 맛집 점심", "단체석 가능, 육전비빔밥 웨이팅 12분"],
  ["15:00", "스탬프 투어", "촉석루, 남강 산책로, 유등 포토존 순서 추천"],
  ["19:30", "유등 점등 관람", "혼잡도 하락 예상 구간에서 야경 관람"],
  ["21:30", "토스 정산", "숙소 이동 전 1인 80,833원 정산 요청"],
];

const parking = [
  ["남강둔치 제2주차장", "도보 9분 · 132면 남음", "여유", "status"],
  ["진주성 임시주차장", "도보 15분 · 셔틀 6분 간격", "혼잡", "status warn"],
  ["중앙시장 공영주차장", "도보 18분 · 주변 맛집 가까움", "만차", "status full"],
];

const foods = [
  ["촉석루 육전식당", "지역 특산 메뉴 · 단체석 · 재방문율 82%", "웨이팅 12분"],
  ["남강 장어구이", "주차 가능 · 가족 추천 · 축제 쿠폰 적용", "할인 10%"],
  ["유등 야시장", "간식 코스 · 포토존 근처 · 혼잡도 보통", "추천"],
];

const stays = [
  ["남강 리버호텔", "축제장 차량 7분 · 조식 포함 · 주차 가능", "148,000원"],
  ["진주 한옥스테이", "야경 산책로 근처 · 체크인 22:00", "126,000원"],
  ["캠핑 게스트하우스", "친구 모임 추천 · 6인실 가능", "96,000원"],
];

const expenses = [
  ["주차비", 20000],
  ["숙소", 240000],
  ["식사", 180000],
  ["간식", 45000],
];

const coupons = [
  ["남강 카페거리", "아메리카노 10%"],
  ["진주 특산품관", "실크 굿즈 5,000원"],
  ["중앙시장", "야시장 세트 15%"],
];

const formatWon = (value) => `${value.toLocaleString("ko-KR")}원`;

const shareText = [
  "축제고(Festival GO)",
  "축제 번거로움은 제로, 즐거움은 배로!",
  "",
  "AI가 축제 일정, 주차, 맛집, 숙소, 쿠폰, 토스 정산까지 한 번에 추천해줘요.",
  "예시: 진주 남강유등축제 친구 5명 일정 생성 → 주차 확인 → 맛집 저장 → 1인 80,833원 정산",
  "",
  "#축제고 #FestivalGO #지역축제 #여름축제 #토스정산",
].join("\n");

async function shareFestivalGo() {
  const payload = {
    title: "축제고",
    text: shareText,
    url: location.protocol === "file:" ? "" : location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText([payload.text, payload.url].filter(Boolean).join("\n"));
    alert("SNS 공유 문구가 복사됐어요.");
  } catch (error) {
    if (error.name !== "AbortError") {
      alert("공유 문구를 복사하지 못했어요. 다시 시도해 주세요.");
    }
  }
}

function renderTimeline() {
  const timeline = document.querySelector("#timeline");
  timeline.innerHTML = planItems.map(([time, title, desc]) => `
    <li>
      <div class="time">${time}</div>
      <div>
        <p class="title">${title}</p>
        <p class="desc">${desc}</p>
      </div>
    </li>
  `).join("");
}

function renderCards(target, items, statusClass = false) {
  const node = document.querySelector(target);
  node.innerHTML = items.map(([title, desc, meta, cls]) => `
    <article class="info-card">
      <p class="title">${title}</p>
      <p class="desc">${desc}</p>
      <div class="meta-row">
        <span>AI 추천</span>
        <strong class="${statusClass ? cls : "status"}">${meta}</strong>
      </div>
    </article>
  `).join("");
}

function renderExpenses() {
  const list = document.querySelector("#expenseList");
  const total = expenses.reduce((sum, [, amount]) => sum + amount, 0);
  list.innerHTML = expenses.map(([name, amount]) => `
    <div class="expense-row">
      <span>${name}</span>
      <strong>${formatWon(amount)}</strong>
    </div>
  `).join("");
  document.querySelector("#totalAmount").textContent = formatWon(total);
  document.querySelector("#perAmount").textContent = formatWon(Math.floor(total / 6));
}

function renderCoupons() {
  const list = document.querySelector("#couponList");
  list.innerHTML = coupons.map(([name, value]) => `
    <article class="coupon">
      <span>${name}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
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
  planItems[0][2] = `"${input.value}" 일정으로 다시 최적화 완료`;
  renderTimeline();
});

document.querySelector("#tossButton").addEventListener("click", () => {
  const message = "토스 정산 요청이 준비됐어요. 실제 토스 연동 시 송금 화면으로 이동합니다.";
  alert(message);
});

document.querySelector("#heroShareButton").addEventListener("click", shareFestivalGo);
document.querySelector("#quickShareButton").addEventListener("click", shareFestivalGo);
document.querySelector("#settleShareButton").addEventListener("click", shareFestivalGo);

renderTimeline();
renderCards("#parkingList", parking, true);
renderCards("#foodList", foods);
renderCards("#stayList", stays);
renderExpenses();
renderCoupons();

const initialTab = location.pathname.replace("/", "") || "plan";
if (document.querySelector(`#${initialTab}`)) {
  showTab(initialTab, false);
}
