import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CTA: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sidebar via-sidebar to-sidebar-accent p-12 md:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-light tracking-tight text-sidebar-foreground mb-4">
              Ready to secure your{' '}
              <span className="text-accent font-medium">transactions</span>?
            </h2>
            <p className="text-sidebar-foreground/70 text-lg mb-8">
              Start detecting fraud in real-time. No credit card required for the demo.
            </p>
            <Link to={isAuthenticated ? '/dashboard' : '/login'}>
              <Button variant="hero" size="xl">
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
