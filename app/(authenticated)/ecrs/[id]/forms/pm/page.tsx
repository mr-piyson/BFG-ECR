"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PMFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    po_receipt_date: "",
    roa: "",
    pm_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/ecrs/${params.id}/forms/pm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) toast.error("Failed to submit form");

      toast.success("Project Manager Form submitted successfully");
      router.push(`/ecrs/${params.id}`);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Project Manager Review</h1>
              <p className="text-muted-foreground">Stage 3: Project Manager Assessment</p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">PO Receipt Date</label>
                  <input type="date" value={formData.po_receipt_date} onChange={(e) => setFormData({ ...formData, po_receipt_date: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ROA (Resource Allocation)</label>
                  <input type="text" value={formData.roa} onChange={(e) => setFormData({ ...formData, roa: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="e.g., 2 engineers for 3 weeks" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Manager Notes</label>
                  <textarea value={formData.pm_notes} onChange={(e) => setFormData({ ...formData, pm_notes: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg min-h-32" placeholder="Timeline impact, risks, comments..." />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
