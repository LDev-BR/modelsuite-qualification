# Task Pipeline
A full-stack task management system for talent onboarding workflows. Built with the MERN stack.

> **📢 For Candidates:** This repo is used for assessment. See [CONTRIBUTING.md](./CONTRIBUTING.md) for submission instructions.

---

##  Maintainers & Core Team

**Pranav Garg**
- **Role:** Project Maintainer / Admin
- **GitHub:** [@Pranav140](https://github.com/Pranav140)

**Vansh Rastogi**
- **Role:** Project Maintainer / Admin
- **GitHub:** [@vanshrastogi111](https://github.com/vanshrastogi111)

> This project is actively maintained. Please refer to the [CODEOWNERS](#codeowners) section for code review policies.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 + custom CSS |
| **Routing & UX** | React Router 7 + Sonner toast notifications |
| **Backend** | Node.js + Express 4 |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **File Uploads** | Multer |

---

##  Project Structure

```
modelsuite-qualification/
├── client/                  # React (Vite) frontend
│   └── src/
│       ├── api/             # Axios API helper modules
│       ├── components/
│       │   ├── admin/       # Admin-specific UI components
│       │   └── talent/      # Talent-specific UI components
│       ├── context/         # Auth, theme, and toast providers
│       └── pages/
│           ├── admin/       # Admin dashboard pages
│           └── talent/      # Talent dashboard pages
└── server/                  # Express backend
    ├── config/              # MongoDB connection
    ├── controllers/         # Route handler logic
    ├── middleware/          # JWT auth + file upload middleware
    ├── models/              # Mongoose schemas
    ├── routes/              # Express route definitions
    ├── scripts/             # Database seed script
    └── uploads/             # Local file storage for submissions
```

---

##  Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MongoDB** running locally on port 27017, **or** a MongoDB Atlas connection string
- **npm** (comes with Node.js)
- **Git**

---

##  Setup

### 1. Fork and Clone the repository

First, fork this repository to your own GitHub account by clicking the "Fork" button at the top right of the repository page. Then clone your fork:

```bash
git clone https://github.com/<your-username>/modelsuite-qualification.git
cd modelsuite-qualification
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/task-pipeline
JWT_SECRET=your-random-secret-string-here
PORT=5000
```

> Use a long random string for `JWT_SECRET`. You can generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Install backend dependencies

```bash
# You should be in the /server directory
npm install
```

### 4. Seed the database

This creates 1 Admin user, 2 Talent users, and 5 sample tasks.

```bash
npm run seed
```

**Seed credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@taskpipeline.com` | `admin123` |
| Talent | `alice@taskpipeline.com` | `talent123` |
| Talent | `bob@taskpipeline.com` | `talent123` |

### 5. Install frontend dependencies

```bash
cd ../client
npm install
```

---

##  Running the Application

You need **two terminals open simultaneously**.

**Terminal 1 — Start the backend server**
```bash
cd server
npm run dev
```
The API will be available at `http://localhost:5000`

**Terminal 2 — Start the frontend**
```bash
cd client
npm run dev
```
The app will open at `http://localhost:5173`

---

##  User Roles & Flows

### Admin
- Log in at `/login`
- **Dashboard** (`/admin/dashboard`) — view task stats, onboarding guidance, and operational summaries
- **Tasks** (`/admin/tasks`) — create, edit, delete, reward, and assign tasks to talents
- **Talents** (`/admin/talents`) — review talent readiness, workload, and profile details
- **Submissions** (`/admin/submissions`) — review talent submissions, approve or reject

### Talent
- Log in at `/login` or register at `/register`
- **Dashboard** (`/talent/dashboard`) — review active work, profile progress, and suggested next actions
- **Profile wizard** — complete headline, availability, skills, interests, and work style during onboarding
- **Tasks** (`/talent/tasks`) — browse the available task marketplace and manage assigned work
- Claim open tasks, then submit assigned tasks by uploading a file and adding notes
- Track submitted, approved, and rejected work with task status and reward context

Both roles can use the theme toggle to switch between light and dark mode. API feedback is shown with toast notifications instead of native browser alerts.

---

##  API Reference

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT token |
| PUT | `/api/auth/profile` | Talent-only profile onboarding update |

### Admin — Tasks

| Method | Route | Description |
|---|---|---|
| GET | `/api/tasks` | List all tasks (with populated assignedTo) |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Admin — Users

| Method | Route | Description |
|---|---|---|
| GET | `/api/users/talents` | List all Talent-role users |

### Talent — Tasks

| Method | Route | Description |
|---|---|---|
| GET | `/api/talent/tasks/available` | Get all Open tasks |
| GET | `/api/talent/tasks/mine` | Get tasks assigned to the logged-in talent |
| PUT | `/api/talent/tasks/:id/claim` | Claim an open task |

### Submissions

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/submissions/:taskId` | Talent | Submit an assigned task with optional file |
| GET | `/api/submissions/:taskId` | Auth | Admins can read any task submission; talents can read only their own submission |
| GET | `/api/submissions/admin/all` | Admin | Get all submissions |
| PUT | `/api/submissions/:id/review` | Admin | Set reviewStatus to Approved or Rejected |

---

##  Available Scripts

### Server (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (auto-reloads on change) |
| `npm start` | Start server with node (no auto-reload) |
| `npm run seed` | Seed the database with sample data |
| `npm run lint` | Run ESLint with zero warnings allowed |

### Client (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

### Focused tests

Some focused regression tests use Node's built-in test runner:

```bash
node --test client/src/utils/*.test.js
node --test server/controllers/submissionController.test.js server/utils/*.test.js
```

---

##  Troubleshooting

**"MongooseError: connect ECONNREFUSED"**
→ MongoDB is not running. Start it with `mongod` or use a MongoDB Atlas URI in `MONGO_URI`.

**"JsonWebTokenError: invalid signature"**
→ `JWT_SECRET` in your `.env` doesn't match the one used to sign existing tokens. Re-run `npm run seed` or clear localStorage in your browser.

**Port already in use**
→ Change `PORT` in `server/.env`. The Vite dev server port can be changed in `client/vite.config.js`.

**Upload files not saving**
→ The `server/uploads/` directory must be writable. The directory is tracked with `.gitkeep`, but uploaded files are ignored by Git.

---

## Contribution and Qualification

Welcome! If you are participating in a qualification assessment or contributing to this repository, you must follow our structured process for branching, local checks, and Pull Requests.

Please read the full guidelines in **[CONTRIBUTING.md](./CONTRIBUTING.md)** before starting your work. This file covers:
- Exact Branch Naming & PR Title rules
- Pre-flight local checks (linting/building)
- PR Template requirements
- Our automated CI/CD Pipeline (which automatically closes failing PRs)
- Final submission requirements (PR link, UI screenshots for visual changes, and Voice recorded video)
---

##  CODEOWNERS

All pull requests must be reviewed and approved by the core maintainers:
- **@Pranav140** (Pranav Garg)
- **@vanshrastogi111** (Vansh Rastogi)

---
