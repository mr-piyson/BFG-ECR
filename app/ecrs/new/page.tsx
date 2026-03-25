"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User2 } from "lucide-react";

interface Project {
  id: string;
  code: string;
  name: string;
}

interface ProjectScope {
  id: string;
  name: string;
}

export default function NewECRPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [scopes, setScopes] = useState<ProjectScope[]>([]);
  const [selectedScopeIds, setSelectedScopeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    source: "CUSTOMER",
    design_engineer_id: "f185b755-6218-4015-9dae-61476dd8fcd6", // Default to seeded admin for now or first user
    cr_received_on: new Date().toISOString().split("T")[0],
    cr_by: "",
    change_description: "",
    is_skip_costing: false,
    is_skip_project_manager: false,
    is_skip_meeting: false,
    is_skip_quality: false,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/admin/projects");
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!formData.project_id) {
      setScopes([]);
      setSelectedScopeIds([]);
      return;
    }

    const fetchScopes = async () => {
      try {
        const res = await fetch(`/api/admin/projects/${formData.project_id}/scopes`);
        const data = await res.json();
        setScopes(data.filter((s: any) => s.isActive));
      } catch (error) {
        console.error("Failed to fetch scopes:", error);
      }
    };
    fetchScopes();
  }, [formData.project_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ecrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scope_ids: selectedScopeIds
        }),
      });

      if (!res.ok) toast.error("Failed to create ECR");

      const data = await res.json();
      toast.success("ECR created successfully");
      router.push(`/ecrs/${data.ecr.id}`);
    } catch (error) {
      console.error("ECR creation error:", error);
      toast.error("Failed to create ECR");
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
              <h1 className="text-3xl font-bold mb-2">Create New ECR</h1>
              <p className="text-muted-foreground">Start a new engineering change request</p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 font-bold">Project Identification</label>
                  <select
                    required
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.project_id && (
                  <div>
                    <label className="block text-sm font-medium mb-3 font-bold">Project Scopes (select multiple)</label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                      {scopes.length === 0 ? (
                        <p className="text-xs text-muted-foreground col-span-2 italic">No active scopes found for this project.</p>
                      ) : scopes.map((scope) => (
                        <label key={scope.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedScopeIds.includes(scope.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedScopeIds([...selectedScopeIds, scope.id]);
                              } else {
                                setSelectedScopeIds(selectedScopeIds.filter(id => id !== scope.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium">{scope.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Source</label>
                  <div className="flex gap-4">
                    <Tabs defaultValue="customer" className="w-full">
                      <TabsList className="w-full">
                        <TabsTrigger value={"customer"}>
                          {" "}
                          <User2 /> Customer
                        </TabsTrigger>
                        <TabsTrigger value={"Internal"}>
                          <Building2 /> Internal{" "}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CR Received On *</label>
                    <input
                      type="date"
                      required
                      value={formData.cr_received_on}
                      onChange={(e) => setFormData({ ...formData, cr_received_on: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CR Number</label>
                    <input
                      type="text"
                      required
                      value={formData.cr_by}
                      onChange={(e) => setFormData({ ...formData, cr_by: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                      placeholder="Customer or department name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Change Description *</label>
                  <textarea
                    required
                    value={formData.change_description}
                    onChange={(e) => setFormData({ ...formData, change_description: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg min-h-32"
                    placeholder="Describe the requested change in detail..."
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Skip Stages (optional)</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_skip_costing}
                        onChange={(e) => setFormData({ ...formData, is_skip_costing: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Skip Costing Stage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_skip_project_manager}
                        onChange={(e) => setFormData({ ...formData, is_skip_project_manager: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Skip Project Manager Stage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_skip_meeting}
                        onChange={(e) => setFormData({ ...formData, is_skip_meeting: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Skip ECR Meeting Stage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_skip_quality}
                        onChange={(e) => setFormData({ ...formData, is_skip_quality: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Skip Quality Check Stage</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create ECR"}
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
