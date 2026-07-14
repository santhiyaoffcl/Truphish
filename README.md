
<div align="center">
  <h1>🛡️ TruPhish</h1>
  <p><strong>Advanced AI-Powered Phishing Domain Detection System</strong></p>
  <p>🚀 <strong><a href="https://truphish.vercel.app/" target="_blank">Live Demo</a></strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>
</div>

<hr />

## 🌟 Overview

**TruPhish** is a modern, full-stack application designed to proactively detect, analyze, and prevent users from falling victim to malicious phishing URLs. By combining a blazing-fast React frontend, a robust Express.js backend, and a dedicated Python machine learning classification service, TruPhish delivers real-time risk assessment for any given domain.

## ✨ Key Features

- **🔍 Real-Time URL Scanning**: Instantaneously evaluates URLs against a trained machine learning model.
- **📊 Comprehensive Risk Meter**: Visualize the threat level of domains through an intuitive, color-coded dashboard.
- **🔒 Secure Authentication**: Robust JWT-based user session handling and password encryption.
- **⚡ Microservices Architecture**: Decoupled Python ML engine (`FastAPI`) and Node core API for optimal scalability.
- **💅 Premium UI/UX**: Built with React and Recharts, offering responsive, interactive analytic visualizations.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** powered by **Vite** for lightning-fast compilation.
- **Recharts** for rich data visualization.
- **Lucide React** for crisp, scalable iconography.
- **React Router** for seamless navigation.

### Backend (Core API)
- **Node.js & Express.js** for handling business logic and routing.
- **MongoDB** as the database (via **Mongoose**).
- **JSON Web Tokens (JWT) & bcryptjs** for secure auth and user management.

### Machine Learning Service
- **Python / FastAPI** serving predictions and advanced URL analytics at high throughput.
- **Uvicorn** ASGI server.

---

## 📂 Project Structure

```text
TruPhish/
├── backend/          # Node/Express API (Auth, DB connectors, Route Handlers)
├── frontend/         # React Application (Views, Components, Dashboard)
├── ml-service/       # Python FastAPI Service (URL analysis & ML Inference)
└── run_all.ps1       # One-click startup script for Windows users
```
---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (3.10 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 🛠️ One-Click Installation (Windows)

We provide a synchronized PowerShell script that sets up virtual environments, installs dependencies, and boots all three servers simultaneously!

1. Clone the repository:
   ```bash
   git clone https://github.com/santhiyaoffcl/TruPhish.git
   cd TruPhish
   ```

2. Run the master startup script:
   ```powershell
   .\run_all.ps1
   ```

*(The script will open three separate terminals running the ML Service on port 8000, Node API on port 5000, and Vite Frontend).*

### 📦 Manual Setup

If you prefer to start services manually or are on Mac/Linux:

**1. ML Service**
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

**2. Backend API**
```bash
cd backend
npm install
npm run dev
```

**3. Frontend Dev Server**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Security & Privacy
TruPhish securely hashes all user credentials via `bcryptjs`. We do not log scanned URLs to persistent public databases, ensuring corporate privacy is maintained while investigating potential threats.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/santhiyaoffcl/TruPhish/issues).

## 📝 License
This project is licensed under the **ISC License**.
