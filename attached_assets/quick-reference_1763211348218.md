# Quick Reference: Dashboard Sections → API Endpoints

## 🏠 Dashboard Home (Overview)
**Data Needed:**
- Total properties count → GET `/api/Property`
- Recent bookings → ⚠️ *Missing* (needs `/api/Booking`)
- Revenue data → ⚠️ *Missing* (calculate from transactions or bookings)
- User info → GET `/api/Auth/me`

---

## 📅 Booking Calendar / Bookings
**Core Features:**
- **Calendar Sync**:
  - GET `/api/Calendar/{propertyId}/syncs` - List connected calendars
  - POST `/api/Calendar/sync` - Add new sync (Airbnb, Booking.com)
  - POST `/api/Calendar/sync/{propertyId}/trigger` - Manual sync
  - DELETE `/api/Calendar/sync/{syncId}` - Remove sync
  - GET `/api/Calendar/export-url/{propertyId}` - Get iCal export URL
  - GET `/api/Calendar/export/{propertyId}` - Download iCal file

- **Bookings** ⚠️ *Missing API*:
  - Need: GET/POST/PUT/DELETE `/api/Booking`
  - Need: GET `/api/Booking/property/{propertyId}`
  - Need: GET `/api/Booking/guest/{guestId}`
  
  *Workaround*: Use Availability system or implement booking endpoints

---

## 🏘️ Properties Management

### Properties
- GET `/api/Property` - List all properties
- POST `/api/Property` - Create property
- GET `/api/Property/{id}` - Get single property
- PUT `/api/Property/{id}` - Update property
- DELETE `/api/Property/{id}` - Delete property

### Property Types
- GET `/api/PropertyType` - List types
- POST `/api/PropertyType` - Create type
- GET `/api/PropertyType/{id}` - Get type
- PUT `/api/PropertyType/{id}` - Update type
- DELETE `/api/PropertyType/{id}` - Delete type

### Rooms
- GET `/api/Room` - List all rooms
- POST `/api/Room` - Create room
- GET `/api/Room/{id}` - Get room
- PUT `/api/Room/{id}` - Update room
- DELETE `/api/Room/{id}` - Delete room

### Room Types
- GET `/api/RoomType` - List types
- POST `/api/RoomType` - Create type
- GET `/api/RoomType/{id}` - Get type
- PUT `/api/RoomType/{id}` - Update type
- DELETE `/api/RoomType/{id}` - Delete type

### Amenities
- GET `/api/Amenity` - List all with categories
- POST `/api/Amenity` - Create amenity
- GET `/api/Amenity/{id}` - Get amenity
- PUT `/api/Amenity/{id}` - Update amenity
- DELETE `/api/Amenity/{id}` - Delete amenity

### Amenity Categories
- GET `/api/AmenityCategory` - List categories
- POST `/api/AmenityCategory` - Create category
- GET `/api/AmenityCategory/{id}` - Get category
- PUT `/api/AmenityCategory/{id}` - Update category
- DELETE `/api/AmenityCategory/{id}` - Delete category

### Location (Cities & Regions)
- GET `/api/Region` - List regions
- GET `/api/Region/with-cities` - Regions with nested cities
- POST `/api/Region` - Create region
- GET `/api/Region/{id}` - Get region
- PUT `/api/Region/{id}` - Update region
- DELETE `/api/Region/{id}` - Delete region

- GET `/api/City` - List cities
- POST `/api/City` - Create city
- GET `/api/City/{id}` - Get city
- PUT `/api/City/{id}` - Update city
- DELETE `/api/City/{id}` - Delete city

### Photos
- POST `/api/Pictures/regular` - Upload regular photo (query: entityId, entityType)
- POST `/api/Pictures/icon` - Upload icon/thumbnail (query: entityId, entityType)
- GET `/api/Pictures` - List all pictures
- GET `/api/Pictures/{id}` - Get picture metadata
- GET `/api/Pictures/{id}/data` - Get picture binary data
- GET `/api/Pictures/entity/{entityType}/{entityId}` - Get entity pictures (query: pictureType)
- DELETE `/api/Pictures/{id}` - Delete picture

### Availability
- GET `/api/Availibility` - List availability statuses
- POST `/api/Availibility` - Create status
- GET `/api/Availibility/{id}` - Get status
- PUT `/api/Availibility/{id}` - Update status
- DELETE `/api/Availibility/{id}` - Delete status

---

## 👥 Guests Table
**Data Needed:**
⚠️ *Missing API* - Guest management endpoints needed:
- Need: GET `/api/Guest` - List guests
- Need: POST `/api/Guest` - Create guest
- Need: GET `/api/Guest/{id}` - Get guest details
- Need: PUT `/api/Guest/{id}` - Update guest
- Need: DELETE `/api/Guest/{id}` - Delete guest

*Workaround*: Extract guest info from Auth/Users or implement guest endpoints

---

## 💰 Transactions Table

### Payment Processing (TBC Bank)
- POST `/api/TBCPayment/create` - Create payment (query: amount, currency, returnUrl, extraInfo, lang)
- GET `/api/TBCPayment/{paymentId}` - Get payment status
- POST `/api/TBCPayment/{paymentId}/cancel` - Cancel/Refund payment (query: amount)
- GET `/api/TBCPayment/callback` - Payment callback handler

**Additional Data:**
⚠️ *May need* transaction history endpoints:
- Need: GET `/api/Transaction` - List all transactions
- Need: GET `/api/Transaction/property/{propertyId}` - Property transactions
- Need: GET `/api/Transaction/booking/{bookingId}` - Booking transactions

---

## 👤 Profile

### User Information
- GET `/api/Auth/me` - Get current user profile
- POST `/api/Auth/assign-usertype` - Assign/change user role (body: userId, userType)

**Additional Needed:**
⚠️ *Missing*:
- Need: PUT `/api/Auth/profile` - Update profile
- Need: POST `/api/Auth/change-password` - Change password
- Need: POST `/api/Auth/upload-avatar` - Upload profile picture

---

## 🔐 Authentication

### Core Auth
- POST `/api/Auth/login` - User login (body: email, password)
- POST `/api/Auth/register` - Register new user (body: email, password, firstName, lastName, username)
- GET `/api/Auth/me` - Get current user
- POST `/api/Auth/assign-usertype` - Assign user role

---

## 📊 Common Query Patterns

### Get Property with Full Details
```
1. GET /api/Property/{id}
2. GET /api/Room?propertyId={id}
3. GET /api/Pictures/entity/Property/{id}
4. GET /api/PropertyType/{propertyTypeId}
5. GET /api/City/{cityId}
6. GET /api/Availibility/{availibilityId}
```

### Setup New Property Flow
```
1. POST /api/Property → Get propertyId
2. POST /api/Room (for each room) → Link to propertyId
3. POST /api/Pictures/regular (multiple) → Link to Property/{propertyId}
4. POST /api/Pictures/icon → Set property thumbnail
```

### Calendar Integration Flow
```
1. POST /api/Calendar/sync → Setup sync for property
2. POST /api/Calendar/sync/{propertyId}/trigger → Trigger manual sync
3. GET /api/Calendar/{propertyId}/syncs → Verify sync status
4. GET /api/Calendar/export-url/{propertyId} → Share iCal URL
```

---

## ⚠️ Missing API Endpoints Summary

To fully implement the dashboard, you'll need these additional endpoints:

### High Priority:
1. **Booking/Reservation System**:
   - CRUD operations for bookings
   - Availability checking
   - Booking status management
   - Price calculation

2. **Guest Management**:
   - CRUD operations for guests
   - Guest booking history
   - Guest search

3. **Transaction History**:
   - List all transactions
   - Transaction filtering
   - Financial reports

### Medium Priority:
4. **User Profile Updates**:
   - Update profile information
   - Change password
   - Upload avatar

5. **Dashboard Analytics**:
   - Aggregated statistics
   - Revenue calculations
   - Occupancy rates

### Low Priority:
6. **Notifications**:
   - Notification preferences
   - Email templates
   - Push notifications

---

## 🎯 Implementation Tips

1. **Start with Reference Data**: Load cities, regions, property types, room types, amenities first
2. **Property Management First**: Get property CRUD working before bookings
3. **Mock Bookings Initially**: Use static data for bookings until endpoints are ready
4. **Use React Query**: Cache reference data, auto-refresh bookings/transactions
5. **Optimistic Updates**: Update UI immediately, rollback on error
6. **Error Boundaries**: Wrap each major section in error boundary
7. **Loading Skeletons**: Show loading states for better UX
8. **Image Optimization**: Compress images before upload, lazy load in galleries

---

## 📝 TypeScript Type Examples

```typescript
// Property Type
interface Property {
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
  checkInTime: string; // "HH:mm:ss"
  checkOutTime: string; // "HH:mm:ss"
}

// Room Type
interface Room {
  id: number;
  propertyId: number;
  roomTypeId: number;
  availibilityId: number;
  capacity: number | null;
  bedsCount: number | null;
  description: string;
}

// Picture Type
interface Picture {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  pictureType: 'Icon' | 'Regular';
  entityId: number;
  entityType: 'Property' | 'Room';
  uploadedAt: string; // ISO date
  url: string;
}

// Calendar Sync Type
interface CalendarSync {
  propertyId: number;
  source: 1 | 2 | 3; // 1=Airbnb, 2=Booking, 3=Other
  importUrl: string;
  sourceName: string;
}

// Payment Type
interface Payment {
  amount: number;
  currency: string;
  returnUrl: string;
  extraInfo?: string;
  lang?: string;
}
```

---

## 🚀 Quick Start Checklist

- [ ] Setup authentication (login/register)
- [ ] Fetch and cache reference data (cities, types, etc.)
- [ ] Implement property list page
- [ ] Implement property create/edit form
- [ ] Add image upload for properties
- [ ] Implement room management
- [ ] Add calendar sync setup
- [ ] Create booking calendar view (with mock data initially)
- [ ] Implement transactions table with TBC payment
- [ ] Add profile page
- [ ] Setup error handling and loading states
- [ ] Add responsive design for mobile
- [ ] Test all CRUD operations
- [ ] Deploy and test in staging environment

---

This quick reference should help you quickly identify which API endpoints to use for each dashboard feature!
