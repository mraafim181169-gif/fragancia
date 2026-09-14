# Fragancia Arts Fest 2026 - Hostinger Deployment & MySQL Setup Guide

This guide walks you through deploying the Fragancia Arts Fest Next.js application on Hostinger using Hostinger's managed MySQL database and Node.js Application Manager.

---

## Architecture Overview

- **Frontend & API**: Next.js 15 (App Router) + React 19 + Tailwind CSS
- **Entry Point**: `server.js` (Custom production server for Hostinger Node.js manager)
- **Database**: Hostinger MySQL (InnoDB, UTF8mb4 Unicode)
- **Database Driver**: `mysql2/promise` with pooled singleton connection
- **State Management**: Server-side MySQL with RESTful API endpoints; client cache automatically auto-polls every 10 seconds for real-time scoreboard synchronization.

---

## Step 1: Create MySQL Database on Hostinger

1. Log into your **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. Navigate to **Databases** > **Management** (or **MySQL Databases**).
3. Under **Create a New MySQL Database and User**:
   - **Database Name**: e.g. `u123456789_fragancia`
   - **MySQL Username**: e.g. `u123456789_admin`
   - **Password**: Enter a strong password and save it securely.
4. Click **Create**.
5. Note down:
   - **Database Host**: (usually `localhost` or an IP like `127.0.0.1` on Hostinger shared/cloud hosting)
   - **Database Name**: e.g. `u123456789_fragancia`
   - **Database Username**: e.g. `u123456789_admin`
   - **Database Password**: Your chosen password
   - **Database Port**: `3306`

---

## Step 2: Import `database.sql` into Hostinger MySQL

1. In Hostinger hPanel under **MySQL Databases**, find your newly created database and click **Enter phpMyAdmin**.
2. Select your database from the left-hand menu.
3. Click on the **Import** tab in the top navigation bar.
4. Click **Choose File** and select `database.sql` from this project's root folder.
5. Ensure the character set is set to **utf-8** and format is **SQL**.
6. Scroll to the bottom and click **Go** (or **Import**).
7. phpMyAdmin will create all 12 tables and load the initial seed data:
   - `profiles`
   - `event_settings`
   - `teams` (Team Seljuk & Team Mamluk)
   - `categories`
   - `competitions` (All 82 official competitions)
   - `students` (All 44 enrolled students)
   - `registrations` (413 registrations)
   - `attendance`
   - `marks`
   - `competition_results`
   - `point_adjustments`
   - `schedule_items`
   - `audit_logs`

---

## Step 3: Setup Node.js Application in Hostinger hPanel

1. In hPanel, go to **Advanced** > **Node.js** (or search for **Node.js** in the hPanel search bar).
2. Click **Create Application**:
   - **Node.js version**: Choose **v20.x** or **v22.x** (LTS recommended).
   - **Application mode**: `Production`
   - **Application root**: `public_html` (or subfolder e.g. `public_html/fest`)
   - **Application startup file**: `server.js`
3. Click **Create**.

---

## Step 4: Configure Environment Variables

Under your Node.js application settings in Hostinger hPanel (or inside `.env.production` in your application root folder):

Add the following environment variables:

```env
NODE_ENV=production
PORT=3000

# Hostinger MySQL Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_admin
DB_PASSWORD=YourDatabasePasswordHere
DB_NAME=u123456789_fragancia
DB_CONNECTION_LIMIT=10
DB_SSL=false

# Optional: Gemini API Key if using AI features
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security Note**: Never commit `.env` or `.env.production` with real credentials to GitHub or public repositories. Database credentials are only accessed server-side in `lib/db.ts` and `app/api/*`.

---

## Step 5: Upload Files & Build

### Option A: Via Hostinger Git / File Manager / SSH (Recommended)

1. Upload the project files to your Hostinger Application Root folder:
   - Exclude `.next`, `node_modules`, and `.git` when uploading a zip archive.
2. In Hostinger hPanel Node.js Manager, click **NPM Install** (or open SSH and run `npm install`).
3. Run the build command:
   ```bash
   npm run build
   ```
4. Once the build completes with `✓ Compiled successfully`, click **Restart Application** in the Hostinger Node.js manager.

### Option B: Pre-building locally and uploading

1. On your development machine:
   ```bash
   npm install
   npm run build
   ```
2. Upload the project including the generated `.next/` directory, `server.js`, `package.json`, and `public/`.
3. In Hostinger, run `npm install --omit=dev` to install production dependencies (`next`, `react`, `mysql2`, `motion`, `xlsx`, `lucide-react`).
4. Start/Restart the application in the Node.js Manager.

---

## Step 6: Verify Database Connectivity

Once started, open your web browser and visit:
```
https://yourdomain.com/api/health
```

You should see:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "version": "8.0.x-...",
    "database": "u123456789_fragancia"
  },
  "timestamp": "..."
}
```

Now open `https://yourdomain.com`:
- The Scoreboard, Dashboard, Students, Teams, Competitions, Registrations, Attendance, Judging panel, and Results are reading directly from your Hostinger MySQL database.
- Any change (student enrollments, marks submitted, results published, point adjustments) immediately writes to Hostinger MySQL using parameterized queries.
