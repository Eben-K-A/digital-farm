import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useStaff, type PermissionKey, type StaffRole } from './staff';

export type UserRole = 'admin' | 'farmer' | 'buyer' | 'delivery' | 'warehouse' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  staffRoles?: StaffRole[];
  permissions?: PermissionKey[];
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isStaffLogin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  staffLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const TEST_CREDENTIALS: Record<string, { password: string; name: string; role: UserRole }> = {
  'admin@test.com': { password: 'admin123', name: 'Admin User', role: 'admin' },
  'farmer@test.com': { password: 'farmer123', name: 'Farmer User', role: 'farmer' },
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
      login: async (email: string, password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

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
        set({ user: null, isLoggedIn: false, isStaffLogin: false });
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
