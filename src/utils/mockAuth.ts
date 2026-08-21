import { User, UserRole, LoginCredentials, RegisterData, AuthTokens, ApiResponse } from '@/types';

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  'admin@example.com': 'admin123',
  'user@example.com': 'user123',
};

// Generate mock JWT token
function generateMockToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    iat: Math.floor(Date.now() / 1000),
  };
  
  // In real app, this would be properly signed
  return `mock.${btoa(JSON.stringify(payload))}.signature`;
}

// Generate refresh token
function generateRefreshToken(user: User): string {
  const payload = {
    sub: user.id,
    type: 'refresh',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    iat: Math.floor(Date.now() / 1000),
  };
  
  return `refresh.${btoa(JSON.stringify(payload))}.signature`;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    await delay(800); // Simulate network delay
    
    const user = mockUsers.find(u => u.email === credentials.email);
    const expectedPassword = mockPasswords[credentials.email];
    
    if (!user || credentials.password !== expectedPassword) {
      throw {
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Invalid email or password',
            data: null,
          }
        }
      };
    }
    
    if (!user.isActive) {
      throw {
        response: {
          status: 403,
          data: {
            success: false,
            message: 'Account is deactivated',
            data: null,
          }
        }
      };
    }
    
    const tokens: AuthTokens = {
      accessToken: generateMockToken(user),
      refreshToken: generateRefreshToken(user),
    };
    
    return {
      success: true,
      message: 'Login successful',
      data: { user, tokens },
    };
  },

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    await delay(1000);
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw {
        response: {
          status: 400,
          data: {
            success: false,
            message: 'User with this email already exists',
            data: null,
          }
        }
      };
    }
    
    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
      throw {
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Password confirmation does not match',
            data: null,
          }
        }
      };
    }
    
    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    mockPasswords[userData.email] = userData.password;
    
    const tokens: AuthTokens = {
      accessToken: generateMockToken(newUser),
      refreshToken: generateRefreshToken(newUser),
    };
    
    return {
      success: true,
      message: 'Registration successful',
      data: { user: newUser, tokens },
    };
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    await delay(300);
    
    try {
      // Extract payload from refresh token
      const parts = refreshToken.split('.');
      if (parts.length !== 3 || !parts[1]) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (Date.now() / 1000 > payload.exp) {
        throw new Error('Refresh token expired');
      }
      
      // Find user
      const user = mockUsers.find(u => u.id === payload.sub);
      if (!user) {
        throw new Error('User not found');
      }
      
      const tokens: AuthTokens = {
        accessToken: generateMockToken(user),
        refreshToken: generateRefreshToken(user),
      };
      
      return {
        success: true,
        message: 'Token refreshed',
        data: tokens,
      };
    } catch (error) {
      throw {
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Invalid refresh token',
            data: null,
          }
        }
      };
    }
  },

  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    await delay(200);
    
    try {
      // Extract payload from access token
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (Date.now() / 1000 > payload.exp) {
        throw new Error('Token expired');
      }
      
      // Find user
      const user = mockUsers.find(u => u.id === payload.sub);
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        message: 'User found',
        data: user,
      };
    } catch (error) {
      throw {
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Invalid token',
            data: null,
          }
        }
      };
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    await delay(200);
    
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    };
  },
};