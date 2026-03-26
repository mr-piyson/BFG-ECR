import { cn } from '@/lib/utils';
import {
  getStatusColor,
  getStatusLabel,
  FLOW_STATUS_COLORS,
  FLOW_STATUS_LABELS,
} from '@/lib/ecr-helpers';
import type { ECRStatus, ECRFlowStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ECRStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-medium',
        size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs',
        getStatusColor(status),
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

interface FlowStatusBadgeProps {
  status: ECRFlowStatus;
  className?: string;
}

export function FlowStatusBadge({ status, className }: FlowStatusBadgeProps) {
  const dotColor: Record<ECRFlowStatus, string> = {
    PROCEED: 'bg-green-500',
    PENDING: 'bg-yellow-400',
    RETURNED: 'bg-orange-500',
    SKIPPED: 'bg-slate-400',
    NOT_APPLICABLE: 'bg-slate-400',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium',
        FLOW_STATUS_COLORS[status],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor[status])} />
      {FLOW_STATUS_LABELS[status]}
    </span>
  );
}
