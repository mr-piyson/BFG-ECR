'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitDesignInitial } from '../../actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Save, X, Settings2, Info } from 'lucide-react';

const formSchema = z.object({
  customer_cr_number: z.string().optional(),
  cr_received_on: z.string().min(1, 'Receipt date is required'),
  change_description: z.string().min(10, 'Description must be at least 10 characters'),
  is_skip_costing: z.boolean().default(false),
  is_skip_project_manager: z.boolean().default(false),
  is_skip_meeting: z.boolean().default(false),
  is_skip_quality: z.boolean().default(false),
});

export default function DesignInitialFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_cr_number: '',
      cr_received_on: new Date().toISOString().split('T')[0],
      change_description: '',
      is_skip_costing: false,
      is_skip_project_manager: false,
      is_skip_meeting: false,
      is_skip_quality: false,
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await submitDesignInitial(params.id, data);
      toast.success('Stage 1 — Design assessment completed');
      router.push(`/ecrs/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Workflow error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-4">
        <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <FileText className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Stage 1 Assessment</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Initial Design Engineer Evaluation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-8 space-y-8">
           <Card className="p-8 space-y-8 shadow-xl border-none ring-1 ring-border/50">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Customer Reference</label>
                 <input
                   {...register('customer_cr_number')}
                   className="w-full bg-slate-50 border-none ring-1 ring-border rounded-xl px-5 py-3 font-bold transition-all focus:ring-2 focus:ring-primary outline-none"
                   placeholder="e.g., CR-21-402"
                 />
               </div>
               <div className="space-y-3">
                 <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Receipt Date *</label>
                 <input
                   type="date"
                   {...register('cr_received_on')}
                   className="w-full bg-slate-50 border-none ring-1 ring-border rounded-xl px-5 py-3 font-bold transition-all focus:ring-2 focus:ring-primary outline-none"
                 />
                 {errors.cr_received_on && <p className="text-red-500 text-[10px] uppercase font-black">{errors.cr_received_on.message}</p>}
               </div>
             </div>

             <div className="space-y-3">
               <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Technical Change Description *</label>
               <textarea
                 {...register('change_description')}
                 className="w-full bg-slate-50 border-none ring-1 ring-border rounded-xl px-5 py-4 font-medium transition-all focus:ring-2 focus:ring-primary outline-none min-h-[220px]"
                 placeholder="Provide detailed technical analysis of the required modification..."
               />
               {errors.change_description && <p className="text-red-500 text-[10px] uppercase font-black">{errors.change_description.message}</p>}
             </div>
           </Card>

           <div className="flex gap-4">
             <Button type="submit" disabled={loading} size="lg" className="h-14 px-10 rounded-2xl font-black tracking-tighter shadow-xl shadow-primary/20">
               {loading ? 'Processing Workflow...' : 'Submit Assessment'} <Save className="ml-2 size-5" />
             </Button>
             <Button
               type="button"
               variant="outline"
               onClick={() => router.back()}
               className="h-14 rounded-2xl px-6 font-bold"
             >
               Discard <X className="ml-2 size-4" />
             </Button>
           </div>
        </form>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <Settings2 className="size-32" />
             </div>
             
             <div className="relative">
                <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                  <div className="size-2 bg-primary rounded-full animate-pulse" />
                  Lifecycle Overrides
                </h3>
                
                <div className="space-y-4">
                  {[
                    { id: 'is_skip_costing', label: 'Skip Costing Evaluation' },
                    { id: 'is_skip_project_manager', label: 'Skip Project Management' },
                    { id: 'is_skip_meeting', label: 'Skip Design Meeting' },
                    { id: 'is_skip_quality', label: 'Skip Quality Check' },
                  ].map(skip => (
                    <label key={skip.id} className="flex items-center gap-4 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors group">
                       <input 
                         type="checkbox" 
                         {...register(skip.id as any)} 
                         className="size-5 rounded-md accent-primary border-white/20"
                       />
                       <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{skip.label}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex items-start gap-3">
                   <Info className="size-4 text-primary shrink-0 mt-1" />
                   <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                     Skipping stages will move the ECR directly to the next mandatory phase in the sequence. Proceed with caution.
                   </p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
