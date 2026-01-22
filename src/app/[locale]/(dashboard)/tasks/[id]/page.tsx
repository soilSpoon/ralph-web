import { CheckCircle, Circle, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProgressBar } from "@/components/common/progress-bar";
import { StatusBadge } from "@/components/common/status-badge";
import { TerminalView } from "@/components/orchestrator/terminal-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { mockStories } from "@/lib/mock-data";
import { taskManager } from "@/lib/tasks/task-manager";

export { generateStaticParams } from "./generate-params";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await taskManager.getTask(id);
  const t = await getTranslations("TaskDetail");

  if (!task) {
    notFound();
  }

  const stories = mockStories.filter((s) => s.taskId === id);
  const completedStories = stories.filter((s) => s.passes).length;

  return (
    <div className="container-custom py-6 space-y-6">
      {/* Task Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h1 className="heading-1">{task.name}</h1>
            <p className="text-muted-foreground">{task.description}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={task.status} />
            {task.status === "review" && (
              <Link href={`/tasks/${task.id}/review`}>
                <Button className="font-semibold shadow-sm">
                  {t("reviewChanges")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {t("iteration")} {task.currentIteration}/{task.maxIterations}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedStories}/{stories.length} {t("storiesCount")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t("branch")}:</span>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {task.branchName}
            </code>
          </div>
        </div>

        <ProgressBar completed={completedStories} total={stories.length} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stories" className="w-full">
        <TabsList>
          <TabsTrigger value="stories">{t("tabs.stories")}</TabsTrigger>
          <TabsTrigger value="prd">{t("tabs.prd")}</TabsTrigger>
          <TabsTrigger value="terminal">
            {t("tabs.terminal") || "Terminal"}
          </TabsTrigger>
          <TabsTrigger value="progress">{t("tabs.progress")}</TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📝 {t("userStories")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stories.length > 0 ? (
                stories.map((story) => (
                  <div
                    key={story.id}
                    className="border rounded-md p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {story.passes ? (
                        <CheckCircle className="h-5 w-5 text-merged mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {story.id}: {story.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {story.description}
                            </p>
                          </div>
                          <Badge variant="outline">
                            Priority {story.priority}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {t("acceptanceCriteria")}:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            {story.acceptanceCriteria.map((criteria) => (
                              <li
                                key={crypto.randomUUID()}
                                className="list-disc"
                              >
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No stories found. Generate PRD first.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prd" className="mt-6">
          <Card>
            <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
              <h2>{t("tabs.prd")}</h2>
              <div className="whitespace-pre-wrap">{task.description}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📟 Agent Logs</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              {/* Connect to the session created for this task */}
              <TerminalView sessionId={`session-for-${task.id}`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📖 {t("progressLog")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-2 border-primary pl-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">2026-01-21 15:30 - US-003</span>
                </div>
                <p className="text-sm">JWT 토큰 생성/검증 로직 구현</p>
                <div className="text-sm text-muted-foreground">
                  <p>
                    {t("files")}: src/lib/auth/jwt.ts (+), src/middleware.ts (~)
                  </p>
                  <p>{t("learnings")}: refresh token rotation 패턴 적용</p>
                </div>
              </div>

              <div className="border-l-2 pl-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">2026-01-20 16:00 - US-002</span>
                </div>
                <p className="text-sm">회원가입 폼 컴포넌트 구현</p>
                <div className="text-sm text-muted-foreground">
                  <p>{t("files")}: src/components/RegisterForm.tsx (+)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
