import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { CheckoutStep } from '@shared/types';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep }) => {
  const { t } = useTranslation();
  const steps: { id: CheckoutStep; label: string }[] = [
    { id: 'address', label: t('checkout.stepAddress') },
    { id: 'payment', label: t('checkout.stepPayment') },
    { id: 'review', label: t('checkout.stepReview') },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <ol className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        
        return (
          <li
            key={step.id}
            className={`flex w-full items-center ${
              index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""
            } ${isCompleted || isCurrent ? 'text-secondary after:border-secondary' : 'text-gray-400 after:border-gray-200'}`}
          >
            <div className="flex flex-col items-center">
                <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    isCompleted ? 'bg-secondary text-white' : isCurrent ? 'border-2 border-secondary text-secondary' : 'bg-gray-200'
                }`}>
                    {index + 1}
                </span>
                <span className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-primary' : 'text-text-secondary'}`}>{step.label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default CheckoutStepper;