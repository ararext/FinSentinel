import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToastNotification } from '@/components/Toast';
import { authApi } from '@/lib/api';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setAuthError(null);
    setIsLoading(true);
    
    const result = await authApi.signup({
      email: data.email,
      password: data.password,
    });
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Account created!', 'Please sign in with your credentials.');
      navigate('/login');
    } else {
      setAuthError(result.error || 'Signup failed. Please try again.');
      toast.error('Signup failed', result.error || 'Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="font-display font-semibold text-xl">FraudShield</span>
            </div>
            <h1 className="text-3xl font-display font-light tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Get started with AI-powered fraud detection.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {authError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email address"
                  className="pl-11"
                  error={errors.email?.message}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  className="pl-11"
                  error={errors.password?.message}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirm password"
                  className="pl-11"
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-sidebar-primary/20 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-sidebar-primary" />
          </div>
          <h2 className="text-2xl font-display font-light text-sidebar-foreground mb-4">
            Real-Time Fraud Detection
          </h2>
          <p className="text-sidebar-foreground/60">
            Monitor transactions, analyze risk patterns, and protect your business 
            with AI-powered fraud detection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
