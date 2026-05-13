# Multi-Tenant Feature Flag Management System

A SaaS-style feature flag management system with role-based access control and three separate frontend applications.

## Overview

This system allows:
- A **Super Admin** to create and manage organizations
- **Organization Admins** to manage feature flags for their organization
- **End Users** to check whether specific features are enabled for their organization

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | Custom JWT (no third-party auth) |
| Frontend | React + Vite |

---

## System Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Super Admin App    │     │    Admin App         │     │    User App         │
│  localhost:3001     │     │  localhost:3002      │     │  localhost:3003     │
└────────┬────────────┘     └────────┬─────────────┘     └────────┬────────────┘
         │                           │                             │
         └───────────────────────────┴─────────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Express Backend    │
                          │   localhost:4000     │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │     PostgreSQL       │
                          │  feature_flags_db    │
                          └─────────────────────┘
```

---

## System Roles

### 1. Super Admin
- Uses static credentials from environment variables
- Can login, create organizations and view list of all organizations

### 2. Organization Admin
- Belongs to one organization
- Can signup, login and manage feature flags for their organization (create, enable/disable, delete)

### 3. End User
- No account needed
- Can check whether a specific feature is enabled for their organization

---

## Database Schema

```
organizations
├── id
├── name
├── slug
└── created_at

app_users
├── id
├── email
├── password (hashed with bcrypt)
├── role (org_admin | end_user)
├── org_id → organizations.id
└── created_at

FeatureFlag
├── id
├── org_id → organizations.id
├── feature_key
├── is_enabled
├── created_at
└── updated_at
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/super-admin/login` | None | Super admin login |
| GET | `/api/super-admin/organizations` | Super Admin JWT | List all organizations |
| POST | `/api/super-admin/organizations` | Super Admin JWT | Create organization |
| POST | `/api/auth/signup` | None | Org admin signup |
| POST | `/api/auth/login` | None | Org admin login |
| GET | `/api/flags` | Org Admin JWT | List flags for org |
| POST | `/api/flags` | Org Admin JWT | Create flag |
| PATCH | `/api/flags/:id` | Org Admin JWT | Toggle flag |
| DELETE | `/api/flags/:id` | Org Admin JWT | Delete flag |
| GET | `/api/flags/check?org_id=X&feature_key=Y` | None | Check flag status |

---

## Project Structure

```
flag_management_system/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.js        # PostgreSQL connection pool
│   │   │   └── init.js        # Database schema initialization
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT authentication + role authorization
│   │   ├── routes/
│   │   │   ├── superAdmin.js  # Super admin routes
│   │   │   ├── auth.js        # Signup/login routes
│   │   │   └── flags.js       # Feature flag CRUD routes
│   │   └── index.js           # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend-super-admin/      # Super Admin portal (port 3001)
│   └── src/
│       ├── api/index.js
│       ├── pages/
│       │   ├── Login.jsx
│       │   └── Dashboard.jsx
│       └── App.jsx
│
├── frontend-admin/            # Org Admin portal (port 3002)
│   └── src/
│       ├── api/index.js
│       ├── pages/
│       │   ├── Auth.jsx
│       │   └── Dashboard.jsx
│       └── App.jsx
│
└── frontend-user/             # End User portal (port 3003)
    └── src/
        ├── api/index.js
        └── App.jsx
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/flag_management_system.git
cd flag_management_system
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env        # Fill in your DB credentials
npm install
npm run db:init             # Creates all tables
npm run dev                 # Starts on http://localhost:4000
```

### 3. Frontend Setup

Open three separate terminals:

```bash
# Terminal 2 - Super Admin
cd frontend-super-admin
npm install
npm run dev                 # http://localhost:3001

# Terminal 3 - Admin
cd frontend-admin
npm install
npm run dev                 # http://localhost:3002

# Terminal 4 - User
cd frontend-user
npm install
npm run dev                 # http://localhost:3003
```

---

## End-to-End Usage

### Step 1 — Super Admin creates an organization
1. Open `http://localhost:3001`
2. Login with credentials from `.env`
3. Create an organization e.g. `Acme Corp`
4. Note the **ID** and **Slug** from the table

### Step 2 — Org Admin signs up
1. Open `http://localhost:3002`
2. Click **Sign Up**
3. Enter email, password and the org **slug** from Step 1
4. Start creating feature flags e.g. `dark_mode`

### Step 3 — End User checks a flag
1. Open `http://localhost:3003`
2. Enter the org **ID** from Step 1
3. Enter the feature key e.g. `dark_mode`
4. Click **Check Feature** to see if it's enabled or disabled

---

## Key Design Decisions

**Why is Super Admin not stored in the database?**
Super admin credentials live in `.env` only. This avoids the chicken-and-egg problem of who creates the first admin, and keeps the most privileged account out of the users table entirely.

**Why is role a column on the users table (not a separate table)?**
Roles are fixed (`org_admin`, `end_user`) and won't change dynamically. A separate roles table adds complexity with no benefit here.

**Why is org_id pulled from the JWT (not the request body)?**
Security. If we trusted org_id from the request body, a malicious admin could read or write another org's flags. The JWT is signed by the server so its payload is tamper-proof.

**Why is the `/flags/check` endpoint public (no auth)?**
End users don't have accounts. This mirrors how real feature flag SDKs work — the client sends an org and feature context and gets a boolean back without needing to authenticate.

**Why raw SQL instead of an ORM?**
Using raw `pg` queries means every database operation is explicit and easy to explain. ORMs like Sequelize hide the SQL which makes debugging harder.
