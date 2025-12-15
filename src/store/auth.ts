import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useStaff, type PermissionKey, type StaffRole } from './staff';
import { useFarmerVerification } from './farmer-verification';
import { authAPI } from '@/services/api';

export type UserRole = 'admin' | 'farmer' | 'buyer' | 'delivery' | 'warehouse' | 'staff';

export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  user_type?: string;
  verification_status?: string;
  staffRoles?: StaffRole[];
  permissions?: PermissionKey[];
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isStaffLogin: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, phoneNumber: string, userType: string) => Promise<boolean>;
  staffLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

// Fall back to test credentials for demo purposes
const TEST_CREDENTIALS: Record<string, { password: string; name: string; role: UserRole }> = {
  'admin@test.com': { password: 'admin123', name: 'Admin User', role: 'admin' },
  'buyer@test.com': { password: 'buyer123', name: 'Buyer User', role: 'buyer' },
  'delivery@test.com': { password: 'delivery123', name: 'Delivery Person', role: 'delivery' },
  'warehouse@test.com': { password: 'warehouse123', name: 'Warehouse Staff', role: 'warehouse' },
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isStaffLogin: false,
      accessToken: null,
      refreshToken: null,

      login: async (email: string, password: string) => {
        try {
          // Try backend API first
          const result = await authAPI.login(email, password);

          const user: User = {
            id: result.user.id,
            email: result.user.email,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
            name: `${result.user.first_name} ${result.user.last_name}`.trim(),
            role: (result.user.user_type || 'buyer') as UserRole,
            user_type: result.user.user_type,
            verification_status: result.user.verification_status,
          };

          set({
            user,
            isLoggedIn: true,
            isStaffLogin: false,
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
          });

          return true;
        } catch (error: any) {
          // Fall back to test credentials for non-farmer roles
          const credentials = TEST_CREDENTIALS[email.toLowerCase()];

          if (credentials && credentials.password === password) {
            const user: User = {
              id: email,
              email: email.toLowerCase(),
              name: credentials.name,
              role: credentials.role,
            };
            set({ user, isLoggedIn: true, isStaffLogin: false });
            return true;
          }

          return false;
        }
      },

      register: async (email: string, password: string, firstName: string, lastName: string, phoneNumber: string, userType: string) => {
        try {
          const result = await authAPI.register(email, password, firstName, lastName, phoneNumber, userType);

          if (userType === 'farmer') {
            // For farmers, just return success - they need to complete verification
            return true;
          }

          // For buyers, auto-login
          const loginResult = await authAPI.login(email, password);

          const user: User = {
            id: loginResult.user.id,
            email: loginResult.user.email,
            first_name: loginResult.user.first_name,
            last_name: loginResult.user.last_name,
            name: `${loginResult.user.first_name} ${loginResult.user.last_name}`.trim(),
            role: (loginResult.user.user_type || 'buyer') as UserRole,
            user_type: loginResult.user.user_type,
            verification_status: loginResult.user.verification_status,
          };

          set({
            user,
            isLoggedIn: true,
            isStaffLogin: false,
            accessToken: loginResult.access_token,
            refreshToken: loginResult.refresh_token,
          });

          return true;
        } catch (error: any) {
          console.error('Registration error:', error.message);
          return false;
        }
      },

      staffLogin: async (email: string, password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const staff = useStaff.getState().validateStaffLogin(email, password);

        if (staff) {
          const permissions = useStaff.getState().getStaffPermissions(staff);
          const user: User = {
            id: staff.id,
            email: staff.email,
            name: staff.name,
            role: 'staff',
            staffRoles: staff.roles,
            permissions: permissions,
          };
          set({ user, isLoggedIn: true, isStaffLogin: true });
          return true;
        }

        return false;
      },

      logout: () => {
        set({ user: null, isLoggedIn: false, isStaffLogin: false, accessToken: null, refreshToken: null });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
