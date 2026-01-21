import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { mockTasks, mockActivity } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/formatters';
import Link from 'next/link';

export default function DashboardPage() {
  const draftCount = mockTasks.filter((t) => t.status === 'pending').length;
  const queuedCount = mockTasks.filter((t) => t.status === 'queued').length;
  const runningCount = mockTasks.filter((t) => t.status === 'running').length;
  const reviewCount = mockTasks.filter((t) => t.status === 'review').length;

  return (
    <div className="container-custom py-6 space-y-6">
      <div>
        <h1 className="heading-1">📊 Dashboard</h1>
      </div>

      {/* Quick Start Card */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="무엇을 만들고 싶으신가요?" className="flex-1" />
            <Button>
              시작 →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div>
        <h2 className="heading-2 mb-4">📈 Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-4xl font-bold mt-2">{draftCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Queued</p>
                <p className="text-4xl font-bold mt-2">{queuedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className="text-4xl font-bold mt-2">{runningCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Review</p>
                <p className="text-4xl font-bold mt-2">{reviewCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Needs Attention */}
      <div>
        <h2 className="heading-2 mb-4">🔔 Needs Attention</h2>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-review" />
                <div>
                  <p className="font-medium">"Dark Mode" 검토 대기 중 (5 stories 완료)</p>
                </div>
              </div>
              <Link href="/tasks/task-002/review">
                <Button variant="outline" size="sm">Review →</Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-failed" />
                <div>
                  <p className="font-medium">"User Auth" 진행 중 (iteration #2)</p>
                </div>
              </div>
              <Link href="/tasks/task-001">
                <Button variant="outline" size="sm">View →</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="heading-2 mb-4">📊 Recent Activity</h2>
        <Card>
          <CardContent className="pt-6 space-y-3">
            {mockActivity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 border-b last:border-0">
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{item.taskName}</span> {item.message}
                  </p>
                </div>
                <p className="text-caption text-muted-foreground">
                  {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
