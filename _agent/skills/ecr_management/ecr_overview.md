---
name: ecr_overview
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

### workflow

- when admin or design engineer create ECR and associate its attributes then the ecr is completed first stage and it goes to next stage based on route configuration (if there is skip route ) the default route is ,

Design initial -> Costing -> Project Manager -> Design Meeting -> Quality Check out 

when it is  any any state the Engineers or admin of that stage will Fill the assisted form and when it filled it goes to next stage



