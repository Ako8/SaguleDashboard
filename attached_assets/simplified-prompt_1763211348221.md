# SIMPLIFIED AI PROMPT: Build Property Booking Dashboard

Build a modern property booking management dashboard using React, TypeScript, and Material-UI.

## Tech Stack
- React 18 + TypeScript
- Material-UI (MUI) for components
- React Router v6 for navigation
- Axios for API calls
- React Hook Form + Yup for forms
- React Big Calendar for booking visualization
- Recharts for analytics
- JWT authentication

## Dashboard Requirements

### 1. Authentication
- Login page with email/password
- Store JWT token from API
- Protected routes requiring authentication
- Logout functionality

**API Endpoints:**
- POST `/api/Auth/login` (body: {email, password})
- GET `/api/Auth/me` (get current user)

---

### 2. Main Layout
- Responsive sidebar with navigation:
  - Dashboard Home
  - Booking Calendar
  - Properties
  - Guests
  - Transactions
  - Profile
- Top header with user info and logout
- Mobile-responsive (collapsible sidebar)

---

### 3. Dashboard Home Page
Display overview cards showing:
- Total Properties (fetch from `/api/Property`)
- Total Bookings (mock for now)
- Monthly Revenue (mock for now)
- Active Guests (mock for now)

Show charts:
- Revenue trend (last 6 months)
- Booking status pie chart
- Recent bookings table

---

### 4. Properties Page

**List View:**
- Display property cards/table
- Each shows: image, name, type, address, price, status
- Actions: View, Edit, Delete
- "Add New Property" button
- Filters: city, property type, price range

**Create/Edit Form:**
Tabs:
1. **Basic Info**: name, description, property type, address, city, price, min/max nights, check-in/out times
2. **Photos**: Multi-image upload with drag-drop, set main image
3. **Rooms**: Add/manage rooms (type, capacity, beds, description)
4. **Amenities**: Checklist grouped by category

**API Endpoints:**
- GET/POST `/api/Property`
- GET/PUT/DELETE `/api/Property/{id}`
- GET/POST `/api/Room`
- GET/PUT/DELETE `/api/Room/{id}`
- GET `/api/PropertyType`, `/api/RoomType`, `/api/City`, `/api/Amenity`
- POST `/api/Pictures/regular` (multipart form: file, query: entityId, entityType)
- GET `/api/Pictures/entity/{entityType}/{entityId}`

---

### 5. Booking Calendar Page

**Calendar View:**
- Month/Week/Day view toggle
- Display bookings as events
- Color-coded by status (Confirmed, Pending, Cancelled)
- Click event to view details
- Filter by property and date range

**Calendar Sync Section:**
- List connected calendars (Airbnb, Booking.com)
- Add sync form: platform selection, iCal URL input
- Manual sync trigger button
- Display export iCal URL

**API Endpoints:**
- POST `/api/Calendar/sync` (body: {propertyId, source, importUrl, sourceName})
- GET `/api/Calendar/{propertyId}/syncs`
- POST `/api/Calendar/sync/{propertyId}/trigger`
- GET `/api/Calendar/export-url/{propertyId}`
- DELETE `/api/Calendar/sync/{syncId}`

**Note:** Booking endpoints missing - use calendar sync data or mock bookings

---

### 6. Guests Page

**Table with columns:**
- Name, Email, Phone, Total Bookings, Total Spent, Last Booking, Actions

**Filters:**
- Search by name/email
- Date range
- Booking count

**Note:** Guest API endpoints missing - implement with local state or mock data

---

### 7. Transactions Page

**Table with columns:**
- Transaction ID, Date, Guest, Property, Amount, Currency, Payment Status, Actions

**Summary cards:**
- Total Revenue
- Pending Payments
- Completed Payments

**Payment Actions:**
- Create payment button
- View transaction details
- Refund option

**API Endpoints:**
- POST `/api/TBCPayment/create` (query: amount, currency, returnUrl)
- GET `/api/TBCPayment/{paymentId}`
- POST `/api/TBCPayment/{paymentId}/cancel` (query: amount)

---

### 8. Profile Page

Display and edit:
- Personal info (name, email, username)
- Change password
- User role/type
- Profile photo

**API Endpoints:**
- GET `/api/Auth/me`
- POST `/api/Auth/assign-usertype` (body: {userId, userType})

---

## Key Features to Implement

1. **Form Validation**: Use Yup schemas, show inline errors
2. **Loading States**: Show spinners/skeletons while loading
3. **Error Handling**: Toast notifications for errors, try-catch all API calls
4. **Responsive Design**: Works on mobile, tablet, desktop
5. **Image Upload**: Drag-drop, preview before upload, multiple files
6. **Date Pickers**: For check-in/out, booking dates
7. **Search/Filters**: Debounced search, dropdown filters
8. **Empty States**: Friendly message when no data
9. **Confirmation Dialogs**: Before delete actions
10. **Breadcrumbs**: Navigation breadcrumbs on detail pages

---

## File Structure

```
src/
├── api/
│   ├── authApi.ts
│   ├── propertyApi.ts
│   └── calendarApi.ts
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── Properties/
│   │   ├── PropertyList.tsx
│   │   ├── PropertyForm.tsx
│   │   └── PropertyCard.tsx
│   └── Common/
│       └── LoadingSpinner.tsx
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
└── App.tsx
```

---

## Implementation Steps

1. **Setup project**: Create React app with TypeScript, install dependencies
2. **Configure Axios**: Create instance with base URL, add auth interceptor
3. **Build authentication**: Login page, token storage, protected routes
4. **Create layout**: Sidebar, header, routing setup
5. **Dashboard home**: Fetch properties, show basic stats
6. **Properties CRUD**: List, create form, edit, delete
7. **Image upload**: Implement photo upload for properties
8. **Rooms management**: Add/edit rooms within properties
9. **Calendar view**: Display calendar with mock bookings
10. **Calendar sync**: Setup external calendar connections
11. **Transactions**: Display list, integrate payment creation
12. **Profile**: Show user info, edit functionality
13. **Polish**: Error handling, loading states, responsive design

---

## Important Notes

- **API Base URL**: Configure in environment variable (e.g., `https://api.example.com`)
- **Authentication**: Include Bearer token in all requests: `Authorization: Bearer {token}`
- **Missing Endpoints**: Booking and Guest CRUD endpoints not available - use mock data
- **Image Upload**: Use `multipart/form-data`, pass entityId and entityType as query params
- **Calendar Sync**: Source enum: 1=Airbnb, 2=Booking.com, 3=Other
- **TBC Payment**: Georgian bank integration - test in sandbox mode
- **Date Format**: Use ISO 8601 for dates, HH:mm:ss for times

---

## Design Guidelines

- **Colors**: Use Material-UI default theme or customize
- **Spacing**: Consistent padding/margins (8px grid system)
- **Typography**: Clear hierarchy, readable font sizes
- **Buttons**: Primary for main actions, outlined for secondary
- **Forms**: Clear labels, helper text, validation messages
- **Tables**: Sortable columns, pagination for large datasets
- **Cards**: Shadow elevation for depth, rounded corners
- **Icons**: Material Icons for consistency

---

## Success Criteria

✅ User can login and see dashboard
✅ User can create/edit/delete properties
✅ User can add rooms to properties
✅ User can upload property photos
✅ User can view booking calendar
✅ User can setup calendar sync
✅ User can view transactions
✅ User can view/edit profile
✅ All forms have validation
✅ Loading states show during API calls
✅ Errors display as toast notifications
✅ Works on mobile devices

---

Start with authentication and basic property management, then expand to other features. Focus on clean code, proper TypeScript typing, and good UX.
