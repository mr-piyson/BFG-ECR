// ============================================================
// ECR System — Core Types
// ============================================================

export type UserRole =
  | 'DESIGN_ENGINEER'
  | 'COSTING_ENGINEER'
  | 'PROJECT_ENGINEER'
  | 'QUALITY_ENGINEER'
  | 'ADMIN'

export type ECRStatus =
  | 'DRAFT'
  | 'PENDING_COSTING'
  | 'UNDER_COSTING'
  | 'PENDING_PROJECT_MANAGER'
  | 'UNDER_PROJECT_MANAGER'
  | 'PENDING_DESIGN_MEETING'
  | 'UNDER_DESIGN_MEETING'
  | 'PENDING_QUALITY_CHECK'
  | 'UNDER_QUALITY_CHECK'
  | 'RELEASED'
  | 'RETURNED_TO_DESIGN'
  | 'RETURNED_TO_COSTING'
  | 'RETURNED_TO_PROJECT_MANAGER'
  | 'ON_HOLD'
  | 'CANCELLED'

export type ECRSource = 'CUSTOMER' | 'INTERNAL'

export type ECRFlowStatus = 'PROCEED' | 'PENDING' | 'RETURNED' | 'SKIPPED' | 'NOT_APPLICABLE'

export type StageType =
  | 'DESIGN_ENGINEER_INITIAL'
  | 'COSTING'
  | 'PROJECT_MANAGER'
  | 'DESIGN_ENGINEER_MEETING'
  | 'QUALITY_FINAL_CHECK'

// ============================================================
// DB Row Types
// ============================================================

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectScope {
  id: string
  projectId: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface ProjectAssignment {
  id: string
  userId: string
  projectId: string
  role: UserRole
  isPrimary: boolean
  assignedAt: string
}

export interface ECR {
  id: string
  ecrNumber: number
  projectId: string
  scopes?: ProjectScope[]
  status: ECRStatus
  source: ECRSource
  currentStage: StageType
  designEngineerId: string
  projectEngineerId: string | null
  ecrFlowLabel: string | null
  isPdfGenerated: boolean
  createdAt: string
  updatedAt: string
  releasedAt: string | null
  // Joined
  project?: Project
  designEngineer?: User
  projectEngineer?: User | null
}



export interface DesignInitialForm {
  id: string
  ecr_id: string
  customer_cr_number: string | null
  cr_received_on: string
  cr_by: string
  change_description: string
  ecr_sheet_filled_on: string | null
  transferred_to_costing_on: string | null
  flow_status: ECRFlowStatus
  is_skip_costing: boolean
  is_skip_project_manager: boolean
  is_skip_quality: boolean
  submitted_at: string | null
  updated_at: string
}

export interface CostingForm {
  id: string
  ecr_id: string
  costing_engineer_id: string | null
  date_of_quote: string | null
  offer_to_customer_date: string | null
  cost_details: string | null
  has_nrc_cost: boolean
  has_rc_cost: boolean
  nrc_amount: string | null
  rc_amount: string | null
  currency: string
  flow_status: ECRFlowStatus
  remark: string | null
  processed_on: string | null
  submitted_at: string | null
  updated_at: string
}

export interface ProjectManagerForm {
  id: string
  ecr_id: string
  po_receipt_date: string | null
  roa: string | null
  pm_notes: string | null
  flow_status: ECRFlowStatus
  remark: string | null
  processed_on: string | null
  submitted_at: string | null
  updated_at: string
}

export interface DesignMeetingForm {
  id: string
  ecr_id: string
  meeting_date: string | null
  epicor_release_date: string | null
  ern_release_date: string | null
  meeting_notes: string | null
  is_not_applicable: boolean
  flow_status: ECRFlowStatus
  remark: string | null
  processed_on: string | null
  submitted_at: string | null
  updated_at: string
  attendees?: MeetingAttendee[]
}

export interface MeetingAttendee {
  id: string
  meeting_form_id: string
  user_id: string | null
  name: string
  email: string | null
  is_external: boolean
}

export interface QualityCheckForm {
  id: string
  ecr_id: string
  quality_engineer_id: string | null
  verification_result: string | null
  verified_in_train_set: string | null
  verification_date: string | null
  findings: string | null
  flow_status: ECRFlowStatus
  remark: string | null
  processed_on: string | null
  submitted_at: string | null
  updated_at: string
}

export interface StageHistory {
  id: string
  ecr_id: string
  stage: StageType
  from_status: ECRStatus
  to_status: ECRStatus
  flow_status: ECRFlowStatus
  acted_by_user_id: string
  remark: string | null
  returned_to_stage: StageType | null
  is_skip: boolean
  created_at: string
  // Joined
  acted_by_user?: User
}

export interface Attachment {
  id: string
  ecr_id: string
  file_name: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  stage: StageType | null
  uploaded_by: string
  uploaded_at: string
}

export interface Notification {
  id: string
  ecr_id: string | null
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

// ============================================================
// Full ECR with all stage forms
// ============================================================

export interface ECRFull extends ECR {
  design_initial_form: DesignInitialForm | null
  costing_form: CostingForm | null
  project_manager_form: ProjectManagerForm | null
  design_meeting_form: DesignMeetingForm | null
  quality_check_form: QualityCheckForm | null
  stage_histories: StageHistory[]
}

// ============================================================
// Dashboard Stats
// ============================================================

export interface DashboardStats {
  total: number
  under_process: number
  released: number
  on_hold: number
  returned: number
  draft: number
  cancelled: number
  by_project: { project_code: string; project_name: string; count: number }[]
  by_status: { status: ECRStatus; count: number }[]
  my_queue: ECR[]
  recent_activity: (StageHistory & { ecr: ECR })[]
}
