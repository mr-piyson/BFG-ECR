"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2 } from "lucide-react";
import type { User, Project } from "@/lib/types";
import { USER_ROLES } from "@/lib/ecr-helpers";
import { toast } from "sonner";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [userDialogMode, setUserDialogMode] = useState<"create" | "edit">("create");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "DESIGN_ENGINEER",
    department: "",
    is_active: true,
  });

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<"create" | "edit">("create");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    code: "",
    name: "",
    description: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/projects")]);

      const usersData = await usersRes.json();
      const projectsData = await projectsRes.json();

      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetUserForm = () => {
    setUserForm({
      name: "",
      email: "",
      role: "DESIGN_ENGINEER",
      department: "",
      is_active: true,
    });
    setActiveUser(null);
    setUserDialogMode("create");
  };

  const openUserDialog = (mode: "create" | "edit", user?: User) => {
    setUserDialogMode(mode);
    if (mode === "edit" && user) {
      setActiveUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || "",
        is_active: user.is_active,
      });
    } else {
      resetUserForm();
    }
    setIsUserDialogOpen(true);
  };

  const closeUserDialog = () => {
    setIsUserDialogOpen(false);
    resetUserForm();
  };

  const resetProjectForm = () => {
    setProjectForm({
      code: "",
      name: "",
      description: "",
      is_active: true,
    });
    setActiveProject(null);
    setProjectDialogMode("create");
  };

  const openProjectDialog = (mode: "create" | "edit", project?: Project) => {
    setProjectDialogMode(mode);
    if (mode === "edit" && project) {
      setActiveProject(project);
      setProjectForm({
        code: project.code,
        name: project.name,
        description: project.description || "",
        is_active: project.is_active,
      });
    } else {
      resetProjectForm();
    }
    setIsProjectDialogOpen(true);
  };

  const closeProjectDialog = () => {
    setIsProjectDialogOpen(false);
    resetProjectForm();
  };

  const saveUser = async () => {
    setSaving(true);

    try {
      const method = activeUser ? "PUT" : "POST";
      const url = activeUser ? `/api/admin/users/${activeUser.id}` : "/api/admin/users";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (!res.ok) toast.error("Failed to save user");
      await fetchData();
      closeUserDialog();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async () => {
    setSaving(true);

    try {
      const method = activeProject ? "PUT" : "POST";
      const url = activeProject ? `/api/admin/projects/${activeProject.id}` : "/api/admin/projects";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      if (!res.ok) toast.error("Failed to save project");
      await fetchData();
      closeProjectDialog();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) toast.error("Failed to delete user");
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const deleteProject = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) toast.error("Failed to delete project");
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

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
                  <Button onClick={() => openUserDialog("create")}>
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
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">{USER_ROLES[user.role] || user.role}</span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{user.department || "—"}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.is_active ? "Active" : "Inactive"}</span>
                              </td>
                              <td className="px-6 py-4 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openUserDialog("edit", user)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone. The user will be permanently removed.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteUser(user.id)} disabled={deletingId === user.id}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
                  <Button onClick={() => openProjectDialog("create")}>
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
                              <td className="px-6 py-4 text-sm text-muted-foreground">{project.description || "—"}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${project.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{project.is_active ? "Active" : "Inactive"}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-4 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openProjectDialog("edit", project)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone. The project will be permanently removed.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteProject(project.id)} disabled={deletingId === project.id}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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

            <Dialog
              open={isUserDialogOpen}
              onOpenChange={(open) => {
                if (!open) closeUserDialog();
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{userDialogMode === "create" ? "Add User" : "Edit User"}</DialogTitle>
                  <DialogDescription>{userDialogMode === "create" ? "Create a new user for the system." : "Update the user details."}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-1">
                    <Label htmlFor="user-name">Name</Label>
                    <Input id="user-name" value={userForm.name} onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Full name" />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="user-email">Email</Label>
                    <Input id="user-email" type="email" value={userForm.email} onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="user@example.com" />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="user-role">Role</Label>
                    <select id="user-role" value={userForm.role} onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))} className="form-input">
                      {Object.entries(USER_ROLES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="user-department">Department</Label>
                    <Input id="user-department" value={userForm.department} onChange={(event) => setUserForm((prev) => ({ ...prev, department: event.target.value }))} placeholder="e.g. Engineering" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch id="user-active" checked={userForm.is_active} onCheckedChange={(checked) => setUserForm((prev) => ({ ...prev, is_active: Boolean(checked) }))} />
                    <Label htmlFor="user-active">Active</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeUserDialog} disabled={saving}>
                    Cancel
                  </Button>
                  <Button onClick={saveUser} disabled={saving}>
                    {saving ? "Saving..." : userDialogMode === "create" ? "Create" : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isProjectDialogOpen}
              onOpenChange={(open) => {
                if (!open) closeProjectDialog();
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{projectDialogMode === "create" ? "New Project" : "Edit Project"}</DialogTitle>
                  <DialogDescription>{projectDialogMode === "create" ? "Create a new project." : "Update the project details."}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-1">
                    <Label htmlFor="project-code">Project Code</Label>
                    <Input id="project-code" value={projectForm.code} onChange={(event) => setProjectForm((prev) => ({ ...prev, code: event.target.value }))} placeholder="e.g. BFG-001" />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="project-name">Name</Label>
                    <Input id="project-name" value={projectForm.name} onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Project name" />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea id="project-description" value={projectForm.description} onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Optional description" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch id="project-active" checked={projectForm.is_active} onCheckedChange={(checked) => setProjectForm((prev) => ({ ...prev, is_active: Boolean(checked) }))} />
                    <Label htmlFor="project-active">Active</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeProjectDialog} disabled={saving}>
                    Cancel
                  </Button>
                  <Button onClick={saveProject} disabled={saving}>
                    {saving ? "Saving..." : projectDialogMode === "create" ? "Create" : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
