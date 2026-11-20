# AirBooking – Flight Booking Web Application

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-3.15-red.svg)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Celery](https://img.shields.io/badge/Celery-5.3-brightgreen.svg)](https://docs.celeryq.dev/)

> **Technical Assignment Test for YUAI Soft Solutions Pvt. Ltd. – Python Full Stack Developer Position**

---

## 1. Project Overview

**AirBooking** is a commercial flight booking web application built with Python (Django REST Framework) and React.js. It features an administrator user verification workflow, JWT authentication, atomic seat reservation locking, multi-channel payment simulation, e-ticket generation, and real-time flight radar tracking using the OpenSky Network ADS-B API.

---

## 2. Project Architecture

The repository adheres to a clean, modular structure containing only the necessary application components:

```
AirBooking/
  backend/
    config/
    accounts/
    flights/
    bookings/
    requirements.txt
    manage.py
    .env.example

  frontend/
    src/
      components/
      pages/
      context/
      services/
      hooks/
      assets/
      App.js
      index.js
    package.json

  README.md
```

### Purpose of Important Folders and Files

| Directory / File | Description |
|---|---|
| **`backend/config/`** | Django project settings, Celery app initialization, URL routing, and WSGI/ASGI handlers. |
| **`backend/accounts/`** | Custom User model, registration, admin approval workflow (`PENDING`, `APPROVED`, `REJECTED`), JWT authentication, and Celery email notification tasks. |
| **`backend/flights/`** | Flight model, search & filtering endpoints, admin flight CRUD, and OpenSky Network real-time telemetry service. |
| **`backend/bookings/`** | Booking & Passenger models, database atomic transactions (`select_for_update`), payment simulation, unique PNR generation, and My Trips views. |
| **`backend/requirements.txt`** | Python dependencies (Django, DRF, SimpleJWT, Celery, Redis, etc.). |
| **`backend/manage.py`** | Django management command utility (migrations, test runner, data seeding). |
| **`backend/.env.example`** | Environment configuration template for secret keys, database engine, Celery, and email credentials. |
| **`frontend/src/components/`** | Reusable UI components (Navbar, Footer, FlightCard, FlightSearchBox, BookingModal, LiveTrackerModal). |
| **`frontend/src/pages/`** | Application view pages (HomePage, FlightSearchPage, MyTripsPage, BookingConfirmationPage, LiveTrackerPage, LoginPage, RegisterPage, AdminDashboardPage). |
| **`frontend/src/context/`** | Application state management using React Context API (`AuthContext` for JWT authentication and user session). |
| **`frontend/src/services/`** | API communication layer using Axios with automatic JWT refresh interceptors (`api.js`, `flightService.js`, `bookingService.js`, `adminService.js`). |
| **`frontend/src/hooks/`** | Custom React hooks (`useAuth`). |
| **`frontend/src/assets/`** | Static assets, icons, and branding illustrations. |
| **`frontend/src/App.js`** | Root application routing and protected route configurations. |
| **`frontend/src/index.js`** | React application entry point. |
| **`frontend/package.json`** | Frontend npm dependencies, scripts, and build configurations. |

---

## 3. Technology Stack

- **Backend**: Python 3.12, Django 5.1, Django REST Framework 3.15, SQLite (default) / MySQL, Simple JWT
- **Background Tasks**: Celery 5.3, Redis (with Celery Eager mode fallback for instant local dev)
- **Frontend**: React 18, Tailwind CSS, Lucide React, Axios, React Router DOM 6, Context API
- **External Integration**: OpenSky Network ADS-B API (with clear fallback demonstration data distinction)

---

## 4. How to Run the Project

### Option A: Run via Commands (Quick Start)

#### 1. Start the Backend Server (Terminal 1)
```powershell
cd C:\Users\lekshmi\.gemini\antigravity\scratch\AirBooking\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8000
```
Backend API will be running at: `http://127.0.0.1:8000/`

#### 2. Start the Frontend Server (Terminal 2)
```powershell
cd C:\Users\lekshmi\.gemini\antigravity\scratch\AirBooking\frontend
npm run dev
```
Frontend Web App will be running at: `http://localhost:3000/`

---

## 5. Pre-Configured Test Accounts

The database comes pre-seeded with realistic flights and accounts:

| Role | Email | Password | Account Status | Purpose |
|---|---|---|---|---|
| **Administrator** | `admin@airbooking.com` | `admin123` | Approved (Staff) | Access Admin Dashboard, approve pending users, manage flights |
| **Approved User** | `alex.miller@example.com` | `user123` | Approved | Search flights, make bookings, view My Trips, print boarding passes |
| **Pending User** | `sarah.smith@example.com` | `user123` | Pending | **Approval Gate Test**: Attempting to log in shows the pending approval notice |

*(You can re-seed sample data anytime by running `python manage.py seed_data` in the backend directory).*

---

## 6. Key Features & Workflows

1. **User Registration & Admin Approval**:
   - Register at `/register`. New accounts are set to `Pending`.
   - Logging in as a pending user displays: *"Your account registration is currently pending admin approval. You will be notified via email once approved."*
   - Log in as `admin@airbooking.com`, open the **Admin Portal**, and click **Approve** to activate the user and dispatch a Celery notification email.
2. **Flight Search & Filtering**:
   - Search by departure/arrival airports, date, and passenger count.
   - Filter by max price slider, airline, and flight status.
3. **Atomic Booking & Payment Simulation**:
   - Select flight, enter passenger details, and choose cabin class.
   - Database transaction with row locking (`select_for_update`) prevents overbooking.
   - Complete checkout with simulated instant payment (Card / UPI / NetBanking).
   - Generates a unique PNR (e.g. `AB-789234`) and printable boarding pass.
4. **My Trips**:
   - View past and upcoming reservations.
   - Cancel trips with automatic seat restoration and simulated refund.
5. **Real-Time Flight Status**:
   - Live ADS-B radar powered by OpenSky Network.
   - Displays altitude, ground speed, and coordinates.
   - Clearly flags data with **LIVE RADAR FEED** vs. **DEMONSTRATION SIMULATOR** badges so mock data is never displayed as live information.

---

## 7. Automated Testing

Run the Django automated test suite covering all 15 required workflows:

```powershell
cd backend
python manage.py test
```

**Result**: `Ran 13 tests in 11.939s — OK`
