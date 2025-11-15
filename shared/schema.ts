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
// PROPERTIES & PROPERTY MANAGEMENT
// ============================================================================

export const properties = pgTable("properties", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  hostId: varchar("host_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  propertyTypeId: integer("property_type_id").notNull(),
  availabilityId: integer("availability_id").default(1),
  address: text("address").notNull(),
  cityId: integer("city_id").notNull(),
  mapLocation: text("map_location"),
  price: integer("price").notNull(),
  minNight: integer("min_night").default(1),
  maxNight: integer("max_night").default(30),
  checkInTime: text("check_in_time").default("14:00:00"),
  checkOutTime: text("check_out_time").default("11:00:00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyTypes = pgTable("property_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  iconUrl: text("icon_url").notNull(),
  displayOrder: integer("display_order").default(0),
});

export const cities = pgTable("cities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  displayOrder: integer("display_order").default(0),
  regionId: integer("region_id").notNull(),
});

export const amenities = pgTable("amenities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  amenityCategoryId: integer("amenity_category_id").notNull(),
  category: text("category"),
});

export const amenityCategories = pgTable("amenity_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
});

export const roomTypes = pgTable("room_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  iconUrl: text("icon_url").notNull(),
  displayOrder: integer("display_order").default(0),
});

export const rooms = pgTable("rooms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  propertyId: integer("property_id").notNull(),
  roomTypeId: integer("room_type_id").notNull(),
  availabilityId: integer("availability_id").default(1),
  capacity: integer("capacity"),
  bedsCount: integer("beds_count"),
  description: text("description"),
});

export const availabilities = pgTable("availabilities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
});

export const pictures = pgTable("pictures", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  fileSize: integer("file_size").notNull(),
  pictureType: text("picture_type").notNull(), // "Icon" or "Regular"
  entityId: integer("entity_id").notNull(),
  entityType: text("entity_type").notNull(), // "Property" or "Room"
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  url: text("url").notNull(),
});

export type Property = typeof properties.$inferSelect;
export type PropertyType = typeof propertyTypes.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Amenity = typeof amenities.$inferSelect;
export type AmenityCategory = typeof amenityCategories.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type RoomType = typeof roomTypes.$inferSelect;
export type Availability = typeof availabilities.$inferSelect;
export type Picture = typeof pictures.$inferSelect;

// Region (not in database, just for reference)
export interface Region {
  id: number;
  name: string;
  displayOrder: number;
  cities?: City[];
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
