# Property Booking Management Dashboard

## Project Overview
A comprehensive property booking management dashboard built with React, TypeScript, and Express. Designed following Material Design principles with the Roboto font family.

## Current Status (November 15, 2024)
**Phase:** Frontend Foundation Complete + Working Authentication

### Completed Features
1. ✅ **Authentication System**
   - JWT-based authentication with bcrypt password hashing
   - Login and registration pages with form validation
   - Protected routes with automatic redirect
   - User session management with localStorage
   - Backend auth endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`

2. ✅ **Dashboard Layout & Navigation**
   - Shadcn Sidebar component with collapsible navigation
   - Top header with theme toggle and notifications button
   - Navigation menu: Dashboard, Properties, Calendar, Guests, Transactions, Profile, Settings
   - Responsive mobile/tablet/desktop layouts
   - Dark/light theme support

3. ✅ **Dashboard Home Page**
   - Analytics metric cards (Properties, Bookings, Revenue, Occupancy)
   - Revenue trend line chart (Recharts)
   - Booking status pie chart
   - Recent bookings table with status indicators
   - Mock data with proper TypeScript typing

4. ✅ **Foundation & Utilities**
   - Complete TypeScript type definitions (`shared/schema.ts`)
   - API client with axios and error handling (`client/src/lib/api-client.ts`)
   - Format utilities for dates, currency, numbers (`client/src/lib/format.ts`)
   - File upload utilities and validation (`client/src/lib/file-utils.ts`)
   - Constants for statuses, colors, limits (`client/src/lib/constants.ts`)
   - Environment variable structure (`.env.example`)

### Technology Stack
- **Frontend:** React 18, TypeScript, Vite
- **UI Components:** Shadcn UI, Radix UI, Tailwind CSS
- **Routing:** Wouter
- **Forms:** React Hook Form + Yup validation
- **Data Fetching:** TanStack React Query (configured, ready to use)
- **Charts:** Recharts
- **Backend:** Express, Node.js
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Database:** In-memory storage (MemStorage) - ready for PostgreSQL migration

### API Endpoints
**Authentication:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user (requires JWT)
- `POST /api/auth/logout` - Logout

**Dashboard (Mock Data):**
- `GET /api/dashboard/analytics` - Get metrics (properties, bookings, revenue, occupancy)
- `GET /api/dashboard/revenue` - Get revenue trend data
- `GET /api/dashboard/booking-status` - Get booking status distribution
- `GET /api/dashboard/recent-bookings` - Get recent bookings list

### Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── app-sidebar.tsx  # Main navigation sidebar
│   │   ├── DashboardLayout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── lib/
│   │   ├── api-client.ts    # Axios instance with interceptors
│   │   ├── constants.ts     # Application constants
│   │   ├── file-utils.ts    # File upload helpers
│   │   ├── format.ts        # Date/currency formatting
│   │   └── queryClient.ts   # React Query configuration
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx    # Analytics dashboard
│   │   ├── Properties.tsx   # (Placeholder)
│   │   ├── CalendarPage.tsx # (Placeholder)
│   │   ├── Guests.tsx       # (Placeholder)
│   │   ├── Transactions.tsx # (Placeholder)
│   │   ├── Profile.tsx      # (Placeholder)
│   │   └── Settings.tsx     # (Placeholder)
│   └── App.tsx
server/
├── routes.ts       # API routes with JWT auth
├── storage.ts      # In-memory user storage
└── index.ts        # Express server setup
shared/
└── schema.ts       # Shared TypeScript types (Drizzle schemas)
```

### Environment Variables
Create a `.env` file based on `.env.example`:
```
VITE_API_BASE_URL=http://localhost:5000
SESSION_SECRET=your-secret-key-here
```

### Running the Application
```bash
npm install
npm run dev
```
Application will be available at http://localhost:5000

### Next Steps (Remaining Work)
1. **Properties Management** - Property list, CRUD forms, image upload
2. **Calendar & Bookings** - React Big Calendar integration, booking management
3. **Transactions** - Payment tracking, TBC integration
4. **Guests Management** - Guest CRUD operations
5. **Profile & Settings** - User profile editing
6. **Backend Integration** - Connect to external Property Booking API
7. **Database Migration** - Move from MemStorage to PostgreSQL
8. **React Query Integration** - Replace mock data with real API calls
9. **Material Design Refinement** - Align spacing, typography, elevations with MD spec

### Known Issues / Technical Debt
- Dashboard currently uses static mock data instead of React Query
- Material Design spacing/typography needs alignment with spec
- ThemeProvider pattern needs proper implementation
- Need to add loading states and error boundaries throughout
- Image upload component not yet implemented
- No calendar sync (Airbnb/Booking.com) integration yet

### User Feedback & Preferences
- API Base URL: localhost (user's local machine)
- No test accounts yet - registration flow allows account creation
- Material Design system with Roboto font family preferred
- Responsive design for mobile/tablet/desktop required

### Design Guidelines
See `design_guidelines.md` for complete Material Design specifications including:
- Color palette and theming
- Typography scale (Roboto font family)
- Spacing system (8px base grid)
- Component patterns
- Elevation and shadows
