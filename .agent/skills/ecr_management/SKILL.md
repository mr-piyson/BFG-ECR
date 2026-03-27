---
name: ecr_management
description: Handles everything related to the Engineering Change Request lifecycle, project/scope management, and stage-specific form processing in the BFG-ECR application.
---

# ECR Management Skill

This skill provides comprehensive instructions for interacting with the BFG-ECR application's core logic and domain models.

## Domain Model (Prisma)

- **Ecr**: The core entity. Includes properties like `ecrNumber`, `status`, `currentStage`, and relationships to various stage-specific forms (`DesignInitialForm`, `CostingForm`, `ProjectManagerForm`, `DesignMeetingForm`, `QualityCheckForm`).
- **Project & ProjectScope**: ECRs are linked to a project and can have multiple scopes.
- **StageHistory**: Tracks all status transitions and stage actions.

## Lifecycle Stages

The workflow follows a 5-step horizontal stepper:

1. `DESIGN_ENGINEER_INITIAL`: Entry point. Basic change details and skip flags for downstream stages.
2. `COSTING`: Financial assessment stage.
3. `PROJECT_MANAGER`: PM review and PO tracking.
4. `DESIGN_ENGINEER_MEETING`: Meeting and release dates.
5. `QUALITY_FINAL_CHECK`: Final verification before release.

## Implementation Guidelines

### API Routes

- Endpoint for list/create: `/api/ecrs`
- Endpoint for single ECR actions: `/api/ecrs/[id]`
- All API routes use Prisma for DB access and `NextResponse` for consistency.

### Forms & UI

- Use **React Hook Form** with **Zod** for validation.
- The `HorizontalStepper` component is used on the ECR details page to visualize the current progress.
- Maintain consistency with the **Authenticated Layout** which includes the sidebar and header.

### Workflow Logic

- Stage skipping is controlled by boolean flags on the `DesignInitialForm` (`isSkipCosting`, `isSkipProjectManager`, etc.).
- Each status transition must be logged in the `StageHistory` model with appropriate `fromStatus` and `toStatus`.
- Attachments should be categorized by `stage` to keep track of when/where they were uploaded.

### Authentication & Permissions

- Users have roles (`DESIGN_ENGINEER`, `COSTING_ENGINEER`, `PROJECT_ENGINEER`, `QUALITY_ENGINEER`, `ADMIN`).
- Restrict form submission and status updates based on the user's role and the current stage of the ECR.

## Workflow & Stage Progression

The ECR follows a linear progression through 5 stages, managed by different roles:

1.  **DESIGN_ENGINEER_INITIAL**: The Design Engineer creates the ECR, defines the change, and sets skip flags for subsequent stages.
2.  **COSTING**: The Costing Engineer performs financial assessment (NRC/RC costs).
3.  **PROJECT_MANAGER**: The Project Manager (or Project Engineer) reviews the impact and tracks PO receipt.
4.  **DESIGN_ENGINEER_MEETING**: Collaborative review to set release dates (Epicor/ERN).
5.  **QUALITY_FINAL_CHECK**: Final verification by Quality Engineer before release to production.

At each stage, the responsible engineer fills a stage-specific form. Submitting the form triggers a transition to the next applicable stage.

## Skipping Logic

Skipping is a key feature that allows the workflow to adapt to different ECR types (e.g., minor changes that don't need costing).

- **Control**: Skip flags are set during the `DESIGN_ENGINEER_INITIAL` stage.
- **Flags**: `isSkipCosting`, `isSkipProjectManager`, `isSkipMeeting`, `isSkipQuality`.
- **Implementation**: The `getNextStatus` utility (found in `app/api/ecrs/[id]/stage/route.ts`) evaluates these flags to determine the next destination stage.
- **History Traces**: When a stage is skipped, a record is added to `StageHistory` with `flowStatus: SKIPPED` to maintain a complete audit trail.

## Status & Transitions

The ECR moves through several statuses:

- `DRAFT`: Initial state.
- `PENDING_[STAGE]`: Waiting for the responsible engineer to start working.
- `UNDER_[STAGE]`: Form is being filled/edited.
- `RELEASED`: Final state after Quality Check.
- `RETURNED_TO_[STAGE]`: When a downstream stage finds an issue and sends it back.
- `ON_HOLD` / `CANCELLED`: Administrative states.

Each transition is logged in the `StageHistory` table, capturing:

- `fromStatus` and `toStatus`
- `actedByUserId`
- `remark` (mandatory for returns)
- `isSkip` flag (if applicable)

## Attachments

Files can be attached to an ECR at any stage.

- **Relationship**: Linked to the `Ecr` model via `ecrId`.
- **Metadata**: Includes `fileName`, `fileUrl`, `mimeType`, and `fileSize`.
- **Categorization**: Each attachment is tagged with the `stage` during which it was uploaded (e.g., a quote document uploaded during `COSTING`).

## Best Practices

- **Role Guarding**: Always check `user.role` before allowing form submission or stage transitions.
- **Data Integrity**: Use transactions (or sequential Prisma/SQL calls) when updating both the form data and the ECR status to ensure consistency.
- **Audit Trail**: Never change a status without creating a corresponding `StageHistory` entry.
- **Multi-Scope**: When displaying ECR information, remember that an ECR can belong to multiple `ProjectScope` entities.
