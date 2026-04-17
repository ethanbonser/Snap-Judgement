// Note: Using a lightweight PubSub library via CDN for wireless sync
import { connect } from 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';

const client = connect('wss://broker.emqx.io:8084/mqtt');
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

function revealCardOnBoard(cardData) {
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
        document.getElementById('discard-card').classList.add('flipped');
        
        // 4. Animate Stat Bar
        statFill.style.width = '0%';
        setTimeout(() => {
            statFill.style.width = `${cardData.awkwardness}%`;
        }, 300);

        // 5. Update Count
        cardsLeft--;
        cardCountDisplay.textContent = cardsLeft;
    }, 300);
}

// Manual Board Interaction (If mouse is used on board)
libraryCard.addEventListener('click', () => {
    // This could trigger a 'Draw' command to the players if needed
    alert("Use your phone to pick and send a card!");
});

document.getElementById('shuffle-btn').addEventListener('click', () => {
    client.publish(topic, JSON.stringify({ action: 'reset' }));
    location.reload();
});
