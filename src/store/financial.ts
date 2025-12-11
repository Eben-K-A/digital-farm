import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'deposit' | 'withdrawal' | 'refund' | 'payout' | 'commission';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'on_hold';
export type PayoutStatus = 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  relatedId?: string; // Order ID, Farmer ID, etc.
  paymentMethod: string; // Mobile Money, Bank Transfer
  createdAt: number;
  completedAt?: number;
}

export interface FarmerPayout {
  id: string;
  farmerId: string;
  farmerName: string;
  email: string;
  totalAmount: number;
  commission: number; // Platform commission (5%)
  netAmount: number; // Amount after commission
  status: PayoutStatus;
  paymentMethod: string;
  accountNumber: string;
  requestedAt: number;
  approvedAt?: number;
  approvedBy?: string;
  processedAt?: number;
  completedAt?: number;
  holdingPeriod: number; // Days before payout (7 days default)
  releaseDate: number;
  notes?: string;
}

export interface DisputeRefund {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  amount: number;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'refunded';
  createdAt: number;
  resolvedAt?: number;
  resolution?: string;
}

interface FinancialState {
  transactions: Transaction[];
  payouts: FarmerPayout[];
  disputes: DisputeRefund[];
  platformCommissionRate: number; // 5% default
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  createPayout: (farmerId: string, farmerName: string, email: string, totalAmount: number) => FarmerPayout;
  approvePayout: (payoutId: string, approvedBy: string) => void;
  processPayout: (payoutId: string) => void;
  completePayout: (payoutId: string) => void;
  rejectPayout: (payoutId: string) => void;
  createDispute: (orderId: string, buyerId: string, buyerName: string, farmerId: string, farmerName: string, amount: number, reason: string) => void;
  resolveDispute: (disputeId: string, resolution: string, shouldRefund: boolean) => void;
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTotalRevenue: () => number;
  getTotalCommissions: () => number;
  getPendingPayouts: () => FarmerPayout[];
  getCompletedPayouts: () => FarmerPayout[];
}

const HOLDING_PERIOD_DAYS = 7;

export const useFinancial = create<FinancialState>()(
  persist(
    (set, get) => ({
      transactions: [],
      payouts: [],
      disputes: [],
      platformCommissionRate: 5, // 5% commission

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `txn_${Date.now()}`,
          createdAt: Date.now(),
        };

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      createPayout: (farmerId, farmerName, email, totalAmount) => {
        const commissionRate = get().platformCommissionRate;
        const commission = (totalAmount * commissionRate) / 100;
        const netAmount = totalAmount - commission;
        const holdingPeriodMs = HOLDING_PERIOD_DAYS * 24 * 60 * 60 * 1000;
        const releaseDate = Date.now() + holdingPeriodMs;

        const newPayout: FarmerPayout = {
          id: `payout_${Date.now()}`,
          farmerId,
          farmerName,
          email,
          totalAmount,
          commission,
          netAmount,
          status: 'pending_approval',
          paymentMethod: 'Mobile Money',
          accountNumber: '', // To be filled by admin
          requestedAt: Date.now(),
          holdingPeriod: HOLDING_PERIOD_DAYS,
          releaseDate,
        };

        set((state) => ({
          payouts: [...state.payouts, newPayout],
        }));

        // Add transaction record
        get().addTransaction({
          type: 'payout',
          status: 'pending',
          amount: totalAmount,
          description: `Pending payout for farmer ${farmerName}`,
          relatedId: farmerId,
          paymentMethod: 'Mobile Money',
        });

        return newPayout;
      },

      approvePayout: (payoutId, approvedBy) => {
        set((state) => ({
          payouts: state.payouts.map((p) =>
            p.id === payoutId
              ? { ...p, status: 'approved', approvedAt: Date.now(), approvedBy }
              : p
          ),
        }));
      },

      processPayout: (payoutId) => {
        set((state) => ({
          payouts: state.payouts.map((p) =>
            p.id === payoutId
              ? { ...p, status: 'processing', processedAt: Date.now() }
              : p
          ),
        }));

        // Add transaction record
        const payout = get().payouts.find((p) => p.id === payoutId);
        if (payout) {
          get().addTransaction({
            type: 'payout',
            status: 'completed',
            amount: payout.netAmount,
            description: `Payout processed for ${payout.farmerName}`,
            relatedId: payout.farmerId,
            paymentMethod: payout.paymentMethod,
          });
        }
      },

      completePayout: (payoutId) => {
        set((state) => ({
          payouts: state.payouts.map((p) =>
            p.id === payoutId
              ? { ...p, status: 'completed', completedAt: Date.now() }
              : p
          ),
        }));
      },

      rejectPayout: (payoutId) => {
        set((state) => ({
          payouts: state.payouts.map((p) =>
            p.id === payoutId
              ? { ...p, status: 'failed' }
              : p
          ),
        }));
      },

      createDispute: (orderId, buyerId, buyerName, farmerId, farmerName, amount, reason) => {
        const newDispute: DisputeRefund = {
          id: `dispute_${Date.now()}`,
          orderId,
          buyerId,
          buyerName,
          farmerId,
          farmerName,
          amount,
          reason,
          status: 'open',
          createdAt: Date.now(),
        };

        set((state) => ({
          disputes: [...state.disputes, newDispute],
        }));
      },

      resolveDispute: (disputeId, resolution, shouldRefund) => {
        const dispute = get().disputes.find((d) => d.id === disputeId);

        set((state) => ({
          disputes: state.disputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  status: shouldRefund ? 'refunded' : 'resolved',
                  resolvedAt: Date.now(),
                  resolution,
                }
              : d
          ),
        }));

        if (shouldRefund && dispute) {
          get().addTransaction({
            type: 'refund',
            status: 'completed',
            amount: dispute.amount,
            description: `Refund for dispute: ${resolution}`,
            relatedId: dispute.orderId,
            paymentMethod: 'Mobile Money',
          });
        }
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },

      getTotalRevenue: () => {
        return get()
          .transactions.filter((t) => t.type === 'deposit' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalCommissions: () => {
        return get()
          .payouts.filter((p) => p.status === 'completed')
          .reduce((sum, p) => sum + p.commission, 0);
      },

      getPendingPayouts: () => {
        return get().payouts.filter(
          (p) => p.status === 'pending_approval' || p.status === 'approved' || p.status === 'processing'
        );
      },

      getCompletedPayouts: () => {
        return get().payouts.filter((p) => p.status === 'completed');
      },
    }),
    {
      name: 'financial-store',
    }
  )
);
