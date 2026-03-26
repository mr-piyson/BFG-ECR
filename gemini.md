# BFG-ECR Project Blueprint

## Project Overview
BFG-ECR is a specialized Engineering Change Request (ECR) management system designed for industrial manufacturing environments. It streamlines the lifecycle of engineering changes from initial design to final quality check and release.

## Core Domain Concepts

### 1. Engineering Change Request (ECR)
The central entity representing a change. It flows through a structured 5-stage lifecycle:
1. **Design Engineer Initial**: Creation and initial change description.
2. **Costing**: Financial assessment (NRC, RC costs).
3. **Project Manager**: Project-level impact and PO receipt.
4. **Design Engineer Meeting**: Collaborative review and release scheduling.
5. **Quality Final Check**: Final verification and release to production.

### 2. Projects and Scopes
- **Projects**: High-level groupings for ECRs (e.g., specific train lines or customer accounts).
- **Scopes**: Granular functional areas within a project. Multi-scope support allows an ECR to affect multiple system parts simultaneously.

### 3. Roles and Permissions
- `DESIGN_ENGINEER`: Creates and manages technical details.
- `COSTING_ENGINEER`: Provides cost analysis.
- `PROJECT_ENGINEER`: Manages project-level approval.
- `QUALITY_ENGINEER`: Conducts the final verification.
- `ADMIN`: Full system management.

## Tech Stack
- **Framework**: Next.js 14/15 (App Router).
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: Auth.js (NextAuth.v5).
- **UI/Components**: Radix UI (Shadcn UI), Tailwind CSS.
- **Workflow**: Horizontal stepper with conditional stage skipping.

## Key Features
- **Multi-Scope Support**: ECRs linked to multiple scopes per project.
- **Dynamic Workflow**: Stages can be marked as "Not Applicable" or "Skipped" based on the ECR type.
- **Status History**: Comprehensive tracking of every stage transition (`StageHistory`).
- **Attachments**: Stage-specific file uploads.
- **Notifications**: Automated alerts for role-based actions.

## Development Patterns
- **API routes**: Use `NextResponse` and Prisma for data access.
- **Forms**: Complex multi-step forms using React Hook Form and Zod.
- **UI Consistency**: Maintain horizontal stepper and authenticated layout across all detail views.
- **Database Constraints**: UUIDs for all primary keys, autoincrementing `ecrNumber` for human-readable IDs.
