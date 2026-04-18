let client, topic;
let hand = [], focusedCardData = null, gameStarted = false;
let lastSubmittedCard = null; // Track the card currently on the board

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const savedRoom = localStorage.getItem('snapRoom');
    if (savedRoom) {
        connectToRoom(savedRoom);
    } else {
        showRoomEntry();
    }
});

function showRoomEntry() {
    document.querySelector('main').innerHTML = `
        <div class="mobile-center-ui" style="display:flex; flex-direction:column; gap:20px; align-items:center;">
            <h2 style="font-family: Bangers; font-size: 2rem; color: var(--gold);">JOIN GAME</h2>
            <input type="text" id="room-input" placeholder="CHILL-153" 
                style="padding: 15px; width: 80%; border: 3px solid var(--gold); background: #000; color: #fff; text-align: center; font-family: 'Press Start 2P'; font-size: 0.8rem;">
            <button onclick="handleJoinSubmit()" class="btn-green" style="width: 80%;">CONNECT</button>
        </div>
    `;
}

window.handleJoinSubmit = () => {
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (code) {
        localStorage.setItem('snapRoom', code);
        connectToRoom(code);
    }
};

function connectToRoom(roomCode) {
    // Convert CHILL-153 to 192-168-0-153 format for the topic
    const ipSuffix = roomCode.replace('CHILL-', '').replace(/-/g, '.');
    const formattedTopic = roomCode.includes('CHILL') ? `192-168-0-${roomCode.split('-').pop()}` : roomCode;
    
    topic = `chillvibez/snap-judgement/${formattedTopic}`;
    client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

    client.on('connect', () => {
        console.log("Connected to Room:", roomCode);
        client.subscribe(topic);
        setInterval(() => {
            if (topic) client.publish(topic, JSON.stringify({ a: 'h', p: document.getElementById('player-role').value }));
        }, 5000);
        
        if (!localStorage.getItem('snapDevice')) showDeviceSelection();
        else applyDeviceOptim();
    });

    client.on('message', (t, m) => {
        const d = JSON.parse(m.toString());
        if (d.a === 'start' && !gameStarted) beginGameDeal();
        if (d.a === 'reset') { localStorage.clear(); location.reload(); }
        if (d.a === 'sv') showVotingUI();
        if (d.a === 'ro') resetForNextRound();
    });
}

function showDeviceSelection() {
    document.querySelector('main').innerHTML = `
        <div class="mobile-center-ui">
            <h2 style="font-family: Bangers; font-size: 1.5rem; color: #f1c40f; margin-bottom: 20px;">CHOOSE DEVICE</h2>
            <div class="device-grid">
                <button onclick="setDevice('ios-p')" class="device-btn">iOS (Phone)</button>
                <button onclick="setDevice('android-p')" class="device-btn">Android (Phone)</button>
                <button onclick="setDevice('ios-t')" class="device-btn">iOS (Tablet)</button>
                <button onclick="setDevice('android-t')" class="device-btn">Android (Tablet)</button>
                <button onclick="setDevice('win')" class="device-btn">Windows</button>
                <button onclick="setDevice('mac')" class="device-btn">Mac OSX</button>
            </div>
        </div>
    `;
}

window.setDevice = (t) => { localStorage.setItem('snapDevice', t); location.reload(); };

function applyDeviceOptim() {
    const t = localStorage.getItem('snapDevice');
    document.querySelector('.game-container').classList.add(`${t}-optim`);
    document.querySelector('main').innerHTML = `<div class="waiting-screen"><h2 style="font-family: Bangers; color: #f1c40f;">CONNECTED!</h2><p style="font-size:0.5rem; margin-top:20px;">WAITING FOR BOARD <span class="loading-dots">...</span></p></div>`;
}

function beginGameDeal() {
    gameStarted = true;
    lastSubmittedCard = null; 
    document.querySelector('main').innerHTML = `<div id="player-hand" class="player-hand"></div>`;
    hand = []; for(let i=0; i<7; i++) hand.push(drawCard());
    renderHand();
}

function drawCard() {
    const r = Math.floor(Math.random() * cardContexts.length);
    const s = Math.floor(r / 20);
    const t = seriesThemes[Math.min(s, seriesThemes.length-1)];
    return { id: Math.random().toString(36).substr(2, 9), text: cardContexts[r], number: r + 1, category: t.name, emoji: t.emoji };
}

function focusCard(c) {
    focusedCardData = c;
    document.getElementById('focused-card-slot').innerHTML = `
        <div class="card flipped">
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-header"><span class="card-type">${c.category}</span></div>
                    <div class="card-illustration">${c.emoji}</div>
                    <div class="card-main-content">
                        <div class="content-wrapper"><p class="mini-card-text">${c.text}</p></div>
                    </div>
                </div>
            </div>
        </div>`;
    document.getElementById('focus-overlay').style.display = 'flex';
}

document.getElementById('close-focus-btn').onclick = () => document.getElementById('focus-overlay').style.display = 'none';
document.getElementById('send-to-pile-btn').onclick = () => {
    const playerRole = document.getElementById('player-role').value;
    client.publish(topic, JSON.stringify({ a: 'pc', c: focusedCardData, p: playerRole }));
    
    const cardIndex = hand.findIndex(h => h.id === focusedCardData.id);
    
    if (lastSubmittedCard) {
        // SWAP: Put the old board card back into the hand at the same position
        if (cardIndex !== -1) {
            hand[cardIndex] = lastSubmittedCard;
        }
    } else {
        // FIRST SUBMISSION: Replace the submitted card with a new one from the library
        if (cardIndex !== -1) {
            hand[cardIndex] = drawCard();
        }
    }

    // Update the reference for the card currently on the board
    const isUpdate = lastSubmittedCard !== null;
    lastSubmittedCard = focusedCardData;
    
    document.getElementById('focus-overlay').style.display = 'none';
    renderHand();
    showSubmissionToast(isUpdate);
};

function showSubmissionToast(isUpdate) {
    const msg = isUpdate ? "CARD UPDATED! 🔄" : "CARD SENT! 🚀";
    const toast = document.createElement('div');
    toast.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:var(--gold); color:#000; padding:20px; border:4px solid #000; font-family:'Press Start 2P'; z-index:6000; box-shadow:8px 8px 0 rgba(0,0,0,0.5);";
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function renderHand() {
    const ph = document.getElementById('player-hand'); if (!ph) return;
    ph.innerHTML = '';
    hand.forEach((c, i) => {
        const el = document.createElement('div'); 
        el.className = `card hand-card flipped`;
        el.innerHTML = `<div class="card-inner"><div class="card-front">
            <div class="card-header"><span class="card-type">${c.category}</span></div>
            <div class="card-illustration">${c.emoji}</div>
            <div class="card-main-content"><div class="content-wrapper"><p class="mini-card-text">${c.text}</p></div></div>
        </div></div>`;
        el.onclick = () => focusCard(c); ph.appendChild(el);
    });
}

function showVotingUI() {
    document.querySelector('main').innerHTML = `<div class="mobile-center-ui"><h2 style="font-family: Bangers; color: #f1c40f;">VOTE NOW!</h2><button onclick="submitVote('p1')" class="vote-btn-large">PLAYER 1</button><button onclick="submitVote('p2')" class="vote-btn-large">PLAYER 2</button></div>`;
}

window.submitVote = (v) => {
    client.publish(topic, JSON.stringify({ a: 'sv', v: v, f: document.getElementById('player-role').value }));
    document.querySelector('main').innerHTML = `<div class="mobile-center-ui"><h2 style="font-family: Bangers; color: #f1c40f;">VOTE SENT!</h2></div>`;
};

function resetForNextRound() { 
    lastSubmittedCard = null; 
    setTimeout(() => location.reload(), 4000); 
}

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
