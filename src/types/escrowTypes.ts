export type EscrowStatus =
  | 'pending'
  | 'funded'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export type DisputeStatus = 'open' | 'under_review' | 'resolved';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type AdminRole = 'super_admin' | 'admin' | 'support' | 'finance';

export type TransactionType =
  | 'escrow_funding'
  | 'release'
  | 'refund'
  | 'fee'
  | 'deposit';

export type TransactionStatus = 'success' | 'pending' | 'failed';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'datetime'
  | 'currency'
  | 'file'
  | 'image'
  | 'wallet'
  | 'address';

export interface FormOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldConfig {
  id: string;
  name: string; // internal variable name
  label: string;
  type: FieldType;
  required: boolean;
  enabled?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  order?: number;
  width?: 'full' | 'half';
  options?: FormOption[];
  
  // Dynamic validation & type specific settings
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  minSelections?: number;
  maxSelections?: number;
  allowedTypes?: string[];
  maxSizeMb?: number;
  maxFiles?: number;
  currencySymbol?: string;
  minAmount?: number;
  maxAmount?: number;
  supportedNetwork?: string;
  requireCountry?: boolean;
  requirePostalCode?: boolean;
  minDate?: string;
  maxDate?: string;
  defaultChecked?: boolean;
}

export interface Category {
  id: string;
  title: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
  displayOrder?: number;
  escrowCount?: number;
  fields: FormFieldConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  completed: boolean;
  actor?: string;
}

export interface Escrow {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerWallet: string;
  buyerAvatar?: string;
  sellerName: string;
  sellerEmail: string;
  sellerWallet: string;
  sellerAvatar?: string;
  amount: number;
  currency: string;
  platformFee: number;
  categoryId: string;
  categoryName: string;
  status: EscrowStatus;
  createdDate: string;
  updatedDate: string;
  categoryData: Record<string, any>;
  timeline: TimelineEvent[];
  disputeId?: string;
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  wallet: string;
  avatar?: string;
  escrowsCount: number;
  completedEscrows: number;
  activeEscrows: number;
  totalVolume: number;
  disputesCount: number;
  status: UserStatus;
  joinedDate: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  wallet: string;
  avatar?: string;
  escrowsCount: number;
  completedEscrows: number;
  activeEscrows: number;
  totalVolume: number;
  rating: number;
  reputationScore: number;
  totalEarned: number;
  status: UserStatus;
  joinedDate: string;
}

export interface DisputeMessage {
  id: string;
  sender: string;
  senderRole: 'buyer' | 'seller' | 'admin';
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface EvidenceFile {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  type: string;
}

export interface Dispute {
  id: string;
  escrowId: string;
  buyerName: string;
  buyerWallet: string;
  sellerName: string;
  sellerWallet: string;
  amount: number;
  currency: string;
  reason: string;
  status: DisputeStatus;
  createdDate: string;
  assignedAdmin?: string;
  evidenceFiles: EvidenceFile[];
  conversation: DisputeMessage[];
  resolution?: {
    resolvedAt: string;
    resolvedBy: string;
    decision: 'buyer' | 'seller' | 'split';
    notes: string;
    buyerAmount?: number;
    sellerAmount?: number;
  };
}

export interface Transaction {
  id: string;
  escrowId: string;
  type: TransactionType;
  fromName: string;
  fromWallet: string;
  toName: string;
  toWallet: string;
  amount: number;
  currency: string;
  network: 'Ethereum' | 'Polygon' | 'Arbitrum' | 'Optimism';
  status: TransactionStatus;
  date: string;
  hash: string;
}

export interface FeeHistoryItem {
  id: string;
  previousFee: number;
  newFee: number;
  changedBy: string;
  timestamp: string;
  reason: string;
}

export interface FeeSettings {
  platformFeePercent: number;
  minFee: number;
  maxFee: number;
  feePayer: 'buyer' | 'seller' | 'split';
  feeHistory: FeeHistoryItem[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  lastActive: string;
  createdDate: string;
  avatar?: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  date: string;
  ipAddress: string;
}

export interface PlatformSettings {
  platformName: string;
  logoUrl: string;
  defaultCurrency: string;
  platformFeePercent: number;
  minEscrowAmount: number;
  maxEscrowAmount: number;
  supportEmail: string;
  autoReleaseDays: number;
  disputePeriodDays: number;
  cancellationPolicy: string;
  buyerProtectionEnabled: boolean;
  sellerProtectionEnabled: boolean;
  network: string;
  chainId: number;
  escrowContractAddress: string;
  tokenContractAddress: string;
  adminWalletAddress: string;
  treasuryWalletAddress: string;
  emailNotifications: boolean;
  webhookUrl: string;
  twoFactorEnforced: boolean;
  sessionTimeoutMinutes: number;
}
