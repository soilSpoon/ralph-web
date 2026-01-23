# Phase 9: Memory System 개요

> **Enterprise-Ready 메모리 & 영속성 아키텍처**
>
> Phase 8 완료 후, 에이전트의 상태 영속화와 확장 가능한 지능형 메모리 시스템을 구축합니다.

---

## 핵심 인사이트

> [!IMPORTANT]
> **메모리는 데이터베이스 문제가 아니라 정보 생명주기(Information Lifecycle) 문제이다.**
>
> Selection → Normalization → Storage → Retrieval → Consolidation

모든 성공적인 메모리 시스템은 다음을 공유합니다:

1. **Canonical Memory Units**: 자기완결적, 타입화된, 인용 가능한 메모리 원자
2. **Multi-View Indexing**: Semantic + Lexical + Symbolic + Relational 인덱스
3. **Token Budget as Economic System**: 검색은 예산 할당 문제
4. **Write Governance**: Staging vs Published 분리
5. **Provenance First**: 인용 없음 = 가설, 사실 아님
6. **ECL Pipeline**: Extract → Cognify → Load 파이프라인 경계

---

## 벤치마크 레포지토리

| 레포지토리      | 핵심 기여                                          | 적용 영역                          |
| :-------------- | :------------------------------------------------- | :--------------------------------- |
| **agentdb**     | **Core Memory Engine** (Reflexion, Causal, Skills) | **메인 메모리 시스템**             |
| **SimpleMem**   | Semantic Lossless Compression, Multi-View Indexing | Atomic Fact 생성, Hybrid Retrieval |
| **memU**        | Resource→Item→Category 계층, Sufficiency Check     | 계층 구조, 검색 충분성 검증        |
| **claude-mem**  | Progressive Disclosure (3-Layer), ~10x 토큰 효율   | 3단계 검색 도구                    |
| **cognee**      | ECL Pipeline, Knowledge Graph, Code Indexing       | 파이프라인 분리, 코드 그래프       |
| **Auto-Claude** | Graphiti Memory, 순환 수정 감지                    | 에피소드 타입, 루프 방지           |
| **emdash**      | Terminal Snapshot, 자동 정리(Pruning)              | 상태 캡처, 보존 정책               |
| **spec-kit**    | Constitution Layer                                 | 불변 원칙 계층                     |
| **1code**       | Worktree Isolation, Session Management             | Phase 8에 이미 적용됨              |

---

## 스케일 전략 (Dual DB Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                      Hybrid Architecture                     │
├──────────────────────┬──────────────────────────────────────┤
│    Application DB    │            Cognitive DB              │
│   (pglite / Drizzle) │             (agentdb)                │
├──────────────────────┼──────────────────────────────────────┤
│ - Users, Projects    │ - Reflexion (Episodic)               │
│ - Tasks, Worktrees   │ - Skills (Procedural)                │
│ - Staging Logs       │ - Causal Graph (Semantic)            │
│                      │                                      │
│  [Source of Truth]   │         [Source of Wisdom]           │
└──────────────────────┴──────────────────────────────────────┘
```

---

## Memory Layers (mapped to agentdb)

```
┌─────────────────────────────────────────────────────────────┐
│                 Level 0: Constitution                        │
│             (CONSTITUTION.md + PolicyGuard)                  │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                 Level 1: Semantic Memory                     │
│   ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│   │  SkillLibrary   │  │   Code Graph    │  │ReasoningBank│ │
│   │ (구조화된 지식) │  │  (코드 인덱스)  │  │ (성공 패턴)│  │
│   └─────────────────┘  └─────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                 Level 2: Episodic Memory                     │
│   ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐  │
│   │ ReflexionMemory │  │  Staging Logs   │  │ CausalGraph│  │
│   │ (Atomic Facts)  │  │   (pglite)      │  │ (실수/원인)│  │
│   └─────────────────┘  └─────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                  Level 3: Working Memory                     │
│               (agentdb ContextSynthesizer)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 세부 문서

| 문서                                           | 설명                                          |
| ---------------------------------------------- | --------------------------------------------- |
| [01-architecture.md](./01-architecture.md)     | 아키텍처, 스케일 전략, DB 선택 가이드         |
| [02-schema.md](./02-schema.md)                 | 스키마 설계, 이벤트 소싱, 테이블 정의         |
| [03-retrieval.md](./03-retrieval.md)           | 검색 시스템, Progressive Disclosure, MCP 도구 |
| [04-governance.md](./04-governance.md)         | 메모리 거버넌스, Staging/Promotion, 신뢰도    |
| [05-ecl-pipeline.md](./05-ecl-pipeline.md)     | Extract → Cognify → Load 파이프라인           |
| [06-code-indexing.md](./06-code-indexing.md)   | 코드 인덱싱, 심볼 관리, LSP 통합              |
| [07-integration.md](./07-integration.md)       | Ralph Loop 통합, 주입/추출 포인트             |
| [08-implementation.md](./08-implementation.md) | 구현 로드맵, TODO, 우선순위                   |

---

## Work Objectives

### Core (Phase 9.0)

1. **Constitution Layer**: 프로젝트 불변의 법칙 정의
2. **ECL Pipeline**: Extract → Cognify → Load → **Memify**
3. **Hybrid Search**: Semantic(Vector) + Lexical(tsvector) + Symbolic(Metadata)

### Advanced (Phase 9.1)

4. **Skill Memory**: 구조화된 기술 매뉴얼 형태로 지식 저장
5. **Progressive Retrieval**: 토큰 효율적 3단계 검색 도구
6. **Code Indexing**: 코드베이스 구조 인덱싱
7. **Complexity-Aware**: 쿼리 복잡도에 따른 동적 검색 깊이 조절

### Enterprise (Phase 9.2)

8. **Self-Evolving**: 사용 패턴에 따른 메모리 구조 자동 최적화
9. **Knowledge Graph**: 엔티티 관계 기반 검색
10. **Multi-tenancy**: 프로젝트/사용자별 격리
11. **Session Resume**: 작업 중단 후 완벽한 컨텍스트 복원

---

## 참조

- [SimpleMem](https://github.com/simple-mem) - Semantic Compression, Hybrid Retrieval
- [memU](https://github.com/memu-framework) - Hierarchical Memory, Skill Extraction
- [claude-mem](https://github.com/claude-mem) - Progressive Disclosure
- [cognee](https://github.com/cognee) - ECL Pipeline, Code Graph
- [Auto-Claude](https://github.com/auto-claude) - Graphiti Memory, Session Insights
- [emdash](https://github.com/emdash) - Terminal Snapshots
