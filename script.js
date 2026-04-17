// Elements
const mainCard = document.getElementById('main-card');
const cardText = document.getElementById('card-text');
const cardCountDisplay = document.getElementById('card-count');
const shuffleBtn = document.getElementById('shuffle-btn');
const cardCategory = document.getElementById('card-category');
const cardNumber = document.getElementById('card-number');
const cardEmoji = document.getElementById('card-emoji');
const statFill = document.getElementById('stat-awkward');

// Series Data
const seriesThemes = [
    { name: "COSMIC", emoji: "🌌" },
    { name: "ANIMALS", emoji: "🐾" },
    { name: "OBJECTS", emoji: "📦" },
    { name: "RANDOM", emoji: "🎲" },
    { name: "CHAOTIC", emoji: "🔥" },
    { name: "CAREER", emoji: "💼" },
    { name: "FOOD", emoji: "🍕" },
    { name: "HISTORY", emoji: "📜" },
    { name: "TECH", emoji: "💻" },
    { name: "ABSURD", emoji: "🌀" },
    { name: "PARANORMAL", emoji: "👻" },
    { name: "BIOLOGICAL", emoji: "🧬" },
    { name: "SURREAL", emoji: "🍄" },
    { name: "CAREER CHAOS", emoji: "⚠️" },
    { name: "FINAL BOSS", emoji: "👑" }
];

// Game State
let currentDeck = [];
let isFlipping = false;

// Initialize Deck
function initDeck() {
    currentDeck = cardContexts.map((text, index) => {
        const seriesIndex = Math.floor(index / 20);
        const theme = seriesThemes[seriesIndex] || seriesThemes[seriesThemes.length - 1];
        return {
            text: text,
            number: index + 1,
            category: theme.name,
            emoji: theme.emoji,
            awkwardness: Math.floor(Math.random() * 60) + 40
        };
    });
    updateCardCount();
}

function updateCardCount() {
    cardCountDisplay.textContent = currentDeck.length;
}

function getRandomCard() {
    if (currentDeck.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * currentDeck.length);
    const card = currentDeck.splice(randomIndex, 1)[0];
    updateCardCount();
    return card;
}

// Single Flip Logic
mainCard.addEventListener('click', () => {
    if (isFlipping) return;

    if (!mainCard.classList.contains('flipped')) {
        const cardData = getRandomCard();
        if (!cardData) {
            alert("The deck is empty! Click Shuffle to reset.");
            return;
        }
        
        // Lock interaction during flip
        isFlipping = true;

        // Reset stat bar to 0 before flip so it animates in
        statFill.style.transition = 'none';
        statFill.style.width = '0%';
        
        // Update Card Front UI
        cardText.textContent = cardData.text;
        cardCategory.textContent = cardData.category;
        cardNumber.textContent = `#${String(cardData.number).padStart(3, '0')}`;
        cardEmoji.textContent = cardData.emoji;
        
        mainCard.classList.add('flipped');

        // Delay updating the stat bar until the card is visible
        setTimeout(() => {
            statFill.style.transition = '';
            statFill.style.width = `${cardData.awkwardness}%`;
        }, 100);

        // Unlock after animation finishes (600ms CSS transition)
        setTimeout(() => {
            isFlipping = false;
        }, 600);
    } else {
        isFlipping = true;
        mainCard.classList.remove('flipped');
        
        setTimeout(() => {
            isFlipping = false;
        }, 600);
    }
});

// Shuffle Logic
shuffleBtn.addEventListener('click', () => {
    if (isFlipping) return;

    mainCard.classList.add('shuffling');
    mainCard.classList.remove('flipped'); 
    
    shuffleBtn.disabled = true;
    shuffleBtn.style.opacity = '0.5';

    setTimeout(() => {
        initDeck();
        mainCard.classList.remove('shuffling');
        cardText.textContent = "Click to draw a card!";
        shuffleBtn.disabled = false;
        shuffleBtn.style.opacity = '1';
    }, 1500);
});

initDeck();
