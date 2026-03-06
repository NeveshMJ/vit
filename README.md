# GRIEVEX — AI-Powered Civic Grievance Management Platform

> Raise your concern. We handle the rest.

**GRIEVEX** is a full-stack, AI-integrated civic grievance platform built for Tamil Nadu citizens to report, track, and resolve public service issues — developed across three competitive hackathon rounds with progressive feature additions at each stage.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend (Vercel) | https://vit-chi.vercel.app |

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Citizen / User** | prajinkumar2020@gmail.com | Prajin@123 |
| **Admin / Management** | admin@tnsmp.gov.in | admin@tnsmp2026 |

> Credentials are pre-filled on the login page — one click to access.

---

## Table of Contents

1. [Round 1 — Initial System Development](#round-1--initial-system-development)
2. [Round 2 — Smart Management & Analytics](#round-2--smart-management--analytics)
3. [Round 3 — Infrastructure Capacity & Monitoring](#round-3--infrastructure-capacity--monitoring)
4. [Additional Improvements](#additional-improvements-round-1--round-2-enhancements)
5. [Tech Stack](#tech-stack)
6. [Roles & Access Control](#roles--access-control)
7. [Architecture](#architecture)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Installation](#installation)
11. [Environment Variables](#environment-variables)
12. [Project Structure](#project-structure)

---

## Round 1 — Initial System Development

> **Goal:** Build the core platform with fundamental complaint management capabilities.

### 1.1 Vision ML Model

Developed an ML-based vision system that analyses complaint photos to automatically identify the type of civic issue.

**How it works:**
- When a citizen uploads or captures a photo, it is sent to the **Google Cloud Vision API**.
- The API returns detected labels and objects from the image (e.g. "pothole", "flooded road", "broken wire").
- These labels are matched against a weighted keyword dictionary mapped to **10 government departments** (Water Resources, Electricity, Roads & Highways, Sanitation, Public Health, Education, Transport, Revenue, Agriculture, General).
- The department with the highest keyword-match score is auto-selected for the complaint.

**Files:** `backend/utils/vision.js`

---

### 1.2 Service Boards Entry by Admin

Built an admin panel for registering and managing service departments and their associated service providers.

**How it works:**
- Management-role users can create provider accounts through the **Manage Providers** panel.
- Each provider is assigned to a specific department.
- Providers can be viewed, created, or deleted from the admin interface.
- All provider accounts are protected with JWT role-based authentication.

**Files:** `frontend/src/pages/management/ManageProviders.js`, `backend/routes/management.js`

---

### 1.3 Maps Integration

Integrated an interactive map to visualise the geographic distribution of all reported complaints across Tamil Nadu.

**How it works:**
- When a citizen raises a complaint, the app captures **live GPS coordinates** via `navigator.geolocation.watchPosition` in high-accuracy mode.
- Coordinates are sent to the **Google Maps Geocoding API** for reverse geocoding into human-readable district/area names.
- On the Complaint Map page, all public complaints are rendered as map markers with popup info showing department, status, priority, and description.
- Citizens and administrators can filter complaints by department, area, or status directly on the map.

**Files:** `frontend/src/pages/user/ComplaintMap.js`

---

### 1.4 Email Notification System

Implemented automatic email alerts at key stages of the complaint lifecycle using Nodemailer.

**How it works:**
- When a new user registers, a **4-digit OTP** is sent to their registered email address for verification.
- Email templates use a professionally styled HTML layout with the GRIEVEX blue-gradient branding.
- OTP emails include: the code in a highlighted box, expiry timer, and a warning notice.
- Future hooks planned for status-update notifications (Accepted, Completed, Rejected).

**Files:** `backend/utils/mailer.js`, `backend/routes/auth.js`

---

### 1.5 Complaint Logging System

Built the core complaint submission pipeline allowing citizens to file civic complaints.

**How it works:**
- Citizens access the **Raise Complaint** page from their dashboard.
- They capture a live photo using the **react-webcam** in-browser camera.
- The form collects: photo, description, department (AI-suggested or manual), area (GPS-detected or manual), and optional additional details.
- The submitted complaint is stored in MongoDB with a unique ticket ID (format: `GRX-2026-XXXXX`).
- Full complaint status history is maintained: `Registered → Accepted → Working On → Completed / Rejected`.

**Files:** `frontend/src/pages/user/RaiseComplaint.js`, `backend/routes/complaints.js`, `backend/models/Complaint.js`

---

## Round 2 — Smart Management & Analytics

> **Goal:** Layer intelligence, analytics, and management control over the core system.

### 2.1 Smart Complaint Categorisation

Enhanced the AI pipeline with LLM-based classification to achieve a higher accuracy and richer classification output.

**How it works:**
- The complaint description is sent to the **DeepSeek Chat v3 model via OpenRouter API**.
- The LLM returns a structured JSON response containing:
  - **Department** — most appropriate government department
  - **Priority** — Critical / High / Medium / Low with justification
  - **Duplicate flag** — whether a similar complaint already exists in the same area
  - **Fake flag** — whether the complaint appears to be spam or nonsense
- If the LLM call fails (quota, network), the system falls back to the **offline keyword NLP engine** so submissions are never blocked.
- Vision API and LLM results are combined; Vision output takes precedence for image-clear complaints.

**Files:** `backend/utils/gemini.js`, `backend/utils/vision.js`

---

### 2.2 Disaster Module Integration

Integrated real-time weather intelligence to correlate disaster conditions with incoming complaint surges.

**How it works:**
- Citizens access the **Weather Report** page from their dashboard.
- The app requests GPS location to auto-detect the user's district.
- Weather data is fetched from the **Open-Meteo API** (free, no API key) using WMO weather codes mapped to descriptive conditions.
- Data displayed: Temperature, Wind Speed, Humidity, Precipitation, UV Index, Weather Condition with emoji.
- All **37 Tamil Nadu districts** are supported with precise lat/lng coordinates for weather fetching.
- Administrators can correlate weather alerts (floods, storms, heatwaves) with complaint spikes in specific departments and districts.

**Files:** `frontend/src/pages/user/WeatherReport.js`

---

### 2.3 Data Analytics Dashboard

Built a comprehensive analytics dashboard providing state-level statistical insights.

**How it works:**
- The Management Dashboard calls `/api/management/dashboard` which runs MongoDB aggregation pipelines.
- KPI cards display: Total Complaints, Resolved, Pending, Critical priority count.
- Department-wise performance breakdown shows which civic sectors have the most unresolved issues.
- District/area filter enables region-specific analysis.
- All data refreshes live without page reload.
- Citizens on the User Dashboard see personal complaint stats (Registered, In Progress, Completed).

**Files:** `frontend/src/pages/management/ManagementDashboard.js`, `backend/routes/management.js`

---

### 2.4 Admin Intelligence Control Panel

Built a unified control panel giving administrators full visibility and control over the entire platform.

**What it provides:**

| Panel | Capability |
|---|---|
| KPI Overview | System-wide complaint counts, resolution rates |
| Complaint Table | Full complaint list with filters by status, department, area, priority |
| Assignment Engine | Assign any complaint to any service provider with one click |
| Provider Panel | View and manage all provider accounts and workloads |
| AI Remarks | View AI-generated analysis and reasoning for each complaint |
| Status Override | Admins can override complaint status at any stage |

- All management routes are role-gated: only `management`-role JWT tokens can access them; mismatches return **403 Forbidden**.

**Files:** `frontend/src/pages/management/ManagementDashboard.js`, `frontend/src/pages/management/ManagementComplaints.js`, `backend/routes/management.js`

---

### 2.5 Smart Task Allocation Engine

Built an AI-powered priority queue system that automatically routes complaints to the correct department and orders them by urgency.

**End-to-end pipeline:**

```
Citizen submits complaint (photo + description + GPS)
         │
         ▼
┌─────────────────────────────────┐
│  Google Cloud Vision API        │
│  Analyses photo → detects       │
│  labels, objects, text in image │
│  → maps to department keywords  │
└──────────────┬──────────────────┘
               │  (combined with / fallback)
               ▼
┌─────────────────────────────────┐
│  DeepSeek LLM via OpenRouter    │
│  Reads description + photo data │
│  → Outputs: department, priority│
│  → Detects duplicate / fake     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Priority Assignment            │
│  🔴 Critical / 🟠 High          │
│  🟡 Medium  / 🟢 Low            │
│  Based on: severity, location,  │
│  disaster conditions, LLM score │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Admin assigns to Provider      │
│  Provider sees sorted queue     │
│  Critical complaints → top      │
└─────────────────────────────────┘
```

**Files:** `backend/utils/gemini.js`, `backend/utils/vision.js`, `backend/routes/complaints.js`

---

## Round 3 — Infrastructure Capacity & Monitoring System

> **Goal:** Extend the platform with infrastructure monitoring, zone-level management, and enhanced detection systems.

### 3.1 Two New Data Sources Integration

Integrated additional external data feeds to enrich the complaint context and improve infrastructure monitoring accuracy.

**Data sources added:**
- **Open-Meteo Weather API** — Real-time weather data for all 37 Tamil Nadu districts, used to correlate environmental conditions with infrastructure stress.
- **Google Maps Geocoding API** — Reverse geocoding of GPS coordinates to human-readable Tamil Nadu district and area names, enabling precise zone-level tracking.

Both sources feed into the complaint pipeline to automatically tag each complaint with verified location data and current weather conditions at the time of submission.

---

### 3.2 Enhanced UI/UX Interface

Overhauled the entire front-end design system for a professional, accessible, and responsive experience.

**Changes made:**
- Implemented a **CSS custom properties design system** in `App.css` with a full blue-gradient palette (replacing the legacy orange theme).
  - Primary: `#1e3a8a` → `#2563eb`
  - Secondary: `#0ea5e9` → `#38bdf8`
  - Background: `#020617 → #0f172a → #1e3a8a → #1d4ed8` gradients
- Added **Inter** typeface for clean, readable typography.
- Rebuilt the Landing Page with animated hero section, GRIEVEX branding, stat pills, and clear CTAs.
- Redesigned auth pages (Login, Signup, Verify OTP) with a card-based layout, step indicators, and smooth transitions.
- Fully **responsive** across desktop, tablet, and mobile via CSS Grid and Flexbox breakpoints.
- Role-aware **Sidebar** navigation with smooth collapse/expand and branded GX emblem.
- OTP input uses individual character boxes with auto-advance focus for intuitive entry.

**Files:** `frontend/src/App.css`, `frontend/src/pages/LandingPage.js`, `frontend/src/pages/Login.js`, `frontend/src/pages/Signup.js`, `frontend/src/pages/VerifyOTP.js`, `frontend/src/components/Sidebar.js`

---

### 3.3 Urgency Detection System

Implemented a multi-signal urgency detection system that identifies critical civic issues requiring immediate government response.

**How it works:**
- The LLM (DeepSeek via OpenRouter) evaluates each complaint's description and photo-analysis output against urgency indicators: threat to human life, infrastructure failure, disaster conditions, scale of impact.
- Priority levels assigned: **Critical → High → Medium → Low**.
- Critical complaints appear at the top of provider queues automatically.
- Administrators can manually escalate complaint priority from the control panel at any stage.
- Weather data from Open-Meteo is cross-referenced: a flood alert in the area elevates Water Resources complaints to Critical automatically.

**Files:** `backend/utils/gemini.js`, `backend/routes/complaints.js`

---

### 3.4 Area-Wise Monitoring

Infrastructure usage and civic complaints are now tracked and visualised at the district/zone level.

**How it works:**
- Every complaint is tagged with a Tamil Nadu district/area (GPS-detected via Geocoding API, or user-selected from a dropdown of all 37 districts).
- The Management Dashboard aggregates complaint counts by area, enabling region-specific views.
- The Complaint Map clusters markers geographically, allowing administrators to identify high-complaint hotspot zones at a glance.
- Area filtering is available on the All Complaints view, provider dashboards, and map view.

**Files:** `frontend/src/pages/user/ComplaintMap.js`, `frontend/src/pages/management/ManagementDashboard.js`

---

### 3.5 Zone Data Management

Infrastructure data is categorised and managed by zones to enable structured governance and delegation.

**How it works:**
- The 37 Tamil Nadu districts are treated as discrete zones in the data model.
- Complaints inherit zone tags that persist through the full complaint lifecycle.
- Providers are assigned to departments, and complaints within their department are automatically visible on their dashboard regardless of zone — but zone filters allow them to focus on specific districts.
- Management can generate zone-wise reports and identify which districts have chronic infrastructure problems vs. one-off incidents.

---

## Additional Improvements (Round 1 → Round 2 Enhancements)

### Live Accessing Features

Real-time monitoring of complaints and infrastructure usage was enabled across all dashboards.

- All complaint lists auto-reflect the latest database state on load.
- KPI cards on Management and User dashboards show live counts.
- Complaint status timelines update in real time as providers take action.

---

### Department Collaboration System

Built coordination capabilities between different service departments.

- Management can assign a complaint to any provider regardless of their primary department.
- Providers can add resolution notes when closing complaints, creating a transparent record of inter-department actions.
- The Amazon-style **status timeline** (`Registered → Accepted → Working On → Completed / Rejected`) records which user updated each stage, with timestamps — enabling full audit trails for cross-department work.

**Files:** `backend/routes/complaints.js`, `backend/routes/provider.js`

---

### Vision ML Model Enhancement

Improved accuracy and resilience of the image analysis pipeline.

- Added a comprehensive **offline keyword NLP fallback** for all 10 departments so the system always produces a department classification even when Google Cloud Vision is unavailable or returns low-confidence results.
- Vision and LLM outputs are now weighted and combined rather than treated independently, improving department selection accuracy.
- "Fake complaint" detection added: the LLM analyses photo labels + description for inconsistency or nonsense content before the complaint is saved.

**Files:** `backend/utils/vision.js`, `backend/utils/gemini.js`

---

### UI Enhancement

- Replaced all inline colour values (`#1a237e`, `#3949ab`, `#5c6bc0`, all orange values) with CSS custom property references across every page component.
- Added `.auth-steps` progress indicator on the Signup page (Register → Verify Email → Sign In).
- OTP card (`otp-card`) given distinct styling with centred layout and oversized digit inputs.
- Sidebar GX emblem updated to blue gradient with matching glow shadow.
- Email OTP template redesigned with a blue professional header, bold OTP display box, and security warning banner.

---

### Deepfake Detection Module

Integrated AI-powered detection of manipulated or fabricated media in complaint images.

- The DeepSeek LLM analyses the Vision API label output and complaint description together.
- If labels returned by Vision API are inconsistent with the described issue in a way that suggests image manipulation (e.g. a stock photo submitted as a local complaint), the complaint is flagged with `isFake: true`.
- Flagged complaints are visible to management with an AI-generated explanation of why the complaint was flagged.
- Flagged complaints are not shown in the public feed but are retained for admin review.

**Files:** `backend/utils/gemini.js`, `backend/models/Complaint.js`

---

### Automated Location Detection

Location detection is fully automated — no manual address entry required.

- `navigator.geolocation.watchPosition` continuously tracks user GPS while the Raise Complaint form is open.
- Coordinates at the moment of photo capture are sent to the **Google Maps Geocoding API**.
- The API response auto-fills district and address fields in the form.
- If GPS is unavailable or permission denied, a manual district dropdown (all 37 Tamil Nadu districts with lat/lng) is shown as fallback.
- The detected location is stored with the complaint for map rendering and zone analytics.

**Files:** `frontend/src/pages/user/RaiseComplaint.js`, `backend/routes/complaints.js`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Create React App), React Router DOM, Axios |
| Styling | Custom CSS Design System (`App.css`) — blue theme, CSS variables |
| Camera | react-webcam (in-browser live capture) |
| Weather | Open-Meteo API (free, no key required) |
| Geocoding | Google Maps Geocoding API |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose (indexed collections) |
| Authentication | JWT (`jsonwebtoken`) + bcryptjs |
| Email | Nodemailer + Gmail SMTP (OTP + notifications) |
| AI Vision | Google Cloud Vision API |
| AI Text / LLM | OpenRouter API — DeepSeek Chat v3 |
| Deployment | Vercel (Frontend) |

---

## Roles & Access Control

| Role | Access |
|---|---|
| `user` | Register complaints, track status, interactive map, weather report, rate resolved complaints |
| `provider` | View assigned complaints, update status (Accepted → Working On → Completed/Rejected), add resolution notes |
| `management` | Full admin panel, system analytics, complaint assignment engine, provider account management, AI remarks, status override |

All routes are protected with JWT middleware. Role mismatches return **403 Forbidden**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   GRIEVEX Frontend (React)                  │
│  LandingPage → Login / Signup → OTP Verify                  │
│  ├── User:       Dashboard, RaiseComplaint, MyComplaints,   │
│  │               ComplaintMap, WeatherReport                │
│  ├── Provider:   ProviderDashboard                         │
│  └── Management: Dashboard, Complaints, ManageProviders     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (Axios + JWT)
┌──────────────────────────▼──────────────────────────────────┐
│                   Express.js Backend                        │
│  /api/auth        → Register, Login, OTP Verify/Resend     │
│  /api/complaints  → Submit, fetch, rate, status update      │
│  /api/provider    → Provider-scoped complaint management    │
│  /api/management  → Admin dashboard, assignment, providers  │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
┌────────▼────────┐                 ┌─────────▼───────────────┐
│    MongoDB       │                 │    External APIs         │
│  Users          │                 │  Google Cloud Vision     │
│  Complaints     │                 │  OpenRouter / DeepSeek   │
│  (Indexed)      │                 │  Google Maps Geocoding   │
└─────────────────┘                 │  Open-Meteo Weather      │
                                    │  Nodemailer / Gmail SMTP │
                                    └─────────────────────────┘
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Register new user, send 4-digit OTP | Public |
| POST | `/verify-otp` | Verify OTP, activate account | Public |
| POST | `/resend-otp` | Resend OTP to email | Public |
| POST | `/login` | Login, returns JWT token | Public |
| GET | `/me` | Get current authenticated user | JWT |

### Complaints — `/api/complaints`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/submit` | Submit complaint with photo + GPS | User |
| GET | `/my` | Get current user's complaints | User |
| GET | `/all-public` | Get all public complaints (filterable) | User |
| GET | `/:id` | Get complaint detail + status timeline | JWT |
| POST | `/:id/rate` | Submit rating & written feedback | User |
| PATCH | `/:id/status` | Update complaint status + resolution note | Provider / Mgmt |

### Management — `/api/management`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/dashboard` | System-wide analytics and KPIs | Management |
| GET | `/complaints` | All complaints with full filters | Management |
| PATCH | `/complaints/:id/assign` | Assign complaint to a provider | Management |
| GET | `/providers` | List all provider accounts | Management |
| POST | `/providers` | Create a new provider account | Management |
| DELETE | `/providers/:id` | Remove provider account | Management |

### Provider — `/api/provider`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/complaints` | Get department-scoped complaint queue | Provider |
| PATCH | `/complaints/:id/status` | Update status + add resolution note | Provider |

---

## Database Schema

### User

```js
{
  name:        String,
  email:       String (unique, indexed),
  password:    String (bcrypt hashed),
  phone:       String,
  isVerified:  Boolean,
  otp:         String,
  otpExpiry:   Date,
  role:        'user' | 'provider' | 'management',
  department:  String,   // providers only
  loginCount:  Number,
  lastLogin:   Date,
  createdAt:   Date
}
```

### Complaint

```js
{
  ticketId:       String,    // e.g. GRX-2026-00042
  userId, userName, userEmail,
  area:           String,    // Tamil Nadu district
  address:        String,    // reverse-geocoded full address
  department:     String,    // one of 10 departments
  description:    String,
  photo:          String,    // base64 image
  status:         'Registered' | 'Accepted' | 'Working On' | 'Completed' | 'Rejected',
  statusHistory:  [{ status, timestamp, updatedBy, note }],
  priority:       'Critical' | 'High' | 'Medium' | 'Low',
  assignedTo,     assignedToName,
  location:       { latitude, longitude },
  rating:         Number (1–5),
  feedback:       String,
  isDuplicate:    Boolean,
  duplicateOf:    String,
  isFake:         Boolean,
  aiRemarks:      String
}
```

---

## Installation

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas cluster)
- Google Cloud Vision API key
- OpenRouter API key
- Gmail account (for Nodemailer SMTP)

### Clone & Setup

```bash
git clone https://github.com/NeveshMJ/vit.git
cd vit
```

### Backend

```bash
cd backend
npm install
# Create .env file (see Environment Variables section below)
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/grievex
JWT_SECRET=your_jwt_secret_here

# Email (Nodemailer)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI APIs
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}
GOOGLE_MAPS_API_KEY=AIza...
```

> **Never commit `.env` to git.** Add it to `.gitignore`.

---

## Project Structure

```
grievex/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   └── Complaint.js             # Complaint schema (full lifecycle)
│   ├── routes/
│   │   ├── auth.js                  # Register, Login, OTP
│   │   ├── complaints.js            # Submit, fetch, rate complaints
│   │   ├── management.js            # Admin analytics and assignment
│   │   └── provider.js              # Provider complaint management
│   └── utils/
│       ├── gemini.js                # OpenRouter / DeepSeek LLM integration
│       ├── vision.js                # Google Cloud Vision + fallback NLP
│       └── mailer.js                # Nodemailer OTP + notifications
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js                   # Routes + protected route logic
│       ├── App.css                  # Design system — all global styles
│       ├── api.js                   # Axios instance with JWT interceptor
│       ├── components/
│       │   └── Sidebar.js           # Role-aware navigation sidebar
│       └── pages/
│           ├── LandingPage.js       # Animated hero landing page
│           ├── Login.js             # Login + demo credential panel
│           ├── Signup.js            # Registration + step indicator
│           ├── VerifyOTP.js         # Email OTP verification
│           ├── user/
│           │   ├── UserDashboard.js
│           │   ├── RaiseComplaint.js    # Webcam + GPS + AI pipeline
│           │   ├── MyComplaints.js      # Status timeline view
│           │   ├── ComplaintMap.js      # Interactive GeoMap
│           │   └── WeatherReport.js     # Open-Meteo weather
│           ├── provider/
│           │   └── ProviderDashboard.js
│           └── management/
│               ├── ManagementDashboard.js   # Analytics + KPIs
│               ├── ManagementComplaints.js  # Full complaint table
│               └── ManageProviders.js       # Provider management
├── vercel.json                      # Vercel deployment config
└── README.md
```

---

## License

MIT License — Open for educational and hackathon use.

---

*Built for Tamil Nadu. Powered by AI. Designed for citizens.*

