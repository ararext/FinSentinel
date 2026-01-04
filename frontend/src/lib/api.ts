import { 
  Transaction, 
  TransactionFormData, 
  FraudAnalysis, 
  LoginCredentials, 
  SignupCredentials,
  User, 
  ApiResponse,
  DashboardStats,
  Notification,
  RiskLevel,
  RiskFactor,
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
    // Use the live transactions endpoint so the main
    // dashboard always reflects real, up-to-date data.
    const result = await jsonRequest<Transaction[]>(
      '/transactions/live?limit=200',
      {
        method: 'GET',
      }
    );

    if (!result.success || !result.data) {
      return result;
    }

    // Sort newest first to match the existing UI expectation.
    const sorted = [...result.data].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return { success: true, data: sorted };
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
    return jsonRequest<Transaction[]>(
      '/transactions/live',
      {
        method: 'GET',
      }
    );
  },
};

// Fraud Analysis API
export const fraudApi = {
  analyze: async (transaction: Transaction): Promise<ApiResponse<FraudAnalysis>> => {
    // Reuse the backend ML + RAG pipeline without mutating
    // CSV or database state via the /analyze endpoint.

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
      // If parsing fails, proceed without a token
    }

    const payload = {
      // `step` is required by the backend model; dashboard
      // transactions don't carry it, so we treat them as
      // single-step events.
      step: 1,
      type: transaction.type,
      amount: transaction.amount,
      nameOrig: transaction.nameOrig,
      oldbalanceOrg: transaction.oldBalanceOrig,
      newbalanceOrig: transaction.newBalanceOrig,
      nameDest: transaction.nameDest,
      oldbalanceDest: transaction.oldBalanceDest,
      newbalanceDest: transaction.newBalanceDest,
    };

    const result = await jsonRequest<{
      fraud_prediction: boolean;
      fraud_score: number;
      explanation: string[];
    }>('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to run fraud analysis.',
      };
    }

    const rawScore = result.data.fraud_score ?? 0;
    const scorePercent = Math.max(0, Math.min(100, rawScore * 100));

    let riskLevel: RiskLevel;
    if (scorePercent <= 5) {
      riskLevel = 'low';
    } else if (scorePercent < 65) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    const explanationLines = (result.data.explanation || []).filter(line => line && line.trim().length > 0);
    const summary = explanationLines.join(' ');

    const baseWeight = explanationLines.length ? 1 / explanationLines.length : 0.2;

    const factors: RiskFactor[] = explanationLines.map((line, idx) => {
      const text = line.trim();
      const lowered = text.toLowerCase();

      let impact: RiskFactor['impact'] = 'neutral';
      if (
        lowered.includes('higher') ||
        lowered.includes('unusual') ||
        lowered.includes('suspicious') ||
        lowered.includes('risk') ||
        lowered.includes('flagged') ||
        lowered.includes('anomaly')
      ) {
        impact = 'negative';
      } else if (
        lowered.includes('within normal') ||
        lowered.includes('known') ||
        lowered.includes('established') ||
        lowered.includes('consistent') ||
        lowered.includes('low risk')
      ) {
        impact = 'positive';
      }

      return {
        title: `Factor ${idx + 1}`,
        description: text,
        impact,
        weight: baseWeight,
      };
    });

    const analysis: FraudAnalysis = {
      id: `${transaction.id}-analysis`,
      transactionId: transaction.id,
      riskLevel,
      riskScore: Number(scorePercent.toFixed(1)),
      explanation: summary,
      factors,
      timestamp: new Date().toISOString(),
    };

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
    // Derive dashboard statistics directly from the live
    // transactions so the summary cards reflect real data.
    const txResult = await transactionsApi.getAll();

    if (!txResult.success || !txResult.data) {
      return {
        success: false,
        error: txResult.error || 'Failed to load dashboard statistics.',
      };
    }

    const txs = txResult.data;

    const totalTransactions = txs.length;
    const flaggedTransactions = txs.filter((t) => t.status === 'flagged').length;
    const totalVolume = txs.reduce((sum, t) => sum + t.amount, 0);

    // Approximate average risk as the percentage of
    // flagged transactions in the current window.
    const avgRiskScore = totalTransactions
      ? Number(((flaggedTransactions / totalTransactions) * 100).toFixed(1))
      : 0;

    const stats: DashboardStats = {
      totalTransactions,
      flaggedTransactions,
      totalVolume,
      avgRiskScore,
      // Treat flagged transactions as active alerts for now.
      recentAlerts: flaggedTransactions,
    };

    return { success: true, data: stats };
  },
};
