"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_SHORT_LABELS, formatDate, formatDatetime, ROLE_LABELS, FLOW_STATUS_LABELS, FLOW_STATUS_COLORS } from "@/lib/ecr-helpers";
import { FlowStatusBadge } from "@/components/status-badge";
import { Stage1Form } from "./stage-forms/stage1-form";
import { Stage2Form } from "./stage-forms/stage2-form";
import { Stage3Form } from "./stage-forms/stage3-form";
import { Stage4Form } from "./stage-forms/stage4-form";
import { Stage5Form } from "./stage-forms/stage5-form";
import type { ECR, DesignInitialForm, CostingForm, ProjectManagerForm, DesignMeetingForm, QualityCheckForm, StageHistory, StageType } from "@/lib/types";

interface StageFormPanelProps {
  ecr: ECR & {
    project_code: string;
    project_name: string;
    scope_name?: string;
    design_engineer_name: string;
  };
  userId: string;
  designInitialForm: DesignInitialForm | null;
  costingForm: CostingForm | null;
  projectManagerForm: ProjectManagerForm | null;
  designMeetingForm: (DesignMeetingForm & { attendees?: { id: string; name: string; email: string | null; is_external: boolean }[] }) | null;
  qualityCheckForm: QualityCheckForm | null;
  stageHistories: (StageHistory & { acted_by_name?: string; acted_by_role?: string })[];
  onUpdate: () => void;
}

type TabType = "stage1" | "stage2" | "stage3" | "stage4" | "stage5" | "history";

const STAGE_TABS: { id: TabType; label: string; stage?: StageType }[] = [
  { id: "stage1", label: "Stage 1", stage: "DESIGN_ENGINEER_INITIAL" },
  { id: "stage2", label: "Stage 2", stage: "COSTING" },
  { id: "stage3", label: "Stage 3", stage: "PROJECT_MANAGER" },
  { id: "stage4", label: "Stage 4", stage: "DESIGN_ENGINEER_MEETING" },
  { id: "stage5", label: "Stage 5", stage: "QUALITY_FINAL_CHECK" },
  { id: "history", label: "Audit Trail" },
];

// Map stage to active tab
function getActiveTab(currentStage: StageType): TabType {
  const map: Record<StageType, TabType> = {
    DESIGN_ENGINEER_INITIAL: "stage1",
    COSTING: "stage2",
    PROJECT_MANAGER: "stage3",
    DESIGN_ENGINEER_MEETING: "stage4",
    QUALITY_FINAL_CHECK: "stage5",
  };
  return map[currentStage] || "stage1";
}

export function StageFormPanel(props: StageFormPanelProps) {
  const { ecr, userId, designInitialForm, costingForm, projectManagerForm, designMeetingForm, qualityCheckForm, stageHistories, onUpdate } = props;
  const [activeTab, setActiveTab] = useState<TabType>(() => getActiveTab(ecr.current_stage));

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex items-center gap-0 overflow-x-auto">
          {STAGE_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("shrink-0 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px", activeTab === tab.id ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {tab.id === "history" ? (
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  {tab.label}
                </span>
              ) : (
                <span>
                  {tab.label}
                  {tab.stage && <span className="hidden sm:inline text-muted-foreground ml-1 text-xs">— {STAGE_SHORT_LABELS[tab.stage]}</span>}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "stage1" && <Stage1Form ecr={ecr} userId={userId} form={designInitialForm} onUpdate={onUpdate} />}
        {activeTab === "stage2" && <Stage2Form ecr={ecr} userId={userId} form={costingForm} designInitialForm={designInitialForm} onUpdate={onUpdate} />}
        {activeTab === "stage3" && <Stage3Form ecr={ecr} userId={userId} form={projectManagerForm} designInitialForm={designInitialForm} onUpdate={onUpdate} />}
        {activeTab === "stage4" && <Stage4Form ecr={ecr} userId={userId} form={designMeetingForm} onUpdate={onUpdate} />}
        {activeTab === "stage5" && <Stage5Form ecr={ecr} userId={userId} form={qualityCheckForm} designInitialForm={designInitialForm} onUpdate={onUpdate} />}
        {activeTab === "history" && <AuditTrail histories={stageHistories} />}
      </div>
    </div>
  );
}

function AuditTrail({ histories }: { histories: (StageHistory & { acted_by_name?: string; acted_by_role?: string })[] }) {
  if (histories.length === 0) {
    return <div className="text-center py-8 text-muted-foreground text-sm">No stage transitions recorded yet.</div>;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {[...histories].reverse().map((h) => {
          const dotColor: Record<string, string> = {
            PROCEED: "bg-green-500",
            PENDING: "bg-yellow-400",
            RETURNED: "bg-orange-500",
            SKIPPED: "bg-slate-300",
            NOT_APPLICABLE: "bg-slate-300",
          };
          return (
            <div key={h.id} className="relative flex items-start gap-4 pl-10">
              <div className={cn("absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card", dotColor[h.flow_status])} />
              <div className="flex-1 bg-muted/30 border border-border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="text-sm font-medium text-foreground">{STAGE_SHORT_LABELS[h.stage]}</span>
                    <span className="mx-2 text-muted-foreground/40">→</span>
                    <FlowStatusBadge status={h.flow_status} />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatDatetime(h.created_at)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  by <span className="font-medium text-foreground">{h.acted_by_name}</span>
                  {h.acted_by_role && <span className="ml-1">({ROLE_LABELS[h.acted_by_role as keyof typeof ROLE_LABELS] || h.acted_by_role})</span>}
                </div>
                {h.returned_to_stage && <div className="mt-1 text-xs text-orange-600">Returned to: {STAGE_SHORT_LABELS[h.returned_to_stage]}</div>}
                {h.remark && <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground italic">&ldquo;{h.remark}&rdquo;</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
