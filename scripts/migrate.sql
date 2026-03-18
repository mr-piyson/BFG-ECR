-- ECR Engineering Change Request System
-- Database Migration Script for Neon PostgreSQL

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM (
    'DESIGN_ENGINEER',
    'COSTING_ENGINEER',
    'PROJECT_ENGINEER',
    'QUALITY_ENGINEER',
    'ADMIN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ECRStatus" AS ENUM (
    'DRAFT',
    'PENDING_COSTING',
    'UNDER_COSTING',
    'PENDING_PROJECT_MANAGER',
    'UNDER_PROJECT_MANAGER',
    'PENDING_DESIGN_MEETING',
    'UNDER_DESIGN_MEETING',
    'PENDING_QUALITY_CHECK',
    'UNDER_QUALITY_CHECK',
    'RELEASED',
    'RETURNED_TO_DESIGN',
    'RETURNED_TO_COSTING',
    'RETURNED_TO_PROJECT_MANAGER',
    'ON_HOLD',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ECRSource" AS ENUM ('CUSTOMER', 'INTERNAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ECRFlowStatus" AS ENUM (
    'PROCEED',
    'PENDING',
    'RETURNED',
    'SKIPPED',
    'NOT_APPLICABLE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StageType" AS ENUM (
    'DESIGN_ENGINEER_INITIAL',
    'COSTING',
    'PROJECT_MANAGER',
    'DESIGN_ENGINEER_MEETING',
    'QUALITY_FINAL_CHECK'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          "UserRole" NOT NULL,
  department    TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_scopes (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id  TEXT NOT NULL REFERENCES projects(id),
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, name)
);

CREATE TABLE IF NOT EXISTS project_assignments (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id),
  project_id  TEXT NOT NULL REFERENCES projects(id),
  role        "UserRole" NOT NULL,
  is_primary  BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id, role)
);

CREATE SEQUENCE IF NOT EXISTS ecr_number_seq START WITH 1998;

CREATE TABLE IF NOT EXISTS ecrs (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_number           INT DEFAULT nextval('ecr_number_seq'),
  project_id           TEXT NOT NULL REFERENCES projects(id),
  scope_id             TEXT REFERENCES project_scopes(id),
  status               "ECRStatus" DEFAULT 'DRAFT',
  source               "ECRSource" DEFAULT 'CUSTOMER',
  current_stage        "StageType" DEFAULT 'DESIGN_ENGINEER_INITIAL',
  design_engineer_id   TEXT NOT NULL REFERENCES users(id),
  project_engineer_id  TEXT REFERENCES users(id),
  ecr_flow_label       TEXT,
  is_pdf_generated     BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  released_at          TIMESTAMPTZ,
  UNIQUE(ecr_number)
);

CREATE TABLE IF NOT EXISTS design_initial_forms (
  id                        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id                    TEXT UNIQUE NOT NULL REFERENCES ecrs(id),
  customer_cr_number        TEXT,
  cr_received_on            TIMESTAMPTZ NOT NULL,
  cr_by                     TEXT NOT NULL,
  change_description        TEXT NOT NULL,
  ecr_sheet_filled_on       TIMESTAMPTZ,
  transferred_to_costing_on TIMESTAMPTZ,
  flow_status               "ECRFlowStatus" DEFAULT 'PENDING',
  is_skip_costing           BOOLEAN DEFAULT false,
  is_skip_project_manager   BOOLEAN DEFAULT false,
  is_skip_quality           BOOLEAN DEFAULT false,
  submitted_at              TIMESTAMPTZ,
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS costing_forms (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id                TEXT UNIQUE NOT NULL REFERENCES ecrs(id),
  costing_engineer_id   TEXT,
  date_of_quote         TIMESTAMPTZ,
  offer_to_customer_date TIMESTAMPTZ,
  cost_details          TEXT,
  has_nrc_cost          BOOLEAN DEFAULT false,
  has_rc_cost           BOOLEAN DEFAULT false,
  nrc_amount            DECIMAL(12,2),
  rc_amount             DECIMAL(12,2),
  currency              TEXT DEFAULT 'USD',
  flow_status           "ECRFlowStatus" DEFAULT 'PENDING',
  remark                TEXT,
  processed_on          TIMESTAMPTZ,
  submitted_at          TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_manager_forms (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id          TEXT UNIQUE NOT NULL REFERENCES ecrs(id),
  po_receipt_date TIMESTAMPTZ,
  roa             TEXT,
  pm_notes        TEXT,
  flow_status     "ECRFlowStatus" DEFAULT 'PENDING',
  remark          TEXT,
  processed_on    TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS design_meeting_forms (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id              TEXT UNIQUE NOT NULL REFERENCES ecrs(id),
  meeting_date        TIMESTAMPTZ,
  epicor_release_date TIMESTAMPTZ,
  ern_release_date    TIMESTAMPTZ,
  meeting_notes       TEXT,
  is_not_applicable   BOOLEAN DEFAULT false,
  flow_status         "ECRFlowStatus" DEFAULT 'PENDING',
  remark              TEXT,
  processed_on        TIMESTAMPTZ,
  submitted_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_attendees (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meeting_form_id TEXT NOT NULL REFERENCES design_meeting_forms(id),
  user_id         TEXT REFERENCES users(id),
  name            TEXT NOT NULL,
  email           TEXT,
  is_external     BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS quality_check_forms (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id              TEXT UNIQUE NOT NULL REFERENCES ecrs(id),
  quality_engineer_id TEXT,
  verification_result TEXT,
  verified_in_train_set TEXT,
  verification_date   TIMESTAMPTZ,
  findings            TEXT,
  flow_status         "ECRFlowStatus" DEFAULT 'PENDING',
  remark              TEXT,
  processed_on        TIMESTAMPTZ,
  submitted_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stage_histories (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id            TEXT NOT NULL REFERENCES ecrs(id),
  stage             "StageType" NOT NULL,
  from_status       "ECRStatus" NOT NULL,
  to_status         "ECRStatus" NOT NULL,
  flow_status       "ECRFlowStatus" NOT NULL,
  acted_by_user_id  TEXT NOT NULL REFERENCES users(id),
  remark            TEXT,
  returned_to_stage "StageType",
  is_skip           BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_histories_ecr_id ON stage_histories(ecr_id);
CREATE INDEX IF NOT EXISTS idx_stage_histories_user_id ON stage_histories(acted_by_user_id);

CREATE TABLE IF NOT EXISTS attachments (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id      TEXT NOT NULL REFERENCES ecrs(id),
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   INT,
  mime_type   TEXT,
  stage       "StageType",
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ecr_id     TEXT REFERENCES ecrs(id),
  user_id    TEXT NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Users
INSERT INTO users (id, email, name, role, department) VALUES
  ('user-de-1',  'alice.morgan@bfg.com',    'Alice Morgan',    'DESIGN_ENGINEER',   'Engineering'),
  ('user-de-2',  'ben.harris@bfg.com',      'Ben Harris',      'DESIGN_ENGINEER',   'Engineering'),
  ('user-ce-1',  'wafa.ali@bfg.com',        'Wafa Ali',        'COSTING_ENGINEER',  'Costing'),
  ('user-pm-1',  'carlos.ruiz@bfg.com',     'Carlos Ruiz',     'PROJECT_ENGINEER',  'Projects'),
  ('user-qe-1',  'diana.chen@bfg.com',      'Diana Chen',      'QUALITY_ENGINEER',  'Quality'),
  ('user-adm-1', 'admin@bfg.com',           'System Admin',    'ADMIN',             'IT')
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, code, name, description) VALUES
  ('proj-1', 'TGV',   'TGV High-Speed Train',          'French high-speed rail project'),
  ('proj-2', 'SJ250', 'SJ 250 Regional Rail',          'Swedish regional rail project'),
  ('proj-3', 'ET490', 'ET490 Suburban EMU',             'German suburban electric multiple unit'),
  ('proj-4', 'DART',  'Dublin Area Rapid Transit',     'Irish rapid transit modernisation')
ON CONFLICT (id) DO NOTHING;

-- Project Scopes
INSERT INTO project_scopes (id, project_id, name) VALUES
  ('scope-1',  'proj-1', 'Front End'),
  ('scope-2',  'proj-1', 'Cab Lining'),
  ('scope-3',  'proj-1', 'Driver Desk'),
  ('scope-4',  'proj-1', 'Luggage Rack'),
  ('scope-5',  'proj-2', 'Front End'),
  ('scope-6',  'proj-2', 'Cab Lining'),
  ('scope-7',  'proj-3', 'Exterior Panels'),
  ('scope-8',  'proj-3', 'Interior Trim'),
  ('scope-9',  'proj-4', 'Driver Cab'),
  ('scope-10', 'proj-4', 'Passenger Saloon')
ON CONFLICT (id) DO NOTHING;

-- Project Assignments
INSERT INTO project_assignments (user_id, project_id, role, is_primary) VALUES
  ('user-de-1',  'proj-1', 'DESIGN_ENGINEER',  true),
  ('user-de-1',  'proj-2', 'DESIGN_ENGINEER',  false),
  ('user-de-2',  'proj-3', 'DESIGN_ENGINEER',  true),
  ('user-de-2',  'proj-4', 'DESIGN_ENGINEER',  true),
  ('user-ce-1',  'proj-1', 'COSTING_ENGINEER', true),
  ('user-ce-1',  'proj-2', 'COSTING_ENGINEER', true),
  ('user-ce-1',  'proj-3', 'COSTING_ENGINEER', true),
  ('user-ce-1',  'proj-4', 'COSTING_ENGINEER', true),
  ('user-pm-1',  'proj-1', 'PROJECT_ENGINEER', true),
  ('user-pm-1',  'proj-2', 'PROJECT_ENGINEER', true),
  ('user-pm-1',  'proj-3', 'PROJECT_ENGINEER', true),
  ('user-pm-1',  'proj-4', 'PROJECT_ENGINEER', true),
  ('user-qe-1',  'proj-1', 'QUALITY_ENGINEER', true),
  ('user-qe-1',  'proj-2', 'QUALITY_ENGINEER', true),
  ('user-qe-1',  'proj-3', 'QUALITY_ENGINEER', true),
  ('user-qe-1',  'proj-4', 'QUALITY_ENGINEER', true)
ON CONFLICT DO NOTHING;

-- ECRs
INSERT INTO ecrs (id, ecr_number, project_id, scope_id, status, source, current_stage, design_engineer_id, project_engineer_id) VALUES
  ('ecr-1', 1998, 'proj-1', 'scope-1', 'RELEASED',               'CUSTOMER', 'QUALITY_FINAL_CHECK',      'user-de-1', 'user-pm-1'),
  ('ecr-2', 1999, 'proj-1', 'scope-2', 'PENDING_COSTING',         'CUSTOMER', 'COSTING',                  'user-de-1', 'user-pm-1'),
  ('ecr-3', 2000, 'proj-2', 'scope-5', 'UNDER_COSTING',           'INTERNAL', 'COSTING',                  'user-de-1', 'user-pm-1'),
  ('ecr-4', 2001, 'proj-3', 'scope-7', 'PENDING_PROJECT_MANAGER', 'CUSTOMER', 'PROJECT_MANAGER',          'user-de-2', 'user-pm-1'),
  ('ecr-5', 2002, 'proj-1', 'scope-3', 'PENDING_DESIGN_MEETING',  'CUSTOMER', 'DESIGN_ENGINEER_MEETING',  'user-de-1', 'user-pm-1'),
  ('ecr-6', 2003, 'proj-4', 'scope-9', 'PENDING_QUALITY_CHECK',   'CUSTOMER', 'QUALITY_FINAL_CHECK',      'user-de-2', 'user-pm-1'),
  ('ecr-7', 2004, 'proj-2', 'scope-6', 'RETURNED_TO_DESIGN',      'CUSTOMER', 'DESIGN_ENGINEER_INITIAL',  'user-de-1', 'user-pm-1'),
  ('ecr-8', 2005, 'proj-3', 'scope-8', 'ON_HOLD',                 'INTERNAL', 'COSTING',                  'user-de-2', 'user-pm-1'),
  ('ecr-9', 2006, 'proj-1', 'scope-4', 'DRAFT',                   'CUSTOMER', 'DESIGN_ENGINEER_INITIAL',  'user-de-1', 'user-pm-1'),
  ('ecr-10',2007, 'proj-4', 'scope-10','RELEASED',                'CUSTOMER', 'QUALITY_FINAL_CHECK',      'user-de-2', 'user-pm-1')
ON CONFLICT (id) DO NOTHING;

-- Update released_at for RELEASED ECRs
UPDATE ecrs SET released_at = NOW() - INTERVAL '5 days' WHERE id = 'ecr-1';
UPDATE ecrs SET released_at = NOW() - INTERVAL '12 days' WHERE id = 'ecr-10';

-- Design Initial Forms
INSERT INTO design_initial_forms (ecr_id, customer_cr_number, cr_received_on, cr_by, change_description, ecr_sheet_filled_on, is_skip_costing, is_skip_project_manager, is_skip_quality, flow_status, submitted_at) VALUES
  ('ecr-1', 'CR269342', NOW() - INTERVAL '30 days', 'SNCF Engineering', 'Modification to front end panel geometry to reduce drag coefficient by 3%. Includes revised bonnet profile and windscreen angle.', NOW() - INTERVAL '28 days', false, false, false, 'PROCEED', NOW() - INTERVAL '28 days'),
  ('ecr-2', 'CR271001', NOW() - INTERVAL '14 days', 'SNCF Design Team', 'Cab lining material change from GRP to Honeycomb composite for weight reduction. Affects all cab lining panels.', NOW() - INTERVAL '12 days', false, false, false, 'PROCEED', NOW() - INTERVAL '12 days'),
  ('ecr-3', 'CR-SJ-0045', NOW() - INTERVAL '10 days', 'SJ Operations', 'Driver desk ergonomic update — revised switch panel layout and addition of USB-C charging ports at driver position.', NOW() - INTERVAL '9 days', false, false, true, 'PROCEED', NOW() - INTERVAL '9 days'),
  ('ecr-4', 'CR-ET-0112', NOW() - INTERVAL '20 days', 'Deutsche Bahn', 'Exterior panel colour update for fleet livery refresh. Full exterior repaint including logos and RAL colour specification change.', NOW() - INTERVAL '18 days', false, false, false, 'PROCEED', NOW() - INTERVAL '18 days'),
  ('ecr-5', 'CR269501', NOW() - INTERVAL '25 days', 'SNCF QA Dept', 'Driver desk instrument cluster relocation — move speedometer 45mm left, replace analogue gauges with digital display.', NOW() - INTERVAL '23 days', false, false, false, 'PROCEED', NOW() - INTERVAL '23 days'),
  ('ecr-6', 'CR-DART-007', NOW() - INTERVAL '35 days', 'Iarnrod Eireann', 'Driver cab accessibility upgrade — revised entry step height and handrail positioning to comply with updated NTA accessibility standards.', NOW() - INTERVAL '33 days', false, false, false, 'PROCEED', NOW() - INTERVAL '33 days'),
  ('ecr-7', 'CR-SJ-0047', NOW() - INTERVAL '8 days', 'SJ Procurement', 'Cab lining fire rating upgrade — all panels to meet EN 45545-2 HL3 classification.', NOW() - INTERVAL '7 days', false, false, false, 'PROCEED', NOW() - INTERVAL '7 days'),
  ('ecr-8', NULL, NOW() - INTERVAL '15 days', 'Internal — DE Team', 'Internal drawing correction for luggage rack bracket hole pattern. No cost impact expected.', NOW() - INTERVAL '14 days', true, true, false, 'PROCEED', NOW() - INTERVAL '14 days'),
  ('ecr-9', 'CR269620', NOW() - INTERVAL '2 days', 'SNCF Engineering', 'New requirement for passenger information display upgrade in first class saloon.', NULL, false, false, false, 'PENDING', NULL),
  ('ecr-10','CR-DART-003', NOW() - INTERVAL '45 days', 'Iarnrod Eireann', 'Passenger saloon seating layout revision — increase first class seats by 4, reduce standard by 4.', NOW() - INTERVAL '43 days', false, false, false, 'PROCEED', NOW() - INTERVAL '43 days')
ON CONFLICT (ecr_id) DO NOTHING;

-- Costing Forms
INSERT INTO costing_forms (ecr_id, costing_engineer_id, date_of_quote, has_nrc_cost, nrc_amount, has_rc_cost, rc_amount, currency, flow_status, remark, processed_on) VALUES
  ('ecr-1', 'Wafa Ali', NOW() - INTERVAL '25 days', true,  45000.00, true,  1200.00, 'EUR', 'PROCEED', 'Costing complete. NRC covers tooling modifications.', NOW() - INTERVAL '24 days'),
  ('ecr-3', 'Wafa Ali', NOW() - INTERVAL '7 days',  true,  8500.00,  false, NULL,    'EUR', 'PENDING', NULL, NULL),
  ('ecr-6', 'Wafa Ali', NOW() - INTERVAL '30 days', false, NULL,     false, NULL,    'EUR', 'PROCEED', 'No cost impact — accessibility compliance work covered under contract.', NOW() - INTERVAL '29 days'),
  ('ecr-10','Wafa Ali', NOW() - INTERVAL '40 days', true,  22000.00, true,  850.00,  'EUR', 'PROCEED', 'Approved.', NOW() - INTERVAL '38 days')
ON CONFLICT (ecr_id) DO NOTHING;

-- Project Manager Forms
INSERT INTO project_manager_forms (ecr_id, po_receipt_date, roa, pm_notes, flow_status, processed_on) VALUES
  ('ecr-1', NOW() - INTERVAL '20 days', 'Train Set: TGV-001, TGV-002', 'PO received and confirmed. RoA covers first two production sets.', 'PROCEED', NOW() - INTERVAL '19 days'),
  ('ecr-4', NULL, NULL, NULL, 'PENDING', NULL),
  ('ecr-6', NOW() - INTERVAL '26 days', 'Train Set: DART-A01 through DART-A06', 'Full fleet application. PO confirmed.', 'PROCEED', NOW() - INTERVAL '25 days'),
  ('ecr-10',NOW() - INTERVAL '35 days', 'Train Set: DART-B01, DART-B02', 'PO received.', 'PROCEED', NOW() - INTERVAL '34 days')
ON CONFLICT (ecr_id) DO NOTHING;

-- Design Meeting Forms
INSERT INTO design_meeting_forms (id, ecr_id, meeting_date, epicor_release_date, ern_release_date, flow_status, processed_on) VALUES
  ('dmf-1', 'ecr-1', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', 'PROCEED', NOW() - INTERVAL '13 days'),
  ('dmf-2', 'ecr-5', NOW() + INTERVAL '3 days',  NULL, NULL, 'PENDING', NULL),
  ('dmf-3', 'ecr-10',NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days', NOW() - INTERVAL '26 days', 'PROCEED', NOW() - INTERVAL '26 days')
ON CONFLICT (ecr_id) DO NOTHING;

-- Meeting Attendees
INSERT INTO meeting_attendees (meeting_form_id, name, email, is_external) VALUES
  ('dmf-1', 'Alice Morgan',  'alice.morgan@bfg.com',    false),
  ('dmf-1', 'Carlos Ruiz',   'carlos.ruiz@bfg.com',     false),
  ('dmf-1', 'Jean-Pierre Dubois', 'jp.dubois@sncf.fr',  true),
  ('dmf-2', 'Alice Morgan',  'alice.morgan@bfg.com',    false),
  ('dmf-2', 'Carlos Ruiz',   'carlos.ruiz@bfg.com',     false),
  ('dmf-3', 'Ben Harris',    'ben.harris@bfg.com',      false),
  ('dmf-3', 'Carlos Ruiz',   'carlos.ruiz@bfg.com',     false),
  ('dmf-3', 'Seamus Kelly',  's.kelly@irishrail.ie',    true)
ON CONFLICT DO NOTHING;

-- Quality Check Forms
INSERT INTO quality_check_forms (ecr_id, quality_engineer_id, verification_result, verified_in_train_set, verification_date, findings, flow_status, processed_on) VALUES
  ('ecr-1',  'Diana Chen', 'OK',     'TGV-001', NOW() - INTERVAL '8 days', 'All modifications verified and found compliant. Panel fit within tolerance.', 'PROCEED', NOW() - INTERVAL '8 days'),
  ('ecr-6',  'Diana Chen', NULL,     NULL,      NULL,                      NULL, 'PENDING', NULL),
  ('ecr-10', 'Diana Chen', 'OK',     'DART-B01', NOW() - INTERVAL '20 days', 'Seating layout verified. Compliant with specification.', 'PROCEED', NOW() - INTERVAL '20 days')
ON CONFLICT (ecr_id) DO NOTHING;

-- Stage Histories
INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark, created_at) VALUES
  -- ECR-1 Full journey (Released)
  ('ecr-1', 'DESIGN_ENGINEER_INITIAL', 'DRAFT', 'PENDING_COSTING', 'PROCEED', 'user-de-1', 'CR submitted for costing review.', NOW() - INTERVAL '28 days'),
  ('ecr-1', 'COSTING', 'PENDING_COSTING', 'UNDER_COSTING', 'PENDING', 'user-ce-1', NULL, NOW() - INTERVAL '26 days'),
  ('ecr-1', 'COSTING', 'UNDER_COSTING', 'PENDING_PROJECT_MANAGER', 'PROCEED', 'user-ce-1', 'Costing complete.', NOW() - INTERVAL '24 days'),
  ('ecr-1', 'PROJECT_MANAGER', 'PENDING_PROJECT_MANAGER', 'UNDER_PROJECT_MANAGER', 'PENDING', 'user-pm-1', NULL, NOW() - INTERVAL '22 days'),
  ('ecr-1', 'PROJECT_MANAGER', 'UNDER_PROJECT_MANAGER', 'PENDING_DESIGN_MEETING', 'PROCEED', 'user-pm-1', 'PO confirmed.', NOW() - INTERVAL '19 days'),
  ('ecr-1', 'DESIGN_ENGINEER_MEETING', 'PENDING_DESIGN_MEETING', 'UNDER_DESIGN_MEETING', 'PENDING', 'user-de-1', NULL, NOW() - INTERVAL '16 days'),
  ('ecr-1', 'DESIGN_ENGINEER_MEETING', 'UNDER_DESIGN_MEETING', 'PENDING_QUALITY_CHECK', 'PROCEED', 'user-de-1', 'Meeting held and release issued.', NOW() - INTERVAL '13 days'),
  ('ecr-1', 'QUALITY_FINAL_CHECK', 'PENDING_QUALITY_CHECK', 'UNDER_QUALITY_CHECK', 'PENDING', 'user-qe-1', NULL, NOW() - INTERVAL '10 days'),
  ('ecr-1', 'QUALITY_FINAL_CHECK', 'UNDER_QUALITY_CHECK', 'RELEASED', 'PROCEED', 'user-qe-1', 'Verified OK in TGV-001.', NOW() - INTERVAL '8 days'),
  -- ECR-2 Submitted to Costing
  ('ecr-2', 'DESIGN_ENGINEER_INITIAL', 'DRAFT', 'PENDING_COSTING', 'PROCEED', 'user-de-1', NULL, NOW() - INTERVAL '12 days'),
  -- ECR-7 Returned to Design
  ('ecr-7', 'DESIGN_ENGINEER_INITIAL', 'DRAFT', 'PENDING_COSTING', 'PROCEED', 'user-de-1', NULL, NOW() - INTERVAL '7 days'),
  ('ecr-7', 'COSTING', 'PENDING_COSTING', 'RETURNED_TO_DESIGN', 'RETURNED', 'user-ce-1', 'Insufficient information on panel specification. Please clarify fire rating requirements before costing can proceed.', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Notifications
INSERT INTO notifications (ecr_id, user_id, title, message, type) VALUES
  ('ecr-2', 'user-ce-1', 'New ECR awaiting costing', 'ECR #1999 — Cab Lining Material Change has been submitted and requires your costing assessment.', 'stage_transition'),
  ('ecr-4', 'user-pm-1', 'ECR awaiting your review', 'ECR #2001 — ET490 Exterior Panel Livery Refresh is pending your project manager review.', 'stage_transition'),
  ('ecr-5', 'user-de-1', 'ECR returned to you', 'ECR #2002 — Driver Desk Instrument Cluster is at the meeting scheduling stage awaiting your action.', 'stage_transition'),
  ('ecr-6', 'user-qe-1', 'ECR ready for quality check', 'ECR #2003 — DART Driver Cab Accessibility Upgrade requires your final verification.', 'stage_transition'),
  ('ecr-7', 'user-de-1', 'ECR returned to you', 'ECR #2004 — SJ Cab Lining Fire Rating has been returned by Costing. Please review the remark and resubmit.', 'return')
ON CONFLICT DO NOTHING;
