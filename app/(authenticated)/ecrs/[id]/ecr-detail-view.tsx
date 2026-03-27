'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { StatusBadge, FlowStatusBadge } from '@/components/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Clock,
  User,
  Building2,
  Search,
  Info,
  CheckCircle2,
  History,
  FileText,
  DollarSign,
  Users,
  Layout,
  Paperclip,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { ECRFlowStatus, ECRStatus, StageType } from '@prisma/client';
import { formatDate, STAGE_SHORT_LABELS, STAGE_ORDER } from '@/lib/ecr-helpers';
import { cn } from '@/lib/utils';
import {
  DesignInitialForm as DesignInitialFormComponent,
  CostingForm as CostingFormComponent,
  PMForm as PMFormComponent,
  MeetingForm as MeetingFormComponent,
  QualityForm as QualityFormComponent,
} from './stage-forms';

interface ECRDetailViewProps {
  ecr: any;
  designInitialForm: any;
  costingForm: any;
  pmForm: any;
  meetingForm: any;
  qualityForm: any;
  stageHistories: any[];
  attachments: any[];
}

export function ECRDetailView({
  ecr,
  designInitialForm,
  costingForm,
  pmForm,
  meetingForm,
  qualityForm,
  stageHistories,
  attachments,
}: ECRDetailViewProps) {
  const [activeTab, setActiveTab] = useState('history');

  const currentStageIndex = STAGE_ORDER.indexOf(ecr.currentStage);
  const stageProgress =
    ((currentStageIndex + (ecr.status === 'RELEASED' ? 1 : 0)) / STAGE_ORDER.length) * 100;

  const isTerminal = ecr.status === 'RELEASED' || ecr.status === 'CANCELLED';

  const renderCurrentForm = () => {
    if (isTerminal) return null;

    switch (ecr.currentStage) {
      case 'DESIGN_ENGINEER_INITIAL':
        return <DesignInitialFormComponent ecrId={ecr.id} initialData={designInitialForm} />;
      case 'COSTING':
        return <CostingFormComponent ecrId={ecr.id} />;
      case 'PROJECT_MANAGER':
        return <PMFormComponent ecrId={ecr.id} />;
      case 'DESIGN_ENGINEER_MEETING':
        return <MeetingFormComponent ecrId={ecr.id} />;
      case 'QUALITY_FINAL_CHECK':
        return <QualityFormComponent ecrId={ecr.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-1000">
      {/* Header & Meta Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 bg-card/50 p-8 rounded-4xl border border-border/50 backdrop-blur-xl shadow-2xl shadow-primary/5">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
              ECR Management
            </span>
            <div className="h-4 w-px bg-border" />
            <StatusBadge status={ecr.status} />
          </div>
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
              #{ecr.ecrNumber}
            </h1>
            <p className="text-xl font-bold text-muted-foreground mt-2 flex items-center gap-2">
              <span className="text-primary/70">{ecr.project?.code}</span>
              <span className="text-muted-foreground/30">•</span>
              {ecr.project?.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-8 items-center bg-white/50 p-8 rounded-3xl border border-border/30 shadow-inner">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Owner
            </p>
            <p className="font-extrabold text-lg text-slate-800">{ecr.designEngineer?.name}</p>
          </div>
          <div className="h-10 w-px bg-border hidden md:block" />
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Created
            </p>
            <p className="font-extrabold text-lg text-slate-800">{formatDate(ecr.createdAt)}</p>
          </div>
          {ecr.releasedAt && (
            <>
              <div className="h-10 w-px bg-border hidden md:block" />
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase text-green-600 tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Released
                </p>
                <p className="font-extrabold text-lg text-green-600">
                  {formatDate(ecr.releasedAt)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Main Content Area: Workflow & Current Action */}
          <div className="space-y-10">
            {/* Modern Workflow Stepper */}
            <Card className="p-12 relative overflow-hidden bg-slate-950 border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                <Settings2 className="size-64" />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-lg  font-bold mb-10 flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full shadow-[0_0_10px_var(--primary)]" />
                    Workflow Progression
                  </h3>
                  <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <p className="text-[10px] font-bold text-white/50">
                      {Math.round(stageProgress)}% Complete
                    </p>
                  </div>
                </div>

                <div className="relative pt-4 pb-8">
                  {/* Track Background */}
                  <div className="absolute top-12 left-0 w-full h-1 bg-white/5" />

                  {/* Progress Line */}
                  <div
                    className="absolute top-12 left-0 h-1 bg-linear-to-r from-primary via-primary to-blue-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(var(--primary),0.6)]"
                    style={{ width: `${stageProgress}%` }}
                  />

                  <div className="relative flex justify-between items-start">
                    {STAGE_ORDER.map((stage, index) => {
                      const isActive = ecr.currentStage === stage && !isTerminal;
                      const isPassed = index < currentStageIndex || isTerminal;

                      const isSkipped =
                        (stage === 'COSTING' && designInitialForm?.isSkipCosting) ||
                        (stage === 'PROJECT_MANAGER' && designInitialForm?.isSkipProjectManager) ||
                        (stage === 'DESIGN_ENGINEER_MEETING' && designInitialForm?.isSkipMeeting) ||
                        (stage === 'QUALITY_FINAL_CHECK' && designInitialForm?.isSkipQuality);

                      return (
                        <div
                          key={stage}
                          className="flex flex-col items-center flex-1 z-10 group/node"
                        >
                          <div
                            className={cn(
                              'size-10 rounded-full flex items-center justify-center transition-all duration-500 border-4',
                              isPassed && !isSkipped
                                ? 'bg-primary border-slate-950 text-white shadow-[0_0_15px_rgba(var(--primary),0.4)]'
                                : isSkipped
                                  ? 'bg-slate-800 border-slate-900 text-slate-500'
                                  : isActive
                                    ? 'bg-white border-primary text-slate-950 scale-125 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                    : 'bg-slate-900 border-slate-800 text-slate-600',
                            )}
                          >
                            {isPassed && !isSkipped ? (
                              <CheckCircle2 className="size-5" />
                            ) : (
                              <span className="text-[10px] font-black">{index + 1}</span>
                            )}
                          </div>

                          <div className="mt-6 text-center space-y-1 w-20">
                            <p
                              className={cn(
                                'text-[9px] font-black uppercase tracking-tighter leading-tight transition-colors',
                                isActive ? 'text-white' : 'text-muted-foreground/60',
                                isSkipped && 'italic opacity-30',
                              )}
                            >
                              {STAGE_SHORT_LABELS[stage]}
                            </p>
                            {isActive && (
                              <div className="size-1 bg-primary rounded-full mx-auto animate-ping" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Current Action / Form Area */}
            {!isTerminal && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Card className="p-1 pb-1 relative overflow-hidden bg-linear-to-br from-primary/20 via-primary/5 to-transparent border-none rounded-4xl shadow-2xl">
                  <div className="bg-white m-px p-8 rounded-4xl space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Sparkles className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black tracking-tight text-slate-900">
                            Immediate Action Required
                          </h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Complete the following to advance the workflow
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                        <span className="text-[10px] font-black text-primary uppercase">
                          {STAGE_SHORT_LABELS[ecr.currentStage as StageType]}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                      {renderCurrentForm()}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Left Column: Essential Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 overflow-hidden relative group border-primary/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Info className="size-12" />
            </div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Layout className="size-4 text-primary" /> Key Information
            </h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase">Scopes</p>
                <div className="flex flex-wrap gap-1.5">
                  {ecr.scopes?.map((s: any) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/5 text-primary border border-primary/20"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase">Source</p>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {ecr.source === 'CUSTOMER' ? (
                    <div className="size-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded flex items-center justify-center">
                      <Users className="size-3.5" />
                    </div>
                  ) : (
                    <div className="size-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded flex items-center justify-center">
                      <Building2 className="size-3.5" />
                    </div>
                  )}
                  {ecr.source}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase">
                  Project Engineer
                </p>
                <p className="font-semibold text-sm">{ecr.projectEngineer?.name || '—'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-dashed border-2 bg-muted/30">
            <h3 className="font-bold text-sm mb-4 flex items-center justify-between">
              Attachments
              <span className="text-[10px] bg-background px-2 py-0.5 rounded-full border">
                {attachments.length} files
              </span>
            </h3>
            {attachments.length > 0 ? (
              <div className="space-y-3">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 bg-background rounded-lg border shadow-sm group hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="size-8 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Paperclip className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{file.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Stage: {STAGE_SHORT_LABELS[file.stage as StageType]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg bg-background/50 border-dashed">
                <p className="text-xs text-muted-foreground">No files attached yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Workflow Visualization */}
        <div className="lg:col-span-8">
          <Card className="p-8 h-full bg-slate-900 dark:bg-zinc-900 border-none shadow-2xl text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CheckCircle2 className="size-64" />
            </div>

            <div className="relative">
              <h3 className="text-lg font-bold mb-10 flex items-center gap-3">
                <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                Workflow Progression
              </h3>

              <div className="relative flex justify-between items-start pt-4 px-4">
                {/* Connector Line */}
                <div className="absolute top-8 left-0 w-full h-[2px] bg-white/10" />
                <div
                  className="absolute top-8 left-0 h-[2px] bg-primary transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  style={{ width: `${Math.min(stageProgress, 100)}%` }}
                />

                {STAGE_ORDER.map((stage, index) => {
                  const isActive = ecr.currentStage === stage;
                  const isPassed =
                    index < STAGE_ORDER.indexOf(ecr.currentStage as StageType) ||
                    ecr.status === 'RELEASED';
                  const isSkipped =
                    (stage === 'COSTING' && designInitialForm?.isSkipCosting) ||
                    (stage === 'PROJECT_MANAGER' && designInitialForm?.isSkipProjectManager) ||
                    (stage === 'DESIGN_ENGINEER_MEETING' && designInitialForm?.isSkipMeeting) ||
                    (stage === 'QUALITY_FINAL_CHECK' && designInitialForm?.isSkipQuality);

                  return (
                    <div key={stage} className="flex flex-col items-center flex-1 z-10">
                      <div
                        className={cn(
                          'size-16 rounded-full flex items-center justify-center transition-all duration-500 border-4',
                          isPassed && !isSkipped
                            ? 'bg-green-500 border-green-400/50 shadow-lg shadow-green-500/20'
                            : isSkipped
                              ? 'bg-zinc-700 border-zinc-600 text-zinc-400'
                              : isActive
                                ? 'bg-primary border-primary/20 shadow-lg shadow-primary/30 scale-110'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500',
                        )}
                      >
                        {isSkipped ? (
                          <AlertCircle className="size-6 opacity-30" />
                        ) : isPassed ? (
                          <CheckCircle2 className="size-6 text-white" />
                        ) : (
                          <span className="text-lg font-black">{index + 1}</span>
                        )}
                      </div>
                      <div className="mt-5 text-center px-1">
                        <p
                          className={cn(
                            'text-[10px] font-black uppercase tracking-widest leading-tight transition-colors',
                            isActive ? 'text-primary' : 'text-zinc-400',
                          )}
                        >
                          {STAGE_SHORT_LABELS[stage]}
                        </p>
                        <div className="mt-1 h-3 flex items-center justify-center">
                          {isActive && (
                            <span className="text-[9px] font-bold text-primary animate-pulse tracking-tight">
                              IN PROGRESS
                            </span>
                          )}
                          {isSkipped && (
                            <span className="text-[9px] font-bold text-zinc-500 italic">
                              SKIPPED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs Section for Forms and History */}
      <Tabs
        defaultValue="history"
        className="space-y-6 pt-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex items-center justify-between border-b pb-1 overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 text-sm font-bold flex gap-2"
            >
              <History className="size-4" /> Activity
            </TabsTrigger>
            <TabsTrigger
              value="design"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 text-sm font-bold flex gap-2"
            >
              <FileText className="size-4" /> Design
            </TabsTrigger>
            <TabsTrigger
              value="costing"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 text-sm font-bold flex gap-2"
            >
              <DollarSign className="size-4" /> Costing
            </TabsTrigger>
            <TabsTrigger
              value="pm"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 text-sm font-bold flex gap-2"
            >
              <User className="size-4" /> PM Review
            </TabsTrigger>
            <TabsTrigger
              value="meeting"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 text-sm font-bold flex gap-2"
            >
              <Users className="size-4" /> Meeting
            </TabsTrigger>
            <TabsTrigger
              value="quality"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 text-sm font-bold flex gap-2"
            >
              <CheckCircle2 className="size-4" /> Quality
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history" className="animate-in slide-in-from-bottom-2 duration-300">
          <Card className="divide-y overflow-hidden">
            <div className="p-6 bg-slate-50 dark:bg-zinc-950">
              <h3 className="font-extrabold flex items-center gap-2">
                <History className="size-5 text-primary" /> Transition Audit Log
              </h3>
            </div>
            {stageHistories.length > 0 ? (
              <div className="p-10 space-y-10 relative">
                <div className="absolute left-[47px] top-12 bottom-12 w-px bg-border" />
                {stageHistories.map((log) => (
                  <div key={log.id} className="relative flex gap-10 group">
                    <div
                      className={cn(
                        'size-10 rounded-full ring-[6px] ring-background z-10 shrink-0 flex items-center justify-center text-white font-black text-[10px]',
                        log.flowStatus === 'RETURNED'
                          ? 'bg-orange-500 shadow-orange-500/20'
                          : log.flowStatus === 'PROCEED'
                            ? 'bg-green-500 shadow-green-500/20'
                            : 'bg-slate-400',
                      )}
                    >
                      {log.flowStatus === 'RETURNED'
                        ? 'RT'
                        : log.flowStatus === 'PROCEED'
                          ? 'OK'
                          : 'SK'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-xs uppercase tracking-widest text-primary">
                          {STAGE_SHORT_LABELS[log.stage as StageType]}
                          {log.flowStatus === 'RETURNED' && (
                            <span className="ml-3 text-[9px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full ring-1 ring-orange-200">
                              RETURNED
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm mb-4">
                        <StatusBadge status={log.fromStatus} className="scale-75 origin-left" />
                        <span className="text-muted-foreground">→</span>
                        <StatusBadge status={log.toStatus} className="scale-75 origin-left" />
                      </div>
                      {log.remark && (
                        <div className="p-4 bg-slate-50 border-l-4 border-primary/20 rounded-r-xl text-sm italic font-medium">
                          "{log.remark}"
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-3">
                        <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {log.actedByUser?.name?.[0]}
                        </div>
                        <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-tighter">
                          Acted by <span className="text-foreground">{log.actedByUser?.name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-muted-foreground">
                <div className="size-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="size-8 opacity-20" />
                </div>
                <p className="font-bold text-lg">No movement yet</p>
                <p className="text-sm">The lifecycle of this ECR is just beginning.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card className="p-10 border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <FileText className="size-48" />
            </div>

            <div className="flex items-center justify-between mb-10 border-b pb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight">Technical Assessment</h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  Stage 1: Primary Details
                </p>
              </div>
              {designInitialForm?.flowStatus && (
                <FlowStatusBadge status={designInitialForm.flowStatus} />
              )}
            </div>

            {designInitialForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Detailed Change Description
                    </p>
                    <div className="p-6 bg-slate-50 dark:bg-zinc-900 border rounded-2xl leading-relaxed text-sm font-medium shadow-inner">
                      {designInitialForm.changeDescription}
                    </div>
                  </div>
                </div>
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        Customer CR Ref
                      </p>
                      <p className="font-mono text-xl font-black text-primary">
                        {designInitialForm.customerCrNumber || 'NONE'}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        Receipt Date
                      </p>
                      <p className="font-black text-xl">
                        {formatDate(designInitialForm.crReceivedOn)}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border rounded-2xl bg-slate-50 dark:bg-zinc-900 border-primary/5">
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">
                      Workflow Configuration
                    </p>
                    <div className="space-y-4">
                      {[
                        { label: 'Costing Assessment', value: designInitialForm.isSkipCosting },
                        {
                          label: 'Project Management',
                          value: designInitialForm.isSkipProjectManager,
                        },
                        { label: 'Design Review Meeting', value: designInitialForm.isSkipMeeting },
                        { label: 'Quality Verification', value: designInitialForm.isSkipQuality },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between group">
                          <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                            {item.label}
                          </span>
                          {item.value ? (
                            <span className="text-[9px] font-black bg-orange-100 text-orange-700 px-3 py-1 rounded-full uppercase">
                              Skipped
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">
                              Mandatory
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed rounded-[32px] bg-muted/10">
                <div className="size-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="size-8 opacity-20" />
                </div>
                <p className="text-muted-foreground font-black text-lg">NOT INITIATED</p>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-2">
                  The design initial form has not been submitted for this engineering change
                  request.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Costing Tab */}
        <TabsContent value="costing">
          <Card className="p-10 border-none shadow-xl">
            <div className="flex items-center justify-between mb-10 border-b pb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight">Financial Impact</h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  Stage 2: Cost Analysis
                </p>
              </div>
              {costingForm?.flowStatus && <FlowStatusBadge status={costingForm.flowStatus} />}
            </div>
            {costingForm ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-50 border rounded-3xl text-center space-y-4">
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                    Non-Recurring Cost (NRC)
                  </p>
                  <p className="text-4xl font-black text-primary">
                    ${costingForm.nrcAmount || '0.00'}
                  </p>
                </div>
                <div className="p-8 bg-slate-50 border rounded-3xl text-center space-y-4">
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                    Recurring Cost (RC)
                  </p>
                  <p className="text-4xl font-black text-primary">
                    ${costingForm.rcAmount || '0.00'}
                  </p>
                </div>
                <div className="p-8 bg-primary text-primary-foreground rounded-3xl text-center space-y-4 ring-8 ring-primary/5">
                  <p className="text-[11px] font-black opacity-70 uppercase tracking-wider">
                    Total Impact Est.
                  </p>
                  <p className="text-4xl font-black">
                    $
                    {(
                      Number(costingForm.nrcAmount || 0) + Number(costingForm.rcAmount || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed rounded-[32px] bg-muted/10 opacity-50">
                <DollarSign className="size-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">Awaiting Costing Input</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="pm">
          <Card className="p-10 border-none shadow-xl">
            <div className="flex items-center justify-between mb-10 border-b pb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight">Management Review</h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  Stage 3: Project Manager Approval
                </p>
              </div>
              {pmForm?.flowStatus && <FlowStatusBadge status={pmForm.flowStatus} />}
            </div>
            {pmForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">
                      PO Receipt Date
                    </p>
                    <p className="text-xl font-black">
                      {pmForm.poReceiptDate ? formatDate(pmForm.poReceiptDate) : 'NOT RECEIVED'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">
                      ROA Reference
                    </p>
                    <p className="text-xl font-black">{pmForm.roa || '—'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">PM Notes</p>
                  <div className="p-6 bg-slate-50 border rounded-2xl min-h-[100px] font-medium text-sm">
                    {pmForm.pmNotes || 'No notes provided.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center opacity-50">
                <Users className="size-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">Awaiting PM Review</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="meeting">
          <Card className="p-10 border-none shadow-xl">
            <div className="flex items-center justify-between mb-10 border-b pb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight">Design Meeting</h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  Stage 4: Technical Release
                </p>
              </div>
              {meetingForm?.flowStatus && <FlowStatusBadge status={meetingForm.flowStatus} />}
            </div>
            {meetingForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">
                      Meeting Date
                    </p>
                    <p className="font-black">
                      {meetingForm.meetingDate ? formatDate(meetingForm.meetingDate) : '—'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">
                      Epicor Release
                    </p>
                    <p className="font-black">
                      {meetingForm.epicorReleaseDate
                        ? formatDate(meetingForm.epicorReleaseDate)
                        : 'PENDING'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">
                    Meeting Minutes
                  </p>
                  <div className="p-6 bg-slate-50 border rounded-2xl min-h-[100px] text-sm font-medium">
                    {meetingForm.meetingNotes || 'No minutes recorded.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center opacity-50">
                <Users className="size-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">Meeting Not Yet Conducted</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card className="p-10 border-none shadow-xl">
            <div className="flex items-center justify-between mb-10 border-b pb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight">Quality Verification</h3>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                  Stage 5: Final Inspection
                </p>
              </div>
              {qualityForm?.flowStatus && <FlowStatusBadge status={qualityForm.flowStatus} />}
            </div>
            {qualityForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest',
                        qualityForm.verificationResult === 'PASSED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700',
                      )}
                    >
                      {qualityForm.verificationResult}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">
                        Verified On
                      </p>
                      <p className="font-black">
                        {qualityForm.verificationDate
                          ? formatDate(qualityForm.verificationDate)
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">
                      Train Set Verified
                    </p>
                    <p className="text-xl font-black">{qualityForm.verifiedInTrainSet || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">
                    Findings & Compliance
                  </p>
                  <div className="p-6 bg-slate-50 border rounded-2xl min-h-[100px] text-sm font-medium">
                    {qualityForm.findings || 'No findings recorded.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center opacity-50">
                <CheckCircle2 className="size-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">Final Quality Check Pending</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
