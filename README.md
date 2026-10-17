# Job Application Tracker — MERN Stack

**Status: Work in Progress — Under Active Development**

A full-stack job application tracker built with MongoDB, Express, React, and Node.js. This starter project provides a working foundation for tracking job applications, with authentication and CRUD operations for applications. It is intentionally marked as under development; additional polish, testing, and deployment configuration remain future work.

## Features in this starter
- Register and log in with JWT authentication
- Create, view, update, and delete job applications
- Track company, role, status, application date, job URL, location, and notes
- Filter applications by status
- Dashboard summary cards
- Responsive React UI
- Protected API routes
- Password hashing with bcrypt
- Environment-based secrets; `.env` files are excluded from Git

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens (JWT) + bcryptjs

## Requirements
- Node.js 20+ recommended
- npm
- MongoDB local instance or MongoDB Atlas database

## Run locally

### 1. Configure backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
On Windows PowerShell, copy `.env.example` to `.env` manually if `cp` is unavailable. Set `MONGODB_URI` and a long random `JWT_SECRET` in `server/.env`.

### 2. Configure frontend
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

The backend defaults to `http://localhost:5000`. The frontend Vite config proxies `/api` to the backend.

## API endpoints
All routes are prefixed with `/api`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create an account | No |
| POST | `/auth/login` | Log in | No |
| GET | `/applications` | List current user's applications | Yes |
| POST | `/applications` | Create an application | Yes |
| PATCH | `/applications/:id` | Update an application | Yes |
| DELETE | `/applications/:id` | Delete an application | Yes |

## Application statuses
- Wishlist
- Applied
- Interview
- Offer
- Rejected

## Project structure
```text
job-application-tracker-mern/
├── client/                 # React + Vite frontend
├── server/                 # Express API + MongoDB
├── README.md
├── DEVELOPMENT.md
├── LICENSE
└── .gitignore
```

## Current development status
This is an early-stage project starter, not a finished production application. Before production use, add automated tests, stronger request validation/rate limiting, password reset and email verification, deployment setup, accessibility review, and security review. JWT is stored in browser localStorage in this starter for simplicity; consider secure HttpOnly cookies and CSRF protections for a production system.

## GitHub upload
Create a repository on GitHub, then from this extracted project folder run:
```bash
git init
git add .
git commit -m "Initial MERN job application tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/job-application-tracker-mern.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username and use the repository URL GitHub provides. Never commit `.env` files or secrets.
