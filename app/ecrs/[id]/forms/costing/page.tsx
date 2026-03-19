"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CostingFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    labour_cost: "",
    material_cost: "",
    total_cost: "",
    currency: "EUR",
    budget_impact: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/ecrs/${params.id}/forms/costing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) toast.error("Failed to submit form");

      toast.success("Costing Form submitted successfully");
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
              <h1 className="text-3xl font-bold mb-2">Costing Form</h1>
              <p className="text-muted-foreground">Stage 2: Cost Estimation</p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Labour Cost *</label>
                    <input type="number" required step="0.01" value={formData.labour_cost} onChange={(e) => setFormData({ ...formData, labour_cost: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Material Cost *</label>
                    <input type="number" required step="0.01" value={formData.material_cost} onChange={(e) => setFormData({ ...formData, material_cost: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Cost *</label>
                    <input type="number" required step="0.01" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg">
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Budget Impact</label>
                  <input type="text" value={formData.budget_impact} onChange={(e) => setFormData({ ...formData, budget_impact: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="e.g., +10% of project budget" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg min-h-28" placeholder="Additional notes or comments..." />
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
