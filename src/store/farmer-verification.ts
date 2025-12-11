import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface PersonalInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  nationalIdNumber: string;
  nationalIdType: 'ghana_card' | 'ecowas_card';
  photograph?: string; // Base64 or file reference
}

export interface FarmDetails {
  farmName: string;
  region: string;
  district: string;
  townCommunity: string;
  gpsAddress: string;
  farmingTypes: ('crops' | 'livestock' | 'mixed' | 'aquaculture')[];
  produceCategories: string[];
  farmSize: string; // in acres/hectares
  yearsOfExperience: string;
}

export interface BankingDetails {
  mobileMoneyName: string;
  mobileMoneyNumber: string;
  preferredPaymentMethod: string;
  accountHolderName: string;
}

export interface DocumentUploads {
  ghanaCardFront?: string;
  ghanaCardBack?: string;
  farmPhoto1?: string;
  farmPhoto2?: string;
  businessRegistration?: string;
}

export interface ComplianceAgreements {
  confirmOwnership: boolean;
  agreeToTerms: boolean;
  consentToVerification: boolean;
}

export interface FarmerVerificationData {
  farmerId: string;
  email: string;
  status: VerificationStatus;
  personalInfo: PersonalInfo;
  farmDetails: FarmDetails;
  bankingDetails: BankingDetails;
  documentUploads: DocumentUploads;
  complianceAgreements: ComplianceAgreements;
  currentStep: number; // 0-5 for the 6-step wizard
  submittedAt?: number;
  approvedAt?: number;
  rejectionReason?: string;
}

interface FarmerVerificationState {
  verifications: Record<string, FarmerVerificationData>;
  createVerification: (farmerId: string, email: string) => FarmerVerificationData;
  getVerification: (farmerId: string) => FarmerVerificationData | undefined;
  updatePersonalInfo: (farmerId: string, info: Partial<PersonalInfo>) => void;
  updateFarmDetails: (farmerId: string, details: Partial<FarmDetails>) => void;
  updateBankingDetails: (farmerId: string, details: Partial<BankingDetails>) => void;
  updateDocumentUploads: (farmerId: string, docs: Partial<DocumentUploads>) => void;
  updateComplianceAgreements: (farmerId: string, agreements: Partial<ComplianceAgreements>) => void;
  updateStep: (farmerId: string, step: number) => void;
  submitVerification: (farmerId: string) => void;
  approveVerification: (farmerId: string) => void;
  rejectVerification: (farmerId: string, reason: string) => void;
}

export const useFarmerVerification = create<FarmerVerificationState>()(
  persist(
    (set, get) => ({
      verifications: {},

      createVerification: (farmerId, email) => {
        const newVerification: FarmerVerificationData = {
          farmerId,
          email,
          status: 'pending',
          currentStep: 0,
          personalInfo: {
            fullName: '',
            phoneNumber: '',
            email: '',
            dateOfBirth: '',
            nationalIdNumber: '',
            nationalIdType: 'ghana_card',
          },
          farmDetails: {
            farmName: '',
            region: '',
            district: '',
            townCommunity: '',
            gpsAddress: '',
            farmingTypes: [],
            produceCategories: [],
            farmSize: '',
            yearsOfExperience: '',
          },
          bankingDetails: {
            mobileMoneyName: '',
            mobileMoneyNumber: '',
            preferredPaymentMethod: '',
            accountHolderName: '',
          },
          documentUploads: {},
          complianceAgreements: {
            confirmOwnership: false,
            agreeToTerms: false,
            consentToVerification: false,
          },
        };

        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: newVerification,
          },
        }));

        return newVerification;
      },

      getVerification: (farmerId) => {
        return get().verifications[farmerId];
      },

      updatePersonalInfo: (farmerId, info) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              personalInfo: {
                ...state.verifications[farmerId].personalInfo,
                ...info,
              },
            },
          },
        }));
      },

      updateFarmDetails: (farmerId, details) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              farmDetails: {
                ...state.verifications[farmerId].farmDetails,
                ...details,
              },
            },
          },
        }));
      },

      updateBankingDetails: (farmerId, details) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              bankingDetails: {
                ...state.verifications[farmerId].bankingDetails,
                ...details,
              },
            },
          },
        }));
      },

      updateDocumentUploads: (farmerId, docs) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              documentUploads: {
                ...state.verifications[farmerId].documentUploads,
                ...docs,
              },
            },
          },
        }));
      },

      updateComplianceAgreements: (farmerId, agreements) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              complianceAgreements: {
                ...state.verifications[farmerId].complianceAgreements,
                ...agreements,
              },
            },
          },
        }));
      },

      updateStep: (farmerId, step) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              currentStep: step,
            },
          },
        }));
      },

      submitVerification: (farmerId) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              status: 'pending',
              submittedAt: Date.now(),
            },
          },
        }));
      },

      approveVerification: (farmerId) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              status: 'approved',
              approvedAt: Date.now(),
            },
          },
        }));
      },

      rejectVerification: (farmerId, reason) => {
        set((state) => ({
          verifications: {
            ...state.verifications,
            [farmerId]: {
              ...state.verifications[farmerId],
              status: 'rejected',
              rejectionReason: reason,
            },
          },
        }));
      },
    }),
    {
      name: 'farmer-verification-store',
    }
  )
);
