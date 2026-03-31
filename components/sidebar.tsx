'use client';

import {
  ChartColumnDecreasingIcon,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ecrs', label: 'ECRs', icon: ListTodo },
  { href: '/admin', label: 'Admin', icon: Users, role: 'ADMIN' },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/wip', label: 'Work in Progress', icon: ChartColumnDecreasingIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredItems = navItems.filter((item) => !item.role || item.role === userRole);

  return (
    <nav className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col gap-8">
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
