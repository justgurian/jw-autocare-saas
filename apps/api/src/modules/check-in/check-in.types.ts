/**
 * Check-In To Win Types
 * Type definitions for the gamified check-in feature
 */

export interface Prize {
  id: string;
  label: string;
  probability: number; // 0 to 1, all probabilities should sum to 1
  description?: string;
  expirationDays?: number; // Days until prize expires (default: 30)
}

export interface CheckInFormData {
  name: string;
  phone?: string;
  carYear: string;
  carMake: string;
  carModel: string;
  carColor: string;
  mileage?: string;
  issue: string;
}

export interface CheckInSubmission {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone?: string;
  carYear?: number;
  carMake?: string;
  carModel?: string;
  carColor?: string;
  mileage?: number;
  issueDescription?: string;
  prizeWon?: string;
  prizeId?: string;
  validationCode: string;
  redeemed: boolean;
  redeemedAt?: Date;
  contentId?: string;
  createdAt: Date;
}

export interface PrizeConfiguration {
  id: string;
  tenantId: string;
  prizes: Prize[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SpinResult {
  prize: Prize;
  validationCode: string;
  submissionId: string;
}

export interface ActionFigureGenerationInput {
  submissionId: string;
  personImage: {
    base64: string;
    mimeType: string;
  };
  logos?: Array<{
    base64: string;
    mimeType: string;
  }>;
}

export interface ActionFigureGenerationResult {
  id: string;
  imageUrl: string;
  caption: string;
  validationCode: string;
  prize: string;
}

// Default prizes - can be customized per tenant
export const DEFAULT_PRIZES: Prize[] = [
  {
    id: 'free-oil-change',
    label: 'FREE Oil Change',
    probability: 0.05,
    description: 'Complete synthetic oil change on your next visit',
    expirationDays: 60,
  },
  {
    id: '25-off-service',
    label: '25% Off Any Service',
    probability: 0.10,
    description: '25% discount on any single service',
    expirationDays: 30,
  },
  {
    id: '20-off-service',
    label: '20% Off Service',
    probability: 0.15,
    description: '20% discount on any single service',
    expirationDays: 30,
  },
  {
    id: '15-off-service',
    label: '15% Off Service',
    probability: 0.15,
    description: '15% discount on any single service',
    expirationDays: 30,
  },
  {
    id: '10-off-service',
    label: '10% Off Service',
    probability: 0.15,
    description: '10% discount on any single service',
    expirationDays: 30,
  },
  {
    id: 'free-inspection',
    label: 'FREE Multi-Point Inspection',
    probability: 0.15,
    description: 'Comprehensive vehicle inspection at no charge',
    expirationDays: 45,
  },
  {
    id: 'free-air-filter',
    label: 'FREE Air Filter',
    probability: 0.10,
    description: 'Free cabin or engine air filter replacement',
    expirationDays: 30,
  },
  {
    id: 'free-car-wash',
    label: 'FREE Car Wash',
    probability: 0.10,
    description: 'Complimentary exterior car wash',
    expirationDays: 14,
  },
  {
    id: 'priority-scheduling',
    label: 'Priority Scheduling',
    probability: 0.05,
    description: 'Skip the line - priority appointment scheduling',
    expirationDays: 60,
  },
];

// Validation code generator
export function generateValidationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters (I, O, 0, 1)
  const prefix = 'JW';
  let code = prefix + '-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Weighted random prize selection
export function selectPrize(prizes: Prize[]): Prize {
  const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalProbability;

  for (const prize of prizes) {
    random -= prize.probability;
    if (random <= 0) {
      return prize;
    }
  }

  // Fallback to last prize if rounding errors occur
  return prizes[prizes.length - 1];
}
