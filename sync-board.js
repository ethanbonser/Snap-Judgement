// Standardize MQTT reference
const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
const topic = 'chillvibez/snap-judgement/192-168-0-153';

let playerCount = 2, scores = {p1:0, p2:0, p3:0, p4:0}, currentSubmissions = [];
let playersWhoVoted = new Set(), currentVotes = {p1:0, p2:0, p3:0, p4:0}, isAnimating = false;

client.on('connect', () => {
    console.log("MQTT Link Active");
    client.subscribe(topic);
});

client.on('message', (t, m) => {
    try {
        const d = JSON.parse(m.toString());
        if (d.a === 'h') { const el = document.getElementById(`${d.p}-status`); if (el) { el.textContent = 'ONLINE'; el.style.color = '#2ecc71'; } }
        if (d.a === 'pc') handleCardPlay(d);
        if (d.a === 'sv') handleVote(d);
        if (d.a === 'reset') location.reload();
    } catch(e) { console.error("Message Error:", e); }
});

// ROBUST INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Ready - Initializing Board...");
    
    // Immediately draw the board layout to remove "Initializing..."
    initLayout();
    
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.onclick = () => {
            console.log("Starting Game...");
            playerCount = parseInt(document.getElementById('setup-players').value);
            document.getElementById('setup-menu').classList.remove('active');
            initLayout(); // Redraw with correct player count
            client.publish(topic, JSON.stringify({ a: 'start', pc: playerCount }));
        };
    }

    const resetBtn = document.getElementById('shuffle-btn');
    if (resetBtn) {
        resetBtn.onclick = () => {
            console.log("Game Resetting...");
            client.publish(topic, JSON.stringify({ a: 'reset' }));
            setTimeout(() => location.reload(), 300);
        };
    }

    const nextBtn = document.getElementById('next-round-btn');
    if (nextBtn) {
        nextBtn.onclick = () => {
            document.getElementById('winner-modal').classList.remove('active');
            revealNewPrompt();
        };
    }
});

function initLayout() {
    const area = document.getElementById('main-board-area');
    if (!area) return;
    
    area.innerHTML = `
        <div class="side-area" id="left-side" style="display:flex; flex-direction:column; gap:30px;"></div>
        <div class="side-area" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <span class="pile-label">LIBRARY</span>
            <div class="card" id="library-card" onclick="revealNewPrompt()">
                <div class="card-inner"><div class="card-back"></div><div class="card-front"></div></div>
            </div>
            <button id="start-voting-btn" style="display:none; background:var(--gold); color:black; margin-top:15px;">START VOTING</button>
        </div>
        <div class="side-area" id="right-side" style="display:flex; flex-direction:column; gap:30px;"></div>
    `;
    
    const leftSide = document.getElementById('left-side');
    const rightSide = document.getElementById('right-side');

    for(let i=1; i<=playerCount; i++) {
        const col = i <= 2 ? leftSide : rightSide;
        const p = `p${i}`;
        const div = document.createElement('div');
        div.className = "player-container-box";
        div.innerHTML = `
            <div class="side-pile">
                <div style="font-size: 1.2rem; color: var(--gold); font-family: 'Bangers', cursive;">P${i}</div>
                <div class="win-count" id="${p}-wins">0</div>
                <div id="${p}-status" style="font-size:0.4rem; color:#444;">OFFLINE</div>
                <div id="${p}-win-pile" class="win-stack"></div>
            </div>
            <div class="submission-slot" id="${p}-submission"></div>
        `;
        if (col) col.appendChild(div);
    }
}

window.revealNewPrompt = function() {
    if (isAnimating) return;
    const libCard = document.getElementById('library-card');
    if (!libCard) return;

    // Use gamePrompts from prompts.js
    const prompt = gamePrompts[Math.floor(Math.random() * gamePrompts.length)];
    const front = libCard.querySelector('.card-front');
    
    front.innerHTML = `
        <div class="card-header"><span class="card-type">${prompt.category}</span></div>
        <div class="card-illustration">❓</div>
        <div class="card-main-content">
            <div class="content-wrapper"><p id="prompt-text" class="mini-card-text">${prompt.text}</p></div>
        </div>
    `;

    isAnimating = true;
    libCard.classList.remove('flipped');
    setTimeout(() => { 
        libCard.classList.add('flipped');
        for(let i=1; i<=4; i++) {
            const slot = document.getElementById(`p${i}-submission`);
            if (slot) slot.innerHTML = '';
        }
        currentSubmissions = [];
        playersWhoVoted.clear();
        currentVotes = { p1: 0, p2: 0, p3: 0, p4: 0 };
        document.getElementById('start-voting-btn').style.display = 'none';
        
        setTimeout(() => { isAnimating = false; }, 600);
    }, 100);
};

function handleCardPlay(d) {
    currentSubmissions.push(d);
    const slot = document.getElementById(`${d.p}-submission`);
    if (slot) {
        slot.innerHTML = `<div class="card flipped" style="width:140px; height:210px;"><div class="card-inner"><div class="card-front">
            <div class="card-header"><span class="card-type">P${d.p.slice(1)}</span></div>
            <div class="card-illustration">${d.c.emoji}</div>
            <div class="card-main-content"><div class="content-wrapper"><p class="mini-card-text">${d.c.text}</p></div></div>
        </div></div></div>`;
    }
    
    if (currentSubmissions.length >= playerCount) {
        const vBtn = document.getElementById('start-voting-btn');
        if (vBtn) {
            vBtn.style.display = 'block';
            vBtn.onclick = () => { vBtn.style.display = 'none'; client.publish(topic, JSON.stringify({ a: 'sv' })); };
        }
    }
}

function handleVote(d) {
    if (playersWhoVoted.has(d.f)) return;
    playersWhoVoted.add(d.f);
    currentVotes[d.v]++;
    if (playersWhoVoted.size >= playerCount) declareWinner();
}

function declareWinner() {
    let winner = 'p1', maxVotes = -1;
    for(let p in currentVotes) {
        if (currentVotes[p] > maxVotes) { maxVotes = currentVotes[p]; winner = p; }
    }
    
    scores[winner]++;
    const winEl = document.getElementById(`${winner}-wins`);
    if (winEl) winEl.textContent = scores[winner];
    addCardToWinPile(winner);

    const modal = document.getElementById('winner-modal');
    document.getElementById('modal-winner-name').textContent = `PLAYER ${winner.slice(1)} WINS!`;
    document.getElementById('modal-funny-msg').textContent = "THEY HAVE THE SUPERIOR BRAIN CELL. 🧠✨";
    modal.classList.add('active');
    client.publish(topic, JSON.stringify({ a: 'ro', w: winner }));
}

function addCardToWinPile(playerKey) {
    const pile = document.getElementById(`${playerKey}-win-pile`);
    if (!pile) return;
    const miniCard = document.createElement('div');
    miniCard.className = 'won-card-mini';
    const offset = (scores[playerKey] - 1) * 5;
    miniCard.style.top = `${offset}px`;
    miniCard.style.left = `${offset}px`;
    miniCard.style.zIndex = scores[playerKey];
    pile.appendChild(miniCard);
}
