# Team Manager - Valorant & League of Legends

A web tool for managing Valorant and League of Legends teams with drag-and-drop interface and real-time OBS overlay.

## Features

- 🎮 **Game Selection**: Switch between Valorant and League of Legends
- 📋 **Admin Interface**: Manage players and their ranks
- 🎯 **Drag-and-Drop**: Easily move players between teams
- ⚖️ **Auto Balance**: Automatically balance teams based on ranks
- 📊 **OBS Overlay**: Live display with rank logos and match history
- 🏆 **Match Tracking**: Track BO1, BO3, BO5 series with scores
- 💾 **Persistence**: Real-time data sync via WebSocket
- 📂 **Import**: Load data from `data.json`
- 🔄 **Live Updates**: Overlay updates instantly across all sources

## Project Structure

```
ranks/
├── server.js          # Express + WebSocket server
├── admin.html         # Admin control panel
├── admin.js           # Admin logic
├── overlay.html       # OBS overlay display
├── overlay.js         # Overlay logic
├── style.css          # Styles
├── data.json          # Data storage
├── package.json       # Dependencies
└── rank/              # Rank logos
    ├── *.png          # Valorant ranks
    └── lol_*.webp     # League of Legends ranks
```

## Installation

### Requirements
- Node.js (v14+)
- npm

### Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open in browser:
   - Admin: http://localhost:3000/admin.html
   - Overlay: http://localhost:3000/overlay.html

## Usage

### Game Selection

Select the game at the top of the admin panel:
- **Valorant**: Full 5-player team matches (rounds to 13)
- **League of Legends**: Simple Best-of series

The rank list updates automatically and logos change accordingly.

### Admin Panel

- **Change Names**: Click player name to edit
- **Change Rank**: Select from dropdown (changes based on game)
- **Move Players**: Drag-and-drop between teams
- **Best Of**: Select BO1, BO3, or BO5
- **Score Control**: Use +Team A / +Team B to increment scores
- **Reset**: Clear all scores and restart series
- **Save**: Final save to persist data
- **Balance**: Auto-distribute 10 players across teams

### Scoring

**Valorant:**
- Rounds to 13 with 2-point lead minimum
- Overtime at 12-12 (first to +2 wins)
- Rounds reset between matches in series

**League of Legends:**
- Simple wins per match in series
- Click +Team once for a match win

### OBS Setup

1. Add a **Browser** source in OBS
2. URL: `http://localhost:3000/overlay.html`
3. Resolution: 1920x1080
4. The overlay displays:
   - Game name (VALORANT / LEAGUE OF LEGENDS)
   - Best of info (BO1, BO3, BO5)
   - Current match number
   - Team names and ranks (5 players each)
   - Round/match scores
   - Match history with scores

## Data Format

```json
{
  "game": "valorant",
  "teamA": [
    { "name": "Player1", "rank": "platinum1" },
    { "name": "Player2", "rank": "gold2" }
  ],
  "teamB": [],
  "bestOf": 3,
  "matches": [
    { "scoreA": 13, "scoreB": 11 },
    { "scoreA": 10, "scoreB": 13 },
    0
  ],
  "currentMatch": 2,
  "roundA": 0,
  "roundB": 0
}
```

## Supported Ranks

### Valorant
- unranked
- iron1-3, bronze1-3, silver1-3, gold1-3
- platinum1-3, diamond1-3, ascendant1-3
- immortal1-3, radiant

### League of Legends
- unranked
- iron4-1, bronze4-1, silver4-1, gold4-1
- platinum4-1, emerald4-1, diamond4-1
- master, grandmaster, challenger

## Technologies

- **Backend**: Node.js, Express, WebSocket
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Storage**: JSON file
- **Real-time**: WebSocket for live updates

## License

NeyZnn
