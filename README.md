# 🚗 Tuk-Tuk Tracking API

**Real-Time Three-Wheeler Tracking System for Sri Lanka Police**

---

**Student ID:** 16114151 | **Module:** NB6007CEM | **Batch:** 24.2P

---

## 🌐 Live Deployment

| Service      | URL                                                         |
| ------------ | ----------------------------------------------------------- |
| API Base     | https://webapitukpeoject-production.up.railway.app          |
| Swagger Docs | https://webapitukpeoject-production.up.railway.app/api-docs |
| Health Check | https://webapitukpeoject-production.up.railway.app/health   |

---

## 🔐 Test Credentials

| Role             | Username               | Password               |
| ---------------- | ---------------------- | ---------------------- |
| SUPER_ADMIN      | hq_admin               | Admin@1234             |
| PROVINCIAL_ADMIN | wp_admin               | WPAdmin@1234           |
| STATION_OFFICER  | col_officer            | Officer@1234           |
| DEVICE_CLIENT    | device_352148078300001 | Device@352148078300001 |

---

## 🛠 Tech Stack

Node.js, Express, MySQL, Sequelize, JWT, Swagger, Docker, Railway

---

## 📡 Main Endpoints

| Method | Endpoint                        | Description            |
| ------ | ------------------------------- | ---------------------- |
| POST   | `/api/v1/auth/login`            | Login                  |
| POST   | `/api/v1/locations/ping`        | Submit GPS ping        |
| GET    | `/api/v1/locations/live`        | Live vehicle locations |
| GET    | `/api/v1/locations/:id/history` | Movement history       |
| GET    | `/api/v1/vehicles`              | List vehicles          |
| GET    | `/api/v1/drivers`               | List drivers           |
| GET    | `/api/v1/provinces`             | List provinces         |
| GET    | `/api/v1/stats`                 | System statistics      |

---

## 📊 Simulation Data

- **200 vehicles** with realistic GPS patterns
- **319,200+ location pings** (7 days history)
- **9 provinces** & **25 districts**
- **21 police stations**

---

## 🚀 Quick Start

```bash
git clone https://github.com/TharunPerera/tuktuk-tracking-api.git
npm install
cp .env.example .env
npm run db:sync
npm run seed
npm run dev
🔗 Links
GitHub: https://github.com/TharunPerera/tuktuk-tracking-api

API Docs: https://webapitukpeoject-production.up.railway.app/api-docs

© 2026 | Student ID: 16114151 | Coventry University & NIBM
```
