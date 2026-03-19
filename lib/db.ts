// import { neon } from '@neondatabase/serverless'

// const sql = neon(process.env.DATABASE_URL!)
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// export default sql

import { ECRFlowStatus, ECRSource, ECRStatus, PrismaClient, StageType, UserRole } from "@prisma/client";

const prismaClientSingleton = () => {
  // 1. Setup the standard Node-Postgres driver
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  // 2. Wrap it in the Prisma Adapter
  const adapter = new PrismaPg(pool);

  // 3. Pass the adapter to the PrismaClient
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

/**
 * A wrapper that acts like the Neon 'sql' function
 * but uses Prisma's internal engine.
 */
export const sql = prisma.$queryRaw.bind(prisma);

export default sql;
// Also exporting as default if you prefer: export default sql;

// async function initDummyData() {
//   // ============================================================
//   // CLEANUP (order matters — children before parents)
//   // ============================================================
//   await prisma.notification.deleteMany();
//   await prisma.attachment.deleteMany();
//   await prisma.stageHistory.deleteMany();
//   await prisma.meetingAttendee.deleteMany();
//   await prisma.qualityCheckForm.deleteMany();
//   await prisma.designMeetingForm.deleteMany();
//   await prisma.projectManagerForm.deleteMany();
//   await prisma.costingForm.deleteMany();
//   await prisma.designInitialForm.deleteMany();
//   await prisma.ecr.deleteMany();
//   await prisma.projectAssignment.deleteMany();
//   await prisma.projectScope.deleteMany();
//   await prisma.project.deleteMany();
//   await prisma.user.deleteMany();

//   // ============================================================
//   // USERS
//   // ============================================================
//   const [adminUser, designEng1, designEng2, costingEng1, costingEng2, projectEng1, projectEng2, qualityEng1] = await Promise.all([
//     prisma.user.create({
//       data: {
//         id: "user-admin-001",
//         email: "admin@acmecorp.com",
//         name: "Sarah Mitchell",
//         role: UserRole.ADMIN,
//         department: "Management",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=SM",
//         isActive: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         id: "user-de-001",
//         email: "james.porter@acmecorp.com",
//         name: "James Porter",
//         role: UserRole.DESIGN_ENGINEER,
//         department: "Engineering – Design",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=JP",
//         isActive: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         id: "user-de-002",
//         email: "linda.chen@acmecorp.com",
//         name: "Linda Chen",
//         role: UserRole.DESIGN_ENGINEER,
//         department: "Engineering – Design",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=LC",
//         isActive: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         id: "user-ce-001",
//         email: "raj.kumar@acmecorp.com",
//         name: "Raj Kumar",
//         role: UserRole.COSTING_ENGINEER,
//         department: "Engineering – Costing",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=RK",
//         isActive: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         id: "user-ce-002",
//         email: "emily.shaw@acmecorp.com",
//         name: "Emily Shaw",
//         role: UserRole.COSTING_ENGINEER,
//         department: "Engineering – Costing",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=ES",
//         isActive: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         id: "user-pe-001",
//         email: "omar.hassan@acmecorp.com",
//         name: "Omar Hassan",
//         role: UserRole.PROJECT_ENGINEER,
//         department: "Project Management",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=OH",
//         isActive: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         id: "user-pe-002",
//         email: "grace.wu@acmecorp.com",
//         name: "Grace Wu",
//         role: UserRole.PROJECT_ENGINEER,
//         department: "Project Management",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=GW",
//         isActive: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         id: "user-qe-001",
//         email: "felix.brown@acmecorp.com",
//         name: "Felix Brown",
//         role: UserRole.QUALITY_ENGINEER,
//         department: "Quality Assurance",
//         avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=FB",
//         isActive: true,
//       },
//     }),
//   ]);

//   console.log("✅ Users created");

//   // ============================================================
//   // PROJECTS
//   // ============================================================
//   const [projectAlpha, projectBeta, projectGamma] = await Promise.all([
//     prisma.project.create({
//       data: {
//         id: "proj-alpha-001",
//         code: "PRJ-ALPHA",
//         name: "Alpha Rail System",
//         description: "Next-generation rail signalling and control system for urban metro lines.",
//         isActive: true,
//       },
//     }),
//     prisma.project.create({
//       data: {
//         id: "proj-beta-001",
//         code: "PRJ-BETA",
//         name: "Beta Offshore Platform",
//         description: "Offshore oil & gas platform instrumentation and safety upgrade.",
//         isActive: true,
//       },
//     }),
//     prisma.project.create({
//       data: {
//         id: "proj-gamma-001",
//         code: "PRJ-GAMMA",
//         name: "Gamma Smart Factory",
//         description: "Industrial IoT integration for automated manufacturing facility.",
//         isActive: true,
//       },
//     }),
//   ]);

//   console.log("✅ Projects created");

//   // ============================================================
//   // PROJECT SCOPES
//   // ============================================================
//   const [scopeAlpha1, scopeAlpha2, scopeBeta1, scopeGamma1] = await Promise.all([
//     prisma.projectScope.create({
//       data: {
//         id: "scope-alpha-001",
//         projectId: projectAlpha.id,
//         name: "Signalling Control Unit",
//         description: "Hardware and firmware for trackside signalling units.",
//         isActive: true,
//       },
//     }),
//     prisma.projectScope.create({
//       data: {
//         id: "scope-alpha-002",
//         projectId: projectAlpha.id,
//         name: "Passenger Information Display",
//         description: "LED display boards and real-time passenger announcement system.",
//         isActive: true,
//       },
//     }),
//     prisma.projectScope.create({
//       data: {
//         id: "scope-beta-001",
//         projectId: projectBeta.id,
//         name: "Emergency Shutdown System",
//         description: "Fail-safe ESD panel and logic solver upgrade.",
//         isActive: true,
//       },
//     }),
//     prisma.projectScope.create({
//       data: {
//         id: "scope-gamma-001",
//         projectId: projectGamma.id,
//         name: "Robotic Assembly Line",
//         description: "Robot arm programming and vision system integration.",
//         isActive: true,
//       },
//     }),
//   ]);

//   console.log("✅ Project scopes created");

//   // ============================================================
//   // PROJECT ASSIGNMENTS
//   // ============================================================
//   await Promise.all([
//     // Alpha
//     prisma.projectAssignment.create({ data: { userId: designEng1.id, projectId: projectAlpha.id, role: UserRole.DESIGN_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: costingEng1.id, projectId: projectAlpha.id, role: UserRole.COSTING_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: projectEng1.id, projectId: projectAlpha.id, role: UserRole.PROJECT_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: qualityEng1.id, projectId: projectAlpha.id, role: UserRole.QUALITY_ENGINEER, isPrimary: true } }),
//     // Beta
//     prisma.projectAssignment.create({ data: { userId: designEng2.id, projectId: projectBeta.id, role: UserRole.DESIGN_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: costingEng2.id, projectId: projectBeta.id, role: UserRole.COSTING_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: projectEng2.id, projectId: projectBeta.id, role: UserRole.PROJECT_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: qualityEng1.id, projectId: projectBeta.id, role: UserRole.QUALITY_ENGINEER, isPrimary: false } }),
//     // Gamma
//     prisma.projectAssignment.create({ data: { userId: designEng1.id, projectId: projectGamma.id, role: UserRole.DESIGN_ENGINEER, isPrimary: false } }),
//     prisma.projectAssignment.create({ data: { userId: designEng2.id, projectId: projectGamma.id, role: UserRole.DESIGN_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: costingEng1.id, projectId: projectGamma.id, role: UserRole.COSTING_ENGINEER, isPrimary: true } }),
//     prisma.projectAssignment.create({ data: { userId: projectEng1.id, projectId: projectGamma.id, role: UserRole.PROJECT_ENGINEER, isPrimary: true } }),
//   ]);

//   console.log("✅ Project assignments created");

//   // ============================================================
//   // ECRs — 8 ECRs covering every major workflow state
//   // ============================================================

//   // ----------------------------------------------------------
//   // ECR 1 — DRAFT (just created, no forms submitted yet)
//   // ----------------------------------------------------------
//   const ecr1 = await prisma.ecr.create({
//     data: {
//       id: "ecr-001",
//       projectId: projectAlpha.id,
//       scopeId: scopeAlpha1.id,
//       status: ECRStatus.DRAFT,
//       source: ECRSource.CUSTOMER,
//       currentStage: StageType.DESIGN_ENGINEER_INITIAL,
//       designEngineerId: designEng1.id,
//       projectEngineerId: projectEng1.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: false,
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr1.id,
//       customerCrNumber: "CUST-CR-2025-001",
//       crReceivedOn: new Date("2025-11-01T09:00:00Z"),
//       crBy: "Metro Authority Ltd.",
//       changeDescription: "Customer requests updated firmware version for all trackside signalling units from v3.1 to v3.5 to address known timing drift issues.",
//       flowStatus: ECRFlowStatus.PENDING,
//       isSkipCosting: false,
//       isSkipProjectManager: false,
//       isSkipQuality: false,
//     },
//   });

//   // ----------------------------------------------------------
//   // ECR 2 — PENDING_COSTING (design submitted, awaiting costing)
//   // ----------------------------------------------------------
//   const ecr2 = await prisma.ecr.create({
//     data: {
//       id: "ecr-002",
//       projectId: projectAlpha.id,
//       scopeId: scopeAlpha2.id,
//       status: ECRStatus.PENDING_COSTING,
//       source: ECRSource.CUSTOMER,
//       currentStage: StageType.COSTING,
//       designEngineerId: designEng1.id,
//       projectEngineerId: projectEng1.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: false,
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr2.id,
//       customerCrNumber: "CUST-CR-2025-002",
//       crReceivedOn: new Date("2025-11-05T10:30:00Z"),
//       crBy: "Metro Authority Ltd.",
//       changeDescription: "Addition of a new passenger information display at Platform 7B. Requires new mounting hardware and software integration with existing CMS.",
//       ecrSheetFilledOn: new Date("2025-11-07T14:00:00Z"),
//       transferredToCostingOn: new Date("2025-11-08T09:00:00Z"),
//       flowStatus: ECRFlowStatus.PROCEED,
//       isSkipCosting: false,
//       isSkipProjectManager: false,
//       isSkipQuality: false,
//       submittedAt: new Date("2025-11-08T09:00:00Z"),
//     },
//   });

//   await prisma.costingForm.create({
//     data: {
//       ecrId: ecr2.id,
//       flowStatus: ECRFlowStatus.PENDING,
//     },
//   });

//   await prisma.stageHistory.create({
//     data: {
//       ecrId: ecr2.id,
//       stage: StageType.DESIGN_ENGINEER_INITIAL,
//       fromStatus: ECRStatus.DRAFT,
//       toStatus: ECRStatus.PENDING_COSTING,
//       flowStatus: ECRFlowStatus.PROCEED,
//       actedByUserId: designEng1.id,
//       remark: "Design review complete. Forwarding to costing.",
//     },
//   });

//   // ----------------------------------------------------------
//   // ECR 3 — UNDER_COSTING (costing engineer actively working)
//   // ----------------------------------------------------------
//   const ecr3 = await prisma.ecr.create({
//     data: {
//       id: "ecr-003",
//       projectId: projectBeta.id,
//       scopeId: scopeBeta1.id,
//       status: ECRStatus.UNDER_COSTING,
//       source: ECRSource.INTERNAL,
//       currentStage: StageType.COSTING,
//       designEngineerId: designEng2.id,
//       projectEngineerId: projectEng2.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: false,
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr3.id,
//       crReceivedOn: new Date("2025-10-15T08:00:00Z"),
//       crBy: "Internal – Safety Team",
//       changeDescription: "Internal request to upgrade ESD logic solver from legacy PLC to SIL-2 certified safety controller. Required before Q1 HAZOP audit.",
//       ecrSheetFilledOn: new Date("2025-10-17T11:00:00Z"),
//       transferredToCostingOn: new Date("2025-10-18T09:30:00Z"),
//       flowStatus: ECRFlowStatus.PROCEED,
//       isSkipCosting: false,
//       isSkipProjectManager: false,
//       isSkipQuality: false,
//       submittedAt: new Date("2025-10-18T09:30:00Z"),
//     },
//   });

//   await prisma.costingForm.create({
//     data: {
//       ecrId: ecr3.id,
//       costingEngineerId: costingEng2.id,
//       dateOfQuote: new Date("2025-10-22T00:00:00Z"),
//       costDetails: "Preliminary estimate: Hardware (SIL-2 controller) ~$45,000. Engineering hours: 120hrs @ $85/hr = $10,200. Contingency 10%.",
//       hasNrcCost: true,
//       hasRcCost: false,
//       nrcAmount: 60720.0,
//       currency: "USD",
//       flowStatus: ECRFlowStatus.PENDING,
//     },
//   });

//   await prisma.stageHistory.create({
//     data: {
//       ecrId: ecr3.id,
//       stage: StageType.DESIGN_ENGINEER_INITIAL,
//       fromStatus: ECRStatus.DRAFT,
//       toStatus: ECRStatus.PENDING_COSTING,
//       flowStatus: ECRFlowStatus.PROCEED,
//       actedByUserId: designEng2.id,
//       remark: "Submitted for costing.",
//     },
//   });

//   // ----------------------------------------------------------
//   // ECR 4 — PENDING_PROJECT_MANAGER (costing done, awaiting PM)
//   // ----------------------------------------------------------
//   const ecr4 = await prisma.ecr.create({
//     data: {
//       id: "ecr-004",
//       projectId: projectAlpha.id,
//       scopeId: scopeAlpha1.id,
//       status: ECRStatus.PENDING_PROJECT_MANAGER,
//       source: ECRSource.CUSTOMER,
//       currentStage: StageType.PROJECT_MANAGER,
//       designEngineerId: designEng1.id,
//       projectEngineerId: projectEng1.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: false,
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr4.id,
//       customerCrNumber: "CUST-CR-2025-004",
//       crReceivedOn: new Date("2025-09-10T07:00:00Z"),
//       crBy: "Metro Authority Ltd.",
//       changeDescription: "Customer requests cable routing redesign in Zone 3 to comply with updated fire safety regulations (EN 45545-2).",
//       ecrSheetFilledOn: new Date("2025-09-12T10:00:00Z"),
//       transferredToCostingOn: new Date("2025-09-13T09:00:00Z"),
//       flowStatus: ECRFlowStatus.PROCEED,
//       submittedAt: new Date("2025-09-13T09:00:00Z"),
//     },
//   });

//   await prisma.costingForm.create({
//     data: {
//       ecrId: ecr4.id,
//       costingEngineerId: costingEng1.id,
//       dateOfQuote: new Date("2025-09-18T00:00:00Z"),
//       offerToCustomerDate: new Date("2025-09-20T00:00:00Z"),
//       costDetails: "Cable material replacement: $12,400. Labour (60hrs): $5,100. Documentation update: $1,200. Total NRC: $18,700.",
//       hasNrcCost: true,
//       hasRcCost: false,
//       nrcAmount: 18700.0,
//       currency: "USD",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-09-20T15:00:00Z"),
//       submittedAt: new Date("2025-09-20T15:00:00Z"),
//     },
//   });

//   await prisma.projectManagerForm.create({
//     data: {
//       ecrId: ecr4.id,
//       flowStatus: ECRFlowStatus.PENDING,
//     },
//   });

//   await prisma.stageHistory.createMany({
//     data: [
//       {
//         ecrId: ecr4.id,
//         stage: StageType.DESIGN_ENGINEER_INITIAL,
//         fromStatus: ECRStatus.DRAFT,
//         toStatus: ECRStatus.PENDING_COSTING,
//         flowStatus: ECRFlowStatus.PROCEED,
//         actedByUserId: designEng1.id,
//         remark: "Approved at design stage.",
//       },
//       {
//         ecrId: ecr4.id,
//         stage: StageType.COSTING,
//         fromStatus: ECRStatus.UNDER_COSTING,
//         toStatus: ECRStatus.PENDING_PROJECT_MANAGER,
//         flowStatus: ECRFlowStatus.PROCEED,
//         actedByUserId: costingEng1.id,
//         remark: "Quote finalised and approved by customer.",
//       },
//     ],
//   });

//   // ----------------------------------------------------------
//   // ECR 5 — UNDER_DESIGN_MEETING (in design meeting stage)
//   // ----------------------------------------------------------
//   const ecr5 = await prisma.ecr.create({
//     data: {
//       id: "ecr-005",
//       projectId: projectGamma.id,
//       scopeId: scopeGamma1.id,
//       status: ECRStatus.UNDER_DESIGN_MEETING,
//       source: ECRSource.INTERNAL,
//       currentStage: StageType.DESIGN_ENGINEER_MEETING,
//       designEngineerId: designEng2.id,
//       projectEngineerId: projectEng1.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: false,
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr5.id,
//       crReceivedOn: new Date("2025-08-01T06:00:00Z"),
//       crBy: "Internal – R&D",
//       changeDescription: "Upgrade robot vision system cameras from 2MP to 5MP for improved defect detection accuracy. Requires updated lighting rig and algorithm tuning.",
//       ecrSheetFilledOn: new Date("2025-08-03T09:00:00Z"),
//       transferredToCostingOn: new Date("2025-08-04T09:00:00Z"),
//       flowStatus: ECRFlowStatus.PROCEED,
//       submittedAt: new Date("2025-08-04T09:00:00Z"),
//     },
//   });

//   await prisma.costingForm.create({
//     data: {
//       ecrId: ecr5.id,
//       costingEngineerId: costingEng1.id,
//       dateOfQuote: new Date("2025-08-10T00:00:00Z"),
//       costDetails: "Camera units x8: $9,600. Lighting rig upgrade: $4,200. Software/algorithm: $6,500. Install & commissioning: $3,800.",
//       hasNrcCost: true,
//       hasRcCost: false,
//       nrcAmount: 24100.0,
//       currency: "USD",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-08-12T14:00:00Z"),
//       submittedAt: new Date("2025-08-12T14:00:00Z"),
//     },
//   });

//   await prisma.projectManagerForm.create({
//     data: {
//       ecrId: ecr5.id,
//       poReceiptDate: new Date("2025-08-20T00:00:00Z"),
//       roa: "ROA-2025-GAMMA-007",
//       pmNotes: "PO received from internal budget allocation. Proceed with design meeting.",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-08-21T10:00:00Z"),
//       submittedAt: new Date("2025-08-21T10:00:00Z"),
//     },
//   });

//   const meetingForm5 = await prisma.designMeetingForm.create({
//     data: {
//       ecrId: ecr5.id,
//       meetingDate: new Date("2025-09-03T10:00:00Z"),
//       epicorReleaseDate: new Date("2025-09-10T00:00:00Z"),
//       meetingNotes: "Agreed on 5MP Basler cameras. Lighting rig supplier shortlisted to two vendors. Algorithm team to start parallel development.",
//       flowStatus: ECRFlowStatus.PENDING,
//     },
//   });

//   await prisma.meetingAttendee.createMany({
//     data: [
//       { meetingFormId: meetingForm5.id, userId: designEng2.id, name: "Linda Chen", email: "linda.chen@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm5.id, userId: projectEng1.id, name: "Omar Hassan", email: "omar.hassan@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm5.id, userId: qualityEng1.id, name: "Felix Brown", email: "felix.brown@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm5.id, userId: null, name: "Dirk Müller", email: "dirk.muller@basler.com", isExternal: true },
//       { meetingFormId: meetingForm5.id, userId: null, name: "Priya Nair", email: "priya.nair@lightingco.com", isExternal: true },
//     ],
//   });

//   await prisma.stageHistory.createMany({
//     data: [
//       {
//         ecrId: ecr5.id,
//         stage: StageType.DESIGN_ENGINEER_INITIAL,
//         fromStatus: ECRStatus.DRAFT,
//         toStatus: ECRStatus.PENDING_COSTING,
//         flowStatus: ECRFlowStatus.PROCEED,
//         actedByUserId: designEng2.id,
//       },
//       {
//         ecrId: ecr5.id,
//         stage: StageType.COSTING,
//         fromStatus: ECRStatus.UNDER_COSTING,
//         toStatus: ECRStatus.PENDING_PROJECT_MANAGER,
//         flowStatus: ECRFlowStatus.PROCEED,
//         actedByUserId: costingEng1.id,
//       },
//       {
//         ecrId: ecr5.id,
//         stage: StageType.PROJECT_MANAGER,
//         fromStatus: ECRStatus.UNDER_PROJECT_MANAGER,
//         toStatus: ECRStatus.PENDING_DESIGN_MEETING,
//         flowStatus: ECRFlowStatus.PROCEED,
//         actedByUserId: projectEng1.id,
//         remark: "PO confirmed, proceed to design meeting.",
//       },
//     ],
//   });

//   // ----------------------------------------------------------
//   // ECR 6 — PENDING_QUALITY_CHECK (post-meeting, awaiting QA)
//   // ----------------------------------------------------------
//   const ecr6 = await prisma.ecr.create({
//     data: {
//       id: "ecr-006",
//       projectId: projectBeta.id,
//       scopeId: scopeBeta1.id,
//       status: ECRStatus.PENDING_QUALITY_CHECK,
//       source: ECRSource.CUSTOMER,
//       currentStage: StageType.QUALITY_FINAL_CHECK,
//       designEngineerId: designEng2.id,
//       projectEngineerId: projectEng2.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: true,
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr6.id,
//       customerCrNumber: "CUST-CR-2025-006",
//       crReceivedOn: new Date("2025-07-01T08:00:00Z"),
//       crBy: "Offshore Operations Ltd.",
//       changeDescription: "Customer requires addition of a local manual override panel for the ESD system, including lockout/tagout provisions as per ISA-84 standard.",
//       ecrSheetFilledOn: new Date("2025-07-03T10:00:00Z"),
//       transferredToCostingOn: new Date("2025-07-04T09:00:00Z"),
//       flowStatus: ECRFlowStatus.PROCEED,
//       submittedAt: new Date("2025-07-04T09:00:00Z"),
//     },
//   });

//   await prisma.costingForm.create({
//     data: {
//       ecrId: ecr6.id,
//       costingEngineerId: costingEng2.id,
//       dateOfQuote: new Date("2025-07-10T00:00:00Z"),
//       offerToCustomerDate: new Date("2025-07-12T00:00:00Z"),
//       costDetails: "Manual override panel fabrication: $8,500. LOTO hardware: $1,800. Installation: $4,200. Documentation (IOM, P&ID): $2,000.",
//       hasNrcCost: true,
//       hasRcCost: true,
//       nrcAmount: 16500.0,
//       rcAmount: 1200.0,
//       currency: "USD",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-07-14T11:00:00Z"),
//       submittedAt: new Date("2025-07-14T11:00:00Z"),
//     },
//   });

//   await prisma.projectManagerForm.create({
//     data: {
//       ecrId: ecr6.id,
//       poReceiptDate: new Date("2025-07-22T00:00:00Z"),
//       roa: "ROA-2025-BETA-012",
//       pmNotes: "Customer PO received. All commercial terms agreed. Proceed.",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-07-23T09:00:00Z"),
//       submittedAt: new Date("2025-07-23T09:00:00Z"),
//     },
//   });

//   const meetingForm6 = await prisma.designMeetingForm.create({
//     data: {
//       ecrId: ecr6.id,
//       meetingDate: new Date("2025-08-05T09:00:00Z"),
//       epicorReleaseDate: new Date("2025-08-10T00:00:00Z"),
//       ernReleaseDate: new Date("2025-08-12T00:00:00Z"),
//       meetingNotes: "Design approved. BOM finalised. Drawing package DWG-BETA-ESD-007 signed off. Epicor and ERN releases scheduled.",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-08-06T10:00:00Z"),
//       submittedAt: new Date("2025-08-06T10:00:00Z"),
//     },
//   });

//   await prisma.meetingAttendee.createMany({
//     data: [
//       { meetingFormId: meetingForm6.id, userId: designEng2.id, name: "Linda Chen", email: "linda.chen@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm6.id, userId: projectEng2.id, name: "Grace Wu", email: "grace.wu@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm6.id, userId: qualityEng1.id, name: "Felix Brown", email: "felix.brown@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm6.id, userId: null, name: "Alan Ford", email: "alan.ford@offshore-ops.com", isExternal: true },
//     ],
//   });

//   await prisma.qualityCheckForm.create({
//     data: {
//       ecrId: ecr6.id,
//       qualityEngineerId: qualityEng1.id,
//       flowStatus: ECRFlowStatus.PENDING,
//     },
//   });

//   // ----------------------------------------------------------
//   // ECR 7 — RELEASED (fully completed, all stages done)
//   // ----------------------------------------------------------
//   const ecr7 = await prisma.ecr.create({
//     data: {
//       id: "ecr-007",
//       projectId: projectAlpha.id,
//       scopeId: scopeAlpha1.id,
//       status: ECRStatus.RELEASED,
//       source: ECRSource.CUSTOMER,
//       currentStage: StageType.QUALITY_FINAL_CHECK,
//       designEngineerId: designEng1.id,
//       projectEngineerId: projectEng1.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: true,
//       releasedAt: new Date("2025-10-01T12:00:00Z"),
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr7.id,
//       customerCrNumber: "CUST-CR-2025-007",
//       crReceivedOn: new Date("2025-06-01T08:00:00Z"),
//       crBy: "Metro Authority Ltd.",
//       changeDescription: "Replace obsolete trackside junction boxes (JB-T400 series) with IP67-rated stainless steel enclosures to address corrosion failures in coastal sections.",
//       ecrSheetFilledOn: new Date("2025-06-03T09:00:00Z"),
//       transferredToCostingOn: new Date("2025-06-04T09:00:00Z"),
//       flowStatus: ECRFlowStatus.PROCEED,
//       submittedAt: new Date("2025-06-04T09:00:00Z"),
//     },
//   });

//   await prisma.costingForm.create({
//     data: {
//       ecrId: ecr7.id,
//       costingEngineerId: costingEng1.id,
//       dateOfQuote: new Date("2025-06-10T00:00:00Z"),
//       offerToCustomerDate: new Date("2025-06-12T00:00:00Z"),
//       costDetails: "JB-IP67 enclosures x24: $14,400. Cable glands & hardware: $3,600. Installation (3 days, 2 techs): $4,800. NRC total: $22,800.",
//       hasNrcCost: true,
//       hasRcCost: false,
//       nrcAmount: 22800.0,
//       currency: "USD",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-06-13T15:00:00Z"),
//       submittedAt: new Date("2025-06-13T15:00:00Z"),
//     },
//   });

//   await prisma.projectManagerForm.create({
//     data: {
//       ecrId: ecr7.id,
//       poReceiptDate: new Date("2025-06-20T00:00:00Z"),
//       roa: "ROA-2025-ALPHA-003",
//       pmNotes: "PO confirmed. Schedule installation during next maintenance window (July 15-17).",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-06-21T10:00:00Z"),
//       submittedAt: new Date("2025-06-21T10:00:00Z"),
//     },
//   });

//   const meetingForm7 = await prisma.designMeetingForm.create({
//     data: {
//       ecrId: ecr7.id,
//       meetingDate: new Date("2025-07-02T10:00:00Z"),
//       epicorReleaseDate: new Date("2025-07-05T00:00:00Z"),
//       ernReleaseDate: new Date("2025-07-07T00:00:00Z"),
//       meetingNotes: "Full drawing set approved. Installation scope confirmed. All attendees signed off.",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-07-03T09:00:00Z"),
//       submittedAt: new Date("2025-07-03T09:00:00Z"),
//     },
//   });

//   await prisma.meetingAttendee.createMany({
//     data: [
//       { meetingFormId: meetingForm7.id, userId: designEng1.id, name: "James Porter", email: "james.porter@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm7.id, userId: projectEng1.id, name: "Omar Hassan", email: "omar.hassan@acmecorp.com", isExternal: false },
//       { meetingFormId: meetingForm7.id, userId: qualityEng1.id, name: "Felix Brown", email: "felix.brown@acmecorp.com", isExternal: false },
//     ],
//   });

//   await prisma.qualityCheckForm.create({
//     data: {
//       ecrId: ecr7.id,
//       qualityEngineerId: qualityEng1.id,
//       verificationResult: "PASS",
//       verifiedInTrainSet: "TrainSet-ALPHA-2025-07",
//       verificationDate: new Date("2025-09-25T14:00:00Z"),
//       findings: "No non-conformances found. All drawings, BOM, and installation records match as-built documentation.",
//       flowStatus: ECRFlowStatus.PROCEED,
//       processedOn: new Date("2025-09-26T10:00:00Z"),
//       submittedAt: new Date("2025-09-26T10:00:00Z"),
//     },
//   });

//   await prisma.stageHistory.createMany({
//     data: [
//       { ecrId: ecr7.id, stage: StageType.DESIGN_ENGINEER_INITIAL, fromStatus: ECRStatus.DRAFT, toStatus: ECRStatus.PENDING_COSTING, flowStatus: ECRFlowStatus.PROCEED, actedByUserId: designEng1.id },
//       { ecrId: ecr7.id, stage: StageType.COSTING, fromStatus: ECRStatus.UNDER_COSTING, toStatus: ECRStatus.PENDING_PROJECT_MANAGER, flowStatus: ECRFlowStatus.PROCEED, actedByUserId: costingEng1.id },
//       { ecrId: ecr7.id, stage: StageType.PROJECT_MANAGER, fromStatus: ECRStatus.UNDER_PROJECT_MANAGER, toStatus: ECRStatus.PENDING_DESIGN_MEETING, flowStatus: ECRFlowStatus.PROCEED, actedByUserId: projectEng1.id },
//       { ecrId: ecr7.id, stage: StageType.DESIGN_ENGINEER_MEETING, fromStatus: ECRStatus.UNDER_DESIGN_MEETING, toStatus: ECRStatus.PENDING_QUALITY_CHECK, flowStatus: ECRFlowStatus.PROCEED, actedByUserId: designEng1.id },
//       { ecrId: ecr7.id, stage: StageType.QUALITY_FINAL_CHECK, fromStatus: ECRStatus.UNDER_QUALITY_CHECK, toStatus: ECRStatus.RELEASED, flowStatus: ECRFlowStatus.PROCEED, actedByUserId: qualityEng1.id, remark: "All checks passed. ECR released." },
//     ],
//   });

//   // ----------------------------------------------------------
//   // ECR 8 — RETURNED_TO_DESIGN (costing returned it)
//   // ----------------------------------------------------------
//   const ecr8 = await prisma.ecr.create({
//     data: {
//       id: "ecr-008",
//       projectId: projectGamma.id,
//       scopeId: scopeGamma1.id,
//       status: ECRStatus.RETURNED_TO_DESIGN,
//       source: ECRSource.CUSTOMER,
//       currentStage: StageType.DESIGN_ENGINEER_INITIAL,
//       designEngineerId: designEng1.id,
//       projectEngineerId: projectEng1.id,
//       ecrFlowLabel: "Standard Flow",
//       isPdfGenerated: false,
//     },
//   });

//   await prisma.designInitialForm.create({
//     data: {
//       ecrId: ecr8.id,
//       customerCrNumber: "CUST-CR-2025-008",
//       crReceivedOn: new Date("2025-10-20T08:00:00Z"),
//       crBy: "SmartFactory GmbH",
//       changeDescription: "Customer requests integration of a new conveyor system into the existing robotic assembly line. Scope and technical details unclear.",
//       ecrSheetFilledOn: new Date("2025-10-21T11:00:00Z"),
//       transferredToCostingOn: new Date("2025-10-22T09:00:00Z"),
//       flowStatus: ECRFlowStatus.RETURNED,
//       submittedAt: new Date("2025-10-22T09:00:00Z"),
//     },
//   });

//   await prisma.costingForm.create({
//     data: {
//       ecrId: ecr8.id,
//       costingEngineerId: costingEng1.id,
//       flowStatus: ECRFlowStatus.RETURNED,
//       remark: "Insufficient technical detail to prepare a quote. Scope of conveyor integration is ambiguous — need to clarify number of conveyor lanes, load capacity, and integration points with existing PLC.",
//       processedOn: new Date("2025-10-25T14:00:00Z"),
//       submittedAt: new Date("2025-10-25T14:00:00Z"),
//     },
//   });

//   await prisma.stageHistory.createMany({
//     data: [
//       {
//         ecrId: ecr8.id,
//         stage: StageType.DESIGN_ENGINEER_INITIAL,
//         fromStatus: ECRStatus.DRAFT,
//         toStatus: ECRStatus.PENDING_COSTING,
//         flowStatus: ECRFlowStatus.PROCEED,
//         actedByUserId: designEng1.id,
//         remark: "Submitted to costing.",
//       },
//       {
//         ecrId: ecr8.id,
//         stage: StageType.COSTING,
//         fromStatus: ECRStatus.UNDER_COSTING,
//         toStatus: ECRStatus.RETURNED_TO_DESIGN,
//         flowStatus: ECRFlowStatus.RETURNED,
//         actedByUserId: costingEng1.id,
//         remark: "Returned — scope not defined clearly enough to cost.",
//         returnedToStage: StageType.DESIGN_ENGINEER_INITIAL,
//       },
//     ],
//   });

//   console.log("✅ ECRs and sub-forms created");

//   // ============================================================
//   // ATTACHMENTS
//   // ============================================================
//   await prisma.attachment.createMany({
//     data: [
//       {
//         ecrId: ecr4.id,
//         fileName: "cable-routing-zone3-rev2.pdf",
//         fileUrl: "https://storage.acmecorp.com/ecr/ecr-004/cable-routing-zone3-rev2.pdf",
//         fileSize: 2048000,
//         mimeType: "application/pdf",
//         stage: StageType.DESIGN_ENGINEER_INITIAL,
//         uploadedBy: designEng1.id,
//       },
//       {
//         ecrId: ecr4.id,
//         fileName: "fire-safety-compliance-EN45545.pdf",
//         fileUrl: "https://storage.acmecorp.com/ecr/ecr-004/fire-safety-compliance-EN45545.pdf",
//         fileSize: 512000,
//         mimeType: "application/pdf",
//         stage: StageType.DESIGN_ENGINEER_INITIAL,
//         uploadedBy: designEng1.id,
//       },
//       {
//         ecrId: ecr6.id,
//         fileName: "ESD-override-panel-schematic.dwg",
//         fileUrl: "https://storage.acmecorp.com/ecr/ecr-006/ESD-override-panel-schematic.dwg",
//         fileSize: 3145728,
//         mimeType: "application/octet-stream",
//         stage: StageType.DESIGN_ENGINEER_MEETING,
//         uploadedBy: designEng2.id,
//       },
//       {
//         ecrId: ecr7.id,
//         fileName: "JB-IP67-installation-IOM.pdf",
//         fileUrl: "https://storage.acmecorp.com/ecr/ecr-007/JB-IP67-installation-IOM.pdf",
//         fileSize: 1024000,
//         mimeType: "application/pdf",
//         stage: StageType.QUALITY_FINAL_CHECK,
//         uploadedBy: qualityEng1.id,
//       },
//       {
//         ecrId: ecr7.id,
//         fileName: "as-built-drawings-final.zip",
//         fileUrl: "https://storage.acmecorp.com/ecr/ecr-007/as-built-drawings-final.zip",
//         fileSize: 8388608,
//         mimeType: "application/zip",
//         stage: StageType.QUALITY_FINAL_CHECK,
//         uploadedBy: qualityEng1.id,
//       },
//     ],
//   });

//   console.log("✅ Attachments created");

//   // ============================================================
//   // NOTIFICATIONS
//   // ============================================================
//   await prisma.notification.createMany({
//     data: [
//       // To costing engineer — new ECR pending
//       {
//         ecrId: ecr2.id,
//         userId: costingEng1.id,
//         title: "New ECR Awaiting Costing",
//         message: 'ECR for "Passenger Information Display – Platform 7B" has been submitted and is pending your cost review.',
//         type: "ECR_PENDING_ACTION",
//         isRead: false,
//       },
//       // To design engineer — ECR returned
//       {
//         ecrId: ecr8.id,
//         userId: designEng1.id,
//         title: "ECR Returned to Design",
//         message: 'ECR for "Conveyor System Integration" was returned by costing. Please review the remarks and resubmit with a clearer scope.',
//         type: "ECR_RETURNED",
//         isRead: false,
//       },
//       // To project engineer — costing approved
//       {
//         ecrId: ecr4.id,
//         userId: projectEng1.id,
//         title: "ECR Ready for Your Review",
//         message: 'Costing has been completed for "Cable Routing Redesign – Zone 3". The ECR is now pending your approval.',
//         type: "ECR_PENDING_ACTION",
//         isRead: false,
//       },
//       // To quality engineer — ready for QC
//       {
//         ecrId: ecr6.id,
//         userId: qualityEng1.id,
//         title: "ECR Pending Quality Check",
//         message: 'ECR for "ESD Local Manual Override Panel" has passed all previous stages and is now pending final quality verification.',
//         type: "ECR_PENDING_ACTION",
//         isRead: false,
//       },
//       // Released notification — design engineer
//       {
//         ecrId: ecr7.id,
//         userId: designEng1.id,
//         title: "ECR Released Successfully",
//         message: 'ECR for "Trackside Junction Box Replacement" has passed quality check and has been officially released.',
//         type: "ECR_RELEASED",
//         isRead: true,
//       },
//       // Released notification — project engineer
//       {
//         ecrId: ecr7.id,
//         userId: projectEng1.id,
//         title: "ECR Released Successfully",
//         message: 'ECR for "Trackside Junction Box Replacement" has passed quality check and has been officially released.',
//         type: "ECR_RELEASED",
//         isRead: true,
//       },
//       // Admin summary
//       {
//         ecrId: null,
//         userId: adminUser.id,
//         title: "Weekly ECR Summary",
//         message: "7 ECRs are active this week: 1 Draft, 1 Pending Costing, 1 Under Costing, 1 Pending PM, 1 Under Design Meeting, 1 Pending QC, 1 Released.",
//         type: "SYSTEM_SUMMARY",
//         isRead: false,
//       },
//     ],
//   });
// }

// initDummyData();
