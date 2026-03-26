import { CheckCircle2, Circle, SkipForward, RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  STAGE_ORDER,
  STAGE_SHORT_LABELS,
  STAGE_OWNER_ROLE,
  ROLE_LABELS,
  formatDate,
} from '@/lib/ecr-helpers';
import type { StageType, ECRStatus, DesignInitialForm, StageHistory } from '@/lib/types';

interface StagePipelineProps {
  currentStage: StageType;
  status: ECRStatus;
  designInitialForm: DesignInitialForm | null;
  stageHistories: (StageHistory & {
    acted_by_name?: string;
    acted_by_role?: string;
  })[];
}

export function StagePipeline({
  currentStage,
  status,
  designInitialForm,
  stageHistories,
}: StagePipelineProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const isReleased = status === 'RELEASED';
  const isCancelled = status === 'CANCELLED';

  // Figure out skip flags per stage
  const skipFlags: Partial<Record<StageType, boolean>> = {
    COSTING: designInitialForm?.is_skip_costing ?? false,
    PROJECT_MANAGER: designInitialForm?.is_skip_project_manager ?? false,
    QUALITY_FINAL_CHECK: designInitialForm?.is_skip_quality ?? false,
  };

  // Get last history entry per stage
  const historyByStage: Partial<Record<StageType, StageHistory & { acted_by_name?: string }>> = {};
  for (const h of stageHistories) {
    historyByStage[h.stage] = h as StageHistory & { acted_by_name?: string };
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Stage Pipeline
      </h2>
      <div className="flex items-start gap-0">
        {STAGE_ORDER.map((stage, index) => {
          const isSkipped = skipFlags[stage];
          const isCurrent = stage === currentStage && !isReleased && !isCancelled;
          const isCompleted = isReleased || (!isCancelled && index < currentIndex && !isSkipped);
          const isReturned = stageHistories.some(
            (h) => h.stage === stage && h.flow_status === 'RETURNED',
          );
          const history = historyByStage[stage];
          const ownerRole = STAGE_OWNER_ROLE[stage];

          let statusIcon;
          if (isSkipped) {
            statusIcon = <SkipForward className="w-3.5 h-3.5 text-slate-400" />;
          } else if (isReturned && isCurrent) {
            statusIcon = <RotateCcw className="w-3.5 h-3.5 text-orange-500" />;
          } else if (isCompleted) {
            statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
          } else if (isCurrent) {
            statusIcon = <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />;
          } else {
            statusIcon = <Circle className="w-3.5 h-3.5 text-slate-300" />;
          }

          return (
            <div key={stage} className="flex-1 flex items-start">
              {/* Stage card */}
              <div className="flex-1">
                <div
                  className={cn(
                    'border rounded-lg p-3 transition-colors relative',
                    isCurrent && 'border-blue-200 bg-blue-50/50',
                    isCompleted && !isCurrent && 'border-green-100 bg-green-50/30',
                    isSkipped && 'border-slate-100 bg-slate-50/50 opacity-60',
                    !isCurrent && !isCompleted && !isSkipped && 'border-border bg-card',
                    isReturned && isCurrent && 'border-orange-200 bg-orange-50/40',
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-xs font-semibold leading-tight truncate',
                          isCurrent
                            ? 'text-blue-700'
                            : isCompleted
                              ? 'text-green-700'
                              : 'text-muted-foreground',
                        )}
                      >
                        {STAGE_SHORT_LABELS[stage]}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {ROLE_LABELS[ownerRole]}
                      </p>
                    </div>
                    <div className="flex-shrink-0">{statusIcon}</div>
                  </div>

                  {/* Stage status line */}
                  {isSkipped && <p className="text-[10px] text-slate-400 italic">Skipped</p>}
                  {isCompleted && history && (
                    <div>
                      <p className="text-[10px] text-green-600">{formatDate(history.created_at)}</p>
                      {history.acted_by_name && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {history.acted_by_name}
                        </p>
                      )}
                      {history.remark && (
                        <p className="text-[10px] text-muted-foreground/70 italic truncate mt-0.5">
                          &ldquo;{history.remark}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                  {isCurrent && !isSkipped && (
                    <p
                      className={cn(
                        'text-[10px] font-medium',
                        isReturned ? 'text-orange-600' : 'text-blue-600',
                      )}
                    >
                      {isReturned ? 'Returned — awaiting action' : 'Awaiting action'}
                    </p>
                  )}
                  {!isCurrent && !isCompleted && !isSkipped && (
                    <p className="text-[10px] text-muted-foreground/50">Not yet reached</p>
                  )}

                  {/* Current indicator bar */}
                  {isCurrent && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg bg-blue-400" />
                  )}
                  {isCompleted && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg bg-green-400" />
                  )}
                </div>
              </div>

              {/* Connector line between stages */}
              {index < STAGE_ORDER.length - 1 && (
                <div className="flex items-center h-12 flex-shrink-0 px-0.5 mt-1">
                  <div
                    className={cn(
                      'w-4 h-px',
                      isCompleted || isSkipped ? 'bg-green-300' : 'bg-border',
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Released end state */}
        <div className="flex items-center h-12 flex-shrink-0 px-0.5 mt-1">
          <div className={cn('w-4 h-px', isReleased ? 'bg-green-400' : 'bg-border')} />
        </div>
        <div
          className={cn(
            'flex-shrink-0 flex flex-col items-center justify-center border rounded-lg px-3 py-3 mt-0',
            isReleased ? 'border-green-200 bg-green-50' : 'border-border bg-muted/30 opacity-40',
          )}
        >
          <CheckCircle2
            className={cn('w-4 h-4 mb-1', isReleased ? 'text-green-600' : 'text-slate-300')}
          />
          <p
            className={cn(
              'text-[10px] font-semibold',
              isReleased ? 'text-green-700' : 'text-muted-foreground',
            )}
          >
            Released
          </p>
        </div>
      </div>
    </div>
  );
}
