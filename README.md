### Important
#  AbsenCerdas - Digital Attendance Management System

## Project Architecture

```
ABSENSI-APP/
├── backend/
│   ├── config/
│   │   └── cloudinary.js         ← Cloudinary connect and configuration
│   │   └── db.js                 ← MongoDB Atlas Cloud connection configuration
│   ├── models/
│   │   ├── User.js               ← User data schema (Student, Homeroom Teacher, Officer, Admin + Password Hashing)
│   │   ├── Absensi.js            ← Attendance data schema (Status, Timestamp, Photo/Document verification, etc.)
│   │   ├── LaporanKasus.js       ← Case reporting data schema for student disciplinary tracking
│   │   └── Settings.js           ← Global application parameters (Configurable Attendance Time Limits)
│   ├── routes/
│   │   ├── auth.js               ← API routing for login, token generation, and authentication sessions (/api/auth)
│   │   ├── absensi.js            ← API routing for attendance management and data tracking (/api/absensi)
│   │   ├── laporan.js            ← API routing for case file management and reporting (/api/laporan)
│   │   ├── user.js               ← API routing for User Account CRUD management (/api/user)
│   │   └── settings.js           ← API routing for global system configurations (/api/settings)
│   ├── middleware/
│   │   └── auth.js               ← JSON Web Token (JWT) verification & Role-Based Access Control (RBAC) middleware
│   ├── .env                      ← Environment variables container (MONGO_URI, JWT_SECRET, CLOUDINARY_CREDENTIALS)
│   ├── package.json              ← Backend project manifest and dependencies declaration (Express, Mongoose, Multer, Cloudinary)
│   └── server.js                 ← Application entry point (Primary Express server configuration and API route registry)
│
├── frontend/
│   ├── public/
│   │   └── assets/               ← Static public assets, CN VIDEOS RAHHHHHHHHH
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx     ← User authentication form interface and handler
│   │   │   └── dashboard/
│   │   │       ├── Dashboard.jsx ← Dynamic dashboard wrapper utilizing conditional rendering based on user roles
│   │   │       ├── Sidebar.jsx   ← Role-Based dynamic navigation layout
│   │   │       └── panels/
│   │   │           ├── AdminPanel.jsx   ← Administrative workspace for Account Management & Global Attendance Settings
│   │   │           ├── WalasPanel.jsx   ← Homeroom Teacher interface featuring attendance summaries & XLSX data export
│   │   │           ├── PetugasPanel.jsx ← Officer interface for monitoring and escalating disciplinary case records
│   │   │           └── MuridPanel.jsx   ← Student terminal supporting Webcam capture, document uploads, & automated lockout enforcement (obviously just handle the absent form)
│   │   ├── App.jsx               ← Client-side client routing architecture (React Router DOM)
│   │   ├── main.jsx              ← React application initialization and DOM rendering entry point
│   │   ├── index.css             ← Global application cascading stylesheets
│   │   └── .env                  ← Frontend client environment variables (VITE_API_URL)
│   ├── package.json              ← Frontend project manifest and dependencies declaration (React, Axios, Chart.js, XLSX)
│   ├── vite.config.js            ← Vite bundler compilation settings
│   └── index.html                ← Single Page Application (SPA) container
│
├── .gitignore                    ← Version control exclusion mapping for node_modules and sensitive local .env files
└── README.md                     ← Deployment, system configuration guidelines, and technical documentation

```

## System Deployment

### 1. Database Initialization (MongoDB)

```bash
# Ubuntu / Debian Environment
sudo systemctl start mongod

# macOS Environment (Homebrew)
brew services start mongodb-community

# Windows Environment: Execute MongoDB Compass or run the mongod.exe binary manually.

```

### 2. Backend Architecture Setup

```bash
cd backend
npm install

# Initialize the server instance in a local development environment
npm run dev        # Default binding: Port 5000

```

### 3. Frontend Architecture Setup

```bash
cd frontend
npm install

# Launch the client application instance
npm run dev        # Default binding: Port 3000

```

## Access Credentials Matrix

| Role | Name | Identifier (Username/NIK) | Access Code (Password) |
| --- | --- | --- | --- |
| Student | Asep | `444444444` | `123456` |

## Core Competencies & Core Features

* **Granular RBAC Architecture:** Dedicated functional views mapped directly to Admin, Security/Officer, Homeroom Teacher, and Student permissions.
* **Biometric Photo Verification:** Integration with local hardware imaging peripherals for image capture upon attendance marking.
* **Digital Document Upload Management:** Native handling of verification documents for automated absence validation processing.
* **Cross-Departmental Case Escalation:** Fluid workflow pipeline to report and log student updates between institutional roles.
* **Data Analytics Engine:** Native statistical aggregation and chart visualizations tracking historical attendance frequencies.
