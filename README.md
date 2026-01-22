# Ralph-Web: AI-Native Coding Platform

> **"Idea to PR" - High-performance AI Agent Orchestrator working in parallel isolated environments.**

Ralph-Web is an experimental coding platform that operationalizes and scales the **Ralph** workflow—a recursive "Think-Code-Verify" loop—into a robust web application. Beyond simple chat-based assistants, it provides an environment where multiple agents work simultaneously in completely isolated Git Worktrees to solve and verify complex tasks.

---

## 🚀 Key Features

1.  **Isolation via Worktrees**
    - Every task runs in its own dedicated Git Worktree (`.worktrees/task-id/`).
    - Agents work safely without conflicting on dependency installations or test executions.

2.  **Parallel Agent Orchestration**
    - Designed to handle multiple tasks concurrently.
    - Full control over CLI agents (like Claude Code) via `node-pty` in a real terminal environment.

3.  **PRD-First Workflow**
    - Prioritizes detailed specification (PRD) and planning before any code is written.
    - Ensures a structured approach where only approved plans proceed to the execution phase.

4.  **Multi-Provider Support**
    - Integrated support for various CLI-based AI agents including Claude Code, Gemini, Qwen, and more via adapter patterns.

5.  **Real-time Monitoring**
    - Monitor agent progress and logs in real-time through a web-based terminal interface.

---

## 🛠 Technology Stack

Ralph-Web leverages modern technologies to provide premium performance and developer experience.

- **Runtime**: [Bun](https://bun.sh/) (Fastest package management & testing)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Beta v4 Engine)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [React Hook Form](https://react-hook-form.com/)
- **Editor**: [Lexical](https://lexical.dev/) (Advanced Rich Text Editor)
- **Code Quality**: [Biome](https://biomejs.dev/) (Fast Linting & Formatting)
- **Testing**: [Playwright](https://playwright.dev/) (E2E) & [Bun Test](https://bun.sh/docs/test/runtime)

---

## 📂 Project Structure

```text
/
├── src/
│   ├── app/              # Next.js App Router (i18n: en/ko)
│   ├── components/       # React Components (Dashboard, Kanban, Wizard, UI, etc.)
│   ├── lib/              # Core Logic (Orchestrator, Worktree, Store, Types)
│   ├── hooks/            # Shared React Hooks
│   ├── i18n/             # i18n Configuration
│   ├── messages/         # Internationalization dictionary files
│   └── stories/          # Storybook component stories
├── public/               # Static assets
├── tasks/                # Project specs and roadmap (PRIORITIES.md, PRD)
├── tests/                # Playwright E2E tests
└── AGENTS.md             # Technical guide for agents and developers
```

---

## 🏁 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) must be installed.
- Git must be configured in your environment.

### Installation & Execution

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Start Storybook (Component development)
bun run storybook
```

---

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)**: Detailed technical guide on architecture, state management, and standards.
- **[tasks/PRIORITIES.md](./tasks/PRIORITIES.md)**: Current roadmap and phase status.
- **[tasks/prd-ralph-web.md](./tasks/prd-ralph-web.md)**: Comprehensive project PRD.

---

## 📄 License

This is a private project. Licensing terms are to be determined.
