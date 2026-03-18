'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import type { User, Project } from '@/lib/types'
import { USER_ROLES } from '@/lib/ecr-helpers'

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/projects'),
        ])

        const usersData = await usersRes.json()
        const projectsData = await projectsRes.json()

        setUsers(usersData)
        setProjects(projectsData)
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
              <p className="text-muted-foreground">Manage users, projects, and system settings</p>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Users</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                <Card className="overflow-hidden">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No users found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted">
                          <tr>
                            <th className="px-6 py-3 text-left font-semibold">Name</th>
                            <th className="px-6 py-3 text-left font-semibold">Email</th>
                            <th className="px-6 py-3 text-left font-semibold">Role</th>
                            <th className="px-6 py-3 text-left font-semibold">Department</th>
                            <th className="px-6 py-3 text-left font-semibold">Status</th>
                            <th className="px-6 py-3 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                              <td className="px-6 py-4 font-medium">{user.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                  {USER_ROLES[user.role] || user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{user.department || '—'}</td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    user.is_active
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Projects</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </div>

                <Card className="overflow-hidden">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading projects...</div>
                  ) : projects.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No projects found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted">
                          <tr>
                            <th className="px-6 py-3 text-left font-semibold">Code</th>
                            <th className="px-6 py-3 text-left font-semibold">Name</th>
                            <th className="px-6 py-3 text-left font-semibold">Description</th>
                            <th className="px-6 py-3 text-left font-semibold">Status</th>
                            <th className="px-6 py-3 text-left font-semibold">Created</th>
                            <th className="px-6 py-3 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                              <td className="px-6 py-4 font-medium">{project.code}</td>
                              <td className="px-6 py-4 font-medium">{project.name}</td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {project.description || '—'}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    project.is_active
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {project.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {new Date(project.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">System Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Organization Name</label>
                      <Input defaultValue="BFG International" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Organization Email</label>
                      <Input type="email" defaultValue="info@bfg-intl.com" />
                    </div>
                    <Button className="mt-6">Save Changes</Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
