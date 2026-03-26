'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, User2, Info, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [scopes, setScopes] = useState<ProjectScope[]>([]);
  const [selectedScopeIds, setSelectedScopeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const [formData, setFormData] = useState({
    project_id: '',
    source: 'CUSTOMER',
    design_engineer_id: '',
    project_engineer_id: '',
    cr_received_on: new Date().toISOString().split('T')[0],
    cr_by: '',
    customer_cr_number: '',
    change_description: '',
    is_skip_costing: false,
    is_skip_project_manager: false,
    is_skip_meeting: false,
    is_skip_quality: false,
  });

  const [engineers, setEngineers] = useState<{ design: any[]; project: any[] }>({
    design: [],
    project: [],
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/admin/projects');
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
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

    const fetchProjectDetails = async () => {
      setFetchingDetails(true);
      try {
        const [scopesRes, adminRes] = await Promise.all([
          fetch(`/api/admin/projects/${formData.project_id}/scopes`),
          fetch(`/api/admin/users`), // We'll filter for engineers
        ]);

        const scopesData = await scopesRes.json();
        const allUsers = await adminRes.json();

        setScopes(scopesData.filter((s: any) => s.isActive));

        // Filter users by role for selection
        const des = allUsers.filter((u: any) => u.role === 'DESIGN_ENGINEER' || u.role === 'ADMIN');
        const pes = allUsers.filter(
          (u: any) => u.role === 'PROJECT_ENGINEER' || u.role === 'ADMIN',
        );
        setEngineers({ design: des, project: pes });

        // Auto-select primary design engineer if available (this would ideally come from a specific project assignments API)
        // For now, we'll let the user select or default to session user if they are an engineer
        if (session?.user?.role === 'DESIGN_ENGINEER' && !formData.design_engineer_id) {
          setFormData((prev) => ({ ...prev, design_engineer_id: session.user.id }));
        }
      } catch (error) {
        console.error('Failed to fetch project details:', error);
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchProjectDetails();
  }, [formData.project_id, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ecrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scope_ids: selectedScopeIds,
        }),
      });

      if (!res.ok) toast.error('Failed to create ECR');

      const data = await res.json();
      toast.success('ECR created successfully');
      router.push(`/ecrs/${data.ecr.id}`);
    } catch (error) {
      console.error('ECR creation error:', error);
      toast.error('Failed to create ECR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New ECR</h1>
        <p className="text-muted-foreground">Start a new engineering change request</p>
      </div>

      <Card className="p-8 shadow-lg border-primary/10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <h2>Project Context</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project Identification *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, project_id: val }))}
                >
                  <SelectTrigger id="project_id" className="w-full">
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.project_id && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label>Project Scopes *</Label>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                    {fetchingDetails ? (
                      <p className="text-xs text-muted-foreground animate-pulse">
                        Loading scopes...
                      </p>
                    ) : scopes.length === 0 ? (
                      <p className="text-xs text-muted-foreground col-span-2 italic">
                        No active scopes found for this project.
                      </p>
                    ) : (
                      scopes.map((scope) => (
                        <label
                          key={scope.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border',
                            selectedScopeIds.includes(scope.id)
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-background border-transparent hover:border-border',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedScopeIds.includes(scope.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedScopeIds([...selectedScopeIds, scope.id]);
                              } else {
                                setSelectedScopeIds(
                                  selectedScopeIds.filter((id) => id !== scope.id),
                                );
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium">{scope.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logistics Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Info className="w-5 h-5" />
              <h2>Request Logistics</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Source *</Label>
                <Tabs
                  value={formData.source}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, source: val }))}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 h-10">
                    <TabsTrigger value="CUSTOMER" className="flex gap-2">
                      <User2 className="w-4 h-4" /> Customer
                    </TabsTrigger>
                    <TabsTrigger value="INTERNAL" className="flex gap-2">
                      <Building2 className="w-4 h-4" /> Internal
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cr_received_on">CR Received On *</Label>
                <input
                  id="cr_received_on"
                  type="date"
                  required
                  value={formData.cr_received_on}
                  onChange={(e) => setFormData({ ...formData, cr_received_on: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cr_by">Requested By *</Label>
                <input
                  id="cr_by"
                  type="text"
                  required
                  value={formData.cr_by}
                  onChange={(e) => setFormData({ ...formData, cr_by: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={
                    formData.source === 'CUSTOMER' ? 'Customer Company Name' : 'Internal Department'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_cr_number">Customer CR # (Optional)</Label>
                <input
                  id="customer_cr_number"
                  type="text"
                  value={formData.customer_cr_number}
                  onChange={(e) => setFormData({ ...formData, customer_cr_number: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. CR-2024-001"
                />
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <User2 className="w-5 h-5" />
              <h2>Team Assignment</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="design_engineer">Design Engineer *</Label>
                <Select
                  value={formData.design_engineer_id}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, design_engineer_id: val }))
                  }
                  required
                >
                  <SelectTrigger id="design_engineer">
                    <SelectValue placeholder="Select engineer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {engineers.design.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_engineer">Project Engineer (Optional)</Label>
                <Select
                  value={formData.project_engineer_id}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, project_engineer_id: val }))
                  }
                >
                  <SelectTrigger id="project_engineer">
                    <SelectValue placeholder="Select PM..." />
                  </SelectTrigger>
                  <SelectContent>
                    {engineers.project.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4 pt-4 border-t">
            <Label
              htmlFor="change_description"
              className="text-primary font-semibold flex items-center gap-2"
            >
              <Info className="w-5 h-5" /> Change Description *
            </Label>
            <textarea
              id="change_description"
              required
              value={formData.change_description}
              onChange={(e) => setFormData({ ...formData, change_description: e.target.value })}
              className="w-full flex min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Provide a detailed explanation of the required changes and technical impacts..."
            />
          </div>

          {/* Workflow Options */}
          <div className="pt-6 border-t">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Workflow Customization
            </Label>
            <div className="grid grid-cols-2 gap-y-3 mt-4">
              {[
                { id: 'is_skip_costing', label: 'Skip Costing Stage' },
                { id: 'is_skip_project_manager', label: 'Skip PM Approval' },
                { id: 'is_skip_meeting', label: 'Skip Design Meeting' },
                { id: 'is_skip_quality', label: 'Skip Quality Check' },
              ].map((stage) => (
                <label key={stage.id} className="flex items-center gap-2 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData as any)[stage.id]}
                    onChange={(e) => setFormData({ ...formData, [stage.id]: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-muted-foreground/30"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">
                    {stage.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t">
            <Button
              type="submit"
              className="flex-1 h-12 text-base font-semibold"
              disabled={loading || !formData.project_id || selectedScopeIds.length === 0}
            >
              {loading ? 'Creating ECR...' : 'Initialize ECR Workflow'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8"
              onClick={() => router.back()}
              disabled={loading}
            >
              Discard
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
