import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import sql from '@/lib/db'
import Link from 'next/link'
import { StatusPieChart, ProjectBarChart } from '@/components/dashboard-charts'

export const revalidate = 60

async function getDashboardStats() {
  try {
    const ecrStats = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM ecrs
      GROUP BY status
      ORDER BY count DESC
    `

    const projectStats = await sql`
      SELECT 
        p.code,
        p.name,
        COUNT(e.id) as count
      FROM projects p
      LEFT JOIN ecrs e ON p.id = e.project_id
      GROUP BY p.id, p.code, p.name
      ORDER BY count DESC
      LIMIT 5
    `

    const totalEcrs = await sql`SELECT COUNT(*) as count FROM ecrs`
    const releasedEcrs = await sql`SELECT COUNT(*) as count FROM ecrs WHERE status = 'RELEASED'`
    const onHoldEcrs = await sql`SELECT COUNT(*) as count FROM ecrs WHERE status = 'ON_HOLD'`
    const recentActivity = await sql`
      SELECT 
        sh.id,
        sh.ecr_id,
        sh.stage,
        sh.to_status,
        sh.created_at,
        e.ecr_number,
        e.current_stage,
        u.name as user_name
      FROM stage_histories sh
      JOIN ecrs e ON sh.ecr_id = e.id
      JOIN users u ON sh.acted_by_user_id = u.id
      ORDER BY sh.created_at DESC
      LIMIT 10
    `

    return {
      totalEcrs: totalEcrs[0]?.count || 0,
      releasedEcrs: releasedEcrs[0]?.count || 0,
      onHoldEcrs: onHoldEcrs[0]?.count || 0,
      ecrStats: ecrStats || [],
      projectStats: projectStats || [],
      recentActivity: recentActivity || [],
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return {
      totalEcrs: 0,
      releasedEcrs: 0,
      onHoldEcrs: 0,
      ecrStats: [],
      projectStats: [],
      recentActivity: [],
    }
  }
}

export default async function DashboardPage() {
  const { totalEcrs, releasedEcrs, onHoldEcrs, ecrStats, projectStats, recentActivity } = await getDashboardStats()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Overview of all ECR requests and their status</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total ECRs</p>
                <p className="text-3xl font-bold">{totalEcrs}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Released</p>
                <p className="text-3xl font-bold text-green-600">{releasedEcrs}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">On Hold</p>
                <p className="text-3xl font-bold text-amber-600">{onHoldEcrs}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{totalEcrs - releasedEcrs - onHoldEcrs}</p>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusPieChart data={ecrStats} />
              <ProjectBarChart data={projectStats} />
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Link href="/ecrs">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">ECR #{activity.ecr_number}</p>
                        <p className="text-xs text-muted-foreground">{activity.stage}</p>
                        <p className="text-xs text-muted-foreground">{activity.user_name} moved to {activity.to_status}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
