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

// Simulated network delay (still used for mock-only endpoints)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const jsonRequest = async <T>(
  path: string,
  options: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: mergedHeaders,
    });

    const data = await response
      .json()
      .catch(() => undefined as unknown as T & { detail?: string });

    if (!response.ok) {
      const errorMessage =
        (data as unknown as { detail?: string })?.detail ||
        'Request failed';
      return { success: false, error: errorMessage };
    }

    return { success: true, data: data as T };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const result = await jsonRequest<{ access_token: string }>(
      '/login',
      {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      }
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Invalid email or password',
      };
    }

    const user: User = {
      // Backend does not currently expose user details on login,
      // so we derive a reasonable frontend representation.
      id: 'current-user',
      email: credentials.email,
      name: credentials.email.split('@')[0],
      role: 'analyst',
    };

    return {
      success: true,
      data: {
        user,
        token: result.data.access_token,
      },
    };
  },

  logout: async (): Promise<ApiResponse<null>> => {
    // Logout is handled entirely client-side; this is kept
    // for API symmetry and future extensibility.
    return { success: true };
  },

  signup: async (credentials: SignupCredentials): Promise<ApiResponse<{ user: User }>> => {
    const result = await jsonRequest<{ id: string }>(
      '/register',
      {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      }
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        error:
          result.error || 'Signup failed. Please try again.',
      };
    }

    const user: User = {
      id: result.data.id,
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
    // Backend does not expose a dedicated token verification
    // endpoint. Token handling is done client-side via
    // persisted auth state in the AuthContext.
    return { success: false, error: 'Token verification not supported' };
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

  create: async (
    data: TransactionFormData
  ): Promise<
    ApiResponse<{
      fraud_prediction: boolean;
      fraud_score: number;
      explanation: string[];
    }>
  > => {
    let token: string | null = null;
    try {
      const stored = localStorage.getItem('fraudshield_auth');
      if (stored) {
        const parsed = JSON.parse(stored) as { token?: string };
        if (parsed.token) {
          token = parsed.token;
        }
      }
    } catch {
      // If parsing fails, we just proceed without a token
    }

    const payload = {
      step: data.step,
      type: data.type,
      amount: data.amount,
      nameOrig: data.nameOrig,
      oldbalanceOrg: data.oldBalanceOrig,
      newbalanceOrig: data.newBalanceOrig,
      nameDest: data.nameDest,
      oldbalanceDest: data.oldBalanceDest,
      newbalanceDest: data.newBalanceDest,
    };

    const numericValues = [
      payload.step,
      payload.amount,
      payload.oldbalanceOrg,
      payload.newbalanceOrig,
      payload.oldbalanceDest,
      payload.newbalanceDest,
    ];

    if (!numericValues.every((v) => Number.isFinite(v))) {
      return {
        success: false,
        error: 'Please fill in all numeric fields with valid numbers.',
      };
    }

    return jsonRequest('/transaction', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
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
