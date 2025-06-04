export const googlePlaceTypes = {
  // グルメ・レストラン
  restaurant: "レストラン",
  cafe: "カフェ",
  bar: "バー",
  fast_food_restaurant: "ファストフード",
  bakery: "ベーカリー",

  // ショッピング
  shopping_mall: "ショッピングモール",
  store: "店舗",
  supermarket: "スーパーマーケット",
  convenience_store: "コンビニ",
  department_store: "デパート",

  // レジャー・エンタメ
  tourist_attraction: "観光地",
  museum: "博物館",
  amusement_park: "遊園地",
  park: "公園",
  movie_theater: "映画館",

  // 暮らし・生活
  hospital: "病院",
  pharmacy: "薬局",
  bank: "銀行",
  beauty_salon: "美容院",
  post_office: "郵便局",

  // 交通
  train_station: "電車駅",
  bus_station: "バス停",
  parking: "駐車場",
  gas_station: "ガソリンスタンド",
  airport: "空港",

  // 教育
  school: "学校",
  university: "大学",
  library: "図書館",

  // 宿泊
  lodging: "宿泊施設",
  hotel: "ホテル",

  // 宗教
  place_of_worship: "宗教施設",
  church: "教会",
} as const;

export type GooglePlaceType = keyof typeof googlePlaceTypes;
