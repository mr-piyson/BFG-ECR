'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, X, Loader2 } from 'lucide-react';
import type { ECRStatus, StageType } from '@/lib/types';

interface ReturnDialogProps {
  ecrId: string;
  userId: string;
  stage: StageType;
  currentStatus: ECRStatus;
  availableTargets: { value: string; label: string }[];
  onClose: () => void;
  onUpdate: () => void;
}

export function ReturnDialog({
  ecrId,
  userId,
  stage,
  availableTargets,
  onClose,
  onUpdate,
}: ReturnDialogProps) {
  const [returnTo, setReturnTo] = useState(availableTargets[0]?.value || '');
  const [remark, setRemark] = useState('');
  const [returning, setReturning] = useState(false);

  async function handleReturn() {
    setReturning(true);
    try {
      const res = await fetch(`/api/ecrs/${ecrId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'return',
          userId,
          stage,
          returnToStage: returnTo,
          remark,
        }),
      });
      if (!res.ok) toast.error();
      toast.success('ECR returned for rework');
      onUpdate();
      onClose();
    } catch {
      toast.error('Failed to return ECR');
    } finally {
      setReturning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Return ECR for Rework</h2>
              <p className="text-xs text-muted-foreground">
                Select target stage and provide a remark
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Return To Stage</label>
            <select
              value={returnTo}
              onChange={(e) => setReturnTo(e.target.value)}
              className="w-full form-input"
            >
              {availableTargets.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Remark</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              placeholder="Describe the issue and what needs to be corrected..."
              className="w-full form-input resize-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReturn}
            disabled={returning}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 font-medium"
          >
            {returning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}
