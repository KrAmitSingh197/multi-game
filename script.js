let rooms = [];
let currentRoom = null;

document.getElementById('num-players').addEventListener('input', function() {
    const numPlayers = this.value;
    const playerNamesDiv = document.getElementById('player-names');
    playerNamesDiv.innerHTML = '';
    for (let i = 0; i < numPlayers; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1} Name`;
        playerNamesDiv.appendChild(input);
    }
});

document.getElementById('create-room').addEventListener('click', function() {
    const distance = document.getElementById('distance').value;
    const numPlayers = document.getElementById('num-players').value;
    const factor = document.getElementById('factor').value;
    const playerNames = Array.from(document.querySelectorAll('#player-names input')).map(input => input.value);

    if (playerNames.some(name => name === '')) {
        alert('Please fill in all player names.');
        return;
    }

    const room = {
        id: rooms.length + 1,
        distance,
        numPlayers,
        factor,
        players: playerNames,
        status: 'waiting',
        winner: null
    };

    rooms.push(room);
    updateRoomList();
    joinRoom(room.id);
});

function updateRoomList() {
    const roomsList = document.getElementById('rooms');
    roomsList.innerHTML = '';
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = `Room ${room.id} - ${room.players.length}/${room.numPlayers} players`;
        li.addEventListener('click', () => joinRoom(room.id));
        roomsList.appendChild(li);
    });
}

function joinRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (room.players.length >= room.numPlayers) {
        alert('Room is full.');
        return;
    }

    currentRoom = room;
    document.getElementById('create-game').style.display = 'none';
    document.getElementById('room-list').style.display = 'none';
    document.getElementById('game-room').style.display = 'block';

    updateGameInfo();

    if (room.status === 'waiting') {
        setTimeout(startGame, 90000); // 1.5 minutes
    }
}

function updateGameInfo() {
    const gameInfo = document.getElementById('game-info');
    gameInfo.innerHTML = `
        <p>Distance: ${currentRoom.distance}</p>
        <p>Number of Players: ${currentRoom.numPlayers}</p>
        <p>Factor: ${currentRoom.factor}</p>
    `;

    const gamePlayers = document.getElementById('game-players');
    gamePlayers.innerHTML = '<h3>Players:</h3>';
    currentRoom.players.forEach(player => {
        gamePlayers.innerHTML += `<p>${player}</p>`;
    });

    const gameStatus = document.getElementById('game-status');
    gameStatus.innerHTML = `<p>Status: ${currentRoom.status}</p>`;
}

function startGame() {
    currentRoom.status = 'playing';
    updateGameInfo();

    let players = [...currentRoom.players];

    while (players.length > 1) {
        const average = players.length / 2;
        const target = average * currentRoom.factor;

        const differences = players.map(player => ({
            name: player,
            difference: Math.abs(player.length - target)
        }));

        differences.sort((a, b) => currentRoom.distance === 'close' ? a.difference - b.difference : b.difference - a.difference);

        const eliminated = differences[0].name;
        players = players.filter(player => player !== eliminated);

        const gameStatus = document.getElementById('game-status');
        gameStatus.innerHTML += `<p>Eliminated: ${eliminated}</p>`;
    }

    currentRoom.winner = players[0];
    currentRoom.status = 'finished';
    updateGameInfo();

    const gameStatus = document.getElementById('game-status');
    gameStatus.innerHTML += `<p>Winner: ${currentRoom.winner}</p>`;
}

document.getElementById('exit-room').addEventListener('click', function() {
    currentRoom = null;
    document.getElementById('create-game').style.display = 'block';
    document.getElementById('room-list').style.display = 'block';
    document.getElementById('game-room').style.display = 'none';
});
