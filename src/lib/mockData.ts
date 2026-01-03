import { Transaction, FraudAnalysis, DashboardStats, TransactionType, RiskLevel } from './types';

const transactionTypes: TransactionType[] = ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT'];

const generateId = () => Math.random().toString(36).substring(2, 15);

const generateName = (prefix: string) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateMockTransaction = (overrides?: Partial<Transaction>): Transaction => {
  const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const amount = Math.floor(Math.random() * 50000) + 100;
  const oldBalanceOrig = Math.floor(Math.random() * 100000) + amount;
  
  return {
    id: generateId(),
    type,
    amount,
    nameOrig: generateName('C'),
    oldBalanceOrig,
    newBalanceOrig: oldBalanceOrig - amount,
    nameDest: generateName('M'),
    oldBalanceDest: Math.floor(Math.random() * 50000),
    newBalanceDest: Math.floor(Math.random() * 50000) + amount,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    status: Math.random() > 0.8 ? 'flagged' : Math.random() > 0.3 ? 'processed' : 'pending',
    ...overrides,
  };
};

export const generateMockTransactions = (count: number): Transaction[] => {
  return Array.from({ length: count }, () => generateMockTransaction());
};

export const mockTransactions: Transaction[] = generateMockTransactions(50);

export const generateMockFraudAnalysis = (transactionId: string): FraudAnalysis => {
  const riskScore = Math.random() * 100;
  let riskLevel: RiskLevel;
  
  if (riskScore < 30) riskLevel = 'low';
  else if (riskScore < 70) riskLevel = 'medium';
  else riskLevel = 'high';

  return {
    id: generateId(),
    transactionId,
    riskLevel,
    riskScore: Math.round(riskScore * 100) / 100,
    explanation: `This transaction has been analyzed using our advanced RAG-powered fraud detection system. The analysis considered multiple factors including transaction patterns, account history, and behavioral anomalies. ${riskLevel === 'high' ? 'Several red flags were detected that require immediate attention.' : riskLevel === 'medium' ? 'Some unusual patterns were identified that warrant monitoring.' : 'The transaction appears to follow normal patterns.'}`,
    factors: [
      {
        title: 'Transaction Amount',
        description: riskScore > 50 ? 'Amount significantly higher than account average' : 'Amount within normal range',
        impact: riskScore > 50 ? 'negative' : 'positive',
        weight: 0.25,
      },
      {
        title: 'Account History',
        description: riskScore > 70 ? 'Limited transaction history for this account' : 'Established transaction history',
        impact: riskScore > 70 ? 'negative' : 'positive',
        weight: 0.2,
      },
      {
        title: 'Geographic Pattern',
        description: riskScore > 60 ? 'Transaction origin differs from usual location' : 'Transaction from familiar location',
        impact: riskScore > 60 ? 'negative' : 'neutral',
        weight: 0.15,
      },
      {
        title: 'Time of Transaction',
        description: 'Transaction occurred during normal business hours',
        impact: 'positive',
        weight: 0.1,
      },
      {
        title: 'Recipient Verification',
        description: riskScore > 80 ? 'New recipient with no prior relationship' : 'Known recipient',
        impact: riskScore > 80 ? 'negative' : 'positive',
        weight: 0.3,
      },
    ],
    timestamp: new Date().toISOString(),
  };
};

export const mockDashboardStats: DashboardStats = {
  totalTransactions: 15847,
  flaggedTransactions: 342,
  totalVolume: 48750000,
  avgRiskScore: 23.5,
  recentAlerts: 12,
};
