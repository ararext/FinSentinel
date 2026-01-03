import React from 'react';
import { Activity, Brain, Shield, BarChart3, Clock, Lock } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Real-Time Streaming',
    description: 'Monitor transactions as they happen with sub-second latency and instant alerts.',
  },
  {
    icon: Brain,
    title: 'ML-Powered Detection',
    description: 'Advanced machine learning models trained on millions of transactions to identify patterns.',
  },
  {
    icon: Shield,
    title: 'RAG Explanations',
    description: 'Understand every decision with AI-generated explanations powered by retrieval-augmented generation.',
  },
  {
    icon: BarChart3,
    title: 'Risk Scoring',
    description: 'Comprehensive risk scores with detailed breakdowns of contributing factors.',
  },
  {
    icon: Clock,
    title: '24/7 Monitoring',
    description: 'Continuous surveillance with automated escalation and response protocols.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance with SOC 2, PCI-DSS, and GDPR standards.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-light tracking-tight mb-4">
            Built for <span className="gradient-text font-medium">Modern Finance</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to protect your business from financial fraud
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-card"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
