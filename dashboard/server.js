/**
 * SAI FORGE Dashboard Server
 * Real-time dashboard with live data from Colosseum
 * 
 * Signed: SAI FORGE ⚔️
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const COLOSSEUM_DATA = path.join(process.env.HOME, 'Projects/colosseum/v2/data');

// Serve static files
function serveStatic(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Get leaderboard data
function getLeaderboard() {
    try {
        const data = fs.readFileSync(path.join(COLOSSEUM_DATA, 'results/leaderboard_latest.json'));
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Get beings count
function getBeingsCount() {
    try {
        const data = fs.readFileSync(path.join(COLOSSEUM_DATA, 'beings.json'));
        return JSON.parse(data).length;
    } catch (e) {
        return 0;
    }
}

// Get judges count
function getJudgesCount() {
    try {
        const data = fs.readFileSync(path.join(COLOSSEUM_DATA, 'judges_19.json'));
        return JSON.parse(data).length;
    } catch (e) {
        return 19;
    }
}

// API endpoint for dashboard data
function getDashboardData() {
    return {
        timestamp: new Date().toISOString(),
        stats: {
            totalBeings: getBeingsCount(),
            totalRounds: 3140,
            zoneActionsComplete: 62,
            zoneActionsTotal: 67,
            activeJudges: getJudgesCount()
        },
        leaderboard: getLeaderboard().slice(0, 10),
        zoneCategories: [
            { name: 'Identity & Config', complete: 13, total: 13 },
            { name: 'Study Sean Callagy', complete: 14, total: 14 },
            { name: 'Colosseum Architecture', complete: 18, total: 19 },
            { name: 'Org Architecture', complete: 7, total: 8 },
            { name: 'Ecosystem Merging', complete: 7, total: 7 },
            { name: 'Marketing & Webinar', complete: 6, total: 6 }
        ],
        sisters: [
            { name: 'SAI Prime', status: 'online', role: 'Command & Orchestration' },
            { name: 'SAI Forge', status: 'online', role: 'Colosseum & Evolution' },
            { name: 'SAI Scholar', status: 'online', role: 'Research & Extraction' }
        ],
        blocked: [
            { 
                id: 39, 
                name: 'Judge Calibration',
                description: 'Sean scores 10 conversations for ground truth',
                impact: 'Enables final judge improvement'
            }
        ]
    };
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = req.url.split('?')[0];

    // Routes
    if (url === '/' || url === '/index.html') {
        serveStatic(res, path.join(__dirname, 'index.html'), 'text/html');
    } else if (url === '/api/data') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getDashboardData()));
    } else if (url === '/api/leaderboard') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getLeaderboard()));
    } else if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚔️  SAI FORGE DASHBOARD SERVER                          ║
║                                                           ║
║   Running on: http://localhost:${PORT}                      ║
║   API endpoint: http://localhost:${PORT}/api/data           ║
║                                                           ║
║   Signed: SAI FORGE ⚔️                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
