# Museum Collection and Exhibit Management System

**Developer:** Mike Justine D. Palapar (BSIT 3 – Batch 1)
**Client:** Tubigon's Museum
**Course:** React Fundamentals with Laravel as Backend (Mini Capstone)

## Description

Tubigon's Museum currently tracks its artifacts, exhibits, and loan requests by hand. Records are hard to update, and loan requests are hard to monitor. This system replaces the manual process with a web application where staff can browse the collection, manage exhibits, and submit loan requests, and where the administrator can manage records and approve or reject requests.

## Features

- **Authentication:** register, login, logout, and "get current user" using Laravel Sanctum tokens
- **Role-based access:** Administrator and Museum Staff, enforced in React (hidden pages) and Laravel (middleware, 403 responses)
- **Artifacts:** full CRUD (admin only for create, edit, delete), with a many-to-many link to exhibits
- **Exhibits:** full CRUD with an artifact picker (staff and admin can add and edit, admin can delete)
- **Loan requests:** staff submit and track their own requests; admin sees all requests
- **Status workflow:** `pending → approved / rejected → returned`, changed by the admin, with invalid transitions blocked by the API
- **Search and filter:** artifacts by name and category, exhibits by title, loan requests by status, users by name or email
- **Pagination:** Laravel `paginate()` displayed in React
- **Dashboard:** total artifacts, total exhibits, and pending loan requests
- **Validation:** client-side checks in React and Laravel Form Requests, with errors shown under the fields
- **User feedback:** loading states, success and error messages, and a confirm modal before deleting
- **User management (admin):** change roles and delete users
- **Responsive layout** that works on a phone screen

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Axios, plain CSS |
| Backend | Laravel 12, PHP 8.2+, Laravel Sanctum |
| Database | MySQL / MariaDB |
| Tools | Git, GitHub, Composer, npm, Postman / curl |

## Project Structure

```
finalProj_React/
├── backend/    Laravel REST API
├── frontend/   React single-page app
└── docs/       ERD, wireframes, screenshots, slides, API docs
```

## Setup

### Requirements
PHP 8.2+, Composer, Node.js, npm, and MySQL (for example XAMPP).

### 1. Backend
Start MySQL, then create an empty database named `museum_db` (for example in phpMyAdmin).

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
On Windows Command Prompt, use `copy .env.example .env` instead of `cp`.

The API runs at `http://localhost:8000`.

### 2. Frontend
In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
On Windows Command Prompt, use `copy .env.example .env` instead of `cp`.

The app runs at `http://localhost:5173`.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@museum.test | password |
| Museum Staff | staff@museum.test | password |

New accounts created through the Register page are always Museum Staff.

## API Documentation

Base URL: `http://localhost:8000/api`. Send `Accept: application/json` on every request. Protected routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /register | Public | Create a staff account, returns a token |
| POST | /login | Public | Log in, returns a token |
| POST | /logout | Auth | Revoke the current token (204) |
| GET | /user | Auth | Current user |
| GET | /dashboard | Auth | Summary counts |
| GET | /artifacts?search=&category=&page= | Auth | List with search, filter, pagination |
| GET | /artifacts/{id} | Auth | View one artifact |
| POST | /artifacts | Admin | Create an artifact |
| PUT | /artifacts/{id} | Admin | Update an artifact |
| DELETE | /artifacts/{id} | Admin | Delete an artifact (204) |
| GET | /exhibits?search=&page= | Auth | List exhibits with their artifacts |
| GET | /exhibits/{id} | Auth | View one exhibit |
| POST | /exhibits | Auth | Create an exhibit (with `artifact_ids`) |
| PUT | /exhibits/{id} | Auth | Update an exhibit |
| DELETE | /exhibits/{id} | Admin | Delete an exhibit (204) |
| GET | /loan-requests?status=&page= | Auth | Staff see their own, admin sees all |
| POST | /loan-requests | Auth | Submit a loan request |
| PATCH | /loan-requests/{id}/status | Admin | Approve, reject, or mark returned |
| GET | /users?search=&page= | Admin | List users |
| PUT | /users/{id} | Admin | Change a user's role |
| DELETE | /users/{id} | Admin | Delete a user (204) |

Status codes used: 200, 201, 204, 401 (no or bad token), 403 (not an admin), 404, and 422 (validation error).

## Database

The ERD is in [`docs/erd.png`](docs/erd.png). Tables: `users`, `artifacts`, `exhibits`, `artifact_exhibit` (pivot), and `loan_requests`.

## Screenshots

Screenshots of the main pages are in [`docs/screenshots`](docs/screenshots).

## Demo Video

(Paste the link here after recording.)

## Known Limitations and Phase 2 Ideas

- No artifact image upload yet
- No email notifications on loan decisions
- No public visitor page for current exhibits
- Reports cannot yet be exported to PDF or CSV

## References

- Laravel 12 documentation (Eloquent, Form Requests, API Resources, Sanctum): https://laravel.com/docs
- React, React Router, Vite, and Axios documentation
- Claude (Anthropic AI assistant) was used as a coding aid for scaffolding, debugging, and drafting documentation. I reviewed, tested, and understood the code.