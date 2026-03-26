'use client';

import { Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* <div className="bg-primary text-primary-foreground rounded-lg p-2">
            <Zap className="w-6 h-6" />
          </div> */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">ECR System</h1>
            <p className="text-sm text-muted-foreground">BFG International</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <div className="text-right">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.role}</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
