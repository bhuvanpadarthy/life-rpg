# ⚔️ LIFE RPG - Turn Your Real Life Into A Game

> A Cyberpunk Gamified Productivity Platform converting daily activities into RPG quests, attributes, streaks, shop gear, and level ascensions.

---

## 📌 Project Overview

Traditional productivity applications (to-do lists, kanban boards, calendar blocks) fail because they lack **immediate visual feedback, emotional reward loop, and tangible progression**. Tasks feel like chores, leading to procrastination and abandonment.

**LIFE RPG** solves the procrastination problem by transforming real-life activities into an immersive Role-Playing Game (RPG). Users create real-world quests (e.g. *Coding 2 hours*, *5km Gym Run*, *Reading 30 mins*), complete them, earn XP & Gold, build 6 core character attributes (Intelligence, Strength, Knowledge, Stamina, Discipline, Social), level up through a non-linear XP progression engine, purchase cybernetic equipment in the shop, maintain daily activity streaks, and unlock achievements.

---

## 🚀 Key Features

1. **Cyberpunk Visual System**:
   - Immersive dark theme (`#090a0f`) with glowing cyan (`#00f3ff`), hot pink (`#ff007f`), neon purple (`#7000ff`), and cyber gold (`#ffaa00`) accents.
   - Glassmorphism cards, scanline animations, micro-interactions, level-up confetti celebrations, and floating reward toasts.
2. **Non-Linear RPG Progression Engine**:
   - Mathematical formula:
     $$\text{XP\_REQUIRED}(level) = \lfloor 100 \times level^{1.5} \rfloor$$
   - Prevents linear grinding; higher levels require progressively higher effort.
   - Backend-validated multi-level ascension logic.
3. **6 Core Character Attributes**:
   - **Intelligence** (INT) 🧠 ← Coding quests
   - **Knowledge** (KNO) 📖 ← Studying quests
   - **Strength** (STR) 🏋️ ← Gym quests
   - **Stamina** (STA) 🏃 ← Running quests
   - **Discipline** (DIS) 🧭 ← Meditation quests
   - **Social** (SOC) 👥 ← Communication quests
4. **Daily Activity Streak System**:
   - Tracks consecutive activity days with 🔥 **Current Streak** and 🏆 **Best Streak**.
   - Handles same-day multiple completion guards and missed-day streak reset calculations.
5. **Virtual Currency & Shop Economy**:
   - Completing quests awards 🪙 **Cyber Gold**.
   - Cyberpunk shop featuring Weapons, Armor, Avatar Frames, Profile Themes, and Badges with rarity ratings (Common, Rare, Epic, Legendary).
   - Inventory manager allowing one-click item equipping and stat bonus activations.
6. **Automatic Achievement Badges**:
   - Triggers unlockable badges automatically based on backend checks (First Quest, 7-day streak, Level 5 Vanguard, Code Master, Cyber Shopper).
7. **Production Security & Persistence**:
   - User registration and login with **bcrypt** password hashing (10 rounds).
   - **JWT Bearer Token** session security.
   - User isolation: strict row-level ownership validation on all API routes.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, JWT (`jsonwebtoken`), `bcryptjs`, `zod`.
- **Database**: PostgreSQL (`pg` pool) with automatic embedded SQLite fallback for zero-dependency local dev execution.
- **Deployment**: Vercel (Frontend), Render / Railway (Backend & PostgreSQL).

---

## 📁 Project Structure

```
data/
├── client/                     # Cyberpunk React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Mobile Menu
│   │   │   ├── dashboard/      # Hero Header, Today's Quests, Attribute Breakdown
│   │   │   ├── quests/         # Quests Hub, Create/Edit Modals, Filters
│   │   │   ├── character/      # Avatar Card, 6 Stats, Equipment Grid, XP Matrix
│   │   │   ├── shop/           # Shop Catalog, Inventory Manager
│   │   │   ├── achievements/   # Badge Showcase
│   │   │   └── common/         # LevelUpModal, ToastNotifications
│   │   ├── context/            # AuthContext, GameContext
│   │   ├── services/           # Axios API Interceptor
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css           # Cyberpunk Design Tokens & Glow Utilities
│   └── index.html
├── server/                     # Node.js Express REST API
│   ├── src/
│   │   ├── controllers/        # Auth, Quest, Shop, Character, Achievement Controllers
│   │   ├── database/           # db.ts (Pg Pool & SQLite fallback), schema.sql, seed.sql
│   │   ├── middleware/         # authMiddleware (JWT verification)
│   │   ├── routes/             # API Router (/api/auth, /api/quests, /api/shop...)
│   │   ├── services/           # progressionService (XP formula, Streaks, Achievements)
│   │   └── index.ts            # Server Entry Point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── render.yaml                 # Render Production Deployment Blueprint
├── vercel.json                 # Vercel Production Deployment Routing
└── .env.example
```

---

## 🛢️ Database Schema DDL

The database includes standard relational PostgreSQL tables with foreign key constraints:

```sql
-- Users Table
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  gold INT DEFAULT 100,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_activity_date VARCHAR(10),
  title VARCHAR(100) DEFAULT 'Novice Cyberpunk'
);

-- Quests Table
CREATE TABLE quests (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  xp_reward INT NOT NULL,
  gold_reward INT NOT NULL,
  attribute_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Attributes, Items, User Inventory, Achievements, User Achievements, Quest Completions...
```

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Install Dependencies
```bash
cd data
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=cyberpunk_life_rpg_super_secret_jwt_key_2026
DATABASE_URL=
CLIENT_URL=http://localhost:3000
```
*(Note: If `DATABASE_URL` is left empty, LIFE RPG automatically initializes the embedded local database engine so you can evaluate the complete app out-of-the-box!)*

### 3. Run Development Server
```bash
npm run dev
```
- Frontend starts at: `http://localhost:3000`
- Backend API starts at: `http://localhost:5000`

---

## 🧪 Testing & Verification

1. **User Registration**:
   - Register a new account (e.g. `CyberTitan`).
   - Check password hash encryption in DB.
2. **Quest CRUD & Completion**:
   - Create a `Coding` quest with `Hard` difficulty.
   - Click **Complete**.
   - Verify immediate floating notifications (+200 XP, +90 Gold, +8 Intelligence).
3. **Level Up Celebration**:
   - Complete additional quests until XP reaches $\text{XP\_REQUIRED}(1) = 100$.
   - Confirm Level Up modal triggers with light beams, confetti, and rank upgrade.
4. **Shop & Inventory**:
   - Go to Shop. Purchase *Cyber Katana* for 🪙 150 Gold.
   - Confirm gold balance deduction.
   - Go to Inventory tab and click **EQUIP**.
5. **Persistence Test**:
   - Refresh the page (`Ctrl + F5`).
   - Log out and log back in.
   - Confirm Level, XP, Gold, Streaks, Attributes, and Inventory remain 100% intact.

---

## 🌐 Production Deployment

- **Frontend (Vercel)**:
  Connect repository to Vercel. Set build command `npm run build:client` and output directory `dist`.
- **Backend (Render / Railway)**:
  Connect repository using `render.yaml`. Set environment variables `DATABASE_URL` (PostgreSQL instance) and `JWT_SECRET`.

---

## 🎥 Demo Video Guide (90–180 Seconds)

1. **0:00 - 0:20**: Introduction & Cyberpunk UI overview ("Turn your real life into an RPG").
2. **0:20 - 0:45**: User Signup/Login & Dashboard stats overview (Streak, Gold, Attributes).
3. **0:45 - 1:15**: Creating a quest & completing it -> XP/Gold floating triggers + Attribute increase.
4. **1:15 - 1:40**: Level-up celebration modal with confetti blast & Character page stat breakdown.
5. **1:40 - 2:15**: Cyberpunk Shop item purchase & Inventory equipping.
6. **2:15 - 2:30**: Page refresh & logout/login demonstrating PostgreSQL database persistence.

---

## 📜 License
MIT License - Built for Life RPG Productivity Platform.
