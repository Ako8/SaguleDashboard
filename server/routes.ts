import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertUserSchema } from "@shared/schema";

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.SESSION_SECRET || "default-secret-key-change-in-production";

// Middleware to verify JWT token
export function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    (req as any).user = user;
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

  const httpServer = createServer(app);
  return httpServer;
}
