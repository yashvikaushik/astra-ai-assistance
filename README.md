# 🌌 ASTRA — AI Virtual Assistant

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

> An elegant, celestial-themed AI companion and virtual assistant built on the modern **MERN** stack (MongoDB, Express 5, React 19, Node.js) styled with Tailwind CSS v4. Astra features secure authentication, customizable persona archetypes, voice recognition input, and a dark cosmic glassmorphism user experience.

---

## ✨ Features

- **🔐 Robust Authentication & Session Management**:
  - Secure registration and sign-in with `bcryptjs` password hashing.
  - Stateless JSON Web Tokens (JWT) stored in tamper-proof `httpOnly`, `SameSite: strict` cookies.
  - Client session hydration on page reload via `/api/auth/me`.
  - Smart routing guards directing unauthenticated users to `/signin` and first-time users to persona setup.

- **🎭 Customizable AI Personas**:
  - **4 Fixed Celestial Presets**:
    - **Astra Nova** — *The Primary Cosmic Intelligence*
    - **Elara** — *The Starlight Whisperer*
    - **Orion** — *The Celestial Strategist*
    - **Auron** — *The Solar Guardian*
  - **2×2 Responsive Grid**: High-resolution rounded-rectangle avatar cards (190–220px desktop) with live selection preview and ambient golden aura highlights.
  - **Custom Avatar Upload**: Upload any custom companion portrait (handled via Multer & uploaded directly to Cloudinary) with custom naming and real-time form validation.

- **🎙️ Celestial Home Dashboard**:
  - Ambient glowing assistant orb with celestial breathing animations.
  - Live Web Speech API voice-to-text recognition with visual active listening feedback.
  - Quick-prompt starter pills for instantaneous productivity inquiries.
  - Seamless navigation between the main assistant space and the persona customizer.

- **🌌 Modern Cosmic Aesthetic**:
  - Custom celestial background graphics with deep obsidian purple surfaces (`#0B0813`, `#17111F/80`).
  - Heavenly gold typography and button accents (`#D4AF72`, `#E8C98A`).
  - Fully responsive across mobile, tablet, and desktop (`min-h-dvh` safe viewport scaling).

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **HTTP Client**: [Axios](https://axios-http.com/) (configured with `withCredentials: true`)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Feather & Material sets)
- **Audio / Speech**: HTML5 Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (native ES Modules `"type": "module"`)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: `jsonwebtoken` (JWT) + `bcryptjs` + `cookie-parser`
- **File Upload & Storage**: [Multer](https://github.com/expressjs/multer) (disk staging) + [Cloudinary SDK v2](https://cloudinary.com/)
- **CORS**: `cors` with explicit client origin and credentials support

---

## 📁 Project Directory Structure

```text
astra-ai-assistance/
├── .gitignore                   # Git exclusion rules (node_modules, .env, build, temp)
├── NOTES.md                     # Deep architectural specifications, flowcharts & logs
├── README.md                    # Project documentation
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js        # Cloudinary SDK init & temp file upload handler
│   │   ├── db.js                # MongoDB Atlas connection lifecycle
│   │   └── token.js             # JWT generation utility (7-day validity)
│   ├── controllers/
│   │   ├── auth.controller.js   # Signup, login, logout, and getMe handlers
│   │   └── user.controller.js   # Profile retrieval & assistant persona updates
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT cookie verification & user hydration
│   │   └── multer.middleware.js # Multi-part file handling (staged in public/temp)
│   ├── models/
│   │   └── user.model.js        # Mongoose User schema (credentials & assistant info)
│   ├── routes/
│   │   ├── auth.routes.js       # /api/auth endpoints
│   │   └── user.routes.js       # /api/user endpoints
│   ├── .env                     # Server environment secrets (not committed)
│   ├── index.js                 # Express bootstrap, CORS, cookie parser & router mounts
│   └── package.json             # Backend dependencies & dev scripts
│
└── frontend/
    ├── src/
    │   ├── assets/              # Celestial backgrounds & 4 agent avatar presets
    │   ├── context/
    │   │   └── UserContext.jsx  # Global session state (UserDataContext & UserContextProvider)
    │   ├── pages/
    │   │   ├── Customize.jsx    # 2×2 avatar grid, custom upload card, preview & sync
    │   │   ├── Home.jsx         # Celestial dashboard, speech recognition & quick prompts
    │   │   ├── signIn.jsx       # Login view with validation & error banners
    │   │   └── signUp.jsx       # Registration view with auto-login
    │   ├── App.jsx              # Protected route architecture & onboarding flow
    │   ├── index.css            # Tailwind CSS v4 root stylesheet
    │   └── main.jsx             # React DOM root mounting UserContextProvider
    ├── package.json             # Frontend dependencies & Vite scripts
    └── vite.config.js           # Vite configuration with Tailwind CSS plugin
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn** / **pnpm**
- A **MongoDB Atlas** database cluster (or local MongoDB instance)
- A **Cloudinary** account (for media storage)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/astra-ai-assistance.git
cd astra-ai-assistance
```

---

### 2. Configure Backend Environment

Navigate into the `backend` directory and create a `.env` file:

```bash
cd backend
touch .env
```

Populate `backend/.env` with your configuration:

```env
PORT=5002
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/astra?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Install backend dependencies:

```bash
npm install
```

Start the backend server in development mode:

```bash
npm run dev
```
> The API will boot on `http://localhost:5002`.

---

### 3. Configure & Start Frontend

In a separate terminal tab, navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

> Vite will start the frontend development server on `http://localhost:5173`.

Open your browser to `http://localhost:5173` to explore Astra!

---

## 📡 API Reference

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/signup` | No | Registers a new user, hashes password, sets auth cookie, returns user document. |
| `POST` | `/api/auth/signin` | No | Verifies credentials, issues JWT cookie, returns user document. |
| `GET` | `/api/auth/logout` | Yes | Clears the `token` authentication cookie. |
| `GET` | `/api/auth/me` | Yes | Verifies JWT cookie and hydrates the active session. |

### User & Persona Routes (`/api/user`)

| Method | Endpoint | Auth Required | Payload | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/user/currentuser` | Yes | None | Returns the full profile of the authenticated user including assistant details. |
| `POST` | `/api/user/update-assistant` | Yes | `multipart/form-data`<br/>• `assistantName` (string)<br/>• `assistantImage` (file / string) | Updates the user's assistant persona. Automatically uploads new images to Cloudinary. |

---

## 🛡️ Security Highlights

1. **HTTP-Only Cookies**: JWT tokens are transmitted exclusively inside `httpOnly`, `sameSite: "strict"` cookies, shielding them from client-side script inspection (mitigating XSS token theft).
2. **Explicit CORS Handshake**: `backend/index.js` explicitly defines `origin: "http://localhost:5173"` with `credentials: true`, rejecting wildcard CORS queries while permitting authenticated cross-origin requests.
3. **Bcrypt Salt Rounds**: All user passwords are encrypted using 10 salt rounds prior to database persistence.
4. **Resilient Temp Cleanup**: Multer temporarily caches uploads to `public/temp/`. Whether Cloudinary succeeds or encounters an error, local files are safely unlinked via `fs.unlinkSync` to avoid disk exhaustion.
5. **State Sanitation**: The browser global `window.name` collision is guarded against by destructuring form states explicitly, guaranteeing zero payload corruption.

---

## 📖 In-Depth Technical Documentation

For complete sequence diagrams, flowcharts, architectural design patterns, React 19 / Tailwind v4 gotchas, and ongoing engineering changelogs, please refer to:
👉 **[NOTES.md](./NOTES.md)**

---

## 📜 License

This project is licensed under the ISC License.
