'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, RotateCcw, Loader2, SkipForward } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/ecr-helpers';
import { ReturnDialog } from '../return-dialog';
import type { ECR, CostingForm, DesignInitialForm } from '@/lib/types';

interface Stage2FormProps {
  ecr: ECR;
  userId: string;
  form: CostingForm | null;
  designInitialForm: DesignInitialForm | null;
  onUpdate: () => void;
}

export function Stage2Form({ ecr, userId, form, designInitialForm, onUpdate }: Stage2FormProps) {
  const isSkipped = designInitialForm?.is_skip_costing;
  const isActive =
    ecr.current_stage === 'COSTING' && ['PENDING_COSTING', 'UNDER_COSTING'].includes(ecr.status);
  const isCompleted = form?.flow_status === 'PROCEED';
  const [showReturn, setShowReturn] = useState(false);

  const [data, setData] = useState({
    costing_engineer_id: form?.costing_engineer_id || '',
    date_of_quote: form?.date_of_quote ? form.date_of_quote.split('T')[0] : '',
    offer_to_customer_date: form?.offer_to_customer_date
      ? form.offer_to_customer_date.split('T')[0]
      : '',
    has_nrc_cost: form?.has_nrc_cost ?? false,
    nrc_amount: form?.nrc_amount || '',
    has_rc_cost: form?.has_rc_cost ?? false,
    rc_amount: form?.rc_amount || '',
    currency: form?.currency || 'EUR',
    cost_details: form?.cost_details || '',
  });
  const [remark, setRemark] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleProcess() {
    if (!data.costing_engineer_id) {
      toast.error('Please enter the costing engineer name');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/ecrs/${ecr.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_costing',
          userId,
          stage: 'COSTING',
          formData: data,
          remark,
        }),
      });
      if (!res.ok) toast.error();
      toast.success('Costing processed — ECR advanced');
      onUpdate();
    } catch {
      toast.error('Failed to process costing');
    } finally {
      setProcessing(false);
    }
  }

  if (isSkipped) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <SkipForward className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">Stage Skipped</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Design Engineer marked this stage as not applicable (no cost impact).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stage 2 — Costing Engineer</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assess cost impact and fill quote details
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Processed {formatDate(form?.processed_on)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Costing Engineer" required>
          <input
            type="text"
            value={data.costing_engineer_id}
            onChange={(e) => setData((p) => ({ ...p, costing_engineer_id: e.target.value }))}
            disabled={!isActive}
            placeholder="Wafa Ali"
            className="form-input"
          />
        </FormField>
        <FormField label="Currency">
          <select
            value={data.currency}
            onChange={(e) => setData((p) => ({ ...p, currency: e.target.value }))}
            disabled={!isActive}
            className="form-input"
          >
            {['EUR', 'USD', 'GBP', 'CHF'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Date of Quote">
          <input
            type="date"
            value={data.date_of_quote}
            onChange={(e) => setData((p) => ({ ...p, date_of_quote: e.target.value }))}
            disabled={!isActive}
            className="form-input"
          />
        </FormField>
        <FormField label="Offer to Customer Date">
          <input
            type="date"
            value={data.offer_to_customer_date}
            onChange={(e) => setData((p) => ({ ...p, offer_to_customer_date: e.target.value }))}
            disabled={!isActive}
            className="form-input"
          />
        </FormField>
      </div>

      {/* NRC Cost */}
      <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.has_nrc_cost}
            onChange={(e) => setData((p) => ({ ...p, has_nrc_cost: e.target.checked }))}
            disabled={!isActive}
            className="rounded"
          />
          <span className="text-sm font-medium text-foreground">Non-Recurring Cost (NRC)</span>
        </label>
        {data.has_nrc_cost && (
          <FormField label="NRC Amount">
            <input
              type="number"
              step="0.01"
              value={data.nrc_amount}
              onChange={(e) => setData((p) => ({ ...p, nrc_amount: e.target.value }))}
              disabled={!isActive}
              placeholder="45000.00"
              className="form-input"
            />
          </FormField>
        )}
      </div>

      {/* RC Cost */}
      <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.has_rc_cost}
            onChange={(e) => setData((p) => ({ ...p, has_rc_cost: e.target.checked }))}
            disabled={!isActive}
            className="rounded"
          />
          <span className="text-sm font-medium text-foreground">Recurring Cost (RC)</span>
        </label>
        {data.has_rc_cost && (
          <FormField label="RC Amount">
            <input
              type="number"
              step="0.01"
              value={data.rc_amount}
              onChange={(e) => setData((p) => ({ ...p, rc_amount: e.target.value }))}
              disabled={!isActive}
              placeholder="1200.00"
              className="form-input"
            />
          </FormField>
        )}
      </div>

      <FormField label="Cost Details / Notes">
        <textarea
          value={data.cost_details}
          onChange={(e) => setData((p) => ({ ...p, cost_details: e.target.value }))}
          disabled={!isActive}
          rows={3}
          className="form-input resize-none"
          placeholder="Additional cost notes..."
        />
      </FormField>

      {/* Completed summary */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 space-y-1">
          {data.has_nrc_cost && (
            <p>
              NRC: <strong>{formatCurrency(data.nrc_amount, data.currency)}</strong>
            </p>
          )}
          {data.has_rc_cost && (
            <p>
              RC: <strong>{formatCurrency(data.rc_amount, data.currency)}</strong>
            </p>
          )}
          {!data.has_nrc_cost && !data.has_rc_cost && <p>No cost impact.</p>}
          {form?.remark && <p className="text-xs italic mt-1">&ldquo;{form.remark}&rdquo;</p>}
        </div>
      )}

      {isActive && (
        <>
          <FormField label="Remark (optional)">
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={2}
              className="form-input resize-none"
              placeholder="Optional remark when processing..."
            />
          </FormField>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={() => setShowReturn(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-orange-200 text-orange-700 rounded hover:bg-orange-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Return to Design
            </button>
            <button
              onClick={handleProcess}
              disabled={processing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              {processing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Mark as Processed
            </button>
          </div>
        </>
      )}

      {showReturn && (
        <ReturnDialog
          ecrId={ecr.id}
          userId={userId}
          stage="COSTING"
          currentStatus={ecr.status}
          availableTargets={[
            { value: 'DESIGN_ENGINEER_INITIAL', label: 'Stage 1 — Design Engineer' },
          ]}
          onClose={() => setShowReturn(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
