'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, FlowStatusBadge } from '@/components/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, User, Building2, Search, Info, CheckCircle2 } from 'lucide-react';
import { ECRFlowStatus, ECRStatus, StageType } from '@prisma/client';
import { formatDate, STAGE_SHORT_LABELS, STAGE_ORDER } from '@/lib/ecr-helpers';
import { cn } from '@/lib/utils';

interface ECRDetailData {
  ecr: any;
  design_initial_form: {
    change_description: string;
    cr_received_on: string;
    cr_by: string;
    flow_status: ECRFlowStatus;
    is_skip_costing: boolean;
    is_skip_project_manager: boolean;
    is_skip_meeting: boolean;
    is_skip_quality: boolean;
  } | null;
  costing_form: any;
  project_manager_form: any;
  design_meeting_form: any;
  quality_check_form: any;
  stage_histories: any[];
  attachments: any[];
}

export default function ECRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<ECRDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [ecrId, setEcrId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setEcrId(p.id));
  }, [params]);

  useEffect(() => {
    if (!ecrId) return;
    const fetchEcr = async () => {
      try {
        const res = await fetch(`/api/ecrs/${ecrId}`);
        const responseData = await res.json();
        setData(responseData);
      } catch (error) {
        console.error('Failed to fetch ECR:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEcr();
  }, [ecrId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading ECR details...</p>
      </div>
    );
  }

  if (!data || !data.ecr) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>ECR not found</p>
        </div>
      </div>
    );
  }

  const ecr = data.ecr;
  const currentStageIndex = STAGE_ORDER.indexOf(ecr.current_stage);
  const stageProgress = ((currentStageIndex + 1) / STAGE_ORDER.length) * 100;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">#{ecr.ecr_number}</h1>
            <p className="text-muted-foreground mt-1">
              {ecr.project_code} • {ecr.project_name}
            </p>
          </div>
          <StatusBadge status={ecr.status} />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <User className="w-4 h-4" />
            {ecr.design_engineer_name}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            Created {formatDate(ecr.created_at)}
          </div>
          {ecr.released_at && (
            <div className="flex items-center gap-1 text-green-600">
              <Clock className="w-4 h-4" />
              Released {formatDate(ecr.released_at)}
            </div>
          )}
        </div>
      </div>
      {/* About ECR */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">ECR Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Project
              </p>
              <p className="font-semibold text-base">{ecr.project?.name}</p>
              <p className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit">
                {ecr.project?.code}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Search className="w-3 h-3" /> Scopes
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ecr.scopes && ecr.scopes.length > 0 ? (
                  ecr.scopes.map((s: any) => (
                    <span
                      key={s.id}
                      className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 shadow-sm"
                    >
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground italic text-xs">No scopes assigned</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Info className="w-3 h-3" /> Source
              </p>
              <p className="font-semibold text-base flex items-center gap-2">
                {ecr.source === 'CUSTOMER' ? (
                  <User className="w-4 h-4 text-blue-500" />
                ) : (
                  <Building2 className="w-4 h-4 text-orange-500" />
                )}
                {ecr.source}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">CR Requested By</p>
              <p className="font-medium">{data.design_initial_form?.cr_by || '—'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">Design Engineer</p>
              <div className="font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {ecr.design_engineer_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </div>
                {ecr.design_engineer_name}
              </div>
            </div>

            {ecr.project_engineer_name && (
              <div className="space-y-1">
                <p className="text-muted-foreground">Project Engineer</p>
                <div className="font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                    {ecr.project_engineer_name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  {ecr.project_engineer_name}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modern Horizontal Workflow Stepper */}
      <Card className="p-8 shadow-sm border-primary/5 bg-muted/20">
        <div className="relative">
          {/* Horizontal Track Background */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-muted-foreground/10" />

          {/* Active Progress Track */}
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(var(--primary),0.5)]"
            style={{ width: `${Math.min(stageProgress, 100)}%` }}
          />

          <div className="relative flex justify-between items-start gap-2">
            {STAGE_ORDER.map((stage, index) => {
              const isActive = ecr.current_stage === stage;
              const isPassed = index < currentStageIndex;

              const isSkipped =
                (stage === 'COSTING' && data.design_initial_form?.is_skip_costing) ||
                (stage === 'PROJECT_MANAGER' &&
                  data.design_initial_form?.is_skip_project_manager) ||
                (stage === 'DESIGN_ENGINEER_MEETING' &&
                  data.design_initial_form?.is_skip_meeting) ||
                (stage === 'QUALITY_FINAL_CHECK' && data.design_initial_form?.is_skip_quality);

              return (
                <div key={stage} className="flex flex-col items-center flex-1 group">
                  {/* Node */}
                  <div
                    className={cn(
                      'size-16 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all duration-300 border-4',
                      isPassed && !isSkipped
                        ? 'bg-green-500 border-green-100 text-white shadow-lg'
                        : isSkipped
                          ? 'bg-slate-200 border-muted text-muted-foreground shadow-sm'
                          : isActive
                            ? 'bg-primary border-primary/20 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-110'
                            : 'bg-background border-muted text-muted-foreground',
                    )}
                  >
                    {isSkipped ? (
                      <CheckCircle2 className="w-5 h-5 opacity-40" />
                    ) : isPassed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Label & Status */}
                  <div className="mt-4 text-center space-y-1">
                    <p
                      className={cn(
                        'text-xs font-bold uppercase tracking-tighter transition-colors w-24 mx-auto leading-tight',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                        isSkipped ? 'opacity-40' : '',
                      )}
                    >
                      {STAGE_SHORT_LABELS[stage]}
                    </p>

                    <div className="flex flex-col items-center">
                      {isActive && (
                        <span className="text-[10px] font-extrabold text-primary animate-pulse tracking-widest uppercase">
                          Active
                        </span>
                      )}
                      {isSkipped && (
                        <span className="text-[9px] font-medium text-muted-foreground/60 italic">
                          Skipped
                        </span>
                      )}
                      {isPassed && !isSkipped && (
                        <span className="text-[9px] font-medium text-green-600">Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      {/* Tabs */}
      <Tabs className="w-full space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="design">Design Initial</TabsTrigger>
          <TabsTrigger value="costing">Costing</TabsTrigger>
          <TabsTrigger value="pm">Project Manager</TabsTrigger>
          <TabsTrigger value="meeting">Design Meeting</TabsTrigger>
          <TabsTrigger value="quality">Quality Check</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Design Initial Form</h3>
            {data.design_initial_form ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Change Description</p>
                  <p className="bg-muted p-3 rounded">
                    {data.design_initial_form.change_description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">CR Received On</p>
                    <p className="font-medium">
                      {formatDate(data.design_initial_form.cr_received_on)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Flow Status</p>
                    <FlowStatusBadge status={data.design_initial_form.flow_status} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No design initial form submitted</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="costing" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Costing Form</h3>
            {data.costing_form ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Total Cost</p>
                    <p className="font-medium">{data.costing_form.total_cost || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Flow Status</p>
                    <FlowStatusBadge status={data.costing_form.flow_status} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No costing form submitted</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="pm" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Project Manager Form</h3>
            {data.project_manager_form ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Flow Status</p>
                    <FlowStatusBadge status={data.project_manager_form.flow_status} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No project manager form submitted</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="meeting" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Design Meeting Form</h3>
            {data.design_meeting_form ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Meeting Date</p>
                    <p className="font-medium">
                      {formatDate(data.design_meeting_form.meeting_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Flow Status</p>
                    <FlowStatusBadge status={data.design_meeting_form.flow_status} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No design meeting form submitted</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Quality Check Form</h3>
            {data.quality_check_form ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Compliance Check</p>
                    <p className="font-medium">
                      {data.quality_check_form.compliance_check ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Flow Status</p>
                    <FlowStatusBadge status={data.quality_check_form.flow_status} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No quality check form submitted</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Stage History</h3>
            {data.stage_histories && data.stage_histories.length > 0 ? (
              <div className="space-y-3">
                {data.stage_histories.map((history: any) => (
                  <div key={history.id} className="border-l-2 border-primary pl-4 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {STAGE_SHORT_LABELS[history.stage as keyof typeof STAGE_SHORT_LABELS]}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(history.created_at)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {history.from_status} → {history.to_status}
                    </p>
                    {history.remark && <p className="text-xs mt-1">{history.remark}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No stage history available</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
