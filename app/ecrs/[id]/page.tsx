'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, FlowStatusBadge } from '@/components/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Clock, User } from 'lucide-react'
import { formatDate, STAGE_SHORT_LABELS, STAGE_ORDER } from '@/lib/ecr-helpers'

interface ECRDetailData {
  ecr: any
  design_initial_form: any
  costing_form: any
  project_manager_form: any
  design_meeting_form: any
  quality_check_form: any
  stage_histories: any[]
  attachments: any[]
}

export default function ECRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<ECRDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [ecrId, setEcrId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setEcrId(p.id))
  }, [params])

  useEffect(() => {
    if (!ecrId) return
    const fetchEcr = async () => {
      try {
        const res = await fetch(`/api/ecrs/${ecrId}`)
        const responseData = await res.json()
        setData(responseData)
      } catch (error) {
        console.error('Failed to fetch ECR:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEcr()
  }, [ecrId])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading ECR details...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!data || !data.ecr) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>ECR not found</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const ecr = data.ecr
  const currentStageIndex = STAGE_ORDER.indexOf(ecr.current_stage)
  const stageProgress = ((currentStageIndex + 1) / STAGE_ORDER.length) * 100

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">ECR #{ecr.ecr_number}</h1>
                  <p className="text-muted-foreground mt-1">{ecr.project_code} • {ecr.project_name}</p>
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

            {/* Stage Progress */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Workflow Progress</h3>
                    <span className="text-sm text-muted-foreground">{Math.round(stageProgress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${stageProgress}%` }}
                    />
                  </div>
                </div>

                {/* Stage Timeline */}
                <div className="mt-6 space-y-2">
                  {STAGE_ORDER.map((stage, index) => {
                    const isActive = ecr.current_stage === stage
                    const isPassed = index < currentStageIndex
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isPassed
                              ? 'bg-green-500 text-white'
                              : isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                            {STAGE_SHORT_LABELS[stage]}
                          </p>
                        </div>
                        {isPassed && <span className="text-xs text-green-600">Completed</span>}
                        {isActive && <span className="text-xs text-primary">In Progress</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="design">Design Initial</TabsTrigger>
                <TabsTrigger value="costing">Costing</TabsTrigger>
                <TabsTrigger value="pm">Project Manager</TabsTrigger>
                <TabsTrigger value="meeting">Design Meeting</TabsTrigger>
                <TabsTrigger value="quality">Quality Check</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">ECR Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Project</p>
                        <p className="font-medium">{ecr.project?.name} ({ecr.project?.code})</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Scopes</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ecr.scopes && ecr.scopes.length > 0 ? (
                            ecr.scopes.map((s: any) => (
                              <span key={s.id} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20">
                                {s.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground italic text-xs">No scopes assigned</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Source</p>
                        <p className="font-medium">{ecr.source}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Stage</p>
                        <p className="font-medium">{STAGE_SHORT_LABELS[ecr.current_stage]}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <StatusBadge status={ecr.status} className="mt-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold">Design Initial Form</h3>
                  {data.design_initial_form ? (
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Change Description</p>
                        <p className="bg-muted p-3 rounded">{data.design_initial_form.change_description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">CR Received On</p>
                          <p className="font-medium">{formatDate(data.design_initial_form.cr_received_on)}</p>
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
                          <p className="font-medium">{formatDate(data.design_meeting_form.meeting_date)}</p>
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
                          <p className="font-medium">{data.quality_check_form.compliance_check ? 'Passed' : 'Failed'}</p>
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
                            <p className="font-medium">{STAGE_SHORT_LABELS[history.stage]}</p>
                            <span className="text-xs text-muted-foreground">{formatDate(history.created_at)}</span>
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
        </main>
      </div>
    </div>
  )
}
