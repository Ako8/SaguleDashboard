# Property Booking System API Documentation

## Base Information
- **API Title**: Booking API
- **Version**: v1
- **Description**: Property Booking System API
- **Authentication**: Bearer Token (JWT)

---

## API Endpoints Overview

### 1. AUTHENTICATION & USER MANAGEMENT

#### POST /api/Auth/login
**Purpose**: User login
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**: 200 OK (Returns authentication token)

#### POST /api/Auth/register
**Purpose**: Register new user
**Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "username": "string"
}
```
**Response**: 200 OK

#### POST /api/Auth/assign-usertype
**Purpose**: Assign user role/type
**Request Body**:
```json
{
  "userId": "integer",
  "userType": "string"
}
```
**Response**: 200 OK

#### GET /api/Auth/me
**Purpose**: Get current user profile
**Response**: 200 OK (Returns user information)

---

### 2. PROPERTY MANAGEMENT

#### GET /api/Property
**Purpose**: Get all properties
**Response**: Array of properties with full details
**Data Structure**:
```json
[
  {
    "id": "integer",
    "hostId": "integer",
    "name": "string",
    "description": "string",
    "propertyTypeId": "integer",
    "availibilityId": "integer",
    "address": "string",
    "cityId": "integer",
    "mapLocation": "string",
    "price": "integer",
    "minNight": "integer",
    "maxNight": "integer",
    "checkInTime": "timespan",
    "checkOutTime": "timespan"
  }
]
```

#### POST /api/Property
**Purpose**: Create new property
**Request Body**: Same structure as GET response (without id)
**Response**: 201 Created, returns property ID

#### GET /api/Property/{id}
**Purpose**: Get single property by ID
**Parameters**: id (path, integer)
**Response**: 200 OK or 404 Not Found

#### PUT /api/Property/{id}
**Purpose**: Update property
**Parameters**: id (path, integer)
**Request Body**: Full property object
**Response**: 204 No Content, 400 Bad Request, or 404 Not Found

#### DELETE /api/Property/{id}
**Purpose**: Delete property
**Parameters**: id (path, integer)
**Response**: 204 No Content or 404 Not Found

---

### 3. PROPERTY TYPES

#### GET /api/PropertyType
**Purpose**: Get all property types (apartment, house, villa, etc.)
**Response**: Array of property types
```json
[
  {
    "name": "string",
    "iconUrl": "string",
    "displayOrder": "integer"
  }
]
```

#### POST /api/PropertyType
**Purpose**: Create new property type
**Response**: 201 Created, returns ID

#### GET /api/PropertyType/{id}
**Purpose**: Get property type by ID
**Response**: Detailed property type object

#### PUT /api/PropertyType/{id}
**Purpose**: Update property type

#### DELETE /api/PropertyType/{id}
**Purpose**: Delete property type

---

### 4. ROOM MANAGEMENT

#### GET /api/Room
**Purpose**: Get all rooms
**Response**: Array of rooms
```json
[
  {
    "id": "integer",
    "propertyId": "integer",
    "roomTypeId": "integer",
    "availibilityId": "integer",
    "capacity": "integer (nullable)",
    "bedsCount": "integer (nullable)",
    "description": "string"
  }
]
```

#### POST /api/Room
**Purpose**: Create new room
**Request Body**: Room object without id
**Response**: 201 Created, returns room ID

#### GET /api/Room/{id}
**Purpose**: Get room by ID

#### PUT /api/Room/{id}
**Purpose**: Update room

#### DELETE /api/Room/{id}
**Purpose**: Delete room

---

### 5. ROOM TYPES

#### GET /api/RoomType
**Purpose**: Get all room types (bedroom, bathroom, living room, etc.)
**Response**: Array of room types with icons

#### POST /api/RoomType
**Purpose**: Create room type

#### GET /api/RoomType/{id}
**Purpose**: Get room type by ID

#### PUT /api/RoomType/{id}
**Purpose**: Update room type

#### DELETE /api/RoomType/{id}
**Purpose**: Delete room type

---

### 6. LOCATION MANAGEMENT

#### REGIONS

**GET /api/Region**
- Get all regions
- Response: Array of `{id, name}`

**GET /api/Region/with-cities**
- Get all regions with their cities nested
- Response: Array with cities included

**POST /api/Region**
- Create new region
- Body: `{name: string, displayOrder: integer}`

**GET /api/Region/{id}**
- Get region by ID

**PUT /api/Region/{id}**
- Update region

**DELETE /api/Region/{id}**
- Delete region

#### CITIES

**GET /api/City**
- Get all cities
- Response: `{id, name, displayOrder, regionId}`

**POST /api/City**
- Create new city

**GET /api/City/{id}**
- Get city by ID

**PUT /api/City/{id}**
- Update city

**DELETE /api/City/{id}**
- Delete city

---

### 7. AMENITIES

#### GET /api/Amenity
**Purpose**: Get all amenities with categories
**Response**: Array of amenities
```json
[
  {
    "id": "integer",
    "name": "string",
    "icon": "string",
    "category": "string"
  }
]
```

#### POST /api/Amenity
**Purpose**: Create amenity
**Request Body**:
```json
{
  "name": "string",
  "icon": "string",
  "amenityCategoryId": "integer"
}
```

#### GET /api/Amenity/{id}
**Purpose**: Get amenity by ID

#### PUT /api/Amenity/{id}
**Purpose**: Update amenity

#### DELETE /api/Amenity/{id}
**Purpose**: Delete amenity

---

### 8. AMENITY CATEGORIES

#### GET /api/AmenityCategory
**Purpose**: Get all amenity categories
**Response**: `{id, name}`

#### POST /api/AmenityCategory
**Purpose**: Create category

#### GET /api/AmenityCategory/{id}
**Purpose**: Get category by ID

#### PUT /api/AmenityCategory/{id}
**Purpose**: Update category

#### DELETE /api/AmenityCategory/{id}
**Purpose**: Delete category

---

### 9. AVAILABILITY

#### GET /api/Availibility
**Purpose**: Get all availability statuses
**Response**: `{id, name}`

#### POST /api/Availibility
**Purpose**: Create availability status

#### GET /api/Availibility/{id}
**Purpose**: Get availability by ID

#### PUT /api/Availibility/{id}
**Purpose**: Update availability

#### DELETE /api/Availibility/{id}
**Purpose**: Delete availability

---

### 10. CALENDAR INTEGRATION

#### POST /api/Calendar/sync
**Purpose**: Add calendar sync (iCal import from other platforms)
**Request Body**:
```json
{
  "propertyId": "integer",
  "source": "integer (1=Airbnb, 2=Booking, 3=Other)",
  "importUrl": "string (iCal URL)",
  "sourceName": "string"
}
```
**Response**: 200 OK, returns sync ID

#### POST /api/Calendar/sync/{propertyId}/trigger
**Purpose**: Manually trigger calendar sync for a property
**Response**: 200 OK

#### GET /api/Calendar/export-url/{propertyId}
**Purpose**: Get iCal export URL for a property
**Response**: 200 OK, returns URL string

#### GET /api/Calendar/export/{propertyId}
**Purpose**: Export calendar in iCal format
**Response**: 200 OK (iCal file)

#### GET /api/Calendar/{propertyId}/syncs
**Purpose**: Get all calendar syncs for a property
**Response**: 200 OK, array of syncs

#### DELETE /api/Calendar/sync/{syncId}
**Purpose**: Remove calendar sync
**Response**: 200 OK

---

### 11. PICTURE MANAGEMENT

#### POST /api/Pictures/regular
**Purpose**: Upload regular property/room picture
**Parameters**:
- entityId (query, integer) - ID of property/room
- entityType (query, string) - "Property" or "Room"
**Request Body**: multipart/form-data with file
**Response**: 201 Created, returns picture object

#### POST /api/Pictures/icon
**Purpose**: Upload icon/thumbnail picture
**Parameters**: Same as regular
**Response**: 201 Created

#### GET /api/Pictures/{id}
**Purpose**: Get picture metadata by ID
**Response**: Picture object

#### GET /api/Pictures/{id}/data
**Purpose**: Get actual picture file/data
**Response**: 200 OK (binary image data)

#### GET /api/Pictures
**Purpose**: Get all pictures
**Response**: Array of picture objects

#### GET /api/Pictures/entity/{entityType}/{entityId}
**Purpose**: Get all pictures for specific entity
**Parameters**:
- entityType (path, string) - "Property" or "Room"
- entityId (path, integer)
- pictureType (query, optional) - 1=Icon, 2=Regular
**Response**: Array of pictures

#### DELETE /api/Pictures/{id}
**Purpose**: Delete picture
**Response**: 204 No Content

**Picture Object Structure**:
```json
{
  "id": "integer",
  "fileName": "string",
  "contentType": "string",
  "fileSize": "integer",
  "pictureType": "string (Icon/Regular)",
  "entityId": "integer",
  "entityType": "string",
  "uploadedAt": "datetime",
  "url": "string"
}
```

---

### 12. PAYMENT (TBC Bank Integration)

#### POST /api/TBCPayment/create
**Purpose**: Create payment transaction
**Parameters** (query):
- amount (number)
- currency (string, default: "GEL")
- returnUrl (string)
- extraInfo (string, optional)
- lang (string, default: "KA")
**Response**: 200 OK (returns payment URL/ID)

#### GET /api/TBCPayment/{paymentId}
**Purpose**: Get payment status
**Response**: 200 OK (payment details)

#### POST /api/TBCPayment/{paymentId}/cancel
**Purpose**: Cancel/refund payment
**Parameters**:
- paymentId (path)
- amount (query, number)
**Response**: 200 OK

#### GET /api/TBCPayment/callback
**Purpose**: Payment callback handler (webhook)
**Parameters**:
- paymentId (query)
**Response**: 200 OK

---

## Data Models & Enums

### RecordStatusEnum
- 0 = Active
- 1 = Inactive
- 2 = Deleted

### CalendarSource
- 1 = Airbnb
- 2 = Booking.com
- 3 = Other

### PictureType
- 1 = Icon
- 2 = Regular

---

## Response Status Codes

- **200 OK**: Success
- **201 Created**: Resource created successfully
- **204 No Content**: Success with no return data
- **400 Bad Request**: Validation error
- **404 Not Found**: Resource not found

---

## Common Error Response
```json
{
  "type": "string",
  "title": "string",
  "status": "integer",
  "detail": "string",
  "instance": "string"
}
```

---

## Authentication Flow

1. POST to `/api/Auth/register` to create account
2. POST to `/api/Auth/login` to get Bearer token
3. Include token in all subsequent requests:
   - Header: `Authorization: Bearer {token}`
4. Use `/api/Auth/me` to verify authentication
5. Use `/api/Auth/assign-usertype` to assign roles (Host, Guest, Admin)

---

## Typical Data Flow for Property Management

1. **Setup Location**: Create Region → Create City
2. **Setup Types**: Create PropertyType, RoomType, AmenityCategory
3. **Create Property**: POST to `/api/Property` with all details
4. **Add Rooms**: POST to `/api/Room` for each room in property
5. **Upload Pictures**: POST to `/api/Pictures/regular` or `/api/Pictures/icon`
6. **Set Availability**: Link to availability status
7. **Sync Calendar**: POST to `/api/Calendar/sync` for external platforms

---

## Notes for AI Implementation

1. All IDs are integers (int32)
2. Dates use ISO 8601 format
3. Times use timespan format (HH:mm:ss)
4. Authentication required for most endpoints (Bearer token)
5. File uploads use multipart/form-data
6. Calendar integration supports iCal format
7. Payment integration is specific to TBC Bank (Georgian bank)
8. Pictures are linked to entities via entityType and entityId
9. Soft delete pattern used (RecordStatusEnum)
10. Display order fields control UI sorting

---

## Missing Endpoints (Likely Needed)

Based on typical booking systems, you may need to add:
- Booking/Reservation CRUD operations
- Guest management endpoints
- Transaction/Payment history
- Reviews/Ratings
- Booking calendar availability queries
- Price management (seasonal pricing, discounts)
- Booking status tracking
