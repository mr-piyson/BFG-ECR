'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/status-badge';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { formatDate } from '@/lib/ecr-helpers';

interface ECRRow {
  id: string;
  ecr_number: number;
  project_code: string;
  project_name: string;
  current_stage: string;
  status: string;
  created_at: string;
  change_description?: string;
  scope_name?: string;
}

export default function ECRsPage() {
  const [ecrs, setEcrs] = useState<ECRRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchEcrs = async () => {
      try {
        const res = await fetch('/api/ecrs');
        const data = await res.json();
        if (data.ecrs) {
          setEcrs(data.ecrs);
        } else {
          setEcrs(data);
        }
      } catch (error) {
        console.error('Failed to fetch ECRs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEcrs();
  }, []);

  const filteredEcrs = ecrs.filter((ecr) => {
    const matchesSearch =
      ecr.ecr_number?.toString().includes(search) ||
      ecr.project_code?.toLowerCase().includes(search.toLowerCase()) ||
      ecr.change_description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || ecr.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ECRs</h2>
          <p className="text-muted-foreground">Manage all engineering change requests</p>
        </div>
        <Link href="/ecrs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New ECR
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ECRs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="RELEASED">Released</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* ECRs Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading ECRs...</div>
        ) : filteredEcrs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No ECRs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">ECR #</th>
                  <th className="px-6 py-3 text-left font-semibold">Title</th>
                  <th className="px-6 py-3 text-left font-semibold">Project</th>
                  <th className="px-6 py-3 text-left font-semibold">Scopes</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Stage</th>
                  <th className="px-6 py-3 text-left font-semibold">Created</th>
                  <th className="px-6 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEcrs.map((ecr) => (
                  <tr key={ecr.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">#{ecr.ecr_number}</td>
                    <td className="px-6 py-4">{ecr.change_description || '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{ecr.project_code}</td>
                    <td className="px-6 py-4 text-sm font-medium">{ecr.scope_name || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ecr.status as any} />
                    </td>
                    <td className="px-6 py-4 text-sm">{ecr.current_stage}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(ecr.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/ecrs/${ecr.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
