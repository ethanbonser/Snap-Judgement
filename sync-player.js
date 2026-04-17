const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
const topic = 'chillvibez/snap-judgement/CHILL-1';

// Elements
const playerHand = document.getElementById('player-hand');
const focusOverlay = document.getElementById('focus-overlay');
const focusedCardSlot = document.getElementById('focused-card-slot');
const sendBtn = document.getElementById('send-to-pile-btn');
const closeBtn = document.getElementById('close-focus-btn');
const playerRole = document.getElementById('player-role');

let hand = [];
let focusedCardData = null;

// Series Data
const seriesThemes = [
    { name: "COSMIC", emoji: "🌌" }, { name: "ANIMALS", emoji: "🐾" }, { name: "OBJECTS", emoji: "📦" },
    { name: "RANDOM", emoji: "🎲" }, { name: "CHAOTIC", emoji: "🔥" }, { name: "CAREER", emoji: "💼" },
    { name: "FOOD", emoji: "🍕" }, { name: "HISTORY", emoji: "📜" }, { name: "TECH", emoji: "💻" },
    { name: "ABSURD", emoji: "🌀" }, { name: "PARANORMAL", emoji: "👻" }, { name: "BIOLOGICAL", emoji: "🧬" },
    { name: "SURREAL", emoji: "🍄" }, { name: "CAREER CHAOS", emoji: "⚠️" }, { name: "FINAL BOSS", emoji: "👑" },
    { name: "SEAGULLS", emoji: "🐦" }, { name: "SEAGULLS", emoji: "🍟" }, { name: "SEAGULLS", emoji: "🐚" },
    { name: "SEAGULLS", emoji: "🌊" }, { name: "SEAGULLS", emoji: "🕶️" }, { name: "PONIES", emoji: "🐎" },
    { name: "PONIES", emoji: "🥕" }, { name: "PONIES", emoji: "🏇" }, { name: "PONIES", emoji: "🎀" },
    { name: "PONIES", emoji: "🍎" }, { name: "MIX", emoji: "🌀" }, { name: "MIX", emoji: "🌪️" },
    { name: "MIX", emoji: "🔮" }, { name: "MIX", emoji: "🎭" }, { name: "MIX", emoji: "✨" }
];

client.on('connect', () => {
    console.log('Player Connected!');
    client.subscribe(topic);
});

client.on('message', (t, message) => {
    if (JSON.parse(message.toString()).action === 'reset') location.reload();
});

// Logic
function drawCard() {
    const randomIndex = Math.floor(Math.random() * cardContexts.length);
    const seriesIndex = Math.floor(randomIndex / 20);
    const theme = seriesThemes[seriesIndex] || seriesThemes[seriesThemes.length - 1];
    
    return {
        id: Math.random().toString(36).substr(2, 9),
        text: cardContexts[randomIndex],
        number: randomIndex + 1,
        category: theme.name,
        emoji: theme.emoji,
        awkwardness: Math.floor(Math.random() * 60) + 40
    };
}

function initHand() {
    for (let i = 0; i < 7; i++) {
        hand.push(drawCard());
    }
    renderHand();
}

function renderHand() {
    playerHand.innerHTML = '';
    hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card hand-card';
        cardEl.style.zIndex = index;
        
        // Calculate Fan Rotation
        const mid = 3;
        const rotation = (index - mid) * 10;
        cardEl.style.transform = `rotate(${rotation}deg) translateY(${Math.abs(index - mid) * 5}px)`;

        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
            </div>
        `;
        
        cardEl.onclick = () => focusCard(card);
        playerHand.appendChild(cardEl);
    });
}

function focusCard(card) {
    focusedCardData = card;
    focusedCardSlot.innerHTML = `
        <div class="card flipped">
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-header">
                        <span class="card-type">${card.category}</span>
                        <span class="card-id">#${String(card.number).padStart(3, '0')}</span>
                    </div>
                    <div class="card-illustration">${card.emoji}</div>
                    <div class="content-wrapper"><p id="card-text">${card.text}</p></div>
                    <div class="card-footer">
                        <div class="stat-bar"><div class="stat-fill" style="width: ${card.awkwardness}%"></div></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    focusOverlay.style.display = 'flex';
}

closeBtn.onclick = () => {
    focusOverlay.style.display = 'none';
    focusedCardData = null;
};

sendBtn.onclick = () => {
    if (!focusedCardData) return;
    
    const payload = {
        action: 'play-card',
        card: {
            ...focusedCardData,
            player: playerRole.value === 'p1' ? 'Player 1' : 'Player 2'
        }
    };

    client.publish(topic, JSON.stringify(payload));
    
    // Remove from hand and draw new
    hand = hand.filter(c => c.id !== focusedCardData.id);
    hand.push(drawCard());
    
    focusOverlay.style.display = 'none';
    focusedCardData = null;
    renderHand();
};

initHand();
