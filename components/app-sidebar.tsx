'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Settings,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'ECR List',
    href: '/ecrs',
    icon: FileText,
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: Activity,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Settings,
  },
]

// Role switcher users (simulated auth)
const USERS = [
  { id: 'user-de-1', name: 'Alice Morgan', role: 'Design Engineer', initials: 'AM' },
  { id: 'user-de-2', name: 'Ben Harris', role: 'Design Engineer', initials: 'BH' },
  { id: 'user-ce-1', name: 'Wafa Ali', role: 'Costing Engineer', initials: 'WA' },
  { id: 'user-pm-1', name: 'Carlos Ruiz', role: 'Project Engineer', initials: 'CR' },
  { id: 'user-qe-1', name: 'Diana Chen', role: 'Quality Engineer', initials: 'DC' },
  { id: 'user-adm-1', name: 'System Admin', role: 'Admin', initials: 'SA' },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      {/* Logo / Brand */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-sidebar-primary flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary-foreground">ECR</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground leading-tight">BFG International</p>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight">Engineering Change Requests</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors group',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* User Switcher */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 mb-2 px-1">Active User</p>
        <UserSwitcher />
      </div>
    </aside>
  )
}

function UserSwitcher() {
  // Using URL params to simulate different users — no auth needed for demo
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const currentUserId = params.get('userId') || 'user-de-1'
  const currentUser = USERS.find(u => u.id === currentUserId) || USERS[0]

  function switchUser(userId: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('userId', userId)
    window.location.href = url.toString()
  }

  return (
    <div className="relative group">
      <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sidebar-accent/50 transition-colors">
        <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-sidebar-primary-foreground">{currentUser.initials}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
          <p className="text-[10px] text-sidebar-foreground/50 truncate">{currentUser.role}</p>
        </div>
      </button>
      {/* Dropdown on hover */}
      <div className="absolute bottom-full left-0 right-0 mb-1 bg-sidebar border border-sidebar-border rounded shadow-lg hidden group-hover:block z-50">
        <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 px-3 pt-2 pb-1">Switch User</p>
        {USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => switchUser(user.id)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-sidebar-accent/50 transition-colors',
              user.id === currentUserId && 'bg-sidebar-accent/30'
            )}
          >
            <div className="w-5 h-5 rounded-full bg-sidebar-primary/60 flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] font-bold text-sidebar-primary-foreground">{user.initials}</span>
            </div>
            <div>
              <p className="text-xs text-sidebar-foreground leading-tight">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50">{user.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
