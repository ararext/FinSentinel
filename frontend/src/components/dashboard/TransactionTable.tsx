import React from 'react';
import { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onSelect?: (transaction: Transaction) => void;
}

type TypeVariant = 'payment' | 'transfer' | 'cash-out' | 'cash-in' | 'debit';
type StatusVariant = 'pending' | 'processed' | 'flagged';

const typeVariants: Record<string, TypeVariant> = {
  PAYMENT: 'payment',
  TRANSFER: 'transfer',
  CASH_OUT: 'cash-out',
  CASH_IN: 'cash-in',
  DEBIT: 'debit',
};

const statusVariants: Record<string, StatusVariant> = {
  pending: 'pending',
  processed: 'processed',
  flagged: 'flagged',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  isLoading,
  onSelect 
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 animate-pulse">
              <div className="w-24 h-4 bg-muted rounded" />
              <div className="w-20 h-6 bg-muted rounded-full" />
              <div className="w-32 h-4 bg-muted rounded" />
              <div className="flex-1" />
              <div className="w-20 h-6 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Time
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Type
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Amount
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Sender
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Receiver
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => (
              <tr 
                key={tx.id}
                onClick={() => onSelect?.(tx)}
                className={cn(
                  'transition-colors',
                  onSelect && 'cursor-pointer hover:bg-muted/30'
                )}
              >
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {format(new Date(tx.timestamp), 'MMM dd, HH:mm:ss')}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={typeVariants[tx.type] || 'default'}>
                    {tx.type.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                  {tx.nameOrig.slice(0, 12)}...
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                  {tx.nameDest.slice(0, 12)}...
                </td>
                <td className="px-6 py-4">
                  <Badge variant={statusVariants[tx.status]}>
                    {tx.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
