import { ActivityItem, Pattern, Story, Task } from "./types";

export const mockTasks: Task[] = [
  {
    id: "t-1",
    name: "Implement Authentication",
    description: "Setup Supabase auth and create login page",
    status: "running",
    priority: 1,
    currentIteration: 2,
    maxIterations: 5,
    worktreePath: "/dev/ralph/auth",
    branchName: "feature/auth",
    metadataPath: ".ralph/auth",
    createdAt: new Date("2024-01-20T10:00:00"),
    updatedAt: new Date("2024-01-21T14:30:00"),
    startedAt: new Date("2024-01-20T11:00:00"),
  },
  {
    id: "t-2",
    name: "Design System Update",
    description: "Update color palette and typography",
    status: "draft",
    priority: 2,
    currentIteration: 0,
    maxIterations: 3,
    worktreePath: "",
    branchName: "",
    metadataPath: "",
    createdAt: new Date("2024-01-21T09:00:00"),
    updatedAt: new Date("2024-01-21T09:00:00"),
  },
  {
    id: "t-3",
    name: "API Optimization",
    description: "Improve response time for /tasks endpoint",
    status: "review",
    priority: 1,
    currentIteration: 1,
    maxIterations: 3,
    worktreePath: "/dev/ralph/api-opt",
    branchName: "fix/api-perf",
    metadataPath: ".ralph/api-opt",
    createdAt: new Date("2024-01-19T16:00:00"),
    updatedAt: new Date("2024-01-21T11:00:00"),
  },
  {
    id: "t-4",
    name: "Legacy Code Cleanup",
    description: "Remove unused components",
    status: "queued",
    priority: 3,
    currentIteration: 0,
    maxIterations: 1,
    worktreePath: "",
    branchName: "",
    metadataPath: "",
    createdAt: new Date("2024-01-21T13:00:00"),
    updatedAt: new Date("2024-01-21T13:00:00"),
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: "a-1",
    type: "iteration_completed",
    taskId: "t-1",
    taskName: "Implement Authentication",
    message: "Iteration 2 completed with 3 files changed",
    timestamp: new Date("2024-01-21T14:30:00"),
  },
  {
    id: "a-2",
    type: "task_started",
    taskId: "t-3",
    taskName: "API Optimization",
    message: "Task started by User",
    timestamp: new Date("2024-01-21T10:00:00"),
  },
  {
    id: "a-3",
    type: "task_created",
    taskId: "t-4",
    taskName: "Legacy Code Cleanup",
    message: "New task created",
    timestamp: new Date("2024-01-21T13:00:00"),
  },
];

export const mockStories: Story[] = [
  {
    id: "s-1",
    taskId: "t-1",
    title: "OAuth Integration",
    description: "Implement Google and GitHub OAuth",
    acceptanceCriteria: [
      "Google login works",
      "GitHub login works",
      "JWT token issued",
    ],
    priority: 1,
    passes: true,
    startedAt: new Date("2024-01-20T12:00:00"),
    completedAt: new Date("2024-01-21T10:00:00"),
  },
  {
    id: "s-2",
    taskId: "t-1",
    title: "Database Schema",
    description: "Create users and profiles tables",
    acceptanceCriteria: [
      "Users table exists",
      "Profiles table exists",
      "Foreign keys set",
    ],
    priority: 2,
    passes: false,
    startedAt: new Date("2024-01-21T11:00:00"),
  },
];

export const mockPatterns: Pattern[] = [
  {
    id: 1,
    taskId: "t-1",
    pattern: "Use K-sortable for large lists",
    category: "tip",
    createdAt: new Date("2024-01-21T15:00:00"),
  },
  {
    id: 2,
    pattern: "Always use absolute paths in imports",
    category: "convention",
    createdAt: new Date("2024-01-20T09:00:00"),
  },
];

export const mockDiff = `diff --git a/src/lib/auth/jwt.ts b/src/lib/auth/jwt.ts
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/src/lib/auth/jwt.ts
@@ -0,0 +1,15 @@
+import { sign, verify } from 'jsonwebtoken';
+
+const SECRET = process.env.JWT_SECRET || 'fallback';
+
+export function generateToken(payload: object) {
+  return sign(payload, SECRET, { expiresIn: '1h' });
+}
+
+export function verifyToken(token: string) {
+  try {
+    return verify(token, SECRET);
+  } catch (e) {
+    return null;
+  }
+}
diff --git a/src/middleware.ts b/src/middleware.ts
index a1b2c3d..e4f5g6h 100644
--- a/src/middleware.ts
+++ b/src/middleware.ts
@@ -1,5 +1,6 @@
 import { NextResponse } from 'next/server';
-import type { NextRequest } from 'next/server';
+import type { NextRequest } from 'next/server';
+import { verifyToken } from './lib/auth/jwt';
 
 export function middleware(request: NextRequest) {
-  return NextResponse.next();
+  const authHeader = request.headers.get('authorization');
+  if (!authHeader || !verifyToken(authHeader.split(' ')[1])) {
+    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
+  }
+  return NextResponse.next();
 }
`;
