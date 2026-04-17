const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
const topic = 'chillvibez/snap-judgement/CHILL-1';

// Elements
const libraryCard = document.getElementById('library-card');
const discardCard = document.getElementById('discard-card');
const cardCountDisplay = document.getElementById('card-count');
const cardText = document.getElementById('card-text');
const cardCategory = document.getElementById('card-category');
const cardNumber = document.getElementById('card-number');
const cardEmoji = document.getElementById('card-emoji');
const statFill = document.getElementById('stat-awkward');

let cardsLeft = 600;
let isAnimating = false;

// Series Data (Shared with player)
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
    console.log('Board Connected Wirelessly!');
    client.subscribe(topic);
});

client.on('message', (t, message) => {
    const data = JSON.parse(message.toString());
    if (data.action === 'play-card') {
        revealCardOnBoard(data.card);
    } else if (data.action === 'reset') {
        location.reload();
    }
});

// Manual Draw from Board
window.drawFromBoard = function() {
    if (isAnimating || cardsLeft <= 0) return;
    
    const randomIndex = Math.floor(Math.random() * cardContexts.length);
    const text = cardContexts[randomIndex];
    const seriesIndex = Math.floor(randomIndex / 20);
    const theme = seriesThemes[seriesIndex] || seriesThemes[seriesThemes.length - 1];
    
    const cardData = {
        text: text,
        number: randomIndex + 1,
        category: theme.name,
        emoji: theme.emoji,
        awkwardness: Math.floor(Math.random() * 60) + 40,
        player: "Board"
    };

    revealCardOnBoard(cardData);
};

function revealCardOnBoard(cardData) {
    isAnimating = true;

    // Reset discard state first
    discardCard.classList.remove('flipped');
    statFill.style.width = '0%';

    setTimeout(() => {
        // 1. Library Animation (Bounce)
        libraryCard.style.transform = 'scale(1.1) translateY(-10px)';
        
        setTimeout(() => {
            libraryCard.style.transform = '';
            
            // 2. Update Discard Pile UI
            cardText.textContent = cardData.text;
            cardCategory.textContent = `${cardData.player}: ${cardData.category}`;
            cardNumber.textContent = `#${String(cardData.number).padStart(3, '0')}`;
            cardEmoji.textContent = cardData.emoji;
            
            // 3. Reveal Discard Card (Vertical Flip)
            discardCard.classList.add('flipped');
            
            // 4. Animate Stat Bar
            setTimeout(() => {
                statFill.style.width = `${cardData.awkwardness}%`;
                isAnimating = false;
            }, 300);

            // 5. Update Count
            cardsLeft--;
            cardCountDisplay.textContent = cardsLeft;
        }, 300);
    }, 100);
}

document.getElementById('shuffle-btn').addEventListener('click', () => {
    client.publish(topic, JSON.stringify({ action: 'reset' }));
    location.reload();
});
