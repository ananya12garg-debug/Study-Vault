
// StudyVault Backend - Own Backend, No Firebase
// Logic: Frontend (App) -> fetch() -> This Server -> JSON File -> Other Phone
// Run: npm install && node server.js
// Deploy Free: render.com -> New Web Service -> Upload this folder

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors()); // Allow any frontend (Netlify) to call
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// ---------- Simple File Database ----------
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return { rooms: {} };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) { return { rooms: {} }; }
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
function getRoom(db, room) {
  if (!db.rooms[room]) db.rooms[room] = { messages: {}, presence: {}, typing: {} };
  return db.rooms[room];
}

// ---------- Health ----------
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'StudyVault Backend is Live', time: new Date().toISOString() });
});

// ---------- Messages ----------
// GET /rooms/us143/messages -> all messages sorted by time
app.get('/rooms/:room/messages', (req, res) => {
  const db = loadDB();
  const room = getRoom(db, req.params.room);
  const list = Object.entries(room.messages).map(([id, m]) => ({ id, ...m })).sort((a,b)=>a.ts-b.ts);
  res.json(list);
});

// POST /rooms/us143/messages {text, sender, deviceId} -> creates message with status 'sent'
app.post('/rooms/:room/messages', (req, res) => {
  const db = loadDB();
  const room = getRoom(db, req.params.room);
  const { text, sender, deviceId } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  const msg = { text, sender: sender || 'me', deviceId: deviceId || 'unknown', ts: Date.now(), status: 'sent' };
  room.messages[id] = msg;
  saveDB(db);
  res.json({ id, ...msg });
});

// PATCH /rooms/us143/messages/:id {status} -> update to 'delivered' or 'read'
app.patch('/rooms/:room/messages/:id', (req, res) => {
  const db = loadDB();
  const room = getRoom(db, req.params.room);
  const msg = room.messages[req.params.id];
  if (!msg) return res.status(404).json({ error: 'not found' });
  if (req.body.status) msg.status = req.body.status;
  saveDB(db);
  res.json({ id: req.params.id, ...msg });
});

// ---------- Presence ----------
// POST /rooms/us143/presence {deviceId, inChat, online} -> update presence
// GET /rooms/us143/presence -> list presence
app.post('/rooms/:room/presence', (req, res) => {
  const db = loadDB();
  const room = getRoom(db, req.params.room);
  const { deviceId, inChat, online } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
  room.presence[deviceId] = { deviceId, inChat: !!inChat, online: online !== false, lastSeen: Date.now() };
  saveDB(db);
  res.json(room.presence[deviceId]);
});
app.get('/rooms/:room/presence', (req, res) => {
  const db = loadDB();
  const room = getRoom(db, req.params.room);
  res.json(Object.values(room.presence));
});

// ---------- Typing ----------
// POST /rooms/us143/typing {deviceId, typing}
app.post('/rooms/:room/typing', (req, res) => {
  const db = loadDB();
  const room = getRoom(db, req.params.room);
  const { deviceId, typing } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
  room.typing[deviceId] = { deviceId, typing: !!typing, ts: Date.now() };
  saveDB(db);
  res.json(room.typing[deviceId]);
});
app.get('/rooms/:room/typing', (req, res) => {
  const db = loadDB();
  const room = getRoom(db, req.params.room);
  res.json(Object.values(room.typing).filter(t => Date.now() - t.ts < 5000 && t.typing));
});

app.listen(PORT, () => console.log(`StudyVault Backend running on port ${PORT}`));
