// Booking Status Colors
export const BOOKING_STATUS_COLORS = {
  confirmed: 'hsl(142, 76%, 36%)', // green
  pending: 'hsl(43, 96%, 56%)', // yellow/orange
  cancelled: 'hsl(0, 84%, 60%)', // red
  completed: 'hsl(217, 91%, 60%)', // blue
} as const;

export const BOOKING_STATUSES = [
  { value: 'confirmed', label: 'Confirmed', color: BOOKING_STATUS_COLORS.confirmed },
  { value: 'pending', label: 'Pending', color: BOOKING_STATUS_COLORS.pending },
  { value: 'cancelled', label: 'Cancelled', color: BOOKING_STATUS_COLORS.cancelled },
  { value: 'completed', label: 'Completed', color: BOOKING_STATUS_COLORS.completed },
] as const;

// Calendar Sync Sources
export const CALENDAR_SOURCES = {
  AIRBNB: 1,
  BOOKING_COM: 2,
  OTHER: 3,
} as const;

export const CALENDAR_SOURCE_NAMES = {
  [CALENDAR_SOURCES.AIRBNB]: 'Airbnb',
  [CALENDAR_SOURCES.BOOKING_COM]: 'Booking.com',
  [CALENDAR_SOURCES.OTHER]: 'Other',
} as const;

// Picture Types
export const PICTURE_TYPES = {
  ICON: 'Icon',
  REGULAR: 'Regular',
} as const;

// Entity Types
export const ENTITY_TYPES = {
  PROPERTY: 'Property',
  ROOM: 'Room',
} as const;

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MAX_FILES: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// User Types
export const USER_TYPES = {
  GUEST: 'Guest',
  HOST: 'Host',
  ADMIN: 'Admin',
} as const;

// Payment Statuses
export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
} as const;

// Default Values
export const DEFAULTS = {
  CHECK_IN_TIME: '14:00:00',
  CHECK_OUT_TIME: '11:00:00',
  MIN_NIGHTS: 1,
  MAX_NIGHTS: 30,
  CURRENCY: 'GEL',
  LANGUAGE: 'KA',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;
