import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { insertUserSchema, propertyFormSchema } from "@shared/schema";

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and WEBP are allowed.'));
    }
  },
});

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.SESSION_SECRET || "default-secret-key-change-in-production";

// Helper function to extract user ID from JWT token
function getUserIdFromToken(tokenPayload: any): string | null {
  // Try different possible claim paths
  if (tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) {
    return tokenPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'].toString();
  }
  if (tokenPayload.userId) {
    return tokenPayload.userId.toString();
  }
  if (tokenPayload.sub) {
    return tokenPayload.sub.toString();
  }
  if (tokenPayload.id) {
    return tokenPayload.id.toString();
  }
  return null;
}

// Middleware to verify JWT token
export function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // Store the decoded token and extract user ID
    const userId = getUserIdFromToken(decoded);
    (req as any).user = {
      ...decoded,
      userId: userId,
    };
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================

  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const username = email.split('@')[0]; // Use email prefix as username
      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        userType: 'Host',
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in token' });
      }
      
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Logout (client-side will handle token removal)
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
  });

  // ============================================================================
  // STUB DATA ENDPOINTS (Mock data for development)
  // ============================================================================

  // Get dashboard analytics
  app.get("/api/dashboard/analytics", authenticateToken, (req: Request, res: Response) => {
    res.json({
      totalProperties: 12,
      activeBookings: 28,
      monthlyRevenue: 45600,
      occupancyRate: 78,
    });
  });

  // Get revenue data
  app.get("/api/dashboard/revenue", authenticateToken, (req: Request, res: Response) => {
    res.json([
      { month: 'Jan', revenue: 32000 },
      { month: 'Feb', revenue: 38000 },
      { month: 'Mar', revenue: 42000 },
      { month: 'Apr', revenue: 39000 },
      { month: 'May', revenue: 44000 },
      { month: 'Jun', revenue: 45600 },
    ]);
  });

  // Get booking status distribution
  app.get("/api/dashboard/booking-status", authenticateToken, (req: Request, res: Response) => {
    res.json([
      { name: 'Confirmed', value: 15 },
      { name: 'Pending', value: 5 },
      { name: 'Cancelled', value: 3 },
      { name: 'Completed', value: 5 },
    ]);
  });

  // Get recent bookings
  app.get("/api/dashboard/recent-bookings", authenticateToken, (req: Request, res: Response) => {
    res.json([
      {
        id: 1,
        guestName: 'John Smith',
        property: 'Sunset Villa',
        checkIn: '2024-12-20',
        checkOut: '2024-12-25',
        status: 'confirmed',
        amount: 1200,
      },
      {
        id: 2,
        guestName: 'Emma Johnson',
        property: 'Beach House',
        checkIn: '2024-12-18',
        checkOut: '2024-12-22',
        status: 'confirmed',
        amount: 980,
      },
      {
        id: 3,
        guestName: 'Michael Brown',
        property: 'Mountain Retreat',
        checkIn: '2024-12-15',
        checkOut: '2024-12-20',
        status: 'pending',
        amount: 1500,
      },
      {
        id: 4,
        guestName: 'Sarah Davis',
        property: 'City Apartment',
        checkIn: '2024-12-10',
        checkOut: '2024-12-12',
        status: 'completed',
        amount: 450,
      },
      {
        id: 5,
        guestName: 'James Wilson',
        property: 'Lake Cottage',
        checkIn: '2024-12-25',
        checkOut: '2024-12-30',
        status: 'cancelled',
        amount: 800,
      },
    ]);
  });

  // ============================================================================
  // PROPERTY MANAGEMENT ROUTES
  // ============================================================================

  // Get all properties
  app.get("/api/property", authenticateToken, async (req: Request, res: Response) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error('Error getting properties:', error);
      res.status(500).json({ message: 'Failed to get properties' });
    }
  });

  // Get single property
  app.get("/api/property/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      res.json(property);
    } catch (error) {
      console.error('Error getting property:', error);
      res.status(500).json({ message: 'Failed to get property' });
    }
  });

  // Create property
  app.post("/api/property", authenticateToken, async (req: Request, res: Response) => {
    try {
      // Use hostId from payload if provided, otherwise extract from token
      const userId = req.body.hostId || (req as any).user.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in token or payload' });
      }
      
      // Validate request body
      const validation = propertyFormSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: validation.error.errors 
        });
      }

      const propertyData = {
        ...validation.data,
        hostId: userId,
        description: validation.data.description ?? null,
        mapLocation: validation.data.mapLocation || null,
        availabilityId: 1,
      };

      const propertyId = await storage.createProperty(propertyData);
      res.status(201).json({ id: propertyId });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ message: 'Failed to create property' });
    }
  });

  // Update property
  app.put("/api/property/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User ID not found in token' });
      }
      
      // Validate request body
      const validation = propertyFormSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: validation.error.errors 
        });
      }

      const propertyData = {
        ...validation.data,
        hostId: userId,
        description: validation.data.description ?? null,
        mapLocation: validation.data.mapLocation || null,
        availabilityId: validation.data.availibilityId || 1,
      };

      await storage.updateProperty(id, propertyData);
      res.status(204).send();
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ message: 'Failed to update property' });
    }
  });

  // Delete property
  app.delete("/api/property/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProperty(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ message: 'Failed to delete property' });
    }
  });

  // Get property types
  app.get("/api/propertytype", authenticateToken, async (req: Request, res: Response) => {
    try {
      const propertyTypes = await storage.getAllPropertyTypes();
      res.json(propertyTypes);
    } catch (error) {
      console.error('Error getting property types:', error);
      res.status(500).json({ message: 'Failed to get property types' });
    }
  });

  // Get cities
  app.get("/api/city", authenticateToken, async (req: Request, res: Response) => {
    try {
      const cities = await storage.getAllCities();
      res.json(cities);
    } catch (error) {
      console.error('Error getting cities:', error);
      res.status(500).json({ message: 'Failed to get cities' });
    }
  });

  // Get amenities (support both endpoints for compatibility)
  app.get("/api/amenity", authenticateToken, async (req: Request, res: Response) => {
    try {
      const amenities = await storage.getAllAmenities();
      res.json(amenities);
    } catch (error) {
      console.error('Error getting amenities:', error);
      res.status(500).json({ message: 'Failed to get amenities' });
    }
  });

  app.get("/api/Amenity", authenticateToken, async (req: Request, res: Response) => {
    try {
      const amenities = await storage.getAllAmenities();
      res.json(amenities);
    } catch (error) {
      console.error('Error getting amenities:', error);
      res.status(500).json({ message: 'Failed to get amenities' });
    }
  });

  // Get amenity categories
  app.get("/api/AmenityCategory", authenticateToken, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAmenityCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error getting amenity categories:', error);
      res.status(500).json({ message: 'Failed to get amenity categories' });
    }
  });

  // Create amenity
  app.post("/api/Amenity", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { name, icon, amenityCategoryId } = req.body;

      if (!name || !icon || !amenityCategoryId) {
        return res.status(400).json({ message: 'name, icon, and amenityCategoryId are required' });
      }

      const amenityData = {
        name: name,
        icon: icon,
        amenityCategoryId: parseInt(amenityCategoryId),
        category: null, // Will be set by the database or computed
      };

      const amenityId = await storage.createAmenity(amenityData);
      res.status(201).json({ id: amenityId });
    } catch (error) {
      console.error('Error creating amenity:', error);
      res.status(500).json({ message: 'Failed to create amenity' });
    }
  });

  // Get room types (support both endpoints for compatibility)
  app.get("/api/roomtype", authenticateToken, async (req: Request, res: Response) => {
    try {
      const roomTypes = await storage.getRoomTypes();
      res.json(roomTypes);
    } catch (error) {
      console.error('Error getting room types:', error);
      res.status(500).json({ message: 'Failed to get room types' });
    }
  });

  app.get("/api/RoomType", authenticateToken, async (req: Request, res: Response) => {
    try {
      const roomTypes = await storage.getRoomTypes();
      res.json(roomTypes);
    } catch (error) {
      console.error('Error getting room types:', error);
      res.status(500).json({ message: 'Failed to get room types' });
    }
  });


  app.get("/api/Availibility", authenticateToken, async (req: Request, res: Response) => {
    try {
      const availabilities = await storage.getAllAvailabilities();
      res.json(availabilities);
    } catch (error) {
      console.error('Error getting availabilities:', error);
      res.status(500).json({ message: 'Failed to get availabilities' });
    }
  });

  // Upload picture
  app.post("/api/pictures/regular", authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { entityId, entityType } = req.query;
      
      if (!entityId || !entityType) {
        return res.status(400).json({ message: 'entityId and entityType are required' });
      }

      // In a real app, you would upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll store as base64 data URL
      const base64Image = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      const picture = await storage.createPicture({
        fileName: req.file.originalname,
        contentType: req.file.mimetype,
        fileSize: req.file.size,
        pictureType: "Regular",
        entityId: parseInt(entityId as string),
        entityType: entityType as "Property" | "Room",
        url: dataUrl,
      });

      res.status(201).json(picture);
    } catch (error) {
      console.error('Error uploading picture:', error);
      res.status(500).json({ message: 'Failed to upload picture' });
    }
  });

  // Get pictures by entity
  app.get("/api/pictures/:entityType/:entityId", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const pictures = await storage.getPicturesByEntity(
        entityType as "Property" | "Room",
        parseInt(entityId)
      );
      res.json(pictures);
    } catch (error) {
      console.error('Error getting pictures:', error);
      res.status(500).json({ message: 'Failed to get pictures' });
    }
  });

  // Delete picture
  app.delete("/api/pictures/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePicture(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting picture:', error);
      res.status(500).json({ message: 'Failed to delete picture' });
    }
  });

  // Get rooms by property
  app.get("/api/room/property/:propertyId", authenticateToken, async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const rooms = await storage.getRoomsByProperty(propertyId);
      res.json(rooms);
    } catch (error) {
      console.error('Error getting rooms:', error);
      res.status(500).json({ message: 'Failed to get rooms' });
    }
  });

  // Create room
  app.post("/api/Room", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { propertyId, roomTypeId, availibilityId, capacity, bedsCount, description } = req.body;

      if (!propertyId || !roomTypeId) {
        return res.status(400).json({ message: 'propertyId and roomTypeId are required' });
      }

      const roomData = {
        propertyId: parseInt(propertyId),
        roomTypeId: parseInt(roomTypeId),
        availabilityId: availibilityId ? parseInt(availibilityId) : 1,
        capacity: capacity ? parseInt(capacity) : null,
        bedsCount: bedsCount ? parseInt(bedsCount) : null,
        description: description || null,
      };

      const roomId = await storage.createRoom(roomData);
      res.status(201).json({ id: roomId });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ message: 'Failed to create room' });
    }
  });

  // Get room by ID
  app.get("/api/Room/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.getRoom(id);
      
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      res.json(room);
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(500).json({ message: 'Failed to get room' });
    }
  });

  // Delete room
  app.delete("/api/Room/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRoom(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(500).json({ message: 'Failed to delete room' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
