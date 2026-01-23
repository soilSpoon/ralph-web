# Phase 12: Multi-Agent Architecture

> 📌 Part of [Phase 7-13 구현 명세](../phases.md)
> **Goal**: 20+ CLI 에이전트를 단일 인터페이스로 표준화 (Inspired by `emdash` & `emdash/agents`)

---

## 1. Core Interface (`AgentDefinition`)

`emdash`의 리네이밍(Provider -> Agent)을 반영하고, CLI 에이전트의 특성을 추상화합니다.

```typescript
// lib/agents/types.ts

export type AgentCapability = 
  | 'planning'      // 복잡한 계획 수립 가능 (e.g., Claude Code, Devin)
  | 'coding'        // 실제 코드 수정 가능
  | 'terminal'      // 터미널 명령어 실행 가능
  | 'browser';      // 브라우저 제어 가능

export interface AgentConfig {
  id: string;             // e.g., 'claude-code', 'gemini-cli', 'open-interpreter'
  name: string;           // Display Name
  description: string;
  version: string;
  capabilities: AgentCapability[];
}

export interface AgentRuntime {
  command: string;        // 실행할 CLI 명령어 (e.g., 'claude')
  args: string[];         // 기본 인자 (e.g., ['--print-architecture'])
  
  // Auto-Approve Flags (Human-in-the-loop 최소화 설정)
  yoloModeFlags?: string[]; // e.g., ['--dangerously-skip-permissions']
}

export interface AgentDefinition extends AgentConfig {
  runtime: AgentRuntime;
  
  // 에이전트 특화 파서 (스트림 출력을 구조화된 데이터로 변환)
  outputParser: (chunk: string) => ParsedAgentEvent | null;

  // 비용 및 사용량 추적 (from Auto-Claude)
  usage?: {
    trackTokenUsage: boolean; // 토큰 사용량 추적 여부
    pricePerInputToken?: number;
    pricePerOutputToken?: number;
  };
  
  // 에러 복구 전략
  errorStrategy: 'retry' | 'restart' | 'ask-human';
}
```

## 2. Agent Registry (Adapter Pattern)

다양한 CLI 도구들을 플러그인 형태로 끼워 넣을 수 있는 레지스트리입니다.

```typescript
// lib/agents/registry.ts

export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    capabilities: ['planning', 'coding', 'terminal'],
    runtime: {
      command: 'claude',
      args: [],
      yoloModeFlags: ['--dangerously-skip-permissions']
    },
    // Claude Code 특화: XML 태그 파싱 등
    outputParser: claudeParser, 
    errorStrategy: 'ask-human'
  },
  
  'gemini-cli': {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    capabilities: ['coding', 'terminal'],
    runtime: {
      command: 'gemini',
      args: ['chat'],
      yoloModeFlags: ['--yolomode']
    },
    outputParser: geminiParser,
    errorStrategy: 'retry'
  }
};
```

## 3. Implementation Plan

1. **Base Adapter**: `node-pty`와 연결되는 기본 `BaseAgent` 클래스 구현
2. **Standard Parser**: ANSI 코드를 제거하고, Markdown/XML 블록을 추출하는 공용 파서 구현
3. **Dynamic Discovery**: 시스템 `$PATH`를 스캔하여 설치된 에이전트 자동 활성화

---

## 4. Key Updates (from emdash Analysis)

- **Terminology**: 기존 `Provider` 용어 폐기 → `Agent`로 통일
- **Structure**: `lib/providers/` → `lib/agents/` 디렉토리 구조 변경 예정

## 5. Configuration & Auth Management (from Auto-Claude #1385)

에이전트별 인증 토큰과 설정이 분산되어 발생하는 401 에러를 방지하기 위해, 설정 파일 경로를 표준화합니다.

- **Global Config**: `~/.ralph/config.json` (전역 설정)
- **Agent Profiles**: `~/.ralph/profiles/{agent-id}.json` (개별 에이전트 인증 정보)
- **Project Overrides**: `./.ralph/agents.json` (프로젝트별 오버라이드)

각 에이전트 어댑터는 위 순서대로 설정을 병합(Merge)하여 로드해야 합니다.
