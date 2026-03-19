"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function NewECRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "user-de-1";

  const { data: projectsData } = useSWR("/api/admin/projects?withScopes=true", fetcher);
  const { data: usersData } = useSWR("/api/admin/users", fetcher);

  const [form, setForm] = useState({
    project_id: "",
    scope_id: "",
    source: "CUSTOMER",
    design_engineer_id: userId,
    project_engineer_id: "",
    customer_cr_number: "",
    cr_received_on: "",
    cr_by: "",
    change_description: "",
    is_skip_costing: false,
    is_skip_project_manager: false,
    is_skip_quality: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const projects = projectsData?.projects || [];
  const users = usersData?.users || [];
  const selectedProject = projects.find((p: { id: string; scopes?: unknown[] }) => p.id === form.project_id);
  const scopes = selectedProject?.scopes || [];
  const pmUsers = users.filter((u: { role: string }) => u.role === "PROJECT_ENGINEER");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_id || !form.cr_received_on || !form.cr_by || !form.change_description) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ecrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) toast.error();
      const { ecr } = await res.json();
      toast.success(`ECR-${ecr.ecr_number} created`);
      router.push(`/ecrs/${ecr.id}?userId=${userId}`);
    } catch {
      toast.error("Failed to create ECR");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="New Engineering Change Request"
        description="Create a new ECR and submit it to the workflow"
        actions={
          <Link href={`/ecrs?userId=${userId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project & Scope */}
          <section className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Project Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Project" required>
                <select value={form.project_id} onChange={(e) => setForm((p) => ({ ...p, project_id: e.target.value, scope_id: "" }))} className="form-input" required>
                  <option value="">Select project...</option>
                  {projects.map((p: { id: string; code: string; name: string }) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Scope (optional)">
                <select value={form.scope_id} onChange={(e) => setForm((p) => ({ ...p, scope_id: e.target.value }))} className="form-input" disabled={!form.project_id}>
                  <option value="">Select scope...</option>
                  {scopes.map((s: { id: string; name: string }) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Source">
                <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} className="form-input">
                  <option value="CUSTOMER">Customer</option>
                  <option value="INTERNAL">Internal</option>
                </select>
              </FormField>

              <FormField label="Project Engineer">
                <select value={form.project_engineer_id} onChange={(e) => setForm((p) => ({ ...p, project_engineer_id: e.target.value }))} className="form-input">
                  <option value="">Select PM...</option>
                  {pmUsers.map((u: { id: string; name: string }) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </section>

          {/* CR Details */}
          <section className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">CR Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Customer CR Number">
                <input type="text" value={form.customer_cr_number} onChange={(e) => setForm((p) => ({ ...p, customer_cr_number: e.target.value }))} placeholder="CR269342" className="form-input" />
              </FormField>
              <FormField label="CR Received On" required>
                <input type="date" value={form.cr_received_on} onChange={(e) => setForm((p) => ({ ...p, cr_received_on: e.target.value }))} className="form-input" required />
              </FormField>
              <FormField label="CR Raised By" required>
                <input type="text" value={form.cr_by} onChange={(e) => setForm((p) => ({ ...p, cr_by: e.target.value }))} placeholder="SNCF Engineering" className="form-input" required />
              </FormField>
            </div>

            <FormField label="Change Description" required>
              <textarea value={form.change_description} onChange={(e) => setForm((p) => ({ ...p, change_description: e.target.value }))} rows={5} placeholder="Describe the engineering change in full detail..." className="form-input resize-none" required />
            </FormField>
          </section>

          {/* Skip Flags */}
          <section className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Stage Skip Options</h2>
            <p className="text-xs text-muted-foreground">Check stages that are not applicable to this change request.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "is_skip_costing", label: "Skip Costing", desc: "No cost impact" },
                { key: "is_skip_project_manager", label: "Skip PM", desc: "No PO/RoA required" },
                { key: "is_skip_quality", label: "Skip Quality", desc: "Future production scope" },
              ].map(({ key, label, desc }) => (
                <label key={key} className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${form[key as keyof typeof form] ? "border-orange-200 bg-orange-50" : "border-border hover:bg-muted/30"}`}>
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))} className="mt-0.5 rounded" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Link href={`/ecrs?userId=${userId}`} className="px-4 py-2 text-sm border border-border rounded hover:bg-muted transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 font-medium">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create ECR (Save as Draft)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
