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
- **Library**: **[React 19](https://react.dev/)**
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
- **Diff Viewer**: **[@git-diff-view/react](https://github.com/git-diff-view/git-diff-view)** & **[Shiki](https://shiki.style/)**
  - Provides high-performance, GitHub-style diff viewing with high-quality syntax highlighting.
- **Internationalization (i18n)**: **[next-intl](https://next-intl-docs.vercel.app/)**
  - Provides type-safe translations and routing-based multi-language support (English & Korean).

### Testing & Quality

- **Unit/Component Tests**: **Bun Test**
  - Native performance, configured with `happy-dom` for DOM simulation.
- **E2E Tests**: **Playwright**
  - Multi-page workflow and browser-level integration testing.
- **Visual Testing**: **Storybook 10 + Vitest**
  - Storybook's new Vitest addon is used for component-level interaction testing.
- **Linting & Formatting**: **[Biome](https://biomejs.dev/)**
  - Replaces ESLint and Prettier with a single tool for linting, formatting, and import sorting.

---

## 4. Directory Structure

Understanding the codebase organization is crucial.

```text
/
├── src/                  # Main source code
│   ├── app/              # Next.js App Router (en/ko)
│   ├── components/       # UI Components
│   │   ├── ui/           # Generic components via shadcn
│   │   ├── dashboard/    # Dashboard-specific widgets
│   │   ├── kanban/       # Kanban board components
│   │   ├── wizard/       # PRD generation & Approval wizards
│   │   ├── settings/     # User & System settings
│   │   ├── review/       # Task review & Diff viewer
│   │   └── layout/       # Shared layout components
│   ├── lib/              # Core business logic
│   │   ├── orchestrator/ # Agent loops & PTY runner
│   │   ├── worktree/     # Git worktree management
│   │   ├── store/        # Zustand stores
│   │   ├── prd/          # PRD logic & schema
│   │   ├── review/       # Review process & diff utils
│   │   ├── tasks/        # Task domain logic
│   │   └── utils.ts      # Shared helper functions
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # i18n routing and request logic
│   ├── messages/         # Translation JSON files (en/ko)
│   └── stories/          # Storybook component stories
├── public/               # Static assets
├── tasks/                # Project Specs & Roadmap
│   ├── PRIORITIES.md     # Current Roadmap & Phase Status
│   ├── prd-ralph-web.md  # The Master Plan
│   └── specs/            # Detailed Architecture & UI Specs
├── .worktrees/           # (Ignored) Isolated agent workspace
├── .ralph/               # (Ignored) Task metadata & SQLite DB
└── AGENTS.md             # 👈 You are here.
```

---

## 5. Development Workflow

If you are an agent or developer adding a feature:

1.  **Read the Feature Spec**: Check `tasks/specs/` for relevant design documents.
2.  **Create Components in Isolation**:
    - Use `Storybook` to build complex UI pieces without running the full app.
    - Run `bun run storybook`.
3.  **Implement Logic & Stores**:
    - Add state to relevant Zustand stores in `src/lib/store/`.
    - Write unit tests (`bun test`) for business logic.
4.  **Assemble Pages**:
    - Import components into `src/app/.../page.tsx`.
    - Ensure responsiveness and accessibility.
5.  **Verify**:
    - Run `bun run dev` to check locally.
    - Run `bun run test:unit` to ensure no regressions.

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

## 7. TypeScript & Code Quality Standards

We enforce **Strict TypeScript** and **Biome** linting rules. We prioritize **type safety and correctness** over development speed.

### 🚫 Strictly Forbidden

1.  **Workarounds**: Do not use `@ts-expect-error`, `@ts-ignore`, or `eslint-disable`. Fix the root issue.
2.  **`any`**: Strictly prohibited.
3.  **Loose Types**: Avoid `unknown` or `Record<string, any>` when specific types are possible.
4.  **Type Assertions (`as`)**: Avoid casting to bypass type checks.

### ✅ Best Practices

1.  **Fundamental Solutions**: Solve the root cause of type errors.
2.  **Type Inference**: Allow TypeScript to infer types naturally where possible.
3.  **Utility Types**: Use `Pick`, `Omit`, `Partial`, or `type-fest` for safe manipulation.
4.  **Strict Declarations**: Define precise interfaces for all props, state, and data.
5.  **Comments**:
    - **English Only**: All comments must be written in English. Korean comments are strictly forbidden.
    - **No Redundancy**: Do not write comments that can be explained by the code itself. "Self-documenting code" is preferred over verbose comments.
