
# StudyVault Backend - Own Backend (No Firebase)

## Logic
Frontend (App) -> fetch() -> This Server -> db.json file -> Other Phone
- POST /rooms/us143/messages = Send
- GET /rooms/us143/messages = Fetch all, sorted by time
- PATCH /rooms/us143/messages/:id {status: 'delivered'/'read'} = Ticks
- POST /rooms/us143/presence = Online / In Chat
- POST /rooms/us143/typing = typing...

## How to Run Locally
1. npm install
2. node server.js
3. Open http://localhost:3000/ -> should show {"ok":true}

## How to Make it Global (Free)
1. Go to render.com -> Sign up with Gmail -> New Web Service
2. Upload this folder (server.js, package.json, db.json) OR connect GitHub
3. Build Command: npm install
4. Start Command: npm start
5. Render will give URL like https://studyvault-backend-xyz.onrender.com
6. Copy that URL -> Paste it in App's Maker Setup (5-tap logo) -> SAVE CODE & GO LIVE
7. Done - Both phones will use same backend URL, same room us143

## Frontend Connection
Frontend does: fetch(BACKEND_URL + '/rooms/us143/messages')
No Firebase config needed. No API key needed.
Backend URL is hidden in code, user sees only clean app.
