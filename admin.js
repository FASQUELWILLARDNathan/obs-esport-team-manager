let data = {
    game: 'valorant',
    teamA: [],
    teamB: [],
    bestOf: 1,
    matches: [],
    currentMatch: 0,
    roundA: 0,
    roundB: 0
};

const valorantRanks = [
    "unranked",
    "iron1", "iron2", "iron3",
    "bronze1", "bronze2", "bronze3",
    "silver1", "silver2", "silver3",
    "gold1", "gold2", "gold3",
    "platinum1", "platinum2", "platinum3",
    "diamond1", "diamond2", "diamond3",
    "ascendant1", "ascendant2", "ascendant3",
    "immortal1", "immortal2", "immortal3",
    "radiant"
];

const lolRanks = [
    "unranked",
    "iron4", "iron3", "iron2", "iron1",
    "bronze4", "bronze3", "bronze2", "bronze1",
    "silver4", "silver3", "silver2", "silver1",
    "gold4", "gold3", "gold2", "gold1",
    "platinum4", "platinum3", "platinum2", "platinum1",
    "emerald4", "emerald3", "emerald2", "emerald1",
    "diamond4", "diamond3", "diamond2", "diamond1",
    "master",
    "grandmaster",
    "challenger"
];

const ranks = valorantRanks;

for (let i = 0; i < 5; i++) {
    data.teamA.push({ name: "Player", rank: "unranked" });
    data.teamB.push({ name: "Player", rank: "unranked" });
}

function getGameRanks() {
    return data.game === 'lol' ? lolRanks : valorantRanks;
}

function setGame(game) {
    data.game = game;
    document.getElementById('valorantBtn').style.opacity = game === 'valorant' ? '1' : '0.5';
    document.getElementById('lolBtn').style.opacity = game === 'lol' ? '1' : '0.5';
    render();
    save();
}

function render() {
    const currentRanks = getGameRanks();

    ["teamA", "teamB"].forEach(team => {
        const container = document.getElementById(team);
        container.innerHTML = "";

        data[team].forEach((p, index) => {
            const div = document.createElement("div");
            div.className = "player";
            div.draggable = true;

            div.innerHTML = `
        <input value="${p.name}" onchange="updateName('${team}', ${index}, this.value)">
        <select onchange="updateRank('${team}', ${index}, this.value)">
          ${currentRanks.map(r => `
            <option value="${r}" ${p.rank === r ? "selected" : ""}>
                ${r.replace(/([a-z]+)(\d?)/, (_, rank, div) =>
                div ? rank.toUpperCase() + " " + div : rank.toUpperCase()
            )}
            </option>
            `).join("")}
        </select>
      `;

            div.addEventListener("dragstart", e => {
                e.dataTransfer.setData("text/plain", JSON.stringify({ team, index }));
            });

            container.appendChild(div);
        });

        container.addEventListener("dragover", e => e.preventDefault());

        container.addEventListener("drop", e => {
            const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
            const targetTeam = team;

            const player = data[dragged.team][dragged.index];

            data[dragged.team].splice(dragged.index, 1);

            data[targetTeam].push(player);

            render();
        });
    });
}

function updateName(team, index, value) {
    data[team][index].name = value;
}

function updateRank(team, index, value) {
    data[team][index].rank = normalizeRank(value);
}

function save() {
    fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .catch(err => console.error('Save error:', err));
}

function setBestOf(value) {
    data.bestOf = value;
    data.matches = new Array(value).fill(0);
    data.currentMatch = 0;
    data.roundA = 0;
    data.roundB = 0;
    document.getElementById('bo1').style.opacity = value === 1 ? '1' : '0.5';
    document.getElementById('bo3').style.opacity = value === 3 ? '1' : '0.5';
    document.getElementById('bo5').style.opacity = value === 5 ? '1' : '0.5';
    updateScore();
    save();
}

function getMatchWinner(matchScore) {
    if (!matchScore) return 0;
    if (matchScore.scoreA > matchScore.scoreB) return 1;
    if (matchScore.scoreB > matchScore.scoreA) return -1;
    return 0;
}

function isMatchWon() {
    if (data.game === 'lol') {
        return data.roundA > 0 ? 1 : (data.roundB > 0 ? -1 : 0);
    } else {
        if (data.roundA >= 13 && data.roundA - data.roundB >= 2) return 1;
        if (data.roundB >= 13 && data.roundB - data.roundA >= 2) return -1;
        return 0;
    }
}

function addScore(team) {
    if (data.matches[data.currentMatch] && typeof data.matches[data.currentMatch] === 'object') {
        return;
    }

    if (team === 'teamA') data.roundA++;
    else data.roundB++;

    const winner = isMatchWon();
    if (winner !== 0) {
        data.matches[data.currentMatch] = { scoreA: data.roundA, scoreB: data.roundB };
        const winsA = data.matches.filter(m => getMatchWinner(m) === 1).length;
        const winsB = data.matches.filter(m => getMatchWinner(m) === -1).length;
        const winsNeeded = Math.ceil(data.bestOf / 2);

        if (winsA < winsNeeded && winsB < winsNeeded && data.currentMatch < data.bestOf - 1) {
            data.currentMatch++;
            data.roundA = 0;
            data.roundB = 0;
        }
    }
    updateScore();
    save();
}

function resetScore() {
    data.matches = new Array(data.bestOf).fill(0);
    data.currentMatch = 0;
    data.roundA = 0;
    data.roundB = 0;
    updateScore();
    save();
}

function updateScore() {
    const display = document.getElementById('scoreDisplay');
    if (display) {
        display.textContent = `Match ${data.currentMatch + 1}/${data.bestOf} | ${data.roundA} - ${data.roundB}`;
    }
}

function normalizeRank(rank) {
    if (rank === 'unranked' || rank === 'radiant') {
        return rank;
    }
    if (/\d$/.test(rank)) {
        return rank;
    }
    return rank + "1";
}

function importData() {
    fetch('/api/data')
        .then(response => response.json())
        .then(importedData => {
            if (importedData.teamA && importedData.teamB) {
                data.teamA = importedData.teamA.map(p => ({
                    ...p,
                    rank: normalizeRank(p.rank)
                }));
                data.teamB = importedData.teamB.map(p => ({
                    ...p,
                    rank: normalizeRank(p.rank)
                }));
                render();
                alert('✅ Data imported successfully!');
                save();
            } else {
                alert('❌ Invalid file format');
            }
        })
        .catch(error => {
            console.error('Error loading data:', error);
            alert('❌ Import error');
        });
}

window.addEventListener('DOMContentLoaded', () => {
    fetch('/api/data')
        .then(res => res.json())
        .then(loadedData => {
            if (loadedData.teamA && loadedData.teamB) {
                data.teamA = loadedData.teamA.map(p => ({
                    ...p,
                    rank: normalizeRank(p.rank)
                }));
                data.teamB = loadedData.teamB.map(p => ({
                    ...p,
                    rank: normalizeRank(p.rank)
                }));
                data.bestOf = loadedData.bestOf || 1;
                data.matches = loadedData.matches || [];
                data.currentMatch = loadedData.currentMatch || 0;
                data.roundA = loadedData.roundA || 0;
                data.roundB = loadedData.roundB || 0;
                data.game = loadedData.game || 'valorant';
            }
            render();
            updateScore();
            setBestOf(data.bestOf);
            setGame(data.game);
        })
        .catch(err => {
            console.error('Load error:', err);
            render();
            updateScore();
        });
});

function rankToValue(rank) {
    const order = [
        "unranked", "iron", "bronze", "silver", "gold",
        "platinum", "diamond", "ascendant", "immortal", "radiant"
    ];

    let match = rank.match(/([a-z]+)(\d?)/);
    let base = order.indexOf(match[1]) * 3;
    let division = match[2] ? parseInt(match[2]) : 4;

    return base + division;
}

function balanceTeams() {
    let players = [...data.teamA, ...data.teamB];

    if (players.length !== 10) {
        alert("Exactly 10 players required!");
        return;
    }

    players.sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));

    let teamA = [];
    let teamB = [];

    let scoreA = 0;
    let scoreB = 0;

    players.forEach(p => {
        if (teamA.length >= 5) {
            teamB.push(p);
            scoreB += rankToValue(p.rank);
        } else if (teamB.length >= 5) {
            teamA.push(p);
            scoreA += rankToValue(p.rank);
        }
        else if (scoreA <= scoreB) {
            teamA.push(p);
            scoreA += rankToValue(p.rank);
        } else {
            teamB.push(p);
            scoreB += rankToValue(p.rank);
        }
    });

    data.teamA = teamA;
    data.teamB = teamB;

    render();
    save();
}