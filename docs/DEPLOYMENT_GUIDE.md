# Production & Cloud Deployment Guide
## MahaSetu: Maharashtra Unified Interoperability Framework (PS 26129)

This document provides step-by-step instructions and architectural recommendations for deploying the **MahaSetu (MUIF)** interoperability middleware across popular cloud providers and hosting environments.


---

## 🏗️ Architecture Overview

The system consists of three decoupled components:
1. **Frontend**: Vite + React 19 Single Page Application (Static Web Client)
2. **Backend**: Node.js + Express + Sequelize ORM (RESTful API Server)
3. **AI Service**: Python FastAPI + scikit-learn / Hugging Face / Qwen LLM integration (AI Inference Microservice)

> **Resilience Note**: The backend features an automatic deterministic fallback engine. If the Python AI service is not running or unreachable, the Node.js backend seamlessly handles domain categorization, severity scoring, and stakeholder matching with zero downtime.

---

## 🚀 Recommended Deployment Options

### Option A: Modern Free/Low-Cost Cloud PaaS (Fastest & Simplest)

| Component | Recommended Platform | Plan / Tier | Key Setting / Command |
|---|---|---|---|
| **Frontend** | **Vercel** or **Cloudflare Pages** | Free Tier | Build: `npm run build`, Output: `dist`, Env: `VITE_API_URL` |
| **Backend** | **Render** or **Railway** | Free / Starter | Root: `server`, Build: `npm install`, Start: `npm start` |
| **AI Service** | **Railway** or **Render** or **Hugging Face Spaces** | Free / Starter | Root: `ai-service`, Start: `uvicorn app:app --host 0.0.0.0 --port $PORT` |
| **Database** | **Railway MySQL** or **Aiven MySQL** (or SQLite with persistent volume) | Free / Starter | Set `DB_DIALECT=mysql` or use SQLite |

---

### Option B: Unified Single VPS with Docker Compose (Most Cost-Effective for Full Ownership)

Deploy the entire stack (Frontend, Backend, AI Service, and SQLite/MySQL) on a single $4-6/month cloud VPS (DigitalOcean Droplet, Hetzner, Linode, AWS EC2, or Oracle Cloud Free Tier).

---

## 📋 Step-by-Step Deployment Instructions

### 1. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

#### Deploying on Vercel:
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository `SIH_43`.
4. Configure the project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   ```env
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```
6. Click **Deploy**. Vercel will assign a production URL (e.g., `https://sih-43-frontend.vercel.app`).

#### Single-Page App (SPA) Routing Note:
If using static hosts like Netlify or Vercel, ensure rewrite rules route all paths to `/index.html`:
- For Vercel, add a `vercel.json` in `frontend/`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

### 2. Backend Server Deployment (Render / Railway)

#### Deploying on Render:
1. Sign in to [Render](https://render.com) and click **"New Web Service"**.
2. Connect your GitHub repository `SIH_43`.
3. Fill in the configuration:
   - **Name**: `sih-43-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set the **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your_super_secret_jwt_random_key_here
   DB_DIALECT=sqlite
   AI_SERVICE_URL=https://your-ai-service.onrender.com
   ```
5. *(Optional for persistence)*: Under **Disks**, attach a persistent disk mounted at `/var/data` and point `DB_STORAGE=/var/data/database.sqlite` if running SQLite across server restarts.
6. Click **Create Web Service**.

---

### 3. AI Microservice Deployment (Render / Railway / Hugging Face Spaces)

#### Deploying on Render:
1. Click **"New Web Service"** in Render.
2. Connect your GitHub repository `SIH_43`.
3. Configuration:
   - **Name**: `sih-43-ai-service`
   - **Root Directory**: `ai-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Copy the service URL and paste it into the backend's `AI_SERVICE_URL` environment variable.

---

### 4. Database Setup (Production MySQL vs SQLite)

For zero-configuration demos, **SQLite** runs out-of-the-box with pre-seeded data in `server/database.sqlite`.

For high-concurrency production deployments:
1. Create a MySQL database (e.g. on Railway, Aiven, or AWS RDS).
2. Set the following environment variables on the backend:
   ```env
   DB_DIALECT=mysql
   DB_HOST=your-db-host.com
   DB_PORT=3306
   DB_NAME=sih_portal
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   ```
3. Run the demo seeder on the server once:
   ```bash
   node seedDemoData.js
   ```

---

## 🔒 Security Best Practices for Production

1. **Change Default Secrets**:
   - Replace `JWT_SECRET` with a cryptographically secure random string:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
2. **CORS Configuration**:
   - In `server/server.js`, configure CORS to restrict requests to your production frontend domain:
     ```javascript
     app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
     ```
3. **HTTPS / SSL**:
   - All recommended platforms (Vercel, Render, Railway, Cloudflare) provide automatic free SSL certificates.

---

## 📊 Summary of Environments & Variables

| Variable | Description | Example (Development) | Example (Production) |
|---|---|---|---|
| `VITE_API_URL` | Frontend API Target | `http://localhost:5000/api` | `https://api.yourdomain.com/api` |
| `PORT` | Backend HTTP Port | `5000` | Assigned by host (`10000`) |
| `DB_DIALECT` | Database Engine | `sqlite` | `sqlite` or `mysql` |
| `JWT_SECRET` | Token Signing Secret | `sih_secret_key_jharkhand_2026` | High-entropy random hash |
| `AI_SERVICE_URL` | AI Microservice Base URL | `http://localhost:8000` | `https://ai.yourdomain.com` |
