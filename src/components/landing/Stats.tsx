import React from 'react';

const stats = [
  { value: '99.9%', label: 'Detection Accuracy' },
  { value: '<50ms', label: 'Response Time' },
  { value: '$2.4B+', label: 'Fraud Prevented' },
  { value: '500M+', label: 'Transactions Analyzed' },
];

const Stats: React.FC = () => {
  return (
    <section className="py-20 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-display font-light tracking-tight gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
