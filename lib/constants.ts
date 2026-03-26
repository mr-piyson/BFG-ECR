export const STAGE_LABELS: Record<string, string> = {
  draft: 'Draft',
  design_initial: 'Design Initial',
  costing: 'Costing',
  project_manager: 'Project Manager',
  design_meeting: 'Design Meeting',
  quality_check: 'Quality Check',
  released: 'Released',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
  returned: 'Returned',
};

export const STAGE_COLORS: Record<string, string> = {
  draft: 'bg-gray-200',
  design_initial: 'bg-blue-200',
  costing: 'bg-cyan-200',
  project_manager: 'bg-teal-200',
  design_meeting: 'bg-indigo-200',
  quality_check: 'bg-purple-200',
  released: 'bg-green-200',
  cancelled: 'bg-red-200',
  on_hold: 'bg-yellow-200',
  returned: 'bg-orange-200',
};

export const STAGE_TEXT_COLORS: Record<string, string> = {
  draft: 'text-gray-800',
  design_initial: 'text-blue-800',
  costing: 'text-cyan-800',
  project_manager: 'text-teal-800',
  design_meeting: 'text-indigo-800',
  quality_check: 'text-purple-800',
  released: 'text-green-800',
  cancelled: 'text-red-800',
  on_hold: 'text-yellow-800',
  returned: 'text-orange-800',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const USER_ROLES: Record<string, string> = {
  admin: 'Administrator',
  design_lead: 'Design Lead',
  cost_estimator: 'Cost Estimator',
  project_manager: 'Project Manager',
  quality_lead: 'Quality Lead',
  viewer: 'Viewer',
};
