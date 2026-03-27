import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ECRDetailView } from './ecr-detail-view';

export default async function ECRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ecr = await prisma.ecr.findUnique({
    where: { id },
    include: {
      project: true,
      scopes: true,
      designEngineer: true,
      projectEngineer: true,
    },
  });

  if (!ecr) {
    notFound();
  }

  const [
    designInitialForm,
    costingForm,
    pmForm,
    meetingForm,
    qualityForm,
    stageHistories,
    attachments,
  ] = await Promise.all([
    prisma.designInitialForm.findUnique({ where: { ecrId: id } }),
    prisma.costingForm.findUnique({ where: { ecrId: id } }),
    prisma.projectManagerForm.findUnique({ where: { ecrId: id } }),
    prisma.designMeetingForm.findUnique({ where: { ecrId: id } }),
    prisma.qualityCheckForm.findUnique({ where: { ecrId: id } }),
    prisma.stageHistory.findMany({
      where: { ecrId: id },
      orderBy: { createdAt: 'desc' },
      include: { actedByUser: true },
    }),
    prisma.attachment.findMany({
      where: { ecrId: id },
      orderBy: { uploadedAt: 'desc' },
    }),
  ]);

  return (
    <ECRDetailView
      ecr={ecr}
      designInitialForm={designInitialForm}
      costingForm={costingForm}
      pmForm={pmForm}
      meetingForm={meetingForm}
      qualityForm={qualityForm}
      stageHistories={stageHistories}
      attachments={attachments}
    />
  );
}
