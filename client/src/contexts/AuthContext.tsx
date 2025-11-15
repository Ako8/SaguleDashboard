import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

// Helper to build API URL (same logic as queryClient)
function buildApiUrl(url: string): string {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  
  // If url already starts with http, use it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If API_BASE_URL is a full URL (starts with http/https), use it directly
  // and append the url (which should already include /api prefix)
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    // Ensure there's a single slash between base URL and path
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  }
  
  // Otherwise, prepend the API base URL (for relative URLs)
  return `${API_BASE_URL}${url}`;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  // Check if user is already logged in on mount (only once)
  useEffect(() => {
    // Prevent multiple auth checks
    if (hasCheckedAuth.current) {
      return;
    }
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // First, try to restore user from localStorage (faster)
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsLoading(false);
            
            // Validate token in the background (don't block UI)
            // Only clear auth if we get a 401/403, not on network errors
            const authMeUrl = buildApiUrl('/api/Auth/me');
            fetch(authMeUrl, {
              credentials: 'include',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
              .then((response) => {
                // Only clear auth on actual authentication errors (401, 403)
                // Don't clear on network errors or other issues
                if (response.status === 401 || response.status === 403) {
                  console.warn('Token validation failed: Unauthorized');
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user');
                  setUser(null);
                }
                // If response is ok or other status, keep the user logged in
              })
              .catch((error) => {
                // Network errors or other fetch errors - don't clear auth
                // Just log the error but keep user logged in
                console.warn('Token validation request failed (network error):', error);
                // Don't clear localStorage on network errors
              });
            
            // Return early - user is already set from localStorage
            return;
          } catch (parseError) {
            console.error('Failed to parse stored user:', parseError);
            // Continue to fetch from API
          }
        }

        // If no stored user, fetch from API
        const authMeUrl = buildApiUrl('/api/Auth/me');
        const response = await fetch(authMeUrl, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          // Map /Auth/me response to user format
          // /Auth/me returns: { userId, email, username, userType }
          // We need to create a user object that matches our User type
          const mappedUser = {
            id: userData.userId?.toString() || userData.id?.toString() || '',
            email: userData.email || '',
            username: userData.username || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            userType: userData.userType || '',
          };
          setUser(mappedUser as User);
          localStorage.setItem('user', JSON.stringify(mappedUser));
        } else if (response.status === 401 || response.status === 403) {
          // Only clear auth on actual authentication errors
          console.warn('Token validation failed: Unauthorized');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // Other errors (500, network issues, etc.) - don't clear auth
          // Just log and keep user logged in
          console.warn('Auth check failed with status:', response.status);
          // Don't clear localStorage on non-auth errors
        }
      } catch (error) {
        // Network errors or fetch failures - don't clear auth
        // Just log the error but keep user logged in
        console.warn('Auth check request failed (network error):', error);
        // Don't clear localStorage on network errors
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/Auth/login', {
      email,
      password,
    });

    const data = await response.json();
    
    // Handle both camelCase and PascalCase response formats
    const token = data.token || data.Token;
    const userData = data.user || data.User;
    
    if (!token) {
      throw new Error('Login failed: No token received');
    }
    
    if (!userData) {
      throw new Error('Login failed: No user data received');
    }
    
    // Map user data to match our User type
    // UserDto from API: { Id, Username, Email, FirstName, LastName, UserType }
    const mappedUser = {
      id: (userData.id || userData.Id || '').toString(),
      email: userData.email || userData.Email || '',
      username: userData.username || userData.Username || '',
      firstName: userData.firstName || userData.FirstName || '',
      lastName: userData.lastName || userData.LastName || '',
      userType: userData.userType || userData.UserType || '',
    };
    
    // Store token and user
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    
    // Update state - this will trigger re-render and navigation
    setUser(mappedUser as User);
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const response = await apiRequest('POST', '/api/Auth/register', {
      email,
      password,
      firstName,
      lastName,
    });

    const data = await response.json();
    
    // Register endpoint returns UserDto, not a token
    // User needs to log in separately after registration
    const user = data.user || data.User || data;
    
    if (!user) {
      throw new Error('Registration failed: No user data received');
    }
    
    // Store user data but don't set auth token (user needs to log in)
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/Auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
