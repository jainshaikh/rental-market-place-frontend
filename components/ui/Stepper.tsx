import { Check } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export interface StepDefinition {
  label: string;
}

interface StepperProps {
  steps: StepDefinition[];
  /** 1-indexed current step. */
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const stepNumber = i + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;
        return (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold',
                  done || active ? 'bg-brand-600 text-white' : 'bg-surface-hover text-text-faint',
                )}
              >
                {done ? <Check className="h-[13px] w-[13px]" /> : stepNumber}
              </span>
              <span className={cn('whitespace-nowrap text-[13px] font-semibold', active || done ? 'text-ink' : 'text-text-faint')}>
                {step.label}
              </span>
            </div>
            {stepNumber < steps.length && (
              <span className={cn('mx-3.5 h-0.5 flex-1', done ? 'bg-brand-600' : 'bg-border-subtle')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
