import React, { useState, useEffect, useRef } from 'react';
import TransactionTable from '@/components/dashboard/TransactionTable';
import { transactionsApi } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Radio, Pause, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LiveStream: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      const result = await transactionsApi.getLive();
      if (result.success && result.data) {
        setTransactions(result.data);
      }
      setIsLoading(false);
    };

    fetchInitial();
  }, []);

  useEffect(() => {
    if (isStreaming) {
      const poll = async () => {
        const result = await transactionsApi.getLive();
        if (result.success && result.data) {
          setTransactions(result.data);
        }
      };

      // Initial poll when streaming starts
      poll();

      intervalRef.current = setInterval(poll, 2500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming]);

  const handleSelectTransaction = (tx: Transaction) => {
    navigate(`/dashboard/results?id=${tx.id}`);
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Live Transaction Stream</h2>
          <Badge variant={isStreaming ? 'success' : 'secondary'} className="flex items-center gap-1.5">
            <Radio className="w-3 h-3" />
            {isStreaming ? 'Streaming' : 'Paused'}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleStreaming}
        >
          {isStreaming ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </>
          )}
        </Button>
      </div>

      {/* Info banner */}
      <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
        <p className="text-sm text-muted-foreground">
          <span className="text-accent font-medium">Live Mode:</span> New transactions appear in real-time. 
          Click on any transaction to view its fraud analysis.
        </p>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onSelect={handleSelectTransaction}
      />
    </div>
  );
};

export default LiveStream;
