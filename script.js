// --- 1. 定数と初期設定 ---

// 簡略化のため、大アルカナのみを定義
// 実際のシステムでは78枚全てを定義します
const majorArcana = [
    { name: '愚者', number: 0 }, { name: '魔術師', number: 1 }, { name: '女教皇', number: 2 },
    { name: '女帝', number: 3 }, { name: '皇帝', number: 4 }, { name: '教皇', number: 5 },
    { name: '恋人', number: 6 }, { name: '戦車', number: 7 }, { name: '力', number: 8 },
    { name: '隠者', number: 9 }, { name: '運命の輪', number: 10 }, { name: '正義', number: 11 },
    { name: '吊るされた男', number: 12 }, { name: '死神', number: 13 }, { name: '節制', number: 14 },
    { name: '悪魔', number: 15 }, { name: '塔', number: 16 }, { name: '星', number: 17 },
    { name: '月', number: 18 }, { name: '太陽', number: 19 }, { name: '審判', number: 20 },
    { name: '世界', number: 21 }
];

// スプレッドごとのカード枚数と位置（名称）を定義
// 実際のシステムでは、それぞれのスプレッドの具体的な位置名称を定義します
const spreadPositions = {
    1: ['現在の状況'],
    3: ['過去', '現在', '未来'],
    5: ['障害', '現状', 'アドバイス', '結果', '対策'],
    10: ['現状', '障害', '顕在意識', '潜在意識', '過去', '未来', '対策', '周囲の状況', '希望/恐れ', '最終結果']
};

let deck = []; // シャッフルされたデッキ
let isShuffling = false;

const cardArea = document.getElementById('card-area');
const statusMessage = document.getElementById('status-message');
const shuffleButton = document.getElementById('shuffle-button');
const drawButton = document.getElementById('draw-button');
const spreadSelect = document.getElementById('spread-select');

// --- 2. シャッフルと準備 (Fix: シャッフルバグの改善) ---

/**
 * フィッシャー・イェーツのシャッフルアルゴリズム
 * @param {Array} array - シャッフルする配列
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startPreparation() {
    if (isShuffling) return;

    isShuffling = true;
    shuffleButton.disabled = true;
    drawButton.disabled = true;
    cardArea.innerHTML = '';
    
    statusMessage.textContent = 'シャッフル中... 集中してください。';
    cardArea.classList.add('shuffling');

    // デッキを初期化（ここでは大アルカナのみ）
    deck = [...majorArcana]; 
    
    // シャッフルエフェクトの表示（CSSアニメーション）
    // ユーザーにシャッフルしている感覚を与えるためのカードの描画
    const numCardsForDisplay = 5; // 画面に表示するシャッフル中のカード枚数
    for (let i = 0; i < numCardsForDisplay; i++) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.innerHTML = '<div class="card"><div class="card-back">TAROT</div><div class="card-face"></div></div>';
        cardArea.appendChild(cardContainer);
    }
    
    // 実際にシャッフル処理は非同期で行い、エフェクト時間を持たせる
    setTimeout(() => {
        // 実際のシャッフル
        deck = shuffleArray(deck);
        
        cardArea.classList.remove('shuffling');
        statusMessage.textContent = 'シャッフル完了。「カードを引く」を押してスプレッドを展開してください。';
        
        isShuffling = false;
        shuffleButton.disabled = false;
        drawButton.disabled = false;
    }, 2000); // 2秒間のシャッフルエフェクト
}

// --- 3. カードを引く (Fix: 1枚しか引けないエラーの解消) ---

// --- 3. カードを引く (Fix: 1枚しか引けないエラーの解消) ---

function drawCards() {
    if (isShuffling || drawButton.disabled) return;
    
    const requiredCards = parseInt(spreadSelect.value, 10);
    const positions = spreadPositions[requiredCards];

    if (deck.length < requiredCards) {
        statusMessage.textContent = `デッキのカードが不足しています。（${requiredCards}枚必要）「シャッフル＆準備」をやり直してください。`;
        return;
    }

    shuffleButton.disabled = true;
    drawButton.disabled = true;
    cardArea.innerHTML = '';
    statusMessage.textContent = 'カードを配置しています...';

    // 必要な枚数だけデッキからカードを抜き出す
    const drawnCards = deck.splice(0, requiredCards);

    // カードを一枚ずつ配置（ディールアニメーション）
    drawnCards.forEach((cardData, index) => {
        // カード表面の画像パスを生成
        const imagePath = `card/${cardData.number}.png`; // 例: card/0.png

        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.dataset.index = index;
        cardContainer.dataset.name = cardData.name;
        cardContainer.dataset.position = positions[index];
        cardContainer.innerHTML = `
            <div class="card">
                <div class="card-back"></div>
                <div class="card-face" style="background-image: url('${imagePath}'); background-size: cover; background-position: center;">
                    <span class="card-name visually-hidden">${cardData.name}</span>
                    <span class="card-position visually-hidden">${positions[index]} の位置</span>
                </div>
            </div>
        `;

        // ディールアニメーションを順に実行
        setTimeout(() => {
            cardContainer.classList.add('dealt');
            cardArea.appendChild(cardContainer);
        }, 100 * index);

        // カードクリックでめくれるイベントを追加
        cardContainer.addEventListener('click', flipCard);
    });

    statusMessage.textContent = `スプレッドを展開しました。カードをクリックして結果を見てください。`;
}

// --- 4. カードのめくり (スタイリッシュな表現) ---

// ... (flipCard関数は変更なし。ただし、カード表面に情報が表示されないため、結果表示ロジックを工夫しても良いかもしれません)

function flipCard(event) {
    const cardContainer = event.currentTarget;
    const card = cardContainer.querySelector('.card');
    
    // 正位置/逆位置をランダムに決定
    const isReversed = Math.random() < 0.5;

    // カードをめくる
    card.classList.add('flipped');

    // 逆位置ならCSSで回転させる
    if (isReversed) {
        // Y軸方向で180度回転し、X軸方向で180度回転して逆位置を表現
        card.style.transform = 'rotateY(180deg) rotateX(180deg)'; 
        cardContainer.querySelector('.card-face .card-position').textContent += ' (逆位置)';
    } else {
        card.style.transform = 'rotateY(180deg) rotateX(0deg)'; 
        cardContainer.querySelector('.card-face .card-position').textContent += ' (正位置)';
    }

    // 一度めくったら、再度めくれないようにイベントを削除
    cardContainer.removeEventListener('click', flipCard);
}


// --- 5. イベントリスナー ---
shuffleButton.addEventListener('click', startPreparation);
drawButton.addEventListener('click', drawCards);

// 初期設定としてカードエリアをクリア
cardArea.innerHTML = '';
