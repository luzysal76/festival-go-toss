/**
 * FG.data — 확장 목업 데이터 (Phase 1)
 * Phase 2(필터링/정렬/개인화 추천)에서 바로 활용할 수 있도록
 * tags / priceRange / coord / capacity 속성을 미리 부여한다.
 */
window.FG = window.FG || {};
(function (FG) {
  const parking = [
    {
      id: "p1",
      name: "남강둔치 제2주차장",
      desc: "도보 9분 · 132면 남음",
      status: "available",
      statusLabel: "여유",
      tags: ["도보근접", "넓음"],
      capacity: 132,
      coord: { lat: 35.1932, lng: 128.0868 },
    },
    {
      id: "p2",
      name: "진주성 임시주차장",
      desc: "도보 15분 · 셔틀 6분 간격",
      status: "busy",
      statusLabel: "혼잡",
      tags: ["셔틀운행"],
      capacity: 40,
      coord: { lat: 35.1912, lng: 128.0825 },
    },
    {
      id: "p3",
      name: "중앙시장 공영주차장",
      desc: "도보 18분 · 주변 맛집 가까움",
      status: "full",
      statusLabel: "만차",
      tags: ["맛집근접"],
      capacity: 0,
      coord: { lat: 35.1889, lng: 128.0841 },
    },
  ];

  const foods = [
    { id: "f1", name: "촉석루 육전식당", desc: "지역 특산 메뉴 · 단체석 · 재방문율 82%", waitMin: 12, priceRange: 2, tags: ["단체석", "재방문율높음"], capacity: 40, hasKidsMenu: false, coord: { lat: 35.1935, lng: 128.0855 } },
    { id: "f2", name: "남강 장어구이", desc: "주차 가능 · 가족 추천 · 축제 쿠폰 적용", waitMin: 5, priceRange: 3, tags: ["주차가능", "아이동반"], capacity: 30, hasKidsMenu: true, coord: { lat: 35.194, lng: 128.086 } },
    { id: "f3", name: "유등 야시장", desc: "간식 코스 · 포토존 근처 · 혼잡도 보통", waitMin: 3, priceRange: 1, tags: ["간식", "포토존"], capacity: 100, hasKidsMenu: true, coord: { lat: 35.192, lng: 128.084 } },
    { id: "f4", name: "진주냉면 본가", desc: "전통 진주냉면 · 단체석 가능", waitMin: 8, priceRange: 2, tags: ["단체석", "전통음식"], capacity: 50, hasKidsMenu: false, coord: { lat: 35.1901, lng: 128.083 } },
    { id: "f5", name: "남강 카페거리 브런치", desc: "뷰 맛집 · 아이동반 추천", waitMin: 15, priceRange: 3, tags: ["아이동반", "뷰맛집"], capacity: 25, hasKidsMenu: true, coord: { lat: 35.1945, lng: 128.087 } },
    { id: "f6", name: "중앙시장 순대국밥", desc: "가성비 · 주차 가능", waitMin: 4, priceRange: 1, tags: ["가성비", "주차가능"], capacity: 20, hasKidsMenu: false, coord: { lat: 35.1885, lng: 128.0845 } },
    { id: "f7", name: "진주비빔밥 전문점", desc: "단체석 · 웨이팅 적음", waitMin: 6, priceRange: 2, tags: ["단체석"], capacity: 45, hasKidsMenu: true, coord: { lat: 35.191, lng: 128.082 } },
    { id: "f8", name: "유등 포차거리", desc: "분위기 좋은 야식 · 친구모임 추천", waitMin: 10, priceRange: 2, tags: ["야식", "친구모임"], capacity: 60, hasKidsMenu: false, coord: { lat: 35.1928, lng: 128.0838 } },
  ];

  const stays = [
    { id: "s1", name: "남강 리버호텔", desc: "축제장 차량 7분 · 조식 포함 · 주차 가능", price: 148000, tags: ["주차가능", "조식포함"], capacity: 4, checkIn: "22:00", coord: { lat: 35.196, lng: 128.089 } },
    { id: "s2", name: "진주 한옥스테이", desc: "야경 산책로 근처 · 체크인 22:00", price: 126000, tags: ["야경뷰", "한옥"], capacity: 4, checkIn: "22:00", coord: { lat: 35.1938, lng: 128.0865 } },
    { id: "s3", name: "캠핑 게스트하우스", desc: "친구 모임 추천 · 6인실 가능", price: 96000, tags: ["친구모임", "대인원"], capacity: 6, checkIn: "21:00", coord: { lat: 35.189, lng: 128.081 } },
    { id: "s4", name: "축제거리 비즈니스호텔", desc: "도보 5분 · 심플한 1인실", price: 89000, tags: ["도보근접", "가성비"], capacity: 2, checkIn: "20:00", coord: { lat: 35.1925, lng: 128.086 } },
    { id: "s5", name: "남강뷰 풀빌라", desc: "단체 모임 · 프라이빗 공간", price: 280000, tags: ["대인원", "프라이빗"], capacity: 8, checkIn: "16:00", coord: { lat: 35.197, lng: 128.09 } },
    { id: "s6", name: "진주역 게스트하우스", desc: "역 도보 2분 · 가성비 최고", price: 68000, tags: ["도보근접", "가성비"], capacity: 3, checkIn: "19:00", coord: { lat: 35.1798, lng: 128.1055 } },
  ];

  const coupons = [
    { id: "c1", name: "남강 카페거리", value: "아메리카노 10%", tags: ["카페"], expiresInDays: 3 },
    { id: "c2", name: "진주 특산품관", value: "실크 굿즈 5,000원", tags: ["쇼핑"], expiresInDays: 5 },
    { id: "c3", name: "중앙시장", value: "야시장 세트 15%", tags: ["먹거리"], expiresInDays: 2 },
    { id: "c4", name: "남강 장어구이", value: "단체석 1만원 할인", tags: ["맛집"], expiresInDays: 3 },
    { id: "c5", name: "진주 한옥스테이", value: "숙박 5% 할인", tags: ["숙소"], expiresInDays: 7 },
    { id: "c6", name: "유등 포토존", value: "기념사진 인화 무료", tags: ["포토"], expiresInDays: 1 },
  ];

  const planItems = [
    ["10:30", "진주역 도착", "셔틀버스 2번 승강장까지 도보 4분"],
    ["11:10", "공영주차장 입차", "남강둔치 제2주차장 여유, 예상 요금 6,000원"],
    ["12:00", "현지 맛집 점심", "단체석 가능, 육전비빔밥 웨이팅 12분"],
    ["15:00", "스탬프 투어", "촉석루, 남강 산책로, 유등 포토존 순서 추천"],
    ["19:30", "유등 점등 관람", "혼잡도 하락 예상 구간에서 야경 관람"],
    ["21:30", "토스 정산", "숙소 이동 전 1인 정산 요청"],
  ];

  const defaultExpenses = [
    { name: "주차비", amount: 20000 },
    { name: "숙소", amount: 240000 },
    { name: "식사", amount: 180000 },
    { name: "간식", amount: 45000 },
  ];

  const defaultMembers = ["나", "친구1", "친구2", "친구3", "친구4", "친구5"];

  FG.data = { parking, foods, stays, coupons, planItems, defaultExpenses, defaultMembers };
})(window.FG);
