"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, RotateCcw, Loader2, SkipForward } from "lucide-react";
import { formatDate } from "@/lib/ecr-helpers";
import { ReturnDialog } from "../return-dialog";
import type { ECR, ProjectManagerForm, DesignInitialForm } from "@/lib/types";

interface Stage3FormProps {
  ecr: ECR;
  userId: string;
  form: ProjectManagerForm | null;
  designInitialForm: DesignInitialForm | null;
  onUpdate: () => void;
}

export function Stage3Form({ ecr, userId, form, designInitialForm, onUpdate }: Stage3FormProps) {
  const isSkipped = designInitialForm?.is_skip_project_manager;
  const isActive = ecr.current_stage === "PROJECT_MANAGER" && ["PENDING_PROJECT_MANAGER", "UNDER_PROJECT_MANAGER"].includes(ecr.status);
  const isCompleted = form?.flow_status === "PROCEED";
  const [showReturn, setShowReturn] = useState(false);

  const [data, setData] = useState({
    po_receipt_date: form?.po_receipt_date ? form.po_receipt_date.split("T")[0] : "",
    roa: form?.roa || "",
    pm_notes: form?.pm_notes || "",
  });
  const [remark, setRemark] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleProcess() {
    setProcessing(true);
    try {
      const res = await fetch(`/api/ecrs/${ecr.id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_pm", userId, stage: "PROJECT_MANAGER", formData: data, remark }),
      });
      if (!res.ok) toast.error();
      toast.success("PM stage processed — ECR advanced");
      onUpdate();
    } catch {
      toast.error("Failed to process PM stage");
    } finally {
      setProcessing(false);
    }
  }

  if (isSkipped) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <SkipForward className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">Stage Skipped</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Design Engineer marked this stage as not applicable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stage 3 — Project Manager</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Fill PO receipt details and Rank of Application</p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Processed {formatDate(form?.processed_on)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="PO Receipt Date">
          <input type="date" value={data.po_receipt_date} onChange={(e) => setData((p) => ({ ...p, po_receipt_date: e.target.value }))} disabled={!isActive} className="form-input" />
        </FormField>
        <FormField label="RoA — Rank of Application" hint="Train set number(s)">
          <input type="text" value={data.roa} onChange={(e) => setData((p) => ({ ...p, roa: e.target.value }))} disabled={!isActive} placeholder="Train Set: TGV-001, TGV-002" className="form-input" />
        </FormField>
      </div>

      <FormField label="PM Notes">
        <textarea value={data.pm_notes} onChange={(e) => setData((p) => ({ ...p, pm_notes: e.target.value }))} disabled={!isActive} rows={4} className="form-input resize-none" placeholder="PO confirmed. Notes on application scope..." />
      </FormField>

      {isCompleted && form?.remark && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          <p className="italic">&ldquo;{form.remark}&rdquo;</p>
        </div>
      )}

      {isActive && (
        <>
          <FormField label="Remark (optional)">
            <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} className="form-input resize-none" placeholder="Optional remark when processing..." />
          </FormField>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button onClick={() => setShowReturn(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-orange-200 text-orange-700 rounded hover:bg-orange-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              Return
            </button>
            <button onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 font-medium">
              {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Process & Advance
            </button>
          </div>
        </>
      )}

      {showReturn && (
        <ReturnDialog
          ecrId={ecr.id}
          userId={userId}
          stage="PROJECT_MANAGER"
          currentStatus={ecr.status}
          availableTargets={[
            { value: "COSTING", label: "Stage 2 — Costing" },
            { value: "DESIGN_ENGINEER_INITIAL", label: "Stage 1 — Design Engineer" },
          ]}
          onClose={() => setShowReturn(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">
        {label}
        {hint && <span className="text-muted-foreground ml-1 font-normal text-[10px]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
