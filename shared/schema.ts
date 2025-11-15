import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  userType: text("user_type"), // Guest, Host, Admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ============================================================================
// BOOKINGS (Local database - not in external API)
// ============================================================================

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: integer("property_id").notNull(), // Reference to external API property
  guestId: varchar("guest_id").references(() => guests.id),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  totalAmount: integer("total_amount"), // in cents
  status: text("status").notNull(), // confirmed, pending, cancelled, completed
  specialRequests: text("special_requests"),
  bookingSource: text("booking_source"), // direct, airbnb, booking.com
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// ============================================================================
// GUESTS (Local database - not in external API)
// ============================================================================

export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;

// ============================================================================
// TYPESCRIPT INTERFACES FOR EXTERNAL API DATA
// These don't have database tables - they come from the external API
// ============================================================================

// Property from external API
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
  checkInTime: string; // timespan format "HH:mm:ss"
  checkOutTime: string; // timespan format "HH:mm:ss"
}

export interface PropertyType {
  id: number;
  name: string;
  iconUrl: string;
  displayOrder: number;
}

// Room from external API
export interface Room {
  id: number;
  propertyId: number;
  roomTypeId: number;
  availibilityId: number;
  capacity: number | null;
  bedsCount: number | null;
  description: string;
}

export interface RoomType {
  id: number;
  name: string;
  iconUrl: string;
  displayOrder: number;
}

// Location data
export interface City {
  id: number;
  name: string;
  displayOrder: number;
  regionId: number;
}

export interface Region {
  id: number;
  name: string;
  displayOrder: number;
  cities?: City[]; // Optional, for nested response
}

// Amenities
export interface Amenity {
  id: number;
  name: string;
  icon: string;
  amenityCategoryId: number;
  category?: string; // Optional, included in some responses
}

export interface AmenityCategory {
  id: number;
  name: string;
}

// Availability
export interface Availability {
  id: number;
  name: string;
}

// Pictures
export interface Picture {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  pictureType: "Icon" | "Regular";
  entityId: number;
  entityType: "Property" | "Room";
  uploadedAt: string;
  url: string;
}

// Calendar Sync
export interface CalendarSync {
  id?: number;
  propertyId: number;
  source: 1 | 2 | 3; // 1=Airbnb, 2=Booking.com, 3=Other
  importUrl: string;
  sourceName: string;
  lastSyncTime?: string;
}

export type CalendarSource = 1 | 2 | 3;

// Payment/Transaction
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  extraInfo?: string;
}

// Auth
export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    userType?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const propertyFormSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  description: z.string().optional(),
  propertyTypeId: z.number().min(1, "Property type is required"),
  address: z.string().min(1, "Address is required"),
  cityId: z.number().min(1, "City is required"),
  mapLocation: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  minNight: z.number().min(1, "Minimum nights must be at least 1").default(1),
  maxNight: z.number().min(1, "Maximum nights must be at least 1").default(30),
  checkInTime: z.string().default("14:00:00"),
  checkOutTime: z.string().default("11:00:00"),
  availibilityId: z.number().optional(),
});

export const roomFormSchema = z.object({
  roomTypeId: z.number().min(1, "Room type is required"),
  capacity: z.number().min(1).optional(),
  bedsCount: z.number().min(0).optional(),
  description: z.string().optional(),
  availibilityId: z.number().optional(),
});

export const guestFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const bookingFormSchema = z.object({
  propertyId: z.number().min(1, "Property is required"),
  guestId: z.string().min(1, "Guest is required"),
  checkIn: z.date(),
  checkOut: z.date(),
  numberOfGuests: z.number().min(1, "At least 1 guest required"),
  totalAmount: z.number().min(0).optional(),
  status: z.enum(["confirmed", "pending", "cancelled", "completed"]).default("pending"),
  specialRequests: z.string().optional(),
  bookingSource: z.string().optional(),
});
