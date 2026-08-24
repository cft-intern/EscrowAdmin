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

export const RESERVED_FIELD_KEYS = new Set([
  'id',
  'name',
  'slug',
  'description',
  'icon',
  'requiresshipping',
  'requires_shipping',
  'status',
  'steps',
  'fields',
  'fieldgroups',
  'field_groups',
  'createdat',
  'created_at',
  'updatedat',
  'updated_at',
  'order',
  'displayorder',
  'display_order',
  'escrowcount',
  'escrows_count',
  'escrow_count',
  'action',
  'actions',
  'type',
  'fieldtype',
  'field_type',
]);

export const sanitizeFieldKey = (raw: string): string => {
  return (raw || 'field')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const generateUniqueFieldKey = (
  label: string,
  existingKeys: Set<string> | string[] = [],
  reservedKeys: Set<string> = RESERVED_FIELD_KEYS,
  currentKey?: string
): string => {
  const existingSet = new Set(
    (Array.isArray(existingKeys) ? existingKeys : Array.from(existingKeys))
      .map((k) => k?.toLowerCase())
      .filter((k) => Boolean(k) && k !== currentKey?.toLowerCase())
  );

  const rawBase = sanitizeFieldKey(label);
  let baseKey = rawBase || 'field';

  // If baseKey matches a reserved category property (e.g. 'description', 'name', 'slug'),
  // append '_field' so 'description' becomes 'description_field'
  if (reservedKeys.has(baseKey)) {
    baseKey = `${baseKey}_field`;
  }

  let candidate = baseKey;
  let counter = 1;

  while (reservedKeys.has(candidate) || existingSet.has(candidate)) {
    candidate = `${baseKey}_${counter}`;
    counter++;
  }

  return candidate;
};

export const BACKEND_FIELD_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  FILE: 'FILE',
  IMAGE: 'IMAGE',
  DROPDOWN: 'DROPDOWN',
  RADIO: 'RADIO',
  TEXTAREA: 'TEXTAREA',
  VIDEO: 'VIDEO',
  LOCATION: 'LOCATION',
  DOCUMENT: 'DOCUMENT',
  CHECKBOX: 'CHECKBOX',
} as const;

export const VALID_FIELD_TYPES = [
  'STRING',
  'NUMBER',
  'BOOLEAN',
  'DATE',
  'FILE',
  'IMAGE',
  'DROPDOWN',
  'RADIO',
  'TEXTAREA',
  'VIDEO',
  'LOCATION',
  'DOCUMENT',
  'CHECKBOX',
] as const;

export type SupportedFieldType = typeof VALID_FIELD_TYPES[number];

export const mapFieldTypeToApi = (fieldType?: any, type?: any): SupportedFieldType => {
  const rawFieldType = typeof fieldType === 'object' && fieldType !== null ? fieldType.value || fieldType.label : fieldType;
  const rawType = typeof type === 'object' && type !== null ? type.value || type.label : type;
  const input = String(rawFieldType || rawType || 'STRING').trim().toUpperCase();

  switch (input) {
    case 'STRING':
    case 'TEXT':
    case 'EMAIL':
    case 'PHONE':
    case 'URL':
    case 'WALLET':
    case 'ADDRESS_LINE':
      return 'STRING';

    case 'NUMBER':
    case 'CURRENCY':
    case 'NUMERIC':
    case 'DECIMAL':
    case 'FLOAT':
    case 'INTEGER':
      return 'NUMBER';

    case 'BOOLEAN':
    case 'TOGGLE':
    case 'SWITCH':
      return 'BOOLEAN';

    case 'DATE':
    case 'DATETIME':
    case 'TIME':
      return 'DATE';

    case 'FILE':
    case 'FILE_UPLOAD':
    case 'ATTACHMENT':
      return 'FILE';

    case 'IMAGE':
    case 'IMAGE_UPLOAD':
    case 'PHOTO':
      return 'IMAGE';

    case 'DROPDOWN':
    case 'SELECT':
    case 'MULTISELECT':
    case 'COMBOBOX':
      return 'DROPDOWN';

    case 'RADIO':
    case 'RADIO_GROUP':
      return 'RADIO';

    case 'TEXTAREA':
    case 'MULTILINE':
    case 'LONGTEXT':
      return 'TEXTAREA';

    case 'VIDEO':
    case 'VIDEO_UPLOAD':
      return 'VIDEO';

    case 'LOCATION':
    case 'ADDRESS':
    case 'MAP':
    case 'GEOLOCATION':
      return 'LOCATION';

    case 'DOCUMENT':
    case 'DOCUMENT_UPLOAD':
    case 'PDF':
      return 'DOCUMENT';

    case 'CHECKBOX':
    case 'CHECK_BOX':
      return 'CHECKBOX';

    default:
      if ((VALID_FIELD_TYPES as readonly string[]).includes(input)) {
        return input as SupportedFieldType;
      }
      return 'STRING';
  }
};

export type FieldType =
  | SupportedFieldType
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

export interface FieldGroup {
  id: string;
  name: string;
  groupName?: string;
  description?: string;
  order?: number;
  displayOrder?: number;
  fields?: FormFieldConfig[];
}

export interface FormFieldConfig {
  id: string;
  name: string; // internal variable name (snake_case key)
  key: string; // field key
  label: string;
  type: FieldType;
  fieldType?: SupportedFieldType | string;
  required: boolean;
  isRequired?: boolean;
  enabled?: boolean;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  defaultValue?: any;
  order?: number;
  displayOrder?: number;
  width?: 'full' | 'half';
  fieldsPerRow?: 1 | 2;
  groupId?: string;
  targetRole?: 'buyer' | 'seller' | 'both';
  options?: FormOption[];
  
  // Dynamic validation & type specific settings
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  noWhitespaceOnly?: boolean;
  alphabetsOnly?: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimal?: boolean;
  pattern?: string;
  rows?: number;
  minSelections?: number;
  maxSelections?: number;
  allowedTypes?: string[];
  maxSizeMb?: number;
  maxFiles?: number;
  uploadType?: 'SINGLE' | 'MULTIPLE';
  minUploadCount?: number;
  maxUploadCount?: number;
  fileSizeLimit?: number;
  currencySymbol?: string;
  minAmount?: number;
  maxAmount?: number;
  supportedNetwork?: string;
  requireCountry?: boolean;
  requirePostalCode?: boolean;
  minDate?: string;
  maxDate?: string;
  defaultChecked?: boolean;
  checkboxText?: string;
  checkboxLink?: string;
  tooltipType?: string;
  tooltipContent?: string;
}

export interface FormStep {
  id: string;
  name: string;
  stepName?: string;
  order: number;
  displayOrder?: number;
  description?: string;
  fields: FormFieldConfig[];
  fieldGroups?: FieldGroup[];
}

export interface Category {
  id: string;
  title: string;
  name: string;
  slug?: string;
  description: string;
  icon: string;
  requiresShipping?: boolean;
  status: 'active' | 'inactive' | 'draft' | string;
  displayOrder?: number;
  escrowCount?: number;
  fields: FormFieldConfig[];
  steps?: FormStep[];
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
