import React, { useState, useEffect } from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import TransactionTable from '@/components/dashboard/TransactionTable';
import { dashboardApi, transactionsApi } from '@/lib/api';
import { DashboardStats, Transaction } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (withLoading: boolean) => {
      if (!isMounted) return;

      if (withLoading) {
        setIsLoading(true);
      }

      try {
        const [statsRes, txRes] = await Promise.all([
          dashboardApi.getStats(),
          transactionsApi.getAll(),
        ]);

        if (!isMounted) return;

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (txRes.success && txRes.data) {
          setTransactions(txRes.data.slice(0, 10));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch dashboard data:', error);
        }
      } finally {
        if (withLoading && isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial load with skeletons
    void fetchData(true);

    // Poll periodically so the dashboard stays in sync
    // with the live transaction stream.
    const intervalId = window.setInterval(() => {
      void fetchData(false);
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleSelectTransaction = (tx: Transaction) => {
    navigate(`/dashboard/results?id=${tx.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <StatsCards 
        stats={stats || { totalTransactions: 0, flaggedTransactions: 0, totalVolume: 0, avgRiskScore: 0, recentAlerts: 0 }} 
        isLoading={isLoading} 
      />

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <button 
            onClick={() => navigate('/dashboard/live')}
            className="text-sm text-accent hover:underline"
          >
            View all
          </button>
        </div>
        <TransactionTable 
          transactions={transactions} 
          isLoading={isLoading}
          onSelect={handleSelectTransaction}
        />
      </div>
    </div>
  );
};

export default DashboardHome;
