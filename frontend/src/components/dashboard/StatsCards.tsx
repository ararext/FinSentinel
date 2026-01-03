import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, DollarSign, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (num: number) => {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num}`;
};

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      label: 'Total Transactions',
      value: formatNumber(stats.totalTransactions),
      icon: Activity,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Flagged Transactions',
      value: formatNumber(stats.flaggedTransactions),
      icon: AlertTriangle,
      trend: '-8.2%',
      trendUp: false,
      highlight: true,
    },
    {
      label: 'Total Volume',
      value: formatCurrency(stats.totalVolume),
      icon: DollarSign,
      trend: '+23.1%',
      trendUp: true,
    },
    {
      label: 'Avg Risk Score',
      value: `${stats.avgRiskScore}%`,
      icon: Percent,
      trend: '-2.3%',
      trendUp: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-border animate-pulse">
            <div className="w-20 h-4 bg-muted rounded mb-4" />
            <div className="w-32 h-8 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={cn(
            'p-6 rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-card',
            card.highlight && 'border-warning/30'
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              card.highlight ? 'bg-warning/10' : 'bg-accent/10'
            )}>
              <card.icon className={cn(
                'w-4 h-4',
                card.highlight ? 'text-warning' : 'text-accent'
              )} />
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <span className="text-2xl font-display font-semibold">{card.value}</span>
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              card.trendUp ? 'text-success' : 'text-danger'
            )}>
              {card.trendUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {card.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
