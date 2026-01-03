// Transaction Types
export type TransactionType = 'PAYMENT' | 'TRANSFER' | 'CASH_OUT' | 'CASH_IN' | 'DEBIT';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  nameOrig: string;
  oldBalanceOrig: number;
  newBalanceOrig: number;
  nameDest: string;
  oldBalanceDest: number;
  newBalanceDest: number;
  timestamp: string;
  status: 'pending' | 'processed' | 'flagged';
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  nameOrig: string;
  oldBalanceOrig: number;
  newBalanceOrig: number;
  nameDest: string;
  oldBalanceDest: number;
  newBalanceDest: number;
}

// Fraud Analysis Types
export type RiskLevel = 'low' | 'medium' | 'high';

export interface FraudAnalysis {
  id: string;
  transactionId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  explanation: string;
  factors: RiskFactor[];
  timestamp: string;
}

export interface RiskFactor {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

// Notification Types
export type NotificationSeverity = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  message: string;
  time: string;
  severity: NotificationSeverity;
  read: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalTransactions: number;
  flaggedTransactions: number;
  totalVolume: number;
  avgRiskScore: number;
  recentAlerts: number;
}
