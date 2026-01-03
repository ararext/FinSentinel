import { 
  Transaction, 
  TransactionFormData, 
  FraudAnalysis, 
  LoginCredentials, 
  SignupCredentials,
  User, 
  ApiResponse,
  DashboardStats,
  Notification
} from './types';
import { 
  mockTransactions, 
  generateMockTransaction, 
  generateMockFraudAnalysis,
  mockDashboardStats,
  mockNotifications
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(800);
    
    // Mock validation
    if (credentials.email === 'demo@fraudshield.ai' && credentials.password === 'demo123') {
      const user: User = {
        id: '1',
        email: credentials.email,
        name: 'Demo User',
        role: 'analyst',
      };
      return {
        success: true,
        data: {
          user,
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
        },
      };
    }
    
    return {
      success: false,
      error: 'Invalid email or password',
    };
  },

  logout: async (): Promise<ApiResponse<null>> => {
    await delay(300);
    return { success: true };
  },

  signup: async (credentials: SignupCredentials): Promise<ApiResponse<{ user: User }>> => {
    await delay(800);
    
    // Mock validation - simulate email already exists
    if (credentials.email === 'demo@fraudshield.ai') {
      return {
        success: false,
        error: 'An account with this email already exists',
      };
    }
    
    const user: User = {
      id: Math.random().toString(36).substring(7),
      email: credentials.email,
      name: credentials.email.split('@')[0],
      role: 'analyst',
    };
    
    return {
      success: true,
      data: { user },
    };
  },

  verifyToken: async (token: string): Promise<ApiResponse<User>> => {
    await delay(200);
    if (token.startsWith('mock-jwt-token-')) {
      return {
        success: true,
        data: {
          id: '1',
          email: 'demo@fraudshield.ai',
          name: 'Demo User',
          role: 'analyst',
        },
      };
    }
    return { success: false, error: 'Invalid token' };
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    await delay(300);
    return { success: true, data: mockNotifications };
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (): Promise<ApiResponse<Transaction[]>> => {
    await delay(500);
    return {
      success: true,
      data: [...mockTransactions].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    };
  },

  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    await delay(300);
    const transaction = mockTransactions.find(t => t.id === id);
    if (transaction) {
      return { success: true, data: transaction };
    }
    return { success: false, error: 'Transaction not found' };
  },

  create: async (data: TransactionFormData): Promise<ApiResponse<Transaction>> => {
    await delay(600);
    const newTransaction = generateMockTransaction({
      ...data,
      status: 'pending',
      timestamp: new Date().toISOString(),
    });
    mockTransactions.unshift(newTransaction);
    return { success: true, data: newTransaction, message: 'Transaction created successfully' };
  },

  getLive: async (): Promise<ApiResponse<Transaction[]>> => {
    await delay(200);
    // Return the 10 most recent transactions
    return {
      success: true,
      data: [...mockTransactions]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10),
    };
  },
};

// Fraud Analysis API
export const fraudApi = {
  analyze: async (transactionId: string): Promise<ApiResponse<FraudAnalysis>> => {
    await delay(1200);
    const analysis = generateMockFraudAnalysis(transactionId);
    return { success: true, data: analysis };
  },

  getByTransactionId: async (transactionId: string): Promise<ApiResponse<FraudAnalysis>> => {
    await delay(400);
    const analysis = generateMockFraudAnalysis(transactionId);
    return { success: true, data: analysis };
  },

  getRecent: async (limit: number = 10): Promise<ApiResponse<FraudAnalysis[]>> => {
    await delay(500);
    const analyses = mockTransactions
      .slice(0, limit)
      .map(t => generateMockFraudAnalysis(t.id));
    return { success: true, data: analyses };
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay(400);
    return { success: true, data: mockDashboardStats };
  },
};
