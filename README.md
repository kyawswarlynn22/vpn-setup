# VPN Key Management & Sales

A web application for managing Outline VPN keys, built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Admin Dashboard** — Generate, view, rename, and delete Outline VPN keys. Copy `ss://` access URLs with one click.
- **Public Status Page** — Users can check their data usage, data limit, and account status by entering their email or Key ID.
- **Secure API** — All Outline API calls run server-side. The API secret is never exposed to the browser.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Prisma 7** + PostgreSQL
- **Outline VPN** (Shadowbox) API

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OUTLINE_API_URL` | Full Outline Management API URL (e.g. `https://1.2.3.4:8080/xxxx`) |
| `ADMIN_PASSWORD` | Password for admin dashboard access |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Set to `0` to allow Outline's self-signed certs |

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the status check page.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add environment variables in the Vercel dashboard.
4. Vercel auto-detects Next.js and deploys.

All Outline API calls happen in route handlers, so the API secret stays on the server.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public status check page
│   ├── layout.tsx            # Root layout with navigation
│   ├── globals.css           # Tailwind + custom theme
│   ├── admin/
│   │   ├── page.tsx          # Admin login gate
│   │   └── dashboard.tsx     # Admin dashboard component
│   └── api/
│       ├── admin/keys/route.ts  # CRUD API for VPN keys (auth required)
│       └── status/route.ts      # Public status check API
├── lib/
│   ├── outline.ts            # Outline VPN API client
│   └── prisma.ts             # Prisma client singleton
└── generated/prisma/         # Prisma generated client
prisma/
└── schema.prisma             # Database schema
```
