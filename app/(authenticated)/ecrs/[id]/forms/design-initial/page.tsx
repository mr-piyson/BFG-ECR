"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DesignInitialFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_cr_number: "",
    change_description: "",
    is_skip_costing: false,
    is_skip_project_manager: false,
    is_skip_quality: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/ecrs/${params.id}/forms/design-initial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) toast.error("Failed to submit form");

      toast.success("Design Initial Form submitted successfully");
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
              <h1 className="text-3xl font-bold mb-2">Design Initial Form</h1>
              <p className="text-muted-foreground">Stage 1: Initial Design Engineer Review</p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer CR Number</label>
                  <input type="text" value={formData.customer_cr_number} onChange={(e) => setFormData({ ...formData, customer_cr_number: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="e.g., CR-2024-001" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Change Description *</label>
                  <textarea required value={formData.change_description} onChange={(e) => setFormData({ ...formData, change_description: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg min-h-32" placeholder="Describe the requested change in detail..." />
                </div>

                <div className="space-y-3 pt-6 border-t border-border">
                  <p className="font-medium text-sm">Skip Stages</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_skip_costing} onChange={(e) => setFormData({ ...formData, is_skip_costing: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm">Skip Costing Stage</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_skip_project_manager} onChange={(e) => setFormData({ ...formData, is_skip_project_manager: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm">Skip Project Manager Stage</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_skip_quality} onChange={(e) => setFormData({ ...formData, is_skip_quality: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm">Skip Quality Check Stage</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Form"}
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
