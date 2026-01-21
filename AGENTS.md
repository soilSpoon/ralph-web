# AGENTS.md

> **Welcome to the Ralph-Web Project!**
> This document serves as the comprehensive guide for developers and AI agents working on this repository. It covers the philosophy, architecture, technology stack, and workflows required to contribute effectively.

---

## 1. Project Overview

**Ralph-Web** is an experimental AI-native coding platform designed to operationalize the "Ralph" workflow—a recursive "Think-Code-Verify" loop—into a scalable web application.

Unlike traditional coding assistants that work linearly in a single chat, Ralph-Web orchestrates **multiple, parallel AI agents**, each working in complete isolation to solve complex software engineering tasks.

### Core Philosophy

1.  **Fresh Context**: Every iteration of an agent starts with a fresh context window. We do not maintain long chat histories. Instead, we pass state via precise files (`prd.json`, `progress.txt`, `memory/`).
2.  **Isolation via Worktrees**: To allow multiple agents to work simultaneously without conflicting (e.g., one agent installing `npm` packages while another runs tests), every task runs in its own **Git Worktree**.
3.  **Plan-First**: We prioritize detailed Spec/PRD generation before any code is written.

---

## 2. Technical Architecture

The architecture is designed to support the **"1 Task = 1 Worktree"** model.

### 🔄 The Ralph Loop (Agent Workflow)

For every task (e.g., "Add Dark Mode"), the system:

1.  **Creates a Worktree**: `.worktrees/task-123/` (A copy of the codebase linked to a dedicated git branch).
2.  **Mounts Memory**: Loads the task's state from `.ralph/tasks/task-123/`.
3.  **Spins a Loop**: An AI agent runs in this folder, reading the `PRD` and `Progress` files, making changes, running tests, and updating the progress file.
4.  **Merges**: Once confident, the agent pushes changes, and a "Reviewer" agent validates them before merging to `main`.

### 💾 Three-Layer State Management

We do not rely solely on database tables. We use a hybrid approach:
| Layer | Storage | Purpose |
| :--- | :--- | :--- |
| **Global State** | `.ralph/ralph.db` (SQLite) | Central registry of all tasks, queue status (Queue/Running/Done), and global configuration. |
| **Task State** | `.ralph/tasks/{id}/*.json` | The source of truth for a specific task (PRD, Requirements, Progress Log). |
| **UI State** | `Zustand` (Client RAM) | Transient frontend state for the Dashboard and Kanban board. |

---

## 3. Technology Stack

We use a modern, performance-oriented stack.

### Core Runtime & Framework

- **Runtime**: **[Bun](https://bun.sh/)**
  - Used for extremely fast package installation, script execution, and testing.
- **Framework**: **[Next.js 16](https://nextjs.org/)** (App Router)
  - Leverages Server Components for performance and Server Actions for data mutation.
- **Language**: **TypeScript** (Strict mode)

### User Interface (UI)

- **Styling**: **[Tailwind CSS v4](https://tailwindcss.com/)**
  - Using the beta v4 engine for lightning-fast compilation.
- **Component Library**: **[shadcn/ui](https://ui.shadcn.com/)**
  - Built on Radix Primitives. Accessible, unstyled by default, and fully customizable.
- **Drag & Drop**: **[@atlaskit/pragmatic-drag-and-drop](https://atlassian.design/components/pragmatic-drag-and-drop)**
  - A low-level, high-performance DnD library used for the Kanban board.
- **Rich Text Editor**: **Lexical**
  - Powers the PRD editor and Markdown viewing experiences.

### Testing & Quality

- **Unit/Component Tests**: **Bun Test**
  - Native performance, configured with `happy-dom` for DOM simulation.
  - Automatically excludes Playwright `.spec.ts` files.
- **E2E Tests**: **Playwright**
  - Multi-page workflow and browser-level integration testing.
- **Visual Testing**: **Storybook 10 + Vitest**
  - Storybook's new Vitest addon is used for component-level interaction testing.
- **Linting & Formatting**: **[Biome](https://biomejs.dev/)**
  - Replaces ESLint and Prettier with a single, high-performance tool for linting, formatting, and import sorting.

---

## 4. Directory Structure

Understanding where things live is crucial.

```text
/home/dh/dev/labs/ralph-web/
├── app/                  # Next.js App Router
│   ├── page.tsx          # Dashboard (Home)
│   ├── tasks/            # Kanban Board & Task Details
│   └── layout.tsx        # Root layout (Sidebar, Header)
├── components/           # React Components
│   ├── ui/               # Generic (Button, Input, Badge) - via shadcn
│   ├── dashboard/        # Dashboard-specific widgets
│   └── kanban/           # Kanban-specific components
├── lib/                  # Core Logic
│   ├── store/            # Zustand stores (useAppStore.ts)
│   ├── db/               # Database schemas & clients (Drizzle/SQLite)
│   └── utils.ts          # Helpers
├── tasks/                # 📄 Project Specs (READ THESE!)
│   ├── prd-ralph-web.md  # The Master Plan
│   └── specs/            # Detailed Architecture & UI Specs
├── .worktrees/           # 🚫 Ignored. Where agents do their work.
├── .ralph/               # 🚫 Ignored. Central DB & Task Metadata.
└── AGENTS.md             # 👈 You are here.
```

---

## 5. Development Workflow (How to Contribute)

If you are an agent or developer adding a feature:

1.  **Read the Feature Spec**: Check if there is a specific MD file in `tasks/specs/` for what you are building.
2.  **Create Components in Isolation**:
    - Use `Storybook` to build complex UI pieces (like the Task Card) without running the full app.
    - Run `bun run storybook`.
3.  **Implement Logic & Stores**:
    - Add state to `useAppStore.ts` or create a new store slice.
    - Write unit tests (`bun test`) for pure logic.
4.  **Assemble Pages**:
    - Import components into `app/.../page.tsx`.
    - Ensure responsiveness (Tailwind mobile-first).
5.  **Verify**:
    - Run `bun run dev` to check locally.
    - Run `bun test` to ensure no regressions.

## 6. Common Commands

| Command             | Description                                          |
| :------------------ | :--------------------------------------------------- |
| `bun run dev`       | Starts the Next.js development server.               |
| `bun run build`     | Builds the application for production.               |
| `bun run test:unit` | Runs fast Unit/Component tests via **Bun Test**.     |
| `bun run test:e2e`  | Runs full interaction tests via **Playwright**.      |
| `bun run test:sb`   | Runs Storybook interaction tests via **Vitest**.     |
| `bun run storybook` | Starts the Storybook UI development environment.     |
| `bun run check`     | Runs lint, format, and import sorting via **Biome**. |
| `bun run lint`      | Runs fast linting checks via **Biome**.              |
| `bun run format`    | Automatically formats code via **Biome**.            |

---

> **Tip for Agents**: When asked to implement a feature, always check `tasks/specs/ui-spec.md` first to see if a specific layout or component hierarchy has already been designed.

---

## 7. TypeScript & Code Quality Standards

We enforce **Strict TypeScript** and **Biome** linting rules. We prioritize **type safety and correctness** over development speed or convenience.

### 🚫 Strictly Forbidden (Avoid These)

1.  **Workarounds**: Do not use `@ts-expect-error`, `@ts-ignore`, or `eslint-disable` to silence errors. Fix the underlying issue.
2.  **`any`**: The usage of `any` is strictly prohibited.
3.  **Loose Types**: Avoid `unknown` or `Record<string, any>` when a specific type can be defined.
4.  **Type Assertions (`as`)**: Avoid casting with `as` to bypass type checks (e.g., `data as User`). This "lies" to the compiler and hides bugs.

### ✅ Best Practices (Do These)

1.  **Fundamental Solutions**: Solve the root cause of type errors. If a type doesn't match, changing the code or the type definition is better than forcing it.
2.  **Type Inference**: Write code that allows TypeScript to infer types naturally. Explicitly declare return types only when necessary or for clarity.
3.  **Utility Types**: Use built-in utilities (`Pick`, `Omit`, `Partial`) or libraries like **`type-fest`** to manipulate types safely.
4.  **Strict Declarations**: Define precise interfaces for all props, state, and data.
    - _Bad_: `payload: object`
    - _Good_: `payload: { id: string; status: 'draft' | 'published' }`
