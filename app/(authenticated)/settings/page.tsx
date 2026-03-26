'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Profile Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input placeholder="John Doe" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <Input placeholder="Engineering" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select className="w-full px-4 py-2 border border-border rounded-lg text-sm">
                  <option>Design Engineer</option>
                  <option>Costing Engineer</option>
                  <option>Project Engineer</option>
                  <option>Quality Engineer</option>
                </select>
              </div>

              <Button className="mt-6">Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Notification Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">ECR Assigned to Me</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when an ECR is assigned
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Stage Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a stage is completed
                  </p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">ECR Status Changes</p>
                  <p className="text-sm text-muted-foreground">Get notified on status updates</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <Button className="mt-6">Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Security Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <Input type="password" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input type="password" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <Input type="password" />
              </div>

              <Button className="mt-6">Update Password</Button>
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="font-semibold mb-4">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
