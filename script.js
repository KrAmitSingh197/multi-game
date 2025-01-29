// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentRoomId = null;
let playerId = null;

// DOM Elements
const createGameBtn = document.getElementById('createGameBtn');
const startGameBtn = document.getElementById('startGameBtn');
const roomList = document.getElementById('roomList');
const gameRoom = document.getElementById('gameRoom');

createGameBtn.addEventListener('click', () => {
    document.getElementById('createGameModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('createGameModal').style.display = 'none';
});

startGameBtn.addEventListener('click', createRoom);

// Firebase listeners
database.ref('rooms').on('value', (snapshot) => {
    roomList.innerHTML = '';
    const rooms = snapshot.val() || {};
    
    Object.entries(rooms).forEach(([roomId, room]) => {
        if (room.status === 'waiting') {
            const li = document.createElement('li');
            li.textContent = `Room ${roomId} (${Object.keys(room.players).length}/${room.maxPlayers})`;
            li.addEventListener('click', () => joinRoom(roomId));
            roomList.appendChild(li);
        }
    });
});

async function createRoom() {
    const strategy = document.getElementById('strategy').value;
    const maxPlayers = document.getElementById('maxPlayers').value;
    const factor = document.getElementById('factor').value;

    const roomRef = database.ref('rooms').push();
    currentRoomId = roomRef.key;
    playerId = generatePlayerId();

    const roomData = {
        strategy,
        maxPlayers: parseInt(maxPlayers),
        factor: parseFloat(factor),
        status: 'waiting',
        players: {
            [playerId]: {
                name: `Player ${Math.floor(Math.random() * 1000)}`,
                number: null,
                status: 'active'
            }
        }
    };

    await roomRef.set(roomData);
    setupRoomListeners();
    showGameRoom();
}

async function joinRoom(roomId) {
    currentRoomId = roomId;
    playerId = generatePlayerId();
    
    const roomRef = database.ref(`rooms/${roomId}`);
    const roomSnapshot = await roomRef.once('value');
    const room = roomSnapshot.val();

    if (Object.keys(room.players).length >= room.maxPlayers) {
        alert('Room is full!');
        return;
    }

    await roomRef.child(`players/${playerId}`).set({
        name: `Player ${Math.floor(Math.random() * 1000)}`,
        number: null,
        status: 'active'
    });

    setupRoomListeners();
    showGameRoom();
}

function setupRoomListeners() {
    const roomRef = database.ref(`rooms/${currentRoomId}`);
    
    roomRef.on('value', (snapshot) => {
        const room = snapshot.val();
        updateGameUI(room);
        
        if (room.status === 'playing') {
            startGameRound(room);
        }
    });
}

function updateGameUI(room) {
    document.getElementById('roomIdDisplay').textContent = currentRoomId;
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';

    Object.entries(room.players).forEach(([id, player]) => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.textContent = `${player.name}${player.status === 'eliminated' ? ' (Eliminated)' : ''}`;
        playersList.appendChild(div);
    });

    if (room.status === 'playing') {
        document.getElementById('inputSection').classList.remove('hidden');
    }
}

function startGameRound(room) {
    if (room.currentNumber) return;

    document.getElementById('submitNumber').addEventListener('click', async () => {
        const number = parseFloat(document.getElementById('numberInput').value);
        await database.ref(`rooms/${currentRoomId}/players/${playerId}/number`).set(number);
    });
}

function generatePlayerId() {
    return Math.random().toString(36).substr(2, 9);
}

function showGameRoom() {
    document.getElementById('lobby').classList.add('hidden');
    document.getElementById('createGameModal').style.display = 'none');
    gameRoom.classList.remove('hidden');
}

// Add remaining game logic for elimination rounds
// This would include calculating averages, eliminating players, and checking for winner
