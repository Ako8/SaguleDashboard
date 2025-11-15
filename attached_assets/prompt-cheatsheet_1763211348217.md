# Replit AI Prompts - Copy-Paste Cheat Sheet

Quick reference of ready-to-use prompts for building your dashboard. Copy and paste these directly into Replit AI chat.

---

## 🎬 INITIAL SETUP

### 1. Create Project Structure
```
Create a React TypeScript project with this folder structure:

src/
├── api/
│   ├── authApi.ts
│   ├── propertyApi.ts
│   ├── calendarApi.ts
│   ├── pictureApi.ts
│   └── paymentApi.ts
├── components/
│   ├── common/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── LoadingSpinner.tsx
│   ├── properties/
│   │   ├── PropertyList.tsx
│   │   ├── PropertyCard.tsx
│   │   └── PropertyForm.tsx
│   ├── bookings/
│   │   └── BookingCalendar.tsx
│   └── profile/
│       └── ProfilePage.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PropertiesPage.tsx
│   ├── BookingCalendarPage.tsx
│   ├── GuestsPage.tsx
│   ├── TransactionsPage.tsx
│   └── ProfilePage.tsx
├── types/
│   └── index.ts
├── utils/
│   └── axiosInstance.ts
├── contexts/
│   └── AuthContext.tsx
├── App.tsx
└── index.tsx

Install these dependencies:
@mui/material @emotion/react @emotion/styled @mui/icons-material
react-router-dom axios
react-hook-form yup @hookform/resolvers
date-fns
react-big-calendar
recharts
react-toastify
```

---

### 2. Setup Axios Instance
```
Create src/utils/axiosInstance.ts:

1. Create axios instance with baseURL from env variable REACT_APP_API_BASE_URL
2. Add request interceptor:
   - Get token from localStorage
   - If token exists, add to headers: Authorization: Bearer {token}
3. Add response interceptor:
   - On 401 error: clear localStorage, redirect to /login
   - On other errors: return error
4. Export the configured instance
```

---

### 3. Create TypeScript Types
```
Create src/types/index.ts with these interfaces:

export interface Property {
  id: number;
  hostId: number;
  name: string;
  description: string;
  propertyTypeId: number;
  availibilityId: number;
  address: string;
  cityId: number;
  mapLocation: string;
  price: number;
  minNight: number;
  maxNight: number;
  checkInTime: string;
  checkOutTime: string;
}

export interface Room {
  id: number;
  propertyId: number;
  roomTypeId: number;
  availibilityId: number;
  capacity: number | null;
  bedsCount: number | null;
  description: string;
}

export interface PropertyType {
  id: number;
  name: string;
  iconUrl: string;
  displayOrder: number;
}

export interface City {
  id: number;
  name: string;
  displayOrder: number;
  regionId: number;
}

export interface Picture {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  pictureType: 'Icon' | 'Regular';
  entityId: number;
  entityType: 'Property' | 'Room';
  uploadedAt: string;
  url: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}
```

---

## 🔐 AUTHENTICATION

### 4. Create Auth Context
```
Create src/contexts/AuthContext.tsx:

1. State: user (User | null), token (string | null), isLoading (boolean)
2. useEffect on mount: check localStorage for token, if exists fetch user from GET /api/Auth/me
3. login function:
   - POST to /api/Auth/login with {email, password}
   - Store token in localStorage
   - Fetch user info
   - Update state
4. logout function:
   - Clear localStorage
   - Clear state
   - Redirect to /login
5. Provide AuthContext to app
6. Export useAuth hook
```

---

### 5. Create Login Page
```
Create src/pages/LoginPage.tsx:

1. Material-UI Box centered on page
2. Card with logo and "Login" title
3. Form using React Hook Form:
   - Email field (type email, required, email validation)
   - Password field (type password, required, min 6 chars)
   - "Remember me" checkbox
   - Submit button with loading spinner
4. Link to register page
5. On submit: call login from useAuth()
6. Show error message if login fails
7. Redirect to /dashboard on success
8. Use Yup for validation schema
```

---

### 6. Create Protected Route
```
Create src/components/common/ProtectedRoute.tsx:

Component that:
1. Uses useAuth() to check authentication
2. If loading: show loading spinner
3. If not authenticated: redirect to /login
4. If authenticated: render children
5. Use Navigate from react-router-dom for redirects
```

---

### 7. Setup Routing
```
In src/App.tsx, setup React Router:

Routes:
- / → redirect to /dashboard
- /login → LoginPage (public)
- /register → RegisterPage (public)
- /dashboard → DashboardPage (protected)
- /properties → PropertiesPage (protected)
- /bookings → BookingCalendarPage (protected)
- /guests → GuestsPage (protected)
- /transactions → TransactionsPage (protected)
- /profile → ProfilePage (protected)

Wrap protected routes with ProtectedRoute component
Wrap all routes in AuthProvider
Use BrowserRouter
```

---

## 📐 LAYOUT

### 8. Create Main Layout
```
Create src/components/common/Layout.tsx with:

1. Material-UI responsive layout:
   - Permanent drawer on desktop (240px width)
   - Temporary drawer on mobile (toggleable)
2. AppBar with:
   - Hamburger menu icon (mobile only)
   - App title
   - User info and logout button
3. Drawer with navigation:
   - Dashboard (icon: Dashboard, route: /dashboard)
   - Bookings (icon: Event, route: /bookings)
   - Properties (icon: Home, route: /properties)
   - Guests (icon: People, route: /guests)
   - Transactions (icon: Payment, route: /transactions)
   - Profile (icon: Person, route: /profile)
4. Highlight active route
5. Main content area with proper spacing
6. Use Material-UI theme colors
```

---

## 🏘️ PROPERTIES

### 9. Create Property API Service
```
Create src/api/propertyApi.ts:

Import axios instance from utils/axiosInstance

Functions:
1. getAllProperties(): Promise<Property[]>
   GET /api/Property

2. getPropertyById(id: number): Promise<Property>
   GET /api/Property/{id}

3. createProperty(data: Omit<Property, 'id'>): Promise<number>
   POST /api/Property
   Returns created property ID

4. updateProperty(id: number, data: Omit<Property, 'id'>): Promise<void>
   PUT /api/Property/{id}

5. deleteProperty(id: number): Promise<void>
   DELETE /api/Property/{id}

6. getAllPropertyTypes(): Promise<PropertyType[]>
   GET /api/PropertyType

7. getAllCities(): Promise<City[]>
   GET /api/City

Add proper error handling with try-catch
Add TypeScript types for all functions
```

---

### 10. Create Properties List Page
```
Create src/pages/PropertiesPage.tsx:

1. Fetch properties on mount using getAllProperties()
2. State for: properties, loading, searchTerm, selectedCity, selectedType
3. Top bar with:
   - "Add New Property" button (opens form dialog)
   - Search input (filter by name)
   - City filter dropdown
   - Property type filter dropdown
4. Display properties in Grid (3 columns desktop, 2 tablet, 1 mobile)
5. Each property card shows:
   - Image (placeholder if none)
   - Name (Typography variant h6)
   - Type badge
   - Address and city
   - Price per night (Typography variant h5)
   - Number of rooms
   - Action buttons: View, Edit, Delete
6. Show loading skeletons while fetching
7. Show empty state if no properties
8. Confirm dialog before delete
9. Toast notification on success/error
```

---

### 11. Create Property Form
```
Create src/components/properties/PropertyForm.tsx:

Multi-tab form with Material-UI Tabs:

TAB 1 - Basic Information:
Fields:
- name (TextField, required)
- description (TextField, multiline, 4 rows)
- propertyTypeId (Select from getAllPropertyTypes())
- address (TextField, required)
- cityId (Select from getAllCities())
- price (TextField, type number, required, min 0)
- minNight (TextField, type number, default 1)
- maxNight (TextField, type number, default 30)
- checkInTime (TimePicker, default "14:00")
- checkOutTime (TimePicker, default "11:00")

TAB 2 - Photos:
- File upload zone (drag and drop or click)
- Preview uploaded images in grid
- Set main image (first is main by default)
- Delete image buttons
- Max 10 images, max 5MB each
- Only allow: jpg, jpeg, png, webp

TAB 3 - Rooms:
- List of rooms (if edit mode)
- "Add Room" button
- Each room shows: type, capacity, beds, edit/delete buttons

TAB 4 - Amenities:
- Fetch amenities from GET /api/Amenity
- Group by category
- Checkboxes for selection
- Grid layout

Bottom buttons:
- Save button (loading spinner when submitting)
- Cancel button (with unsaved changes warning)

Use React Hook Form with Yup validation
Handle both create and edit modes (pass propertyId prop for edit)
Show success toast and close dialog on save
Show error toast on failure
```

---

### 12. Create Property Card Component
```
Create src/components/properties/PropertyCard.tsx:

Material-UI Card with:
1. CardMedia showing property image (placeholder if none)
2. CardContent with:
   - Property name (Typography variant h6)
   - Property type chip
   - Location (city + address, Typography variant body2)
   - Price (Typography variant h5, color primary)
   - Rooms count
3. CardActions with:
   - View IconButton (Visibility icon)
   - Edit IconButton (Edit icon)
   - Delete IconButton (Delete icon, color error)
4. Props: property (Property), onEdit, onDelete, onView
5. Responsive: full width on mobile, fixed width on desktop
6. Hover effect: slight elevation increase
```

---

## 📅 CALENDAR

### 13. Create Calendar API Service
```
Create src/api/calendarApi.ts:

Functions:
1. addCalendarSync(data: {propertyId: number, source: 1|2|3, importUrl: string, sourceName: string})
   POST /api/Calendar/sync
   Body: JSON with all fields
   source: 1=Airbnb, 2=Booking.com, 3=Other

2. getPropertySyncs(propertyId: number)
   GET /api/Calendar/{propertyId}/syncs

3. triggerSync(propertyId: number)
   POST /api/Calendar/sync/{propertyId}/trigger

4. getExportUrl(propertyId: number): Promise<string>
   GET /api/Calendar/export-url/{propertyId}
   Returns iCal export URL string

5. deleteSync(syncId: number)
   DELETE /api/Calendar/sync/{syncId}

Use axios instance, add error handling
```

---

### 14. Create Booking Calendar Page
```
Create src/pages/BookingCalendarPage.tsx:

1. Top controls:
   - View buttons: Month, Week, Day
   - Property filter dropdown (All, or specific property)
   - "Create Booking" button

2. Calendar component using react-big-calendar:
   - Show month view by default
   - Events: bookings with {id, title, start, end, resourceId}
   - Color code by status:
     - Confirmed: #4caf50 (green)
     - Pending: #ff9800 (orange)
     - Cancelled: #f44336 (red)
   - Click event to show details modal
   - Use date-fns for date formatting

3. Legend showing status colors

4. Below calendar: "Calendar Sync Settings" section
   - Table with columns: Source, Property, Last Sync Time, Actions
   - "Add Calendar Sync" button
   - Each row: Sync button, Delete button

5. Use MOCK DATA for bookings:
   [
     {id: 1, title: "John Doe - Villa Rosa", start: new Date(2025,4,1), 
      end: new Date(2025,4,5), status: "confirmed"},
     {id: 2, title: "Jane Smith - Beach House", start: new Date(2025,4,3), 
      end: new Date(2025,4,10), status: "pending"}
   ]

Make responsive - stack controls vertically on mobile
```

---

## 💰 TRANSACTIONS

### 15. Create Payment API Service
```
Create src/api/paymentApi.ts:

Functions:
1. createPayment(amount: number, currency: string, returnUrl: string, extraInfo?: string)
   POST /api/TBCPayment/create?amount={amount}&currency={currency}&returnUrl={returnUrl}&extraInfo={extraInfo}&lang=KA
   Returns payment response with URL and ID

2. getPaymentStatus(paymentId: string)
   GET /api/TBCPayment/{paymentId}

3. cancelPayment(paymentId: string, amount: number)
   POST /api/TBCPayment/{paymentId}/cancel?amount={amount}

Use axios instance with proper error handling
```

---

### 16. Create Transactions Page
```
Create src/pages/TransactionsPage.tsx:

1. Top row with 4 summary cards:
   - Total Revenue (calculate from transactions)
   - Pending Payments
   - Completed Payments
   - Refunded Amount

2. Filters row:
   - Date range picker
   - Status dropdown (All, Completed, Pending, Failed, Refunded)
   - "Export CSV" button
   - "Create Payment" button

3. Table with columns:
   - ID, Date & Time, Guest Name, Property Name
   - Booking ID, Amount, Currency, Payment Status, Actions

4. Status badges with colors:
   - Completed: green
   - Pending: yellow
   - Failed: red
   - Refunded: gray

5. Actions: View button, Refund button (only for completed)

6. Use MOCK DATA:
   [
     {id: "T001", date: "2025-05-01 09:00", guest: "John Doe", 
      property: "Villa Rosa", booking: "B123", amount: 450, 
      currency: "GEL", status: "Completed"},
     {id: "T002", date: "2025-05-02 14:00", guest: "Jane Smith",
      property: "Beach House", booking: "B124", amount: 800,
      currency: "GEL", status: "Pending"}
   ]

Pagination: 25 per page
Use Material-UI DataGrid or Table
```

---

## 👥 GUESTS

### 17. Create Guests Page
```
Create src/pages/GuestsPage.tsx:

1. Top controls:
   - Search bar (filter by name or email)
   - Date range filter
   - "Add Guest" button

2. Table with columns:
   - ID, Name (First + Last), Email, Phone
   - Total Bookings, Total Spent
   - Last Booking Date, Status, Actions

3. Actions: View button, Edit button, Delete button

4. Use MOCK DATA:
   [
     {id: "G001", firstName: "John", lastName: "Doe",
      email: "john@email.com", phone: "+995555123456",
      totalBookings: 5, totalSpent: 1200,
      lastBooking: "2025-05-01", status: "Active"},
     {id: "G002", firstName: "Jane", lastName: "Smith",
      email: "jane@email.com", phone: "+995555654321",
      totalBookings: 3, totalSpent: 850,
      lastBooking: "2025-04-15", status: "Active"}
   ]

5. Click row to view guest details (open dialog)
6. Guest detail dialog shows:
   - Personal info
   - Booking history
   - Total statistics

Pagination: 25 per page
Material-UI DataGrid or Table
Responsive
```

---

## 👤 PROFILE

### 18. Create Profile Page
```
Create src/pages/ProfilePage.tsx:

Layout with 3 sections in Cards:

Card 1 - Personal Information:
- Left: Profile photo with upload button
- Right: Display current user info from useAuth():
  - Name, Email, Username, Phone
  - User Type (badge)
  - Member Since date
- "Edit Profile" button

Card 2 - Change Password:
- Current password field (type password)
- New password field (type password, show strength meter)
- Confirm new password field
- "Update Password" button
- Validation: min 6 chars, passwords match
- Show success toast on change

Card 3 - Preferences:
- Language dropdown (English, Georgian)
- Currency dropdown (GEL, USD, EUR)
- Timezone dropdown (GMT+4 Tbilisi, GMT, etc.)
- "Save Preferences" button
- Store in localStorage

Use Material-UI Card, TextField, Button
Show loading states
Proper spacing and responsive
```

---

## 🏠 DASHBOARD HOME

### 19. Create Dashboard Home Page
```
Create src/pages/DashboardPage.tsx:

1. Top row - 4 metric cards in Grid:
   Card 1: Total Properties
   - Fetch count from getAllProperties()
   - Icon: Home
   - Color: blue
   
   Card 2: Total Bookings
   - Use mock: 156
   - Icon: Event
   - Color: green
   
   Card 3: Monthly Revenue
   - Use mock: $12,450
   - Icon: AttachMoney
   - Color: orange
   
   Card 4: Occupancy Rate
   - Use mock: 76%
   - Icon: ShowChart
   - Color: purple

2. Second row - 2 charts:
   Left: Revenue Line Chart
   - Use Recharts LineChart
   - Mock data for last 6 months
   - Title: "Revenue Trend"
   
   Right: Booking Status Pie Chart
   - Use Recharts PieChart
   - Mock data: Confirmed 45%, Pending 30%, Completed 25%
   - Title: "Booking Status"

3. Third row - Recent Bookings Table:
   - Show last 5 bookings (use mock data)
   - Columns: ID, Guest, Property, Dates, Status
   - "View All Bookings" button links to /bookings

Use Material-UI Card, Grid, Typography
Make responsive - stack cards on mobile
Add loading states
```

---

## 🎨 POLISH

### 20. Add Global Error Handler
```
Create src/utils/errorHandler.ts:

export function handleApiError(error: any): string {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return error.response.data?.detail || 'Invalid request';
      case 401:
        return 'Unauthorized - please login';
      case 403:
        return 'Access denied';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error - please try again later';
      default:
        return 'An error occurred';
    }
  }
  if (error.request) {
    return 'Network error - check your connection';
  }
  return error.message || 'An unexpected error occurred';
}

Update all API calls to use this function in catch blocks
```

---

### 21. Add Toast Notifications
```
Install react-toastify: npm install react-toastify

In src/App.tsx:
- Import ToastContainer from react-toastify
- Add <ToastContainer /> at top level
- Configure: position="top-right", autoClose={5000}

Create src/utils/notifications.ts:
import { toast } from 'react-toastify';

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showWarning = (message: string) => toast.warning(message);
export const showInfo = (message: string) => toast.info(message);

Replace all alert() calls with toast notifications
```

---

### 22. Add Loading Skeletons
```
Create src/components/common/LoadingSkeleton.tsx:

Export these skeleton components:

1. CardSkeleton - for property cards
   - Use Material-UI Skeleton
   - Rectangle for image
   - Lines for text

2. TableSkeleton - for tables
   - Grid of skeleton rows
   - Configurable row count

3. FormSkeleton - for forms
   - Multiple TextField skeletons

Use these in pages while data is loading:
{loading ? <CardSkeleton count={6} /> : <PropertyList />}
```

---

### 23. Make Everything Responsive
```
Update all pages to be mobile responsive:

1. Use Material-UI Grid with xs, sm, md, lg breakpoints
2. Tables: Add sx={{display: {xs: 'none', md: 'block'}}}
   On mobile: Show cards instead of table
3. Buttons: fullWidth on mobile
4. Forms: fullWidth on mobile
5. Cards: span full width on mobile
6. Spacing: reduce padding on mobile

Test on these breakpoints:
- xs: 0-600px (mobile)
- sm: 600-960px (tablet)
- md: 960-1280px (laptop)
- lg: 1280px+ (desktop)

Use theme.breakpoints.down('md') in sx prop
```

---

## 🔧 UTILITIES

### 24. Date Formatting Helper
```
Create src/utils/dateHelpers.ts:

import { format, parseISO } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (time: string): string => {
  return format(parseISO(`2000-01-01T${time}`), 'hh:mm a');
};

Use these throughout the app for consistent date formatting
```

---

### 25. Currency Formatting Helper
```
Create src/utils/formatters.ts:

export const formatCurrency = (amount: number, currency: string = 'GEL'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

Use for displaying prices and amounts
```

---

## 🚀 QUICK FIXES

### Fix: "Module not found"
```
Check imports are correct
Check file exists at specified path
Check case sensitivity (React vs react)
Run: npm install [missing-package]
```

### Fix: "Type error"
```
Add proper TypeScript types:
import { PropertyType } from '../types';
const properties: Property[] = [];
```

### Fix: "Cannot read property of undefined"
```
Add optional chaining:
user?.name
properties?.length
Use || or ?? for defaults:
properties || []
```

### Fix: "Cors error"
```
This is backend issue - check API allows your origin
For development, may need proxy in package.json
```

### Fix: "401 Unauthorized"
```
Check token is in localStorage
Check token is added to headers in axios instance
Check token hasn't expired
Try logging in again
```

---

## 📱 MOBILE TESTING PROMPTS

### Test Responsive Layout
```
Add this code to test different screen sizes:

In browser dev tools:
1. Open responsive design mode (Ctrl+Shift+M)
2. Test these sizes:
   - iPhone SE: 375px
   - iPad: 768px
   - Desktop: 1280px

Check:
- Sidebar collapses on mobile
- Tables scroll or show as cards
- Buttons are accessible
- Text is readable
- Forms are usable
```

---

This cheat sheet should cover 95% of what you need to build the dashboard! Just copy-paste the relevant prompt and modify as needed.
