"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, RotateCcw, Loader2, Plus, X, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/ecr-helpers";
import { ReturnDialog } from "../return-dialog";
import type { ECR, DesignMeetingForm } from "@/lib/types";

interface Attendee {
  name: string;
  email: string;
  is_external: boolean;
}

interface Stage4FormProps {
  ecr: ECR;
  userId: string;
  form: (DesignMeetingForm & { attendees?: { id: string; name: string; email: string | null; is_external: boolean }[] }) | null;
  onUpdate: () => void;
}

export function Stage4Form({ ecr, userId, form, onUpdate }: Stage4FormProps) {
  const isActive = ecr.current_stage === "DESIGN_ENGINEER_MEETING" && ["PENDING_DESIGN_MEETING", "UNDER_DESIGN_MEETING"].includes(ecr.status);
  const isCompleted = form?.flow_status === "PROCEED";
  const [showReturn, setShowReturn] = useState(false);

  const [data, setData] = useState({
    meeting_date: form?.meeting_date ? form.meeting_date.split("T")[0] : "",
    epicor_release_date: form?.epicor_release_date ? form.epicor_release_date.split("T")[0] : "",
    ern_release_date: form?.ern_release_date ? form.ern_release_date.split("T")[0] : "",
    meeting_notes: form?.meeting_notes || "",
    is_not_applicable: form?.is_not_applicable ?? false,
  });
  const [attendees, setAttendees] = useState<Attendee[]>(form?.attendees?.map((a) => ({ name: a.name, email: a.email || "", is_external: a.is_external })) || []);
  const [newAttendee, setNewAttendee] = useState<Attendee>({ name: "", email: "", is_external: false });
  const [remark, setRemark] = useState("");
  const [processing, setProcessing] = useState(false);

  function addAttendee() {
    if (!newAttendee.name.trim()) return;
    setAttendees((p) => [...p, { ...newAttendee }]);
    setNewAttendee({ name: "", email: "", is_external: false });
  }

  function removeAttendee(i: number) {
    setAttendees((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleProcess() {
    setProcessing(true);
    try {
      const res = await fetch(`/api/ecrs/${ecr.id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_meeting",
          userId,
          stage: "DESIGN_ENGINEER_MEETING",
          formData: { ...data, attendees },
          remark,
        }),
      });
      if (!res.ok) toast.error();
      toast.success("Meeting stage processed — ECR advanced");
      onUpdate();
    } catch {
      toast.error("Failed to process meeting stage");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stage 4 — Design Engineer: Meeting & Release</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Schedule the ECR release meeting and fill release dates</p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Processed {formatDate(form?.processed_on)}
          </div>
        )}
      </div>

      {/* Not applicable toggle */}
      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${data.is_not_applicable ? "border-slate-300 bg-slate-50" : "border-border hover:bg-muted/30"}`}>
        <input type="checkbox" checked={data.is_not_applicable} onChange={(e) => setData((p) => ({ ...p, is_not_applicable: e.target.checked }))} disabled={!isActive} className="rounded" />
        <div>
          <p className="text-sm font-medium text-foreground">Meeting Not Applicable</p>
          <p className="text-xs text-muted-foreground">e.g. paint-scope-only changes — no meeting required</p>
        </div>
      </label>

      {!data.is_not_applicable && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Meeting Date">
              <input type="date" value={data.meeting_date} onChange={(e) => setData((p) => ({ ...p, meeting_date: e.target.value }))} disabled={!isActive} className="form-input" />
            </FormField>
            <FormField label="EPICOR Release Date">
              <input type="date" value={data.epicor_release_date} onChange={(e) => setData((p) => ({ ...p, epicor_release_date: e.target.value }))} disabled={!isActive} className="form-input" />
            </FormField>
            <FormField label="ERN Release Date">
              <input type="date" value={data.ern_release_date} onChange={(e) => setData((p) => ({ ...p, ern_release_date: e.target.value }))} disabled={!isActive} className="form-input" />
            </FormField>
          </div>

          <FormField label="Meeting Notes">
            <textarea value={data.meeting_notes} onChange={(e) => setData((p) => ({ ...p, meeting_notes: e.target.value }))} disabled={!isActive} rows={3} className="form-input resize-none" placeholder="Meeting discussion notes..." />
          </FormField>

          {/* Attendees */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meeting Attendees</p>
            </div>

            {attendees.length > 0 && (
              <div className="space-y-1.5">
                {attendees.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 px-3 py-2 rounded border border-border">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${att.is_external ? "bg-orange-400" : "bg-blue-400"}`} />
                    <span className="text-sm text-foreground flex-1">{att.name}</span>
                    {att.email && <span className="text-xs text-muted-foreground">{att.email}</span>}
                    <span className="text-[10px] text-muted-foreground">{att.is_external ? "External" : "Internal"}</span>
                    {isActive && (
                      <button onClick={() => removeAttendee(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isActive && (
              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded border border-dashed border-border">
                <input type="text" value={newAttendee.name} onChange={(e) => setNewAttendee((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="form-input flex-1" onKeyDown={(e) => e.key === "Enter" && addAttendee()} />
                <input type="email" value={newAttendee.email} onChange={(e) => setNewAttendee((p) => ({ ...p, email: e.target.value }))} placeholder="Email (optional)" className="form-input flex-1" />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap cursor-pointer">
                  <input type="checkbox" checked={newAttendee.is_external} onChange={(e) => setNewAttendee((p) => ({ ...p, is_external: e.target.checked }))} className="rounded" />
                  External
                </label>
                <button onClick={addAttendee} className="flex-shrink-0 p-1.5 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
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
              Process & Advance to Quality
            </button>
          </div>
        </>
      )}

      {showReturn && (
        <ReturnDialog
          ecrId={ecr.id}
          userId={userId}
          stage="DESIGN_ENGINEER_MEETING"
          currentStatus={ecr.status}
          availableTargets={[
            { value: "PROJECT_MANAGER", label: "Stage 3 — Project Manager" },
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
