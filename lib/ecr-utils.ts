import type { ECRStatus, StageType } from '@/lib/types'

export const STAGE_ORDER: StageType[] = [
  'DESIGN_ENGINEER_INITIAL',
  'COSTING',
  'PROJECT_MANAGER',
  'DESIGN_ENGINEER_MEETING',
  'QUALITY_FINAL_CHECK',
]

export const STAGE_LABELS: Record<StageType, string> = {
  DESIGN_ENGINEER_INITIAL: 'Design Initial',
  COSTING: 'Costing',
  PROJECT_MANAGER: 'Project Manager',
  DESIGN_ENGINEER_MEETING: 'Design Meeting',
  QUALITY_FINAL_CHECK: 'Quality Check',
}

export const STATUS_LABELS: Record<ECRStatus, string> = {
  DRAFT: 'Draft',
  PENDING_COSTING: 'Pending Costing',
  UNDER_COSTING: 'Under Costing',
  PENDING_PROJECT_MANAGER: 'Pending PM',
  UNDER_PROJECT_MANAGER: 'Under PM',
  PENDING_DESIGN_MEETING: 'Pending Meeting',
  UNDER_DESIGN_MEETING: 'Under Meeting',
  PENDING_QUALITY_CHECK: 'Pending QC',
  UNDER_QUALITY_CHECK: 'Under QC',
  RELEASED: 'Released',
  RETURNED_TO_DESIGN: 'Returned to Design',
  RETURNED_TO_COSTING: 'Returned to Costing',
  RETURNED_TO_PROJECT_MANAGER: 'Returned to PM',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
}

export const STATUS_COLORS: Record<ECRStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PENDING_COSTING: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  UNDER_COSTING: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  PENDING_PROJECT_MANAGER: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  UNDER_PROJECT_MANAGER: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  PENDING_DESIGN_MEETING: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
  UNDER_DESIGN_MEETING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
  PENDING_QUALITY_CHECK: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  UNDER_QUALITY_CHECK: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  RELEASED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  RETURNED_TO_DESIGN: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  RETURNED_TO_COSTING: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  RETURNED_TO_PROJECT_MANAGER: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
}

export const getStageProgress = (currentStage: StageType): number => {
  return ((STAGE_ORDER.indexOf(currentStage) + 1) / STAGE_ORDER.length) * 100
}

export const canSkipStage = (stage: StageType, ecrStatus: ECRStatus): boolean => {
  return ecrStatus.includes('SKIP')
}
