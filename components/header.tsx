'use client'

import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground rounded-lg p-2">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ECR System</h1>
            <p className="text-sm text-muted-foreground">BFG International</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            Profile
          </Button>
        </div>
      </div>
    </header>
  )
}
