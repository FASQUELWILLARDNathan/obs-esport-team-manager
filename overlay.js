function getRankImageName(rank, game) {
    const isLol = game === 'lol';

    const rankMap = {
        'radiant': 'Radiant',
        'unranked': 'unranked',
        'unranked1': 'unranked'
    };

    if (!isLol && rankMap[rank]) {
        return { name: rankMap[rank], ext: 'png' };
    }

    if (!isLol && rank.match(/^plat(\d?)$/)) {
        rank = rank.replace(/^plat/, 'platinum');
    }

    if (!/\d$/.test(rank)) {
        rank = rank + '1';
    }

    if (isLol) {
        const rankBase = rank.replace(/\d+$/, '');
        return { name: `lol_${rankBase}`, ext: 'webp' };
    }
    return { name: rank, ext: 'png' };
}

function updateTeam(id, players, game) {
    const container = document.getElementById(id);
    container.innerHTML = "";

    players.slice(0, 5).forEach(p => {
        const div = document.createElement("div");
        div.className = "player";

        const rankImage = getRankImageName(p.rank, game);
        div.innerHTML = `
      <img src="rank/${rankImage.name}.${rankImage.ext}">
      <span>${p.name}</span>
    `;

        container.appendChild(div);
    });
}

function updateScore(data) {
    const gameDisplay = document.getElementById('gameDisplay');
    const boDisplay = document.getElementById('boDisplay');
    const matchDisplay = document.getElementById('matchDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');

    if (gameDisplay) gameDisplay.textContent = (data.game || 'valorant').toUpperCase();
    if (boDisplay) boDisplay.textContent = `BO${data.bestOf}`;
    if (matchDisplay) matchDisplay.textContent = `Match ${data.currentMatch + 1}/${data.bestOf}`;
    if (scoreDisplay) scoreDisplay.textContent = `${data.roundA} - ${data.roundB}`;
    updateMatchHistory(data);
}

function updateMatchHistory(data) {
    const historyDiv = document.getElementById('matchHistory');
    if (!historyDiv || !data.matches) return;

    let html = '';
    for (let i = 0; i < data.bestOf; i++) {
        const matchScore = data.matches[i];
        let matchLabel = '';
        if (matchScore && typeof matchScore === 'object' && matchScore.scoreA !== undefined) {
            matchLabel = `${matchScore.scoreA}-${matchScore.scoreB}`;
        } else if (i === data.currentMatch) {
            matchLabel = '●';
        } else {
            matchLabel = '○';
        }

        html += `<span class="match-item${i === data.currentMatch ? ' current' : ''}">${matchLabel}</span>`;
    }

    historyDiv.innerHTML = html;
}

let ws;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(protocol + '//' + window.location.host);

    ws.onopen = () => {
        console.log('Connected to server');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'init' || message.type === 'update') {
            const data = message.data;
            updateTeam("teamA", data.teamA || [], data.game || 'valorant');
            updateTeam("teamB", data.teamB || [], data.game || 'valorant');
            updateScore(data);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('Disconnected, reconnecting...');
        setTimeout(connectWebSocket, 3000);
    };
}

connectWebSocket();