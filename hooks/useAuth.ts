import { UserData, UserPreferences } from '../types';

/**
 * Mock implementation of the `useAuth` hook.
 *
 * This serves as a placeholder while the new Firebase authentication system is being built.
 * It returns a mock 'admin' user by default. This allows protected routes and
 * components that rely on user data to render without crashing.
 *
 * NOTE: The logout functionality in the UI will not reflect a state change
 * because this hook always returns the same mock user. This is expected temporary behavior.
 */
export const useAuth = () => {
  const mockUser: UserData = {
    id: 'mock-admin-id',
    email: 'admin@example.com',
    user_metadata: { display_name: 'Admin User' },
    created_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    profile: {
        id: 'mock-admin-id',
        display_name: 'Admin User',
        photo_url: null,
        phone: null,
        role: 'admin', // This user is an admin to allow access to admin routes
        language: 'en',
        updated_at: new Date().toISOString(),
        preferences: { orderUpdates: true, promotions: true, newArtworks: true },
    }
  };
  
  return {
    user: mockUser,
    loading: false,
    refetchUser: async (): Promise<void> => {
      // This is a no-op for the mock implementation.
    },
    updateUserPreferences: async (preferences: Partial<UserPreferences>): Promise<void> => {
       // This is a no-op for the mock implementation.
    },
  };
};
