const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json({ teamA: [], teamB: [] });
    }
});

app.post('/api/data', (req, res) => {
    try {
        const data = req.body;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });

        broadcastData(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

function broadcastData(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', data }));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        ws.send(JSON.stringify({ type: 'init', data: JSON.parse(data) }));
    } catch (error) {
        ws.send(JSON.stringify({ type: 'init', data: { teamA: [], teamB: [] } }));
    }

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
