import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { StatusPieChart, ProjectBarChart } from "@/components/dashboard-charts";

export const revalidate = 60;

async function getDashboardStats() {
  try {
    const [statusCounts, projectCounts, totalEcrs, releasedEcrs, onHoldEcrs, recentActivity] = await Promise.all([
      prisma.ecr.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.project.findMany({
        take: 5,
        include: { 
          _count: { 
            select: { ecrs: true } 
          } 
        },
        orderBy: { 
          ecrs: { _count: 'desc' } 
        }
      }),
      prisma.ecr.count(),
      prisma.ecr.count({ where: { status: 'RELEASED' } }),
      prisma.ecr.count({ where: { status: 'ON_HOLD' } }),
      prisma.stageHistory.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          ecr: { 
            select: { 
              ecrNumber: true, 
              currentStage: true 
            } 
          },
          actedByUser: { 
            select: { 
              name: true 
            } 
          }
        }
      })
    ]);

    return {
      totalEcrs,
      releasedEcrs,
      onHoldEcrs,
      ecrStats: statusCounts.map(s => ({ 
        status: s.status, 
        count: s._count._all 
      })),
      projectStats: projectCounts.map(p => ({ 
        code: p.code, 
        name: p.name, 
        count: p._count.ecrs 
      })),
      recentActivity: recentActivity.map(sh => ({
        id: sh.id,
        ecr_number: sh.ecr.ecrNumber,
        stage: sh.stage,
        to_status: sh.toStatus,
        created_at: sh.createdAt.toISOString(),
        user_name: sh.actedByUser.name
      })),
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalEcrs: 0,
      releasedEcrs: 0,
      onHoldEcrs: 0,
      ecrStats: [],
      projectStats: [],
      recentActivity: [],
    };
  }
}

export default async function DashboardPage() {
  const { totalEcrs, releasedEcrs, onHoldEcrs, ecrStats, projectStats, recentActivity } = await getDashboardStats();

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
                <p className="text-3xl font-bold text-blue-600">{Number(totalEcrs) - Number(releasedEcrs) - Number(onHoldEcrs)}</p>
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
                  recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">ECR #{activity.ecr_number}</p>
                        <p className="text-xs text-muted-foreground">{activity.stage}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user_name} moved to {activity.to_status}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
