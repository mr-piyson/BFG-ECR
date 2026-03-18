'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Project {
  id: string
  code: string
  name: string
}

export default function NewECRPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    source: 'CUSTOMER',
    design_engineer_id: 'user-de-1', // Default to Alice Morgan
    cr_received_on: new Date().toISOString().split('T')[0],
    cr_by: '',
    change_description: '',
    is_skip_costing: false,
    is_skip_project_manager: false,
    is_skip_quality: false,
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/admin/projects')
        const data = await res.json()
        setProjects(data)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }

    fetchProjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/ecrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create ECR')

      const data = await res.json()
      toast.success('ECR created successfully')
      router.push(`/ecrs/${data.ecr.id}`)
    } catch (error) {
      console.error('ECR creation error:', error)
      toast.error('Failed to create ECR')
    } finally {
      setLoading(false)
    }
  }

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
                  <label className="block text-sm font-medium mb-2">Project *</label>
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

                <div>
                  <label className="block text-sm font-medium mb-2">Source</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="source"
                        value="CUSTOMER"
                        checked={formData.source === 'CUSTOMER'}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Customer Request</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="source"
                        value="INTERNAL"
                        checked={formData.source === 'INTERNAL'}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Internal Request</span>
                    </label>
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
                    <label className="block text-sm font-medium mb-2">CR By (Requester) *</label>
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
                    {loading ? 'Creating...' : 'Create ECR'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
