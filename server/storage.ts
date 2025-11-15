import { 
  type User, 
  type InsertUser,
  type Property,
  type PropertyType,
  type City,
  type Amenity,
  type AmenityCategory,
  type Room,
  type RoomType,
  type Picture,
  type Availability,
  users,
  properties,
  propertyTypes,
  cities,
  amenities,
  amenityCategories,
  rooms,
  roomTypes,
  pictures,
  availabilities,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property methods
  getAllProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>;
  updateProperty(id: number, property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
  deleteProperty(id: number): Promise<void>;
  
  // Property Type methods
  getAllPropertyTypes(): Promise<PropertyType[]>;
  
  // City methods
  getAllCities(): Promise<City[]>;
  
  // Amenity methods
  getAllAmenities(): Promise<Amenity[]>;
  getAmenityCategories(): Promise<AmenityCategory[]>;
  
  // Room methods
  getRoomsByProperty(propertyId: number): Promise<Room[]>;
  createRoom(room: Omit<Room, 'id'>): Promise<number>;
  updateRoom(id: number, room: Omit<Room, 'id'>): Promise<void>;
  deleteRoom(id: number): Promise<void>;
  getRoomTypes(): Promise<RoomType[]>;
  
  // Picture methods
  getPicturesByEntity(entityType: "Property" | "Room", entityId: number): Promise<Picture[]>;
  createPicture(picture: Omit<Picture, 'id' | 'uploadedAt'>): Promise<Picture>;
  deletePicture(id: number): Promise<void>;
  
  // Availability methods
  getAllAvailabilities(): Promise<Availability[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Property methods
  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }
  
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }
  
  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const [created] = await db.insert(properties).values(property).returning();
    return created.id;
  }
  
  async updateProperty(id: number, property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await db.update(properties).set(property).where(eq(properties.id, id));
  }
  
  async deleteProperty(id: number): Promise<void> {
    // Delete associated rooms and pictures
    await db.delete(rooms).where(eq(rooms.propertyId, id));
    await db.delete(pictures).where(eq(pictures.entityId, id));
    await db.delete(properties).where(eq(properties.id, id));
  }
  
  // Property Type methods
  async getAllPropertyTypes(): Promise<PropertyType[]> {
    return await db.select().from(propertyTypes);
  }
  
  // City methods
  async getAllCities(): Promise<City[]> {
    return await db.select().from(cities);
  }
  
  // Amenity methods
  async getAllAmenities(): Promise<Amenity[]> {
    return await db.select().from(amenities);
  }
  
  async getAmenityCategories(): Promise<AmenityCategory[]> {
    return await db.select().from(amenityCategories);
  }
  
  // Room methods
  async getRoomsByProperty(propertyId: number): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.propertyId, propertyId));
  }
  
  async createRoom(room: Omit<Room, 'id'>): Promise<number> {
    const [created] = await db.insert(rooms).values(room).returning();
    return created.id;
  }
  
  async updateRoom(id: number, room: Omit<Room, 'id'>): Promise<void> {
    await db.update(rooms).set(room).where(eq(rooms.id, id));
  }
  
  async deleteRoom(id: number): Promise<void> {
    await db.delete(pictures).where(eq(pictures.entityId, id));
    await db.delete(rooms).where(eq(rooms.id, id));
  }
  
  async getRoomTypes(): Promise<RoomType[]> {
    return await db.select().from(roomTypes);
  }
  
  // Picture methods
  async getPicturesByEntity(entityType: "Property" | "Room", entityId: number): Promise<Picture[]> {
    return await db.select().from(pictures)
      .where(eq(pictures.entityType, entityType))
      .where(eq(pictures.entityId, entityId));
  }
  
  async createPicture(picture: Omit<Picture, 'id' | 'uploadedAt'>): Promise<Picture> {
    const [created] = await db.insert(pictures).values(picture).returning();
    return created;
  }
  
  async deletePicture(id: number): Promise<void> {
    await db.delete(pictures).where(eq(pictures.id, id));
  }
  
  // Availability methods
  async getAllAvailabilities(): Promise<Availability[]> {
    return await db.select().from(availabilities);
  }
}

// Seed function to populate reference tables
export async function seedDatabase() {
  try {
    // Check if already seeded
    const existingTypes = await db.select().from(propertyTypes);
    if (existingTypes.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Seed availabilities
    await db.insert(availabilities).values([
      { name: "Available" },
      { name: "Unavailable" },
    ]);

    // Seed property types
    await db.insert(propertyTypes).values([
      { name: "Apartment", iconUrl: "🏢", displayOrder: 1 },
      { name: "House", iconUrl: "🏠", displayOrder: 2 },
      { name: "Villa", iconUrl: "🏡", displayOrder: 3 },
      { name: "Condo", iconUrl: "🏘️", displayOrder: 4 },
      { name: "Studio", iconUrl: "🚪", displayOrder: 5 },
      { name: "Cottage", iconUrl: "🛖", displayOrder: 6 },
    ]);
    
    // Seed cities
    await db.insert(cities).values([
      { name: "Batumi", displayOrder: 1, regionId: 1 },
      { name: "Tbilisi", displayOrder: 2, regionId: 1 },
      { name: "Kutaisi", displayOrder: 3, regionId: 2 },
      { name: "Rustavi", displayOrder: 4, regionId: 3 },
      { name: "Gori", displayOrder: 5, regionId: 3 },
    ]);
    
    // Seed amenity categories
    await db.insert(amenityCategories).values([
      { name: "Kitchen & Dining" },
      { name: "Bathroom" },
      { name: "Entertainment" },
      { name: "Comfort" },
      { name: "Safety & Security" },
    ]);
    
    // Seed amenities
    await db.insert(amenities).values([
      { name: "WiFi", icon: "📶", amenityCategoryId: 3, category: "Entertainment" },
      { name: "Kitchen", icon: "🍳", amenityCategoryId: 1, category: "Kitchen & Dining" },
      { name: "Coffee Maker", icon: "☕", amenityCategoryId: 1, category: "Kitchen & Dining" },
      { name: "Dishwasher", icon: "🍽️", amenityCategoryId: 1, category: "Kitchen & Dining" },
      { name: "Hot Water", icon: "🚿", amenityCategoryId: 2, category: "Bathroom" },
      { name: "Bathtub", icon: "🛁", amenityCategoryId: 2, category: "Bathroom" },
      { name: "Shower", icon: "🚿", amenityCategoryId: 2, category: "Bathroom" },
      { name: "TV", icon: "📺", amenityCategoryId: 3, category: "Entertainment" },
      { name: "Netflix", icon: "🎬", amenityCategoryId: 3, category: "Entertainment" },
      { name: "Board Games", icon: "🎲", amenityCategoryId: 3, category: "Entertainment" },
      { name: "Air Conditioning", icon: "❄️", amenityCategoryId: 4, category: "Comfort" },
      { name: "Heating", icon: "🔥", amenityCategoryId: 4, category: "Comfort" },
      { name: "Washer", icon: "🧺", amenityCategoryId: 4, category: "Comfort" },
      { name: "Dryer", icon: "🌀", amenityCategoryId: 4, category: "Comfort" },
      { name: "Smoke Detector", icon: "🚨", amenityCategoryId: 5, category: "Safety & Security" },
      { name: "Fire Extinguisher", icon: "🧯", amenityCategoryId: 5, category: "Safety & Security" },
    ]);
    
    // Seed room types
    await db.insert(roomTypes).values([
      { name: "Bedroom", iconUrl: "🛏️", displayOrder: 1 },
      { name: "Living Room", iconUrl: "🛋️", displayOrder: 2 },
      { name: "Kitchen", iconUrl: "🍳", displayOrder: 3 },
      { name: "Bathroom", iconUrl: "🚿", displayOrder: 4 },
    ]);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export const storage = new DatabaseStorage();
