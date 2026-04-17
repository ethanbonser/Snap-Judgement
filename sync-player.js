import { connect } from 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';

const client = connect('wss://broker.emqx.io:8084/mqtt');
const topic = 'chillvibez/snap-judgement/CHILL-1';

// Elements
const mainCard = document.getElementById('main-card');
const sendBtn = document.getElementById('send-to-pile-btn');
const statusMsg = document.getElementById('status-msg');
const playerRole = document.getElementById('player-role');

const cardText = document.getElementById('card-text');
const cardCategory = document.getElementById('card-category');
const cardNumber = document.getElementById('card-number');
const cardEmoji = document.getElementById('card-emoji');
const statFill = document.getElementById('stat-awkward');

let currentSelectedCard = null;
let isFlipping = false;

// Series Data (Same as script.js)
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
    console.log('Player Connected Wirelessly!');
    client.subscribe(topic);
});

client.on('message', (t, message) => {
    const data = JSON.parse(message.toString());
    if (data.action === 'reset') {
        location.reload();
    }
});

// Pick a card on phone
mainCard.addEventListener('click', () => {
    if (isFlipping) return;
    
    isFlipping = true;
    
    if (!mainCard.classList.contains('flipped')) {
        // Draw random
        const randomIndex = Math.floor(Math.random() * cardContexts.length);
        const text = cardContexts[randomIndex];
        const seriesIndex = Math.floor(randomIndex / 20);
        const theme = seriesThemes[seriesIndex] || seriesThemes[seriesThemes.length - 1];
        
        currentSelectedCard = {
            text: text,
            number: randomIndex + 1,
            category: theme.name,
            emoji: theme.emoji,
            awkwardness: Math.floor(Math.random() * 60) + 40,
            player: playerRole.value === 'p1' ? 'Player 1' : 'Player 2'
        };

        // UI Update
        cardText.textContent = currentSelectedCard.text;
        cardCategory.textContent = currentSelectedCard.category;
        cardNumber.textContent = `#${String(currentSelectedCard.number).padStart(3, '0')}`;
        cardEmoji.textContent = currentSelectedCard.emoji;
        statFill.style.width = `${currentSelectedCard.awkwardness}%`;
        
        mainCard.classList.add('flipped');
        sendBtn.disabled = false;
        statusMsg.textContent = "Ready to send!";
    } else {
        mainCard.classList.remove('flipped');
        sendBtn.disabled = true;
    }

    setTimeout(() => { isFlipping = false; }, 600);
});

// Wireless Send
sendBtn.addEventListener('click', () => {
    if (!currentSelectedCard) return;

    statusMsg.textContent = "Sending...";
    
    client.publish(topic, JSON.stringify({
        action: 'play-card',
        card: currentSelectedCard
    }));

    setTimeout(() => {
        mainCard.classList.remove('flipped');
        currentSelectedCard = null;
        sendBtn.disabled = true;
        statusMsg.textContent = "Card Sent! Draw again.";
    }, 500);
});
