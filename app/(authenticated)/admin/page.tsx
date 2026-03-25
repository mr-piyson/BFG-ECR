"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2, Users, FolderKanban, Settings as SettingsIcon } from "lucide-react";
import type { User, Project, ProjectScope, ProjectAssignment } from "@/lib/types";
import { USER_ROLES } from "@/lib/ecr-helpers";
import { toast } from "sonner";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // User Dialog State
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [userDialogMode, setUserDialogMode] = useState<"create" | "edit">("create");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DESIGN_ENGINEER",
    department: "",
    isActive: true,
  });

  // Project Dialog State
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<"create" | "edit">("create");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });

  // Project Detail State
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectScopes, setProjectScopes] = useState<ProjectScope[]>([]);
  const [projectAssignments, setProjectAssignments] = useState<(ProjectAssignment & { user: User })[]>([]);

  // Scope Dialog State
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  const [activeScope, setActiveScope] = useState<ProjectScope | null>(null);
  const [scopeForm, setScopeForm] = useState({ name: "", description: "", isActive: true });

  // Assignment Dialog State
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ userId: "", role: "DESIGN_ENGINEER", isPrimary: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/projects")
      ]);
      setUsers(await usersRes.json());
      setProjects(await projectsRes.json());
    } catch (error) {
      toast.error("Failed to fetch admin data");
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
      password: "",
      role: "DESIGN_ENGINEER",
      department: "",
      isActive: true,
    });
    setActiveUser(null);
  };

  const openUserDialog = (mode: "create" | "edit", user?: User) => {
    setUserDialogMode(mode);
    if (mode === "edit" && user) {
      setActiveUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        department: user.department || "",
        isActive: user.isActive,
      });
    } else {
      resetUserForm();
    }
    setIsUserDialogOpen(true);
  };

  const saveUser = async () => {
    setSaving(true);
    try {
      const method = activeUser ? "PUT" : "POST";
      const url = activeUser ? `/api/admin/users/${activeUser.id}` : "/api/admin/users";
      const payload = { ...userForm };
      if (activeUser && !payload.password) delete (payload as any).password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(activeUser ? "User updated" : "User created");
        fetchData();
        setIsUserDialogOpen(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save user");
      }
    } catch (error) {
      toast.error("Error saving user");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted");
        fetchData();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      toast.error("Error deleting user");
    } finally {
      setDeletingId(null);
    }
  };

  const resetProjectForm = () => {
    setProjectForm({ code: "", name: "", description: "", isActive: true });
    setActiveProject(null);
  };

  const openProjectDialog = (mode: "create" | "edit", project?: Project) => {
    setProjectDialogMode(mode);
    if (mode === "edit" && project) {
      setActiveProject(project);
      setProjectForm({
        code: project.code,
        name: project.name,
        description: project.description || "",
        isActive: project.isActive,
      });
    } else {
      resetProjectForm();
    }
    setIsProjectDialogOpen(true);
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
      if (res.ok) {
        toast.success(activeProject ? "Project updated" : "Project created");
        fetchData();
        setIsProjectDialogOpen(false);
      } else {
        toast.error("Failed to save project");
      }
    } catch (error) {
      toast.error("Error saving project");
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        fetchData();
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      toast.error("Error deleting project");
    } finally {
      setDeletingId(null);
    }
  };

  const fetchProjectDetails = async (project: Project) => {
    try {
      const [scopesRes, assignmentsRes] = await Promise.all([
        fetch(`/api/admin/projects/${project.id}/scopes`),
        fetch(`/api/admin/projects/${project.id}/assignments`),
      ]);
      setProjectScopes(await scopesRes.json());
      setProjectAssignments(await assignmentsRes.json());
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    }
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    fetchProjectDetails(project);
    setIsProjectDetailOpen(true);
  };

  const saveScope = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const method = activeScope ? "PUT" : "POST";
      const url = activeScope 
        ? `/api/admin/projects/${selectedProject.id}/scopes/${activeScope.id}`
        : `/api/admin/projects/${selectedProject.id}/scopes`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scopeForm),
      });
      if (res.ok) {
        toast.success(activeScope ? "Scope updated" : "Scope created");
        fetchProjectDetails(selectedProject);
        setIsScopeDialogOpen(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save scope");
      }
    } catch (error) {
      toast.error("Error saving scope");
    } finally {
      setSaving(false);
    }
  };

  const deleteScope = async (scopeId: string) => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/admin/projects/${selectedProject.id}/scopes/${scopeId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Scope deleted");
        fetchProjectDetails(selectedProject);
      }
    } catch (error) {
      toast.error("Error deleting scope");
    }
  };

  const saveAssignment = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${selectedProject.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentForm),
      });
      if (res.ok) {
        toast.success("Assignment added");
        fetchProjectDetails(selectedProject);
        setIsAssignmentDialogOpen(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add assignment");
      }
    } catch (error) {
      toast.error("Error adding assignment");
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/admin/projects/${selectedProject.id}/assignments/${assignmentId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Assignment removed");
        fetchProjectDetails(selectedProject);
      }
    } catch (error) {
      toast.error("Error removing assignment");
    }
  };

  return (
    <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
              <p className="text-muted-foreground">Manage users, projects, and system settings</p>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="bg-muted p-1 rounded-lg">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Users
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" /> Projects
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" /> Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4 outline-none">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold tracking-tight">User Directory</h3>
                  <Button onClick={() => openUserDialog("create")}>
                    <Plus className="w-4 h-4 mr-2" /> Add User
                  </Button>
                </div>

                <Card className="overflow-hidden border-border bg-card shadow-sm">
                  {loading ? (
                    <div className="p-12 text-center text-muted-foreground">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">No users found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/50">
                          <tr>
                            <th className="px-6 py-4 text-left font-semibold">Name</th>
                            <th className="px-6 py-4 text-left font-semibold">Email</th>
                            <th className="px-6 py-4 text-left font-semibold">Role</th>
                            <th className="px-6 py-4 text-left font-semibold">Department</th>
                            <th className="px-6 py-4 text-left font-semibold">Status</th>
                            <th className="px-6 py-4 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 font-medium">{user.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wider">
                                  {USER_ROLES[user.role as keyof typeof USER_ROLES] || user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{user.department || "—"}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openUserDialog("edit", user)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone. All records associated with this user will persist but the user account will be removed.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete User
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

              <TabsContent value="projects" className="space-y-4 outline-none">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold tracking-tight">Active Projects</h3>
                  <Button onClick={() => openProjectDialog("create")}>
                    <Plus className="w-4 h-4 mr-2" /> New Project
                  </Button>
                </div>

                <Card className="overflow-hidden border-border bg-card shadow-sm">
                  {loading ? (
                    <div className="p-12 text-center text-muted-foreground">Loading projects...</div>
                  ) : projects.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">No projects found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/50">
                          <tr>
                            <th className="px-6 py-4 text-left font-semibold">Code</th>
                            <th className="px-6 py-4 text-left font-semibold">Name</th>
                            <th className="px-6 py-4 text-left font-semibold">Status</th>
                            <th className="px-6 py-4 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-primary">{project.code}</td>
                              <td className="px-6 py-4 font-medium">{project.name}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${project.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {project.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openProjectDetail(project)}>
                                  View Details
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openProjectDialog("edit", project)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                                      <AlertDialogDescription>Removing a project will affect all associated ECRs. Consider deactivating it instead.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteProject(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete Project
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

              <TabsContent value="settings" className="outline-none">
                 <Card className="p-8 max-w-2xl border-border bg-card shadow-sm">
                   <h3 className="text-xl font-bold mb-6">System Configuration</h3>
                   <div className="space-y-6">
                      <div className="grid gap-2">
                        <Label>Organization Name</Label>
                        <Input defaultValue="BFG International" className="bg-muted/50" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Admin Contact Email</Label>
                        <Input defaultValue="admin@bfg-int.com" className="bg-muted/50" />
                      </div>
                      <div className="pt-4 border-t border-border flex justify-end">
                        <Button>Save Settings</Button>
                      </div>
                   </div>
                 </Card>
              </TabsContent>
            </Tabs>

            {/* Dialogs */}
            
            {/* User Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{userDialogMode === "create" ? "Add System User" : "Update User Profile"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="u-name">Full Name</Label>
                    <Input id="u-name" value={userForm.name} onChange={e => setUserForm(p => ({...p, name: e.target.value}))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="u-email">Email Address</Label>
                    <Input id="u-email" type="email" value={userForm.email} onChange={e => setUserForm(p => ({...p, email: e.target.value}))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="u-pass">{userDialogMode === "edit" ? "New Password (Optional)" : "Password"}</Label>
                    <Input id="u-pass" type="password" value={userForm.password} onChange={e => setUserForm(p => ({...p, password: e.target.value}))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="u-role">System Role</Label>
                    <select id="u-role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={userForm.role} onChange={e => setUserForm(p => ({...p, role: e.target.value}))}>
                      {Object.entries(USER_ROLES).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch id="u-active" checked={userForm.isActive} onCheckedChange={c => setUserForm(p => ({...p, isActive: !!c}))} />
                    <Label htmlFor="u-active">User Account Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveUser} disabled={saving}>{saving ? "Saving..." : "Save User"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Project Dialog */}
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{projectDialogMode === "create" ? "Define New Project" : "Update Project Details"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="p-code">Project Code</Label>
                    <Input id="p-code" value={projectForm.code} onChange={e => setProjectForm(p => ({...p, code: e.target.value}))} placeholder="e.g. BFG-XXX" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-name">Project Name</Label>
                    <Input id="p-name" value={projectForm.name} onChange={e => setProjectForm(p => ({...p, name: e.target.value}))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-desc">Description</Label>
                    <Textarea id="p-desc" value={projectForm.description} onChange={e => setProjectForm(p => ({...p, description: e.target.value}))} />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch id="p-active" checked={projectForm.isActive} onCheckedChange={c => setProjectForm(p => ({...p, isActive: !!c}))} />
                    <Label htmlFor="p-active">Project Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveProject} disabled={saving}>{saving ? "Saving..." : "Save Project"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Project Details Modal (Scopes & Assignments) */}
            <Dialog open={isProjectDetailOpen} onOpenChange={setIsProjectDetailOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Project: {selectedProject?.name}</DialogTitle>
                  <DialogDescription className="font-mono text-primary font-semibold">{selectedProject?.code}</DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-10">
                  {/* Scopes Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <h4 className="text-lg font-bold">Project Scopes</h4>
                      <Button size="sm" variant="outline" onClick={() => { setActiveScope(null); setScopeForm({ name: "", description: "", isActive: true }); setIsScopeDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Scope
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectScopes.length === 0 ? (
                        <div className="col-span-2 text-center py-6 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">No scopes defined for this project.</div>
                      ) : projectScopes.map(scope => (
                        <Card key={scope.id} className="p-4 bg-muted/30 border-border relative group">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold">{scope.name}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${scope.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {scope.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{scope.description || "No description provided."}</p>
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setActiveScope(scope); setScopeForm({ name: scope.name, description: scope.description || "", isActive: scope.isActive }); setIsScopeDialogOpen(true); }}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteScope(scope.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Assignments Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <h4 className="text-lg font-bold">User Assignments</h4>
                      <Button size="sm" variant="outline" onClick={() => { setAssignmentForm({ userId: "", role: "DESIGN_ENGINEER", isPrimary: false }); setIsAssignmentDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Assign User
                      </Button>
                    </div>
                    <Card className="overflow-hidden border-border bg-card">
                      <table className="w-full text-sm font-medium">
                         <thead className="bg-muted/50 border-b border-border">
                           <tr>
                              <th className="px-4 py-3 text-left">Assigned Professional</th>
                              <th className="px-4 py-3 text-left">Assigned Role</th>
                              <th className="px-4 py-3 text-center">Designation</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-border">
                            {projectAssignments.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users assigned to this project yet.</td></tr>
                            ) : projectAssignments.map(asgn => (
                              <tr key={asgn.id} className="hover:bg-muted/20">
                                <td className="px-4 py-3">
                                  <div className="font-bold">{asgn.user.name}</div>
                                  <div className="text-xs text-muted-foreground font-normal">{asgn.user.email}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 rounded text-[10px] bg-primary/5 border border-primary/20 text-primary font-bold uppercase tracking-wide"> 
                                    {USER_ROLES[asgn.role as keyof typeof USER_ROLES] || asgn.role} 
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {asgn.isPrimary && <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-100 text-amber-700 font-bold border border-amber-200 uppercase">Primary Lead</span>}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteAssignment(asgn.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    </Card>
                  </div>
                </div>

                <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6 mt-10 border-t border-border">
                  <Button onClick={() => setIsProjectDetailOpen(false)} className="px-8">Close Project View</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Scope Modal */}
            <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>{activeScope ? "Edit Project Scope" : "Define New Scope"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Scope Name (e.g. Interior, Propulsion)</Label>
                    <Input value={scopeForm.name} onChange={e => setScopeForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Brief Description</Label>
                    <Textarea value={scopeForm.description} onChange={e => setScopeForm(p => ({ ...p, description: e.target.value }))} className="h-20" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch checked={scopeForm.isActive} onCheckedChange={c => setScopeForm(p => ({ ...p, isActive: !!c }))} />
                    <Label>Scope Status Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScopeDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveScope} disabled={saving}>{saving ? "Processing..." : "Commit Scope"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Assignment Modal */}
            <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Project User Assignment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label>Select Professional</Label>
                    <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary" 
                            value={assignmentForm.userId} onChange={e => setAssignmentForm(p => ({ ...p, userId: e.target.value }))}>
                       <option value="">Search user catalogue...</option>
                       {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.department || 'No Dept'}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Designated Project Role</Label>
                    <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary" 
                            value={assignmentForm.role} onChange={e => setAssignmentForm(p => ({ ...p, role: e.target.value as any }))}>
                       {Object.entries(USER_ROLES).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg border border-border">
                    <Switch checked={assignmentForm.isPrimary} onCheckedChange={c => setAssignmentForm(p => ({ ...p, isPrimary: !!c }))} />
                    <div>
                      <Label className="block mb-0.5">Primary Lead Designation</Label>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Sets as the main contact for this role</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveAssignment} disabled={saving}>{saving ? "Processing..." : "Finalize Assignment"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </div>
  );
}
