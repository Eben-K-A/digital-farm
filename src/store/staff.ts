import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PermissionKey = 
  | 'manage_farmers'
  | 'manage_deliveries'
  | 'manage_warehouse'
  | 'manage_buyers'
  | 'create_farmers'
  | 'view_farmers'
  | 'edit_farmers'
  | 'delete_farmers'
  | 'create_deliveries'
  | 'view_deliveries'
  | 'edit_deliveries'
  | 'assign_deliveries'
  | 'create_warehouse'
  | 'view_warehouse'
  | 'edit_warehouse'
  | 'manage_inventory'
  | 'view_buyers'
  | 'manage_buyer_orders'
  | 'view_reports'
  | 'export_data';

export interface Permission {
  key: PermissionKey;
  label: string;
  description: string;
}

export const PERMISSIONS: Record<PermissionKey, Permission> = {
  manage_farmers: { key: 'manage_farmers', label: 'Manage Farmers', description: 'Full control over farmer accounts' },
  manage_deliveries: { key: 'manage_deliveries', label: 'Manage Deliveries', description: 'Full control over deliveries' },
  manage_warehouse: { key: 'manage_warehouse', label: 'Manage Warehouse', description: 'Full control over warehouse' },
  manage_buyers: { key: 'manage_buyers', label: 'Manage Buyers', description: 'Full control over buyer accounts' },
  create_farmers: { key: 'create_farmers', label: 'Create Farmers', description: 'Create new farmer accounts' },
  view_farmers: { key: 'view_farmers', label: 'View Farmers', description: 'View farmer accounts' },
  edit_farmers: { key: 'edit_farmers', label: 'Edit Farmers', description: 'Edit farmer accounts' },
  delete_farmers: { key: 'delete_farmers', label: 'Delete Farmers', description: 'Delete farmer accounts' },
  create_deliveries: { key: 'create_deliveries', label: 'Create Deliveries', description: 'Create delivery assignments' },
  view_deliveries: { key: 'view_deliveries', label: 'View Deliveries', description: 'View delivery assignments' },
  edit_deliveries: { key: 'edit_deliveries', label: 'Edit Deliveries', description: 'Edit delivery assignments' },
  assign_deliveries: { key: 'assign_deliveries', label: 'Assign Deliveries', description: 'Assign delivery personnel' },
  create_warehouse: { key: 'create_warehouse', label: 'Create Warehouse Items', description: 'Create warehouse items' },
  view_warehouse: { key: 'view_warehouse', label: 'View Warehouse', description: 'View warehouse inventory' },
  edit_warehouse: { key: 'edit_warehouse', label: 'Edit Warehouse', description: 'Edit warehouse items' },
  manage_inventory: { key: 'manage_inventory', label: 'Manage Inventory', description: 'Full inventory control' },
  view_buyers: { key: 'view_buyers', label: 'View Buyers', description: 'View buyer accounts' },
  manage_buyer_orders: { key: 'manage_buyer_orders', label: 'Manage Buyer Orders', description: 'Manage buyer orders' },
  view_reports: { key: 'view_reports', label: 'View Reports', description: 'Access reports and analytics' },
  export_data: { key: 'export_data', label: 'Export Data', description: 'Export data to CSV/PDF' },
};

export type StaffRole = 'farmer_manager' | 'delivery_manager' | 'warehouse_manager' | 'buyer_manager' | 'staff';

export const STAFF_ROLES: Record<StaffRole, { label: string; description: string; defaultPermissions: PermissionKey[] }> = {
  farmer_manager: {
    label: 'Farmer Manager',
    description: 'Manages all farmer-related activities',
    defaultPermissions: ['manage_farmers', 'create_farmers', 'view_farmers', 'edit_farmers', 'delete_farmers', 'view_reports'],
  },
  delivery_manager: {
    label: 'Delivery Manager',
    description: 'Manages all delivery operations',
    defaultPermissions: ['manage_deliveries', 'create_deliveries', 'view_deliveries', 'edit_deliveries', 'assign_deliveries', 'view_reports'],
  },
  warehouse_manager: {
    label: 'Warehouse Manager',
    description: 'Manages warehouse and inventory',
    defaultPermissions: ['manage_warehouse', 'create_warehouse', 'view_warehouse', 'edit_warehouse', 'manage_inventory', 'view_reports'],
  },
  buyer_manager: {
    label: 'Buyer Manager',
    description: 'Manages buyer accounts and orders',
    defaultPermissions: ['manage_buyers', 'view_buyers', 'manage_buyer_orders', 'view_reports'],
  },
  staff: {
    label: 'Custom Staff',
    description: 'Custom role with specific permissions',
    defaultPermissions: [],
  },
};

export interface StaffAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: StaffRole[];
  permissions: PermissionKey[];
  createdBy: string; // admin email
  createdAt: number;
  active: boolean;
}

interface StaffState {
  staffAccounts: StaffAccount[];
  addStaff: (staff: Omit<StaffAccount, 'id' | 'createdAt'>) => StaffAccount;
  updateStaff: (id: string, updates: Partial<StaffAccount>) => void;
  deleteStaff: (id: string) => void;
  getStaffByEmail: (email: string) => StaffAccount | undefined;
  validateStaffLogin: (email: string, password: string) => StaffAccount | null;
  hasPermission: (staff: StaffAccount, permission: PermissionKey) => boolean;
  getStaffPermissions: (staff: StaffAccount) => PermissionKey[];
}

export const useStaff = create<StaffState>()(
  persist(
    (set, get) => ({
      staffAccounts: [],

      addStaff: (staff) => {
        const newStaff: StaffAccount = {
          ...staff,
          id: `staff_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          staffAccounts: [...state.staffAccounts, newStaff],
        }));
        return newStaff;
      },

      updateStaff: (id, updates) => {
        set((state) => ({
          staffAccounts: state.staffAccounts.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteStaff: (id) => {
        set((state) => ({
          staffAccounts: state.staffAccounts.filter((s) => s.id !== id),
        }));
      },

      getStaffByEmail: (email) => {
        return get().staffAccounts.find((s) => s.email.toLowerCase() === email.toLowerCase());
      },

      validateStaffLogin: (email, password) => {
        const staff = get().getStaffByEmail(email);
        if (staff && staff.password === password && staff.active) {
          return staff;
        }
        return null;
      },

      hasPermission: (staff, permission) => {
        return staff.permissions.includes(permission);
      },

      getStaffPermissions: (staff) => {
        // Combine role default permissions + custom permissions
        const rolePermissions = new Set<PermissionKey>();
        
        staff.roles.forEach((role) => {
          STAFF_ROLES[role].defaultPermissions.forEach((perm) => {
            rolePermissions.add(perm);
          });
        });

        // Add custom permissions
        staff.permissions.forEach((perm) => {
          rolePermissions.add(perm);
        });

        return Array.from(rolePermissions);
      },
    }),
    {
      name: 'staff-store',
    }
  )
);
