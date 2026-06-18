import { Check } from 'lucide-react';
import type { EscrowStatus, OrderStatus } from '@/types';

interface EscrowTimelineProps {
  currentStatus: EscrowStatus;
  orderStatus: OrderStatus;
}

interface Step {
  key: string;
  label: string;
  description: string;
}

const steps: Step[] = [
  { key: 'payment', label: 'Pembayaran', description: 'Buyer melakukan pembayaran' },
  { key: 'held', label: 'Dana Ditahan', description: 'Dana aman di escrow' },
  { key: 'delivery', label: 'Pengiriman', description: 'Barang dalam perjalanan' },
  { key: 'qc', label: 'E-QC', description: 'Verifikasi kualitas elektronik' },
  { key: 'released', label: 'Pencairan', description: 'Dana dicairkan ke petani' },
];

function getActiveStepIndex(
  escrowStatus: EscrowStatus,
  orderStatus: OrderStatus
): number {
  if (orderStatus === 'cancelled') return -1;

  switch (escrowStatus) {
    case 'pending':
      return 0;
    case 'captured':
      return 1;
    case 'on_hold':
      if (orderStatus === 'in_delivery') return 2;
      return 1;
    case 'released':
      return 4;
    case 'refunded':
      return -1;
    default:
      break;
  }

  // Fallback based on order status
  switch (orderStatus) {
    case 'pending_payment':
      return 0;
    case 'paid':
    case 'on_hold':
      return 1;
    case 'in_delivery':
      return 2;
    case 'delivered':
      return 3;
    case 'completed':
      return 4;
    default:
      return 0;
  }
}

type StepState = 'completed' | 'active' | 'upcoming';

function getStepState(stepIndex: number, activeIndex: number): StepState {
  if (activeIndex < 0) return 'upcoming'; // cancelled
  if (stepIndex < activeIndex) return 'completed';
  if (stepIndex === activeIndex) return 'active';
  return 'upcoming';
}

export default function EscrowTimeline({
  currentStatus,
  orderStatus,
}: EscrowTimelineProps) {
  const activeIndex = getActiveStepIndex(currentStatus, orderStatus);

  return (
    <div className="w-full">
      {/* Desktop timeline (horizontal) */}
      <div className="hidden sm:flex items-start">
        {steps.map((step, i) => {
          const state = getStepState(i, activeIndex);
          const isLast = i === steps.length - 1;

          return (
            <div
              key={step.key}
              className={`flex-1 flex flex-col items-center relative ${
                isLast ? '' : ''
              }`}
            >
              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    state === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step circle */}
              <div
                className={`
                  relative z-10 flex items-center justify-center h-8 w-8 rounded-full
                  border-2 transition-all duration-300
                  ${
                    state === 'completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : state === 'active'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/20'
                      : 'bg-slate-800 border-slate-600 text-slate-500'
                  }
                `}
              >
                {state === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <p
                className={`mt-2 text-xs font-medium text-center ${
                  state === 'completed'
                    ? 'text-emerald-400'
                    : state === 'active'
                    ? 'text-white'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-slate-600 text-center mt-0.5 max-w-[100px]">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile timeline (vertical) */}
      <div className="sm:hidden space-y-0">
        {steps.map((step, i) => {
          const state = getStepState(i, activeIndex);
          const isLast = i === steps.length - 1;

          return (
            <div key={step.key} className="flex gap-3">
              {/* Line + circle column */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center h-7 w-7 rounded-full
                    border-2 shrink-0 transition-all duration-300
                    ${
                      state === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : state === 'active'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-600 text-slate-500'
                    }
                  `}
                >
                  {state === 'completed' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 ${
                      state === 'completed' ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-6">
                <p
                  className={`text-sm font-medium ${
                    state === 'completed'
                      ? 'text-emerald-400'
                      : state === 'active'
                      ? 'text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
