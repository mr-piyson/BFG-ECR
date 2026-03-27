'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Loader2, Sparkles, Send } from 'lucide-react';
import { submitDesignInitial, submitCosting, submitPM, submitMeeting, submitQuality } from './actions';

// ---------------------------------------------------------
// STAGE 1: DESIGN INITIAL FORM
// ---------------------------------------------------------
const designSchema = z.object({
  customer_cr_number: z.string().optional(),
  cr_received_on: z.string().min(1, 'Required'),
  change_description: z.string().min(10, 'Too short'),
  is_skip_costing: z.boolean().default(false),
  is_skip_project_manager: z.boolean().default(false),
  is_skip_meeting: z.boolean().default(false),
  is_skip_quality: z.boolean().default(false),
  remark: z.string().optional(),
});

export function DesignInitialForm({ ecrId, initialData }: { ecrId: string, initialData?: any }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(designSchema),
    defaultValues: {
      customer_cr_number: initialData?.customerCrNumber || '',
      cr_received_on: initialData?.crReceivedOn ? new Date(initialData.crReceivedOn).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      change_description: initialData?.changeDescription || '',
      is_skip_costing: initialData?.isSkipCosting || false,
      is_skip_project_manager: initialData?.isSkipProjectManager || false,
      is_skip_meeting: initialData?.isSkipMeeting || false,
      is_skip_quality: initialData?.isSkipQuality || false,
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitDesignInitial(ecrId, data);
      toast.success('Design assessment submitted');
    } catch (e) {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Customer Ref</label>
          <input {...register('customer_cr_number')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 ring-primary outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Receipt Date</label>
          <input type="date" {...register('cr_received_on')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 ring-primary outline-none" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-muted-foreground">Change Description</label>
        <textarea {...register('change_description')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-medium min-h-[120px] focus:ring-2 ring-primary outline-none" />
      </div>
      <div className="p-4 bg-slate-900 rounded-xl space-y-3">
         <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles className="size-3" /> Workflow Automation
         </p>
         <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              { id: 'is_skip_costing', label: 'Skip Costing' },
              { id: 'is_skip_project_manager', label: 'Skip PM Review' },
              { id: 'is_skip_meeting', label: 'Skip Meeting' },
              { id: 'is_skip_quality', label: 'Skip Quality' },
            ].map(s => (
              <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" {...register(s.id as any)} className="size-4 rounded accent-primary bg-white/10" />
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{s.label}</span>
              </label>
            ))}
         </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all">
        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="size-4 mr-2" />} Submit Stage 1
      </Button>
    </form>
  );
}

// ---------------------------------------------------------
// STAGE 2: COSTING FORM
// ---------------------------------------------------------
const costingSchema = z.object({
  nrcAmount: z.coerce.number().min(0),
  rcAmount: z.coerce.number().min(0),
  currency: z.string().default('EUR'),
  remark: z.string().optional(),
});

export function CostingForm({ ecrId }: { ecrId: string }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ resolver: zodResolver(costingSchema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitCosting(ecrId, data);
      toast.success('Costing analysis submitted');
    } catch (e) {
      toast.error('Failed to submit costing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">NRC Amount (Non-Recurring)</label>
          <div className="relative">
             <span className="absolute left-3 top-3.5 text-xs font-bold text-muted-foreground">$</span>
             <input type="number" step="0.01" {...register('nrcAmount')} className="w-full bg-muted/50 border-none rounded-lg py-3 pl-7 pr-3 text-sm font-black focus:ring-2 ring-primary outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">RC Amount (Recurring)</label>
          <div className="relative">
             <span className="absolute left-3 top-3.5 text-xs font-bold text-muted-foreground">$</span>
             <input type="number" step="0.01" {...register('rcAmount')} className="w-full bg-muted/50 border-none rounded-lg py-3 pl-7 pr-3 text-sm font-black focus:ring-2 ring-primary outline-none" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-muted-foreground">Financial Remarks</label>
        <textarea {...register('remark')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-medium min-h-[80px] focus:ring-2 ring-primary outline-none" placeholder="Add any notes regarding the costing..." />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="size-4 mr-2" />} Finalize Costing
      </Button>
    </form>
  );
}

// ---------------------------------------------------------
// STAGE 3: PM FORM
// ---------------------------------------------------------
const pmSchema = z.object({
  po_receipt_date: z.string().optional(),
  roa: z.string().optional(),
  pm_notes: z.string().optional(),
  remark: z.string().optional(),
});

export function PMForm({ ecrId }: { ecrId: string }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ resolver: zodResolver(pmSchema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitPM(ecrId, data);
      toast.success('PM review complete');
    } catch (e) {
      toast.error('Failed to update PM review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">PO Receipt Date</label>
          <input type="date" {...register('po_receipt_date')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 ring-primary outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">ROA Reference</label>
          <input {...register('roa')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 ring-primary outline-none" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-muted-foreground">Management Notes</label>
        <textarea {...register('pm_notes')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-medium min-h-[80px] focus:ring-2 ring-primary outline-none" />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4 mr-2" />} Approve PM Stage
      </Button>
    </form>
  );
}

// ---------------------------------------------------------
// STAGE 4: MEETING FORM
// ---------------------------------------------------------
const meetingSchema = z.object({
  meeting_date: z.string().optional(),
  epicor_release_date: z.string().optional(),
  ern_release_date: z.string().optional(),
  meeting_notes: z.string().optional(),
  remark: z.string().optional(),
});

export function MeetingForm({ ecrId }: { ecrId: string }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ resolver: zodResolver(meetingSchema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitMeeting(ecrId, data);
      toast.success('Meeting details recorded');
    } catch (e) {
      toast.error('Failed to submit meeting details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Meeting Date</label>
          <input type="date" {...register('meeting_date')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 ring-primary outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Epicor Release</label>
          <input type="date" {...register('epicor_release_date')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 ring-primary outline-none" />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
        Record Meeting & Release
      </Button>
    </form>
  );
}

// ---------------------------------------------------------
// STAGE 5: QUALITY FORM
// ---------------------------------------------------------
const qualitySchema = z.object({
  verification_result: z.string().min(1, 'Required'),
  verified_in_train_set: z.string().optional(),
  verification_date: z.string().optional(),
  findings: z.string().optional(),
  remark: z.string().optional(),
});

export function QualityForm({ ecrId }: { ecrId: string }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ resolver: zodResolver(qualitySchema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitQuality(ecrId, data);
      toast.success('ECR RELEASED SUCCESSFULLY');
    } catch (e) {
      toast.error('Quality check submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-muted-foreground">Verification Result</label>
        <select {...register('verification_result')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-bold focus:ring-2 ring-primary outline-none appearance-none">
          <option value="PASSED">PASSED</option>
          <option value="FAILED">FAILED</option>
          <option value="CONDITIONALLY_PASSED">CONDITIONALLY PASSED</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-muted-foreground">Test Findings</label>
        <textarea {...register('findings')} className="w-full bg-muted/50 border-none rounded-lg p-3 text-sm font-medium min-h-[100px] focus:ring-2 ring-primary outline-none" placeholder="Document the final verification results..." />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 mr-2" />} Release ECR to Production
      </Button>
    </form>
  );
}
