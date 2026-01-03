import React from 'react';

const features = [
  { title: 'Event-Driven', subtitle: 'Pathway Streaming Engine' },
  { title: 'Continuous', subtitle: 'Transaction Ingestion' },
  { title: 'Explainable AI', subtitle: 'RAG-Based Risk Reasoning' },
  { title: 'Live Demo', subtitle: 'End-to-End Fraud Pipeline' },
];

const Stats: React.FC = () => {
  return (
    <section className="py-20 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-display font-light tracking-tight gradient-text mb-2">
                {feature.title}
              </div>
              <div className="text-sm text-muted-foreground">{feature.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
