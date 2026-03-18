'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Send, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/ecr-helpers'
import type { ECR, DesignInitialForm } from '@/lib/types'

interface Stage1FormProps {
  ecr: ECR & { project_code: string; design_engineer_name: string }
  userId: string
  form: DesignInitialForm | null
  onUpdate: () => void
}

export function Stage1Form({ ecr, userId, form, onUpdate }: Stage1FormProps) {
  const isEditable = ['DRAFT', 'RETURNED_TO_DESIGN'].includes(ecr.status)
  const isCurrentStage = ecr.current_stage === 'DESIGN_ENGINEER_INITIAL'

  const [data, setData] = useState({
    customer_cr_number: form?.customer_cr_number || '',
    cr_received_on: form?.cr_received_on ? form.cr_received_on.split('T')[0] : '',
    cr_by: form?.cr_by || '',
    change_description: form?.change_description || '',
    ecr_sheet_filled_on: form?.ecr_sheet_filled_on ? form.ecr_sheet_filled_on.split('T')[0] : '',
    is_skip_costing: form?.is_skip_costing ?? false,
    is_skip_project_manager: form?.is_skip_project_manager ?? false,
    is_skip_quality: form?.is_skip_quality ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/ecrs/${ecr.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_stage1', userId, stage: 'DESIGN_ENGINEER_INITIAL', formData: data }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Draft saved')
      onUpdate()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    if (!data.cr_received_on || !data.cr_by || !data.change_description) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ecrs/${ecr.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_stage1', userId, stage: 'DESIGN_ENGINEER_INITIAL', formData: data }),
      })
      if (!res.ok) throw new Error('Submit failed')
      toast.success('ECR submitted to workflow')
      onUpdate()
    } catch {
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No Stage 1 form found.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stage 1 — Design Engineer: Initial CR Form</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Fill the customer change request details and submit to workflow</p>
        </div>
        {form.flow_status !== 'PENDING' && (
          <div className="text-xs text-muted-foreground bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded">
            Submitted {formatDate(form.submitted_at)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Customer CR Number" hint="e.g. CR269342">
          <input
            type="text"
            value={data.customer_cr_number}
            onChange={e => setData(p => ({ ...p, customer_cr_number: e.target.value }))}
            disabled={!isEditable}
            placeholder="CR269342"
            className="form-input"
          />
        </FormField>

        <FormField label="CR Received On" required>
          <input
            type="date"
            value={data.cr_received_on}
            onChange={e => setData(p => ({ ...p, cr_received_on: e.target.value }))}
            disabled={!isEditable}
            className="form-input"
          />
        </FormField>

        <FormField label="CR Raised By" required hint="Customer name / department">
          <input
            type="text"
            value={data.cr_by}
            onChange={e => setData(p => ({ ...p, cr_by: e.target.value }))}
            disabled={!isEditable}
            placeholder="SNCF Engineering"
            className="form-input"
          />
        </FormField>

        <FormField label="ECR Sheet Filled On">
          <input
            type="date"
            value={data.ecr_sheet_filled_on}
            onChange={e => setData(p => ({ ...p, ecr_sheet_filled_on: e.target.value }))}
            disabled={!isEditable}
            className="form-input"
          />
        </FormField>
      </div>

      <FormField label="Change Description" required>
        <textarea
          value={data.change_description}
          onChange={e => setData(p => ({ ...p, change_description: e.target.value }))}
          disabled={!isEditable}
          rows={4}
          placeholder="Describe the engineering change in full detail..."
          className="form-input resize-none"
        />
      </FormField>

      {/* Skip Flags */}
      <div className="border border-border rounded-lg p-4 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Stage Skip Options</p>
        <p className="text-xs text-muted-foreground mb-3">Check to skip stages that are not applicable to this ECR.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SkipToggle
            label="Skip Costing"
            description="No cost impact"
            checked={data.is_skip_costing}
            onChange={v => setData(p => ({ ...p, is_skip_costing: v }))}
            disabled={!isEditable}
          />
          <SkipToggle
            label="Skip Project Manager"
            description="No PO/RoA required"
            checked={data.is_skip_project_manager}
            onChange={v => setData(p => ({ ...p, is_skip_project_manager: v }))}
            disabled={!isEditable}
          />
          <SkipToggle
            label="Skip Quality Check"
            description="Future production scope"
            checked={data.is_skip_quality}
            onChange={v => setData(p => ({ ...p, is_skip_quality: v }))}
            disabled={!isEditable}
          />
        </div>
      </div>

      {isEditable && isCurrentStage && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit to Workflow
          </button>
        </div>
      )}

      {!isEditable && (
        <div className="text-xs text-muted-foreground text-center py-2">
          This stage has been completed. View the audit trail for full history.
        </div>
      )}
    </div>
  )
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {hint && <span className="text-muted-foreground ml-1 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function SkipToggle({ label, description, checked, onChange, disabled }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled: boolean
}) {
  return (
    <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
      checked ? 'border-orange-200 bg-orange-50' : 'border-border bg-card hover:bg-muted/30'
    } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 rounded"
      />
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
    </label>
  )
}
