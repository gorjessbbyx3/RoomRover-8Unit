# 934 Kapahulu Rooms — RoomRover 8-Unit

Full-stack property management system for **934 Kapahulu Ave, Honolulu, O'ahu** — an 8-room shared living space offering short-term and long-term stays.

## Features

### Public-Facing (`/membership`)
- 🌺 Beautiful landing page with real room photos and neighborhood map
- 📸 Interactive photo gallery (7 images: entrance, kitchen, rooms, bathrooms)
- 💰 Dynamic pricing cards with savings comparisons and "Book Now" CTAs
- 📝 Inquiry form with automatic EmailJS confirmation emails
- 🔑 Tracking token system for guests to check inquiry status

### Admin Dashboard (`/dashboard`)
- 📊 Real-time occupancy, revenue, and guest stats
- 🗺️ Visual room status grid by property
- ⚡ Quick action bar: Check In/Out, Inquiries, Payments, Tasks
- 💵 Cash drawer monitoring for managers
- 🔔 Alerts for overdue payments, urgent tasks
- 📬 Recent inquiries panel with status badges

### Operations
- 🛏️ Room management with status tracking (available/occupied/cleaning/maintenance)
- 👤 Guest check-in/out with door code assignment
- 💳 Payment tracking (Cash + Cash App)
- 🧹 Cleaning task assignment and tracking
- 🔐 Front door code management with expiry
- 📈 Analytics and reporting
- 🚫 Banned users management

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT token-based with role system (admin/manager/helper/guest)
- **Email**: EmailJS for no-reply confirmations
- **Deployment**: Vercel-ready (`vercel.json` + `api/index.ts`)

## Properties

| Property | Address | Rooms | Rates |
|----------|---------|-------|-------|
| 934 Kapahulu | 934 Kapahulu Ave, Honolulu, HI 96816 | 8 | $100/night · $550/week · $2,000/month |

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Add DATABASE_URL, JWT_SECRET, etc.

# Run development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT token signing |

## Deployment

Configured for Vercel deployment:
- `vercel.json` routes all requests through the Express API
- `api/index.ts` wraps the Express app as a serverless function
- Static assets served from `client/dist`

---

934 Kapahulu Rooms · Affordable island living on O'ahu 🌺
