import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Activity, Brain, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Hero: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 animate-fade-up">
            <Shield className="w-4 h-4" />
            <span>Enterprise-Grade Fraud Detection</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-display font-light tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Protect Your Business with{' '}
            <span className="gradient-text font-medium">
              AI-Powered
            </span>{' '}
            Fraud Detection
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Real-time transaction monitoring powered by advanced machine learning 
            and RAG-enhanced explanations. Detect, analyze, and prevent fraud before it happens.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="hero" size="xl">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Button variant="hero-secondary" size="xl" disabled>
                  View Demo
                </Button>
              </>
            )}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Activity, label: 'Live Streaming' },
              { icon: Brain, label: 'ML Prediction' },
              { icon: Zap, label: 'RAG Explanations' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
              >
                <feature.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
