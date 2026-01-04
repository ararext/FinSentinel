import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RiskAnalysisCard from '@/components/dashboard/RiskAnalysisCard';
import TransactionTable from '@/components/dashboard/TransactionTable';
import { fraudApi, transactionsApi } from '@/lib/api';
import { FraudAnalysis, Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const RiskResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [analysis, setAnalysis] = useState<FraudAnalysis | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTransactions = async (showLoading: boolean) => {
      if (!isMounted) return;
      if (showLoading) {
        setIsLoadingTx(true);
      }
      const result = await transactionsApi.getLive();
      if (result.success && result.data && isMounted) {
        const liveTx = result.data;
        setTransactions(liveTx);

        // Auto-select if ID provided from query string
        if (selectedId) {
          const found = liveTx.find((tx) => tx.id === selectedId);
          if (found) {
            handleSelectTransaction(found);
          }
        }
      }
      if (isMounted && showLoading) {
        setIsLoadingTx(false);
      }
    };

    // Initial fetch
    fetchTransactions(true);

    // Keep Risk Results in sync with the Live Stream by polling
    // the same backend endpoint on a fixed interval.
    const intervalId = setInterval(() => fetchTransactions(false), 2500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedId]);

  const handleSelectTransaction = async (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsLoadingAnalysis(true);
    
    const result = await fraudApi.analyze(tx);
    if (result.success && result.data) {
      setAnalysis(result.data);
    }
    setIsLoadingAnalysis(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Transaction List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Analyzed Transactions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a transaction to view its fraud analysis
        </p>
        <TransactionTable
          transactions={transactions}
          isLoading={isLoadingTx}
          onSelect={handleSelectTransaction}
        />
      </div>

      {/* Right: Analysis Details */}
      <div className="space-y-4">
        {selectedTransaction ? (
          <>
            {/* Transaction Summary */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Transaction Details</h3>
                <Badge variant={selectedTransaction.type.toLowerCase().replace('_', '-') as any}>
                  {selectedTransaction.type}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-semibold text-lg">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time</span>
                  <p className="font-medium">{format(new Date(selectedTransaction.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sender</span>
                  <p className="font-mono text-xs">{selectedTransaction.nameOrig}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Receiver</span>
                  <p className="font-mono text-xs">{selectedTransaction.nameDest}</p>
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            {analysis && (
              <RiskAnalysisCard analysis={analysis} isLoading={isLoadingAnalysis} />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-96 rounded-2xl bg-card border border-border">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">No Transaction Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a transaction from the list to view its fraud analysis and risk assessment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskResults;
