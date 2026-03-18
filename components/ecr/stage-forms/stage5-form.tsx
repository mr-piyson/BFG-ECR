'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, RotateCcw, Loader2, SkipForward, Award } from 'lucide-react'
import { formatDate } from '@/lib/ecr-helpers'
import { ReturnDialog } from '../return-dialog'
import type { ECR, QualityCheckForm, DesignInitialForm } from '@/lib/types'

interface Stage5FormProps {
  ecr: ECR
  userId: string
  form: QualityCheckForm | null
  designInitialForm: DesignInitialForm | null
  onUpdate: () => void
}

export function Stage5Form({ ecr, userId, form, designInitialForm, onUpdate }: Stage5FormProps) {
  const isSkipped = designInitialForm?.is_skip_quality
  const isActive = ecr.current_stage === 'QUALITY_FINAL_CHECK' && ['PENDING_QUALITY_CHECK', 'UNDER_QUALITY_CHECK'].includes(ecr.status)
  const isReleased = ecr.status === 'RELEASED'
  const [showReturn, setShowReturn] = useState(false)

  const [data, setData] = useState({
    quality_engineer_id: form?.quality_engineer_id || '',
    verification_result: form?.verification_result || 'OK',
    verified_in_train_set: form?.verified_in_train_set || '',
    verification_date: form?.verification_date ? form.verification_date.split('T')[0] : '',
    findings: form?.findings || '',
  })
  const [remark, setRemark] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleRelease() {
    if (!data.verification_result) {
      toast.error('Please select a verification result')
      return
    }
    setProcessing(true)
    try {
      const res = await fetch(`/api/ecrs/${ecr.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release_quality', userId, stage: 'QUALITY_FINAL_CHECK', formData: data, remark }),
      })
      if (!res.ok) throw new Error()
      toast.success('ECR Released!')
      onUpdate()
    } catch {
      toast.error('Failed to release ECR')
    } finally {
      setProcessing(false)
    }
  }

  if (isSkipped) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <SkipForward className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">Stage Skipped</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Design Engineer marked this stage as not applicable.</p>
      </div>
    )
  }

  if (isReleased) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-700 mb-1">ECR Released</h3>
        <p className="text-sm text-muted-foreground mb-4">Released on {formatDate(ecr.released_at)}</p>
        {form && (
          <div className="w-full max-w-sm bg-green-50 border border-green-200 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result:</span>
              <span className="font-medium text-green-700">{form.verification_result}</span>
            </div>
            {form.verified_in_train_set && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Train Set:</span>
                <span className="font-medium">{form.verified_in_train_set}</span>
              </div>
            )}
            {form.verification_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified:</span>
                <span className="font-medium">{formatDate(form.verification_date)}</span>
              </div>
            )}
            {form.findings && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-xs text-muted-foreground mb-1">Findings:</p>
                <p className="text-xs text-foreground">{form.findings}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stage 5 — Quality Engineer: Final Check</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Verify the change has been correctly implemented in the train set</p>
        </div>
        {form?.flow_status === 'PROCEED' && !isReleased && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified {formatDate(form.verification_date)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Quality Engineer">
          <input type="text" value={data.quality_engineer_id} onChange={e => setData(p => ({ ...p, quality_engineer_id: e.target.value }))} disabled={!isActive} placeholder="Diana Chen" className="form-input" />
        </FormField>
        <FormField label="Verification Result" required>
          <div className="flex gap-3">
            {['OK', 'Not OK'].map(v => (
              <label key={v} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                data.verification_result === v
                  ? v === 'OK' ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'
                  : 'border-border hover:bg-muted/30 text-muted-foreground'
              } ${!isActive ? 'cursor-not-allowed opacity-60' : ''}`}>
                <input type="radio" name="verification_result" value={v} checked={data.verification_result === v} onChange={() => setData(p => ({ ...p, verification_result: v }))} disabled={!isActive} className="sr-only" />
                <span className="text-sm font-medium">{v}</span>
              </label>
            ))}
          </div>
        </FormField>
        <FormField label="Verified In Train Set">
          <input type="text" value={data.verified_in_train_set} onChange={e => setData(p => ({ ...p, verified_in_train_set: e.target.value }))} disabled={!isActive} placeholder="TGV-001" className="form-input" />
        </FormField>
        <FormField label="Verification Date">
          <input type="date" value={data.verification_date} onChange={e => setData(p => ({ ...p, verification_date: e.target.value }))} disabled={!isActive} className="form-input" />
        </FormField>
      </div>

      <FormField label="Findings">
        <textarea value={data.findings} onChange={e => setData(p => ({ ...p, findings: e.target.value }))} disabled={!isActive} rows={4} className="form-input resize-none" placeholder="Describe the verification findings and any issues observed..." />
      </FormField>

      {isActive && (
        <>
          <FormField label="Remark (optional)">
            <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={2} className="form-input resize-none" placeholder="Optional remark when releasing..." />
          </FormField>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button onClick={() => setShowReturn(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-orange-200 text-orange-700 rounded hover:bg-orange-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              Return for Rework
            </button>
            <button onClick={handleRelease} disabled={processing} className="inline-flex items-center gap-2 px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold">
              {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
              Release ECR
            </button>
          </div>
        </>
      )}

      {showReturn && (
        <ReturnDialog
          ecrId={ecr.id}
          userId={userId}
          stage="QUALITY_FINAL_CHECK"
          currentStatus={ecr.status}
          availableTargets={[
            { value: 'DESIGN_ENGINEER_MEETING', label: 'Stage 4 — Design Meeting' },
            { value: 'PROJECT_MANAGER', label: 'Stage 3 — Project Manager' },
            { value: 'COSTING', label: 'Stage 2 — Costing' },
            { value: 'DESIGN_ENGINEER_INITIAL', label: 'Stage 1 — Design Engineer' },
          ]}
          onClose={() => setShowReturn(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
