import { fortunes } from "./data.js";

// =========================================
// 設定
// =========================================

// カテゴリーごとの出現率（合計100）
const categoryRates = [
  { category: "normal", rate: 90 },
  { category: "fantasy", rate: 6 },
  { category: "special", rate: 3 },
  { category: "ultra_rare", rate: 1 }
];

// SP_001（おみくじミックス吉）はVer.1.0では抽選対象から外す
const drawTargets = fortunes.filter(item => item.id !== "SP_001");

// =========================================
// 画面の部品（HTMLのidで取得）
// =========================================
const drawButton = document.getElementById("drawButton");
const resultPlaceholder = document.getElementById("resultPlaceholder");
const card = document.getElementById("omikujiCard");

const fortuneNo = document.getElementById("fortuneNo");
const fortuneName = document.getElementById("fortuneName");
const fortuneOneliner = document.getElementById("fortuneOneliner");
const fortuneMessage = document.getElementById("fortuneMessage");
const luckyItem = document.getElementById("luckyItem");
const mission = document.getElementById("mission");
const fortuneImage = document.getElementById("fortuneImage");

const surpriseBox = document.getElementById("surpriseBox");
const openBoxButton = document.getElementById("openBoxButton");
const surpriseClosedContent = document.getElementById("surpriseClosedContent");
const surpriseOpenedContent = document.getElementById("surpriseOpenedContent");

const bonusSection = document.getElementById("bonusSection");
const bonusPose = document.getElementById("bonusPose");
const bonusStamp = document.getElementById("bonusStamp");

const bonusClosedContent = document.getElementById("bonusClosedContent");
const bonusOpenedContent = document.getElementById("bonusOpenedContent");
const openBonusButton = document.getElementById("openBonusButton");
// =========================================
// 抽選の部品
// =========================================

// 配列からランダムに1つ選ぶ（空ならから文字を返す）
function pickRandom(array) {
  if (!array || array.length === 0) {
    return "";
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// 第1抽選：カテゴリーを決める
function drawCategory() {
  const roll = Math.random() * 100; // 0以上100未満
  let cumulativeRate = 0;

  for (const item of categoryRates) {
    cumulativeRate += item.rate;
    if (roll < cumulativeRate) {
      return item.category;
    }
  }
  return "normal"; // 念のための保険
}

// 第2抽選：選ばれたカテゴリーの中から、運勢を1つ選ぶ
function drawFortune() {
  const selectedCategory = drawCategory();

  const categoryTargets = drawTargets.filter(
    item => item.category === selectedCategory
  );

  // 万一そのカテゴリーが空だったら、通常吉から選ぶ
  const targets =
    categoryTargets.length > 0
      ? categoryTargets
      : drawTargets.filter(item => item.category === "normal");

  return pickRandom(targets);
}

// =========================================
// 結果の表示
// =========================================

// 文章を「、」「。」「！」「？」の区切りで、文節のかたまりに分ける
// 例：「今日は、ごきげんの日です。決定事項です。」→「今日は、」「ごきげんの日です。」「決定事項です。」
function splitPhrases(line) {
  return line.match(/[^、。！？]+[、。！？]*|[、。！？]+/g) ?? [];
}

// 文章を、文節ごとの <span class="phrase"> にして表示する
// 画面の端で折り返すとき、文節の途中ではなく区切りで折り返せるので、
// 「す。」のように1〜2文字だけが次の行に残るのを防げる
function setPhrasedText(element, text) {
  element.replaceChildren();

  text.split("\n").forEach((line, index) => {
    if (index > 0) {
      element.append("\n"); // 行の区切り（CSSの white-space: pre-line で改行になる）
    }
    for (const phrase of splitPhrases(line)) {
      const span = document.createElement("span");
      span.className = "phrase";
      span.textContent = phrase;
      element.append(span);
    }
  });
}

  // 抽選結果をカードに流し込む
  function renderFortune(fortune) {
  // 運勢の中身
  fortuneNo.textContent = String(fortune.displayNo).padStart(3, "0");
  fortuneName.textContent = fortune.name;
  setPhrasedText(fortuneOneliner, fortune.oneLiner);
  // message は「1行ずつの配列」なので、改行でつないで1つの文章にする
  // （表示側のCSSが white-space: pre-line なので、改行がそのまま反映される）
  setPhrasedText(fortuneMessage, fortune.message.join("\n"));

  // ラッキーアイテムと今日のミッションは、候補の中から1つ選ぶ
  setPhrasedText(luckyItem, pickRandom(fortune.luckyItems));
  setPhrasedText(mission, pickRandom(fortune.missions));
// カテゴリー（CSSが枠の色を切り替える）
card.dataset.category = fortune.category;

// 通常吉のキャラクター画像
const normalImages = {
  "なんか吉": "./images/character-trim/nanka_kichi.png",
  "じわ吉": "./images/character-trim/jiwa_kichi.png",
  "たぶん吉": "./images/character-trim/tabun_kichi.png",
  "ほぼ大吉": "./images/character-trim/hobodaikichi.png",
  "まあいっか吉": "./images/character-trim/maaikka_kichi.png",
  "だいたい吉": "./images/character-trim/daitai_kichi.png",
  "ひょっこり吉": "./images/character-trim/hyokkori_kichi.png",
  "ひと息つき吉": "./images/character-trim/hitoikitsuki_kichi.png"
};
// SRのキャラクター画像
const srImages = {
  "エレガント瑞龍": "./images/character-trim/sr_zuiryu.png",
  "省エネペガサス": "./images/character-trim/sr_pegasus.png",
  "全肯定鳳凰": "./images/character-trim/sr_houou.png"
};
// 大明神のキャラクター画像
const specialImages = {
  "ごきげん大明神": "./images/character-trim/daimyojin.png"
};

// カテゴリーと運勢名に応じてキャラクター画像を切り替える
let imagePath = "";

if (fortune.category === "normal") {
  imagePath = normalImages[fortune.name];
} else if (fortune.category === "fantasy") {
  imagePath = srImages[fortune.name];
} else if (fortune.name === "ごきげん大明神") {
  imagePath = specialImages[fortune.name];
}

// 画像が登録されている場合だけ表示する
if (imagePath) {
  fortuneImage.src = imagePath;
  fortuneImage.parentElement.dataset.category = fortune.category;
  fortuneImage.alt = fortune.name + "のキャラクター";
  fortuneImage.parentElement.hidden = false;
} else {
  fortuneImage.parentElement.hidden = true;
}

 // おまけ（おまけつき吉のときだけ表示）
const poses = fortune.bonuses?.luckyPoses;
const stamps = fortune.bonuses?.stamps;
const hasBonus = poses?.length > 0 && stamps?.length > 0;

if (hasBonus) {
  setPhrasedText(bonusPose, pickRandom(poses));
  bonusStamp.textContent = pickRandom(stamps);
}

bonusSection.hidden = !hasBonus;

// おまけの開封状態をリセット
bonusClosedContent.hidden = false;
bonusOpenedContent.hidden = true;


  // サプライズ吉は、箱を開けるまで中身を隠す
  const isSurprise = fortune.specialType === "surprise";
  card.dataset.state = isSurprise ? "sealed" : "open";
  surpriseBox.hidden = !isSurprise;

  // サプライズ吉が抽選されたら、閉じた箱を表示する
  surpriseClosedContent.hidden = false;
  surpriseOpenedContent.hidden = true;

  // 画面の切り替え
  resultPlaceholder.hidden = true;
  card.hidden = false;
}

// 箱を開ける（サプライズ吉）
function openSurpriseBox() {
  card.dataset.state = "open";

  surpriseClosedContent.hidden = true;
  surpriseOpenedContent.hidden = false;
}

// 巾着袋を開ける（おまけつき吉）
function openBonusBag() {
  bonusClosedContent.hidden = true;
  bonusOpenedContent.hidden = false;
}
// =========================================
// ボタンの動き
// =========================================
drawButton.addEventListener("click", () => {
  const fortune = drawFortune();
  console.log("抽選結果:", fortune);

  renderFortune(fortune);
  drawButton.textContent = "もう一度引く";
  drawButton.closest(".top-screen").classList.add("is-drawn");
});

openBoxButton.addEventListener("click", openSurpriseBox);
openBonusButton.addEventListener("click", openBonusBag);
