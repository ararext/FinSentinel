import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { transactionsApi } from '@/lib/api';
import { TransactionType, TransactionFormData } from '@/lib/types';
import { useToastNotification } from '@/components/Toast';
import { PlusCircle } from 'lucide-react';

const transactionSchema = z.object({
  step: z
    .number({ invalid_type_error: 'Step is required' })
    .int('Step must be an integer')
    .min(1, 'Step must be at least 1'),
  type: z.enum(['PAYMENT', 'TRANSFER', 'CASH_OUT', 'CASH_IN', 'DEBIT']),
  amount: z.number().positive('Amount must be positive'),
  nameOrig: z.string().min(1, 'Sender name is required'),
  oldBalanceOrig: z.number().min(0, 'Balance cannot be negative'),
  newBalanceOrig: z.number().min(0, 'Balance cannot be negative'),
  nameDest: z.string().min(1, 'Receiver name is required'),
  oldBalanceDest: z.number().min(0, 'Balance cannot be negative'),
  newBalanceDest: z.number().min(0, 'Balance cannot be negative'),
});

type FormData = z.infer<typeof transactionSchema>;

const transactionTypes: { value: TransactionType; label: string }[] = [
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'CASH_OUT', label: 'Cash Out' },
  { value: 'CASH_IN', label: 'Cash In' },
  { value: 'DEBIT', label: 'Debit' },
];

const NewTransaction: React.FC = () => {
  const toast = useToastNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      step: 1,
      type: 'TRANSFER',
      amount: 0,
      nameOrig: '',
      oldBalanceOrig: 0,
      newBalanceOrig: 0,
      nameDest: '',
      oldBalanceDest: 0,
      newBalanceDest: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData: TransactionFormData = {
        step: data.step,
        type: data.type,
        amount: data.amount,
        nameOrig: data.nameOrig,
        oldBalanceOrig: data.oldBalanceOrig,
        newBalanceOrig: data.newBalanceOrig,
        nameDest: data.nameDest,
        oldBalanceDest: data.oldBalanceDest,
        newBalanceDest: data.newBalanceDest,
      };
      const result = await transactionsApi.create(formData);
      if (result.success) {
        toast.success('Transaction Created', 'The transaction has been submitted for processing.');
        reset();
      } else {
        toast.error('Error', result.error || 'Failed to create transaction.');
      }
    } catch (error) {
      toast.error('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-light tracking-tight mb-2">
          Create New Transaction
        </h2>
        <p className="text-muted-foreground">
          Submit a transaction for fraud analysis and risk scoring.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Transaction Metadata */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Transaction Details (API fields)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              {...register('step', { valueAsNumber: true })}
              type="number"
              label="step"
              placeholder="1"
              error={errors.step?.message}
            />
            <div className="md:col-span-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">type</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {transactionTypes.map((type) => (
                  <label
                    key={type.value}
                    className="relative flex items-center justify-center p-3 rounded-xl border border-border cursor-pointer transition-all hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                  >
                    <input
                      type="radio"
                      {...register('type')}
                      value={type.value}
                      className="absolute opacity-0"
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="mt-2 text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Amount (amount) */}
          <h4 className="text-xs font-medium text-muted-foreground mb-2">amount</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="col-span-2 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 text-lg"
                error={errors.amount?.message}
              />
            </div>
          </div>
        </div>

        {/* Sender Details */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Sender Details (nameOrig, oldbalanceOrg, newbalanceOrig)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              {...register('nameOrig')}
              label="nameOrig"
              placeholder="C1234567890"
              error={errors.nameOrig?.message}
            />
            <Input
              {...register('oldBalanceOrig', { valueAsNumber: true })}
              type="number"
              step="0.01"
              label="oldbalanceOrg"
              placeholder="0.00"
              error={errors.oldBalanceOrig?.message}
            />
            <Input
              {...register('newBalanceOrig', { valueAsNumber: true })}
              type="number"
              step="0.01"
              label="newbalanceOrig"
              placeholder="0.00"
              error={errors.newBalanceOrig?.message}
            />
          </div>
        </div>

        {/* Receiver Details */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Receiver Details (nameDest, oldbalanceDest, newbalanceDest)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              {...register('nameDest')}
              label="nameDest"
              placeholder="M9876543210"
              error={errors.nameDest?.message}
            />
            <Input
              {...register('oldBalanceDest', { valueAsNumber: true })}
              type="number"
              step="0.01"
              label="oldbalanceDest"
              placeholder="0.00"
              error={errors.oldBalanceDest?.message}
            />
            <Input
              {...register('newBalanceDest', { valueAsNumber: true })}
              type="number"
              step="0.01"
              label="newbalanceDest"
              placeholder="0.00"
              error={errors.newBalanceDest?.message}
            />
          </div>
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          variant="hero" 
          size="lg" 
          className="w-full"
          isLoading={isSubmitting}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Submit Transaction
        </Button>
      </form>
    </div>
  );
};

export default NewTransaction;
