# AI PROMPT: Build Property Booking Management Dashboard

## Project Overview
Create a comprehensive web-based property booking management dashboard for hosts/property managers. The dashboard should manage properties, rooms, bookings, guests, and financial transactions with a modern, responsive UI.

---

## Technical Stack Requirements
- **Frontend**: React.js with TypeScript
- **UI Framework**: Use modern component library (Material-UI, Ant Design, or Shadcn/ui)
- **State Management**: React Context API or Redux Toolkit
- **HTTP Client**: Axios for API calls
- **Authentication**: JWT Bearer token authentication
- **Date Handling**: date-fns or Day.js
- **Calendar**: React Big Calendar or FullCalendar for booking visualization
- **Charts**: Recharts or Chart.js for analytics
- **Forms**: React Hook Form with Yup validation
- **Routing**: React Router v6
- **API Base URL**: Configurable via environment variable

---

## Dashboard Structure & Features

### 1. AUTHENTICATION & LAYOUT

#### Login Page
- Email and password fields
- "Remember me" checkbox
- Error handling with clear messages
- Redirect to dashboard after successful login
- Store JWT token in localStorage/sessionStorage

#### Registration Page (Optional)
- Form fields: email, password, firstName, lastName, username
- Password strength indicator
- Terms and conditions acceptance

#### Main Layout
- **Sidebar Navigation** with sections:
  - Dashboard Home
  - Booking Calendar
  - Properties
  - Guests
  - Transactions
  - Profile
  - Settings (optional)
  
- **Top Header**:
  - User avatar and name
  - Notifications icon
  - Logout button
  
- **Responsive Design**:
  - Collapsible sidebar on mobile
  - Hamburger menu for small screens

---

### 2. DASHBOARD HOME (Overview Page)

**Purpose**: Quick overview of key metrics and recent activity

**Key Metrics Cards** (Top Row):
- Total Properties
- Total Bookings (This Month)
- Revenue (This Month)
- Occupancy Rate (%)
- Active Guests

**Visual Components**:
- **Revenue Chart**: Line/Bar chart showing last 6 months revenue
- **Booking Status Pie Chart**: Confirmed, Pending, Cancelled, Completed
- **Recent Bookings Table**: Last 10 bookings with quick actions
- **Upcoming Check-ins/Check-outs**: Today and next 7 days

**Quick Actions**:
- "Add New Property" button
- "Create Manual Booking" button
- "View All Bookings" link

---

### 3. BOOKING CALENDAR / BOOKINGS

**Purpose**: Visualize and manage all bookings

#### Calendar View
- **Display Format**: Month/Week/Day views
- **Each Event Shows**:
  - Guest name
  - Property name
  - Booking dates
  - Status color coding (Confirmed=green, Pending=yellow, Cancelled=red)
  
- **Interactive Features**:
  - Click event to view booking details
  - Drag-and-drop to reschedule (if status allows)
  - Right-click context menu for quick actions
  - Filter by property, status, date range

#### Bookings List View
- **Table Columns**:
  - Booking ID
  - Guest Name
  - Property Name
  - Check-in Date
  - Check-out Date
  - Number of Nights
  - Total Amount
  - Payment Status
  - Booking Status
  - Actions (View, Edit, Cancel, Complete)

- **Filters**:
  - Date range picker
  - Property dropdown
  - Status dropdown
  - Guest search
  - Payment status

- **Actions**:
  - Create new booking (manual)
  - Export bookings to CSV/Excel
  - Bulk actions (Cancel, Confirm)

#### Booking Detail Modal/Page
- Guest information
- Property and room details
- Check-in/Check-out dates and times
- Number of guests
- Special requests/notes
- Payment information
- Booking source (direct, Airbnb, Booking.com)
- Status history timeline
- Actions: Confirm, Cancel, Modify, Contact Guest, Generate Invoice

#### Calendar Sync Integration
- List of connected calendars (Airbnb, Booking.com, etc.)
- "Add New Sync" button with form:
  - Platform selection
  - iCal URL input
  - Source name
- Manual sync trigger button
- Export calendar URL (iCal) display
- Last sync timestamp
- Sync status (success/failed)

**API Endpoints to Use**:
- POST `/api/Calendar/sync` - Add calendar sync
- POST `/api/Calendar/sync/{propertyId}/trigger` - Manual sync
- GET `/api/Calendar/export-url/{propertyId}` - Get export URL
- GET `/api/Calendar/{propertyId}/syncs` - List syncs
- DELETE `/api/Calendar/sync/{syncId}` - Remove sync

**Note**: Booking endpoints are not in current API - may need to be created or simulate with availability data

---

### 4. PROPERTIES MANAGEMENT

**Purpose**: Comprehensive property and room management

#### Properties List View
- **Card or Table Layout Options**
- **Property Card Shows**:
  - Main property image
  - Property name
  - Property type (with icon)
  - Address and city
  - Price per night
  - Number of rooms
  - Availability status
  - Quick actions: Edit, Delete, View Details, Add Room

- **Filters**:
  - City dropdown
  - Property type dropdown
  - Availability status
  - Price range slider

- **Actions**:
  - "Add New Property" button
  - Search by name/address
  - Sort by: name, price, date created

#### Add/Edit Property Form
- **Basic Information Tab**:
  - Property name (required)
  - Description (rich text editor)
  - Property type (dropdown from `/api/PropertyType`)
  - Address (text input)
  - City (dropdown from `/api/City`)
  - Map location (text or map picker)
  
- **Details Tab**:
  - Price per night (number)
  - Minimum nights (number)
  - Maximum nights (number)
  - Check-in time (time picker)
  - Check-out time (time picker)
  - Availability status (dropdown from `/api/Availibility`)
  
- **Amenities Tab**:
  - Checklist grouped by category
  - Fetch from `/api/Amenity`
  - Group by category
  
- **Photos Tab**:
  - Upload multiple images (drag-and-drop)
  - Set main/cover image
  - Reorder images (drag-and-drop)
  - Delete images
  - Use `/api/Pictures/regular` and `/api/Pictures/icon`
  
- **Rooms Tab** (if property has multiple rooms):
  - List of rooms with quick edit
  - "Add Room" button

#### Property Detail Page
- **Header Section**:
  - Image gallery with lightbox
  - Property name, type, location
  - Edit and delete buttons
  
- **Information Sections**:
  - Overview (description, price, nights)
  - Amenities (icon grid)
  - Location (map if available)
  - Check-in/out times
  
- **Rooms Section**:
  - List/grid of all rooms
  - Room type, capacity, beds count
  - Room images
  - Add/Edit/Delete room actions
  
- **Booking History**:
  - Past and upcoming bookings for this property
  - Quick link to calendar view

#### Room Management
- **Add/Edit Room Form**:
  - Room type (dropdown from `/api/RoomType`)
  - Capacity (number of guests)
  - Number of beds
  - Description
  - Availability status
  - Photos (similar to property photos)
  
- **Room Detail View**:
  - Room information
  - Associated property
  - Booking history for this room

#### Property Types & Room Types (Admin Settings)
- Manage property types (Apartment, House, Villa, etc.)
- Manage room types (Bedroom, Bathroom, Living Room, etc.)
- Fields: Name, Icon URL, Display Order
- CRUD operations using respective API endpoints

#### Location Management (Admin Settings)
- **Regions Management**:
  - List of regions
  - Add/Edit/Delete regions
  - Display order
  
- **Cities Management**:
  - List of cities grouped by region
  - Add/Edit/Delete cities
  - Assign to region
  - Display order

**API Endpoints to Use**:
- Properties: GET/POST `/api/Property`, GET/PUT/DELETE `/api/Property/{id}`
- Rooms: GET/POST `/api/Room`, GET/PUT/DELETE `/api/Room/{id}`
- Property Types: All `/api/PropertyType` endpoints
- Room Types: All `/api/RoomType` endpoints
- Amenities: All `/api/Amenity` and `/api/AmenityCategory` endpoints
- Cities: All `/api/City` endpoints
- Regions: All `/api/Region` endpoints
- Pictures: All `/api/Pictures` endpoints

---

### 5. GUESTS TABLE

**Purpose**: Manage guest information and booking history

#### Guests List
- **Table Columns**:
  - Guest ID
  - Name (First + Last)
  - Email
  - Phone Number
  - Total Bookings
  - Total Spent
  - Last Booking Date
  - Registration Date
  - Status (Active, Blocked)
  - Actions (View, Edit, Contact, Delete)

- **Filters**:
  - Search by name, email, phone
  - Date range (registration date)
  - Booking count range
  - Status dropdown

- **Actions**:
  - "Add New Guest" button (manual entry)
  - Export guest list to CSV
  - Bulk actions (Email selected guests)

#### Guest Detail Page
- **Personal Information**:
  - Full name
  - Email, phone
  - Address
  - Registration date
  - Notes
  
- **Booking History**:
  - All bookings (past and future)
  - Total bookings count
  - Total amount spent
  - Average booking value
  - Favorite properties
  
- **Documents** (if applicable):
  - ID upload
  - Contract/agreements
  
- **Communication**:
  - Message history
  - Quick email/SMS button

**Note**: Guest endpoints not in API - implement with local state or add to backend

---

### 6. TRANSACTIONS TABLE

**Purpose**: Track all financial transactions and payments

#### Transactions List
- **Table Columns**:
  - Transaction ID
  - Date & Time
  - Guest Name
  - Property Name
  - Booking ID (linked)
  - Amount
  - Currency
  - Payment Method
  - Payment Status (Pending, Completed, Failed, Refunded)
  - Actions (View, Refund, Receipt)

- **Filters**:
  - Date range picker
  - Payment status dropdown
  - Payment method dropdown
  - Amount range
  - Guest search
  - Property search

- **Summary Cards** (Top):
  - Total Revenue (selected period)
  - Pending Payments
  - Completed Payments
  - Refunded Amount

- **Actions**:
  - "Create Manual Transaction" button
  - Export transactions to CSV/Excel
  - Generate financial reports

#### Transaction Detail Modal
- Full transaction details
- Guest and booking information
- Payment timeline
- Refund button (if applicable)
- Download receipt/invoice button
- Notes section

#### Payment Processing
- **Create Payment**:
  - Amount input
  - Currency selection (default GEL)
  - Return URL
  - Extra info/notes
  - Language selection
  - Submit to `/api/TBCPayment/create`
  
- **Check Payment Status**:
  - Fetch status via `/api/TBCPayment/{paymentId}`
  - Display status badge
  
- **Refund/Cancel**:
  - Input refund amount
  - Confirm action
  - POST to `/api/TBCPayment/{paymentId}/cancel`

#### Financial Reports (Optional Enhancement)
- Revenue by month/year chart
- Revenue by property
- Revenue by booking source
- Payment method distribution
- Export reports to PDF

**API Endpoints to Use**:
- POST `/api/TBCPayment/create` - Create payment
- GET `/api/TBCPayment/{paymentId}` - Check status
- POST `/api/TBCPayment/{paymentId}/cancel` - Refund
- GET `/api/TBCPayment/callback` - Handle webhook

---

### 7. PROFILE

**Purpose**: User account management and settings

#### Profile Information
- **Personal Details**:
  - First Name, Last Name
  - Email (display, not editable or with verification)
  - Username
  - Phone Number
  - Profile Photo
  
- **Actions**:
  - Edit profile button
  - Change password button
  - Upload/change profile photo

#### Account Settings
- **User Type/Role**:
  - Display current role (Guest, Host, Admin)
  - Change role (if authorized)
  - Use `/api/Auth/assign-usertype`
  
- **Preferences**:
  - Language preference
  - Currency preference
  - Notification settings
  - Time zone

#### Security
- **Change Password Form**:
  - Current password
  - New password
  - Confirm new password
  - Password strength indicator
  
- **Two-Factor Authentication** (Optional):
  - Enable/disable 2FA
  - QR code setup

#### Subscription/Plan (Optional)
- Current plan details
- Usage statistics
- Upgrade/downgrade options

**API Endpoints to Use**:
- GET `/api/Auth/me` - Get current user
- POST `/api/Auth/assign-usertype` - Change user type
- (Additional endpoints may be needed for profile updates)

---

## Key UI/UX Requirements

### Design Principles
1. **Clean and Modern**: Use white space effectively, modern typography
2. **Consistent**: Uniform color scheme, button styles, form layouts
3. **Intuitive**: Clear navigation, logical information hierarchy
4. **Responsive**: Mobile-first approach, works on all screen sizes
5. **Accessible**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support

### Color Scheme
- Primary color for actions and highlights
- Success (green), Warning (yellow), Error (red), Info (blue) states
- Neutral grays for backgrounds and borders
- High contrast for readability

### Loading States
- Skeleton screens for initial data loading
- Spinner indicators for actions
- Progress bars for uploads
- Optimistic UI updates where appropriate

### Error Handling
- Toast notifications for success/error messages
- Inline form validation errors
- Friendly error messages (not raw API errors)
- Retry options for failed operations
- 404 and error boundary pages

### Empty States
- Friendly illustrations for empty tables/lists
- Clear call-to-action buttons
- Helpful text explaining what to do next

---

## Data Management & State

### Authentication State
- Store JWT token securely
- Refresh token logic (if available)
- Automatic logout on 401 responses
- Token expiration handling

### API Integration
- Centralized API service with Axios
- Request/response interceptors
- Global error handling
- Loading state management
- Success/error toast notifications

### Data Caching (Optional but Recommended)
- Cache reference data (cities, property types, etc.)
- Invalidate cache on updates
- Use React Query or SWR for smart data fetching

### Form Handling
- Controlled components
- Field-level validation
- Form-level validation
- Disable submit until valid
- Show unsaved changes warning

---

## Advanced Features (Optional Enhancements)

1. **Dashboard Analytics**:
   - Revenue trends and forecasts
   - Occupancy analytics
   - Guest demographics
   - Property performance comparison
   
2. **Automated Notifications**:
   - Email confirmations for bookings
   - Reminders before check-in
   - Payment reminders
   - Calendar sync notifications
   
3. **Multi-language Support**:
   - i18n implementation
   - Language switcher
   - Translated content
   
4. **Bulk Operations**:
   - Bulk property updates
   - Bulk pricing changes
   - Bulk booking actions
   
5. **Advanced Calendar Features**:
   - Drag-to-create bookings
   - Recurring availability blocks
   - Seasonal pricing visualization
   - Multi-property calendar view
   
6. **Reporting System**:
   - Custom report builder
   - Scheduled reports
   - PDF/Excel export
   - Email reports
   
7. **Communication Hub**:
   - In-app messaging
   - Email templates
   - SMS notifications
   - Guest communication history

---

## Implementation Priority

### Phase 1 (MVP - Core Features):
1. Authentication (Login/Logout)
2. Dashboard home with basic metrics
3. Properties list and CRUD
4. Rooms CRUD (within properties)
5. Basic profile page

### Phase 2 (Essential Features):
1. Booking calendar view
2. Bookings list and management
3. Calendar sync integration
4. Photo upload for properties
5. Guests table

### Phase 3 (Financial & Advanced):
1. Transactions table
2. Payment processing integration
3. Advanced filters and search
4. Analytics and reports
5. Bulk operations

### Phase 4 (Polish & Enhancement):
1. Advanced UI/UX improvements
2. Multi-language support
3. Notifications system
4. Performance optimization
5. Mobile app (optional)

---

## File Structure Suggestion

```
src/
├── api/
│   ├── axiosInstance.ts
│   ├── authApi.ts
│   ├── propertyApi.ts
│   ├── bookingApi.ts
│   ├── guestApi.ts
│   ├── transactionApi.ts
│   └── calendarApi.ts
├── components/
│   ├── common/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── properties/
│   │   ├── PropertyList.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyForm.tsx
│   │   ├── PropertyDetail.tsx
│   │   └── RoomForm.tsx
│   ├── bookings/
│   │   ├── BookingCalendar.tsx
│   │   ├── BookingList.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingDetail.tsx
│   ├── guests/
│   │   ├── GuestList.tsx
│   │   └── GuestDetail.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   └── TransactionDetail.tsx
│   └── profile/
│       └── ProfilePage.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProperties.ts
│   └── useBookings.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PropertiesPage.tsx
│   ├── BookingsPage.tsx
│   ├── GuestsPage.tsx
│   ├── TransactionsPage.tsx
│   └── ProfilePage.tsx
├── types/
│   ├── property.types.ts
│   ├── booking.types.ts
│   ├── guest.types.ts
│   └── transaction.types.ts
├── utils/
│   ├── dateHelpers.ts
│   ├── formatters.ts
│   └── validators.ts
├── App.tsx
└── index.tsx
```

---

## Security Considerations

1. **Authentication**:
   - Secure token storage
   - HTTPS only
   - Token expiration handling
   - XSS protection

2. **Authorization**:
   - Role-based access control
   - Protected routes
   - API endpoint validation

3. **Data Validation**:
   - Client-side validation
   - Sanitize user inputs
   - Prevent SQL injection (handled by API)

4. **File Uploads**:
   - File type validation
   - File size limits
   - Virus scanning (if possible)

---

## Testing Requirements

1. **Unit Tests**:
   - API service functions
   - Utility functions
   - Custom hooks

2. **Integration Tests**:
   - Form submissions
   - API calls with mock responses
   - Authentication flows

3. **E2E Tests** (Optional):
   - Complete user journeys
   - Critical paths (login, create property, create booking)

---

## Deployment Considerations

1. **Environment Variables**:
   - API_BASE_URL
   - Payment gateway keys (if any)
   - Feature flags

2. **Build Optimization**:
   - Code splitting
   - Lazy loading routes
   - Image optimization

3. **Monitoring**:
   - Error tracking (Sentry)
   - Analytics (Google Analytics, Mixpanel)
   - Performance monitoring

---

## Success Criteria

The dashboard should:
1. ✅ Successfully authenticate users
2. ✅ Display all properties with CRUD operations
3. ✅ Show booking calendar with all bookings
4. ✅ Allow calendar sync setup with external platforms
5. ✅ Manage rooms for each property
6. ✅ Display guest information and booking history
7. ✅ Show transaction history with payment processing
8. ✅ Be fully responsive (mobile, tablet, desktop)
9. ✅ Have intuitive navigation and UX
10. ✅ Handle errors gracefully
11. ✅ Load quickly (< 3s initial load)
12. ✅ Be accessible (WCAG 2.1 AA)

---

## Additional Notes

- The current API seems to be missing actual Booking/Reservation endpoints. You may need to:
  - Add booking endpoints to the backend OR
  - Simulate bookings using the Availability system OR
  - Use the Calendar sync as a workaround
  
- Consider adding these API endpoints if possible:
  - POST/GET/PUT/DELETE `/api/Booking`
  - GET `/api/Booking/property/{propertyId}`
  - GET `/api/Booking/guest/{guestId}`
  - GET `/api/Guest` (CRUD operations)
  
- The TBC Payment integration is specific to Georgian bank, ensure proper testing in sandbox environment

- Calendar sync should be tested with actual iCal URLs from Airbnb/Booking.com

---

This comprehensive specification should enable you to build a fully functional property booking management dashboard. Prioritize the MVP features first, then iterate with additional features based on user feedback and requirements.
