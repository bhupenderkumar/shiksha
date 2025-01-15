import { signIn, signUp } from '@/services/authservice';
import { supabase } from '@/lib/api-client';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the Supabase client
vi.mock('@/lib/api-client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    schema: vi.fn(() => ({
      from: vi.fn(() => ({
        insert: vi.fn(),
      })),
    })),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockResponse = { data: { user: mockUser }, error: null };
      
      (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      const result = await signIn('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.data).toEqual(mockResponse.data);
      expect(result.error).toBeNull();
    });

    it('should handle sign in errors', async () => {
      const mockError = { message: 'Invalid credentials' };
      const mockResponse = { data: null, error: mockError };
      
      (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

      const result = await signIn('test@example.com', 'wrongpassword');

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockAuthResponse = { data: { user: mockUser }, error: null };
      const mockProfileResponse = { error: null };

      (supabase.auth.signUp as any).mockResolvedValue(mockAuthResponse);
      (supabase.schema().from().insert as any).mockResolvedValue(mockProfileResponse);

      const result = await signUp(
        'test@example.com',
        'password123',
        'student',
        'Test User'
      );

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(supabase.schema).toHaveBeenCalledWith('school');
      expect(result.error).toBeNull();
    });

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already exists' };
      const mockResponse = { data: null, error: mockError };

      (supabase.auth.signUp as any).mockResolvedValue(mockResponse);

      const result = await signUp(
        'existing@example.com',
        'password123',
        'student',
        'Test User'
      );

      expect(result.error).toEqual(mockError);
    });
  });
});
