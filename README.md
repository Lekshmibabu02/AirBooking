# AirBooking – Flight Booking Web Application

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-3.15-red.svg)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Celery](https://img.shields.io/badge/Celery-5.3-brightgreen.svg)](https://docs.celeryq.dev/)

> **Full Stack Flight Booking Platform – Technical Assignment Assessment for YUAI Soft Solutions Pvt. Ltd.**

---

## 1. Project Introduction

**AirBooking** is a commercial airline flight booking web application developed with a decoupled architecture featuring a **Django REST Framework** backend and a **React 18** frontend. 

The application provides an end-to-end flight discovery and reservation experience, incorporating:
- An administrative user verification gate where new registrations remain in `Pending` status until approved by staff.
- Asynchronous email notifications dispatched via Celery upon account activation.
- Concurrency-safe seat allocation using database row locking (`select_for_update`) to prevent overbooking.
- Multi-tier cabin fare calculations (Economy, Premium Economy, Business, First Class).
- Simulated instant payment processing across multiple payment channels.
- Digital electronic boarding passes (print/PDF ready).
- Real-time ADS-B flight radar tracking integrated with the **OpenSky Network API**.

---

## 2. Project Features

### 🛡️ User Registration & Admin Approval Workflow
- **Application Sign Up**: Users register with full name, email, phone number, and password. Accounts are initially placed in `PENDING` status.
- **Login Restriction**: Only `APPROVED` users (and admin staff) can log in. Pending applicants receive an informative status message.
- **Admin Verification Console**: Authorized administrators can review pending accounts with 1-click **Approve** or **Reject** actions.
- **Celery Email Notifications**: Account approvals automatically queue an asynchronous background task sending a personalized HTML email.
- **JWT Security**: Access and refresh token authentication using Simple JWT with token rotation and blacklisting.

### 🔍 Flight Search & Filtering
- Search flights by departure airport, destination airport, travel date, and number of passengers.
- Interactive filtering: Maximum ticket price slider, airline selector, flight status, and price/departure time sorting.
- Results display airline name, flight number, departure/arrival times, aircraft model, available seats, and real-time status.

### ✈️ Atomic Flight Booking & Overbooking Prevention
- **Database Row Locking**: Booking creation runs within `transaction.atomic()` using `select_for_update()` on the flight model, ensuring concurrent reservations cannot oversell available seats.
- **Automatic Fare Calculation**: Ticket prices dynamically scale based on passenger count and selected cabin class.
- **Payment Simulation**: Instant clearance supporting Credit Card, UPI / QR, and Net Banking with unique transaction IDs (`PAY-XXXXXXXXXX`).
- **Unique PNR Generation**: Generates standard alphanumeric booking references (e.g. `AB-789234`).
- **Electronic Boarding Pass**: Printable digital ticket containing flight itinerary, seat allocation, boarding gate, terminal, and barcode.

### 🧳 My Trips & Self-Service Cancellation
- Authenticated customers can view all their past and upcoming bookings.
- Direct access to printable e-tickets and live flight radar tracking.
- Self-service booking cancellation automatically restores seat counts to the flight inventory and marks the payment as refunded.

### 🛰️ Real-Time Flight Radar (OpenSky Network ADS-B)
- Streams real-time telemetry: altitude, true airspeed, geographic coordinates, and transponder callsign.
- **Strict Data Integrity Policy**: When live transponder signals are active, a green **LIVE RADAR FEED** badge is displayed. When external networks are unreachable or aircraft are grounded, an amber **DEMONSTRATION SIMULATOR** badge with an explanatory disclaimer is shown—ensuring mock data is never presented as live information.

### 📊 Operations Admin Dashboard
- Live KPI analytics: Registered users, pending approvals, approved accounts, scheduled flights, total bookings, and revenue metrics.
- Comprehensive management tabs for user approvals, flight inventory CRUD, and passenger booking manifests.

---

## 3. Technologies Used

| Layer | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Python 3.12, Django 5.1 | Web framework, ORM, and database models |
| **API Architecture** | Django REST Framework 3.15 | RESTful API endpoints and serializers |
| **Authentication** | Simple JWT (djangorestframework-simplejwt) | Stateless JWT access and refresh token security |
| **Background Tasks** | Celery 5.3, Redis | Asynchronous email dispatching |
| **Database** | SQLite (default) / MySQL | Relational data persistence with ACID compliance |
| **Frontend Framework** | React 18, Vite 6 | Modern reactive component interface |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React | Aviation design system and responsive layouts |
| **HTTP Client** | Axios | API communication with JWT interceptors |
| **Routing & State** | React Router DOM 6, Context API | Client-side routing and global authentication state |
| **External Telemetry** | OpenSky Network API, AirLabs API | Real-time ADS-B aircraft tracking |

---

## 4. Installation Instructions

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** & **npm**
- **Git**

### Clone the Repository
```bash
git clone https://github.com/Lekshmibabu02/AirBooking.git
cd AirBooking
```

---

## 5. Backend Setup Instructions

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **On Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **On macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

5. Apply database migrations:
   ```bash
   python manage.py makemigrations accounts flights bookings
   python manage.py migrate
   ```

6. Seed initial test data (Admin, sample users, and scheduled flights):
   ```bash
   python manage.py seed_data
   ```

---

## 6. Frontend Setup Instructions

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment variables:
   ```bash
   cp .env.example .env
   ```

4. Verify or build the frontend:
   ```bash
   npm run build
   ```

---

## 7. Database Configuration

AirBooking supports both SQLite and MySQL out of the box via environment variables configured in `backend/.env`:

### Option A: SQLite (Default Zero-Configuration)
```ini
DB_ENGINE=sqlite
```
SQLite is pre-configured and requires no external database server. Running `python manage.py migrate` creates the database file `db.sqlite3` automatically.

### Option B: MySQL (Production Configuration)
To use MySQL:
1. Create a MySQL database:
   ```sql
   CREATE DATABASE airbooking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Update `backend/.env`:
   ```ini
   DB_ENGINE=mysql
   DB_NAME=airbooking_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```
3. Install the MySQL database driver in your virtual environment:
   ```bash
   pip install mysqlclient
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```

---

## 8. Environment Variables

### Backend Configuration (`backend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `SECRET_KEY` | *(django secret)* | Django cryptographic signing key |
| `DEBUG` | `True` | Debug mode for development |
| `ALLOWED_HOSTS` | `*` | Comma-separated allowed hostnames |
| `DB_ENGINE` | `sqlite` | Database engine (`sqlite` or `mysql`) |
| `CELERY_TASK_ALWAYS_EAGER` | `True` | Runs Celery tasks synchronously in local development without Redis |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Redis broker connection URL |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/0` | Redis result backend connection URL |
| `EMAIL_BACKEND` | `console.EmailBackend` | Outputs approval emails directly to terminal logs |
| `DEFAULT_FROM_EMAIL` | `noreply@airbooking.com` | Sender address for system notifications |
| `OPENSKY_API_URL` | `https://opensky-network.org/api` | OpenSky Network ADS-B telemetry API |
| `AIRLABS_API_KEY` | *(optional)* | AirLabs API key for secondary telemetry verification |

### Frontend Configuration (`frontend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000/api` | Target backend REST API base URL |

---

## 9. API Documentation

All endpoints accept and return `application/json`. Authenticated routes require the `Authorization: Bearer <access_token>` header.

### Authentication Endpoints (`/api/auth/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Public | Register new user. Sets initial status to `PENDING`. |
| `POST` | `/api/auth/login/` | Public | JWT login. Issues tokens only if account is `APPROVED`. |
| `POST` | `/api/auth/token/refresh/` | Public | Obtain new access token using valid refresh token. |
| `GET` | `/api/auth/me/` | Authenticated | Retrieve profile details of authenticated user. |

### Flights Endpoints (`/api/flights/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/flights/` | Public | Search flights with query filters (airports, dates, price, seats). |
| `GET` | `/api/flights/search/` | Public | Dedicated search alias endpoint. |
| `GET` | `/api/flights/{id}/` | Public | Retrieve detailed information for a single flight. |
| `GET` | `/api/flights/{id}/realtime-status/` | Public | Fetch live OpenSky ADS-B telemetry or fallback simulator. |

### Booking Endpoints (`/api/bookings/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bookings/` | Authenticated | View current customer's trip bookings (My Trips). |
| `POST` | `/api/bookings/` | Authenticated | Create booking with atomic seat locking and payment simulation. |
| `GET` | `/api/bookings/{id}/` | Authenticated | Retrieve booking by ID or PNR reference. |
| `POST` | `/api/bookings/{id}/cancel/` | Authenticated | Cancel booking, restore seats, and mark payment as refunded. |

### Admin Endpoints (`/api/admin/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats/` | Staff Only | Aggregated KPIs: users, flights, bookings, and revenue metrics. |
| `GET` | `/api/admin/users/pending/` | Staff Only | List all registrations waiting for approval. |
| `GET` | `/api/admin/users/` | Staff Only | List all registered accounts. |
| `POST` | `/api/admin/users/{id}/approve/` | Staff Only | Approve account and dispatch Celery email notification. |
| `POST` | `/api/admin/users/{id}/reject/` | Staff Only | Reject user application with optional reason. |
| `GET` | `/api/admin/flights/` | Staff Only | List all scheduled flights in inventory. |
| `POST` | `/api/admin/flights/` | Staff Only | Add a new flight schedule. |
| `PUT` | `/api/admin/flights/{id}/` | Staff Only | Update flight schedules, fares, and seat quotas. |
| `DELETE` | `/api/admin/flights/{id}/` | Staff Only | Delete a flight. |
| `PUT` | `/api/admin/flights/{id}/status/` | Staff Only | Update flight status (`ON_TIME`, `DELAYED`, `CANCELLED`). |
| `GET` | `/api/admin/bookings/` | Staff Only | Complete audit manifest of all bookings across all customers. |

---

## 10. Admin Login Credentials for Testing

The database comes pre-seeded with test accounts for technical evaluation:

| Role | Email | Password | Account Status | Intended Demonstration |
|---|---|---|---|---|
| **Administrator** | `admin@airbooking.com` | `admin123` | Approved (Staff) | Access Admin Portal at `/admin`, approve/reject users, manage flights |
| **Approved Customer** | `alex.miller@example.com` | `user123` | Approved | Login, search flights, complete booking checkout, view My Trips |
| **Pending Customer** | `sarah.smith@example.com` | `user123` | Pending | **Approval Gate Test**: Attempting to log in displays the pending approval notice |

*(To restore or re-seed the test database at any time, run `python manage.py seed_data` in the backend directory).*

---

## 11. How to Run the Project

To run both services simultaneously, open two terminal windows:

### Terminal 1: Backend (Django REST Framework)
```bash
cd backend
# Activate virtual environment:
# Windows: .\venv\Scripts\activate | macOS/Linux: source venv/bin/activate
python manage.py runserver 127.0.0.1:8000
```
- **Backend API**: `http://127.0.0.1:8000/api/`
- **Django Admin**: `http://127.0.0.1:8000/admin/`

### Terminal 2: Frontend (React.js)
```bash
cd frontend
npm run dev
```
- **Frontend Web Application**: `http://localhost:3000/`

---

## Automated Test Verification

Run the Django automated test suite covering all 15 required workflows:

```bash
cd backend
python manage.py test
```

```text
Found 13 test(s).
System check identified no issues (0 silenced).
.............
----------------------------------------------------------------------
Ran 13 tests in 11.939s

OK
```
