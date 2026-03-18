import type { ECRStatus, ECRFlowStatus, StageType, UserRole } from './types'

// ============================================================
// Status Display Helpers
// ============================================================

export const STATUS_LABELS: Record<ECRStatus, string> = {
  DRAFT: 'Draft',
  PENDING_COSTING: 'Pending Costing',
  UNDER_COSTING: 'Under Costing',
  PENDING_PROJECT_MANAGER: 'Pending PM',
  UNDER_PROJECT_MANAGER: 'Under PM',
  PENDING_DESIGN_MEETING: 'Pending Meeting',
  UNDER_DESIGN_MEETING: 'Under Meeting',
  PENDING_QUALITY_CHECK: 'Pending Quality',
  UNDER_QUALITY_CHECK: 'Under Quality',
  RELEASED: 'Released',
  RETURNED_TO_DESIGN: 'Returned to Design',
  RETURNED_TO_COSTING: 'Returned to Costing',
  RETURNED_TO_PROJECT_MANAGER: 'Returned to PM',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
}

export const STATUS_COLORS: Record<ECRStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING_COSTING: 'bg-blue-50 text-blue-700 border-blue-200',
  UNDER_COSTING: 'bg-blue-100 text-blue-800 border-blue-300',
  PENDING_PROJECT_MANAGER: 'bg-teal-50 text-teal-700 border-teal-200',
  UNDER_PROJECT_MANAGER: 'bg-teal-100 text-teal-800 border-teal-300',
  PENDING_DESIGN_MEETING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  UNDER_DESIGN_MEETING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  PENDING_QUALITY_CHECK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UNDER_QUALITY_CHECK: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  RELEASED: 'bg-green-100 text-green-800 border-green-300',
  RETURNED_TO_DESIGN: 'bg-orange-50 text-orange-700 border-orange-200',
  RETURNED_TO_COSTING: 'bg-orange-50 text-orange-700 border-orange-200',
  RETURNED_TO_PROJECT_MANAGER: 'bg-orange-50 text-orange-700 border-orange-200',
  ON_HOLD: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

export const FLOW_STATUS_COLORS: Record<ECRFlowStatus, string> = {
  PROCEED: 'bg-green-100 text-green-700 border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  RETURNED: 'bg-orange-50 text-orange-700 border-orange-200',
  SKIPPED: 'bg-slate-100 text-slate-500 border-slate-200',
  NOT_APPLICABLE: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const FLOW_STATUS_LABELS: Record<ECRFlowStatus, string> = {
  PROCEED: 'Proceed',
  PENDING: 'Pending',
  RETURNED: 'Returned',
  SKIPPED: 'Skipped',
  NOT_APPLICABLE: 'N/A',
}

export const STAGE_LABELS: Record<StageType, string> = {
  DESIGN_ENGINEER_INITIAL: 'Stage 1 — Design Engineer',
  COSTING: 'Stage 2 — Costing',
  PROJECT_MANAGER: 'Stage 3 — Project Manager',
  DESIGN_ENGINEER_MEETING: 'Stage 4 — Design Meeting',
  QUALITY_FINAL_CHECK: 'Stage 5 — Quality Check',
}

export const STAGE_SHORT_LABELS: Record<StageType, string> = {
  DESIGN_ENGINEER_INITIAL: 'Design (Initial)',
  COSTING: 'Costing',
  PROJECT_MANAGER: 'Project Manager',
  DESIGN_ENGINEER_MEETING: 'Design Meeting',
  QUALITY_FINAL_CHECK: 'Quality Check',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  DESIGN_ENGINEER: 'Design Engineer',
  COSTING_ENGINEER: 'Costing Engineer',
  PROJECT_ENGINEER: 'Project Engineer',
  QUALITY_ENGINEER: 'Quality Engineer',
  ADMIN: 'Admin',
}

// Alias for use in components
export const USER_ROLES = ROLE_LABELS

export const ROLE_COLORS: Record<UserRole, string> = {
  DESIGN_ENGINEER: 'bg-indigo-100 text-indigo-700',
  COSTING_ENGINEER: 'bg-blue-100 text-blue-700',
  PROJECT_ENGINEER: 'bg-teal-100 text-teal-700',
  QUALITY_ENGINEER: 'bg-emerald-100 text-emerald-700',
  ADMIN: 'bg-slate-100 text-slate-700',
}

export const STAGE_ORDER: StageType[] = [
  'DESIGN_ENGINEER_INITIAL',
  'COSTING',
  'PROJECT_MANAGER',
  'DESIGN_ENGINEER_MEETING',
  'QUALITY_FINAL_CHECK',
]

// Which role owns which stage
export const STAGE_OWNER_ROLE: Record<StageType, UserRole> = {
  DESIGN_ENGINEER_INITIAL: 'DESIGN_ENGINEER',
  COSTING: 'COSTING_ENGINEER',
  PROJECT_MANAGER: 'PROJECT_ENGINEER',
  DESIGN_ENGINEER_MEETING: 'DESIGN_ENGINEER',
  QUALITY_FINAL_CHECK: 'QUALITY_ENGINEER',
}

// What status the ECR is in while this stage is pending
export const STAGE_PENDING_STATUS: Record<StageType, ECRStatus> = {
  DESIGN_ENGINEER_INITIAL: 'DRAFT',
  COSTING: 'PENDING_COSTING',
  PROJECT_MANAGER: 'PENDING_PROJECT_MANAGER',
  DESIGN_ENGINEER_MEETING: 'PENDING_DESIGN_MEETING',
  QUALITY_FINAL_CHECK: 'PENDING_QUALITY_CHECK',
}

export function getStatusLabel(status: ECRStatus): string {
  return STATUS_LABELS[status] ?? status
}

export function getStatusColor(status: ECRStatus): string {
  return STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'
}

export function isTerminalStatus(status: ECRStatus): boolean {
  return status === 'RELEASED' || status === 'CANCELLED'
}

export function isReturnedStatus(status: ECRStatus): boolean {
  return (
    status === 'RETURNED_TO_DESIGN' ||
    status === 'RETURNED_TO_COSTING' ||
    status === 'RETURNED_TO_PROJECT_MANAGER'
  )
}

export function formatCurrency(amount: string | number | null, currency = 'EUR'): string {
  if (amount === null || amount === undefined) return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDatetime(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function timeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}
