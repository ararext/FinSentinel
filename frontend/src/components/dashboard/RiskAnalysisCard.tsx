import React from 'react';
import { FraudAnalysis } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface RiskAnalysisCardProps {
  analysis: FraudAnalysis;
  isLoading?: boolean;
}

const riskColors = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-destructive',
};

const riskBg = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-destructive',
};

type RiskBadgeVariant = 'risk-low' | 'risk-medium' | 'risk-high';

const riskBadgeVariants: Record<string, RiskBadgeVariant> = {
  low: 'risk-low',
  medium: 'risk-medium',
  high: 'risk-high',
};

const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border animate-pulse">
        <div className="w-32 h-6 bg-muted rounded mb-4" />
        <div className="w-full h-4 bg-muted rounded mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Risk Analysis</h3>
          <Badge variant={riskBadgeVariants[analysis.riskLevel]}>
            {analysis.riskScore <= 0.05
              ? 'NO RISK'
              : `${analysis.riskLevel.toUpperCase()} RISK`}
          </Badge>
        </div>

        {/* Risk Score Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Risk Score</span>
            <span className={cn('font-semibold', riskColors[analysis.riskLevel])}>
              {analysis.riskScore.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', riskBg[analysis.riskLevel])}
              style={{ width: `${analysis.riskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="p-6 bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
            <Info className="w-4 h-4 text-accent" />
          </div>
          <span className="text-sm font-medium">AI-Generated Explanation</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {analysis.explanation}
        </p>
      </div>
    </div>
  );
};

export default RiskAnalysisCard;
