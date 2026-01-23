# Phase 10: Queue Manager (Smart Scheduling)

> 📌 Part of [Phase 7-13 구현 명세](../phases.md)
> **Goal**: 병렬 태스크 관리 및 자동 승격 시스템 (Inspired by `Auto-Claude` Queue V2)

---

## 1. Smart Queue Concept

단순 FIFO 큐가 아니라, 태스크의 **상태(Health)**와 **성과(Score)**에 따라 동적으로 우선순위가 바뀌는 큐입니다.

### Queue Lanes (우선순위 레인)
1. **🚀 Express Lane**: 사용자 직접 요청, 긴급 핫픽스
2. **🚙 Normal Lane**: 일반 기능 개발
3. **🐢 Background Lane**: 문서 업데이트, 리팩토링, 분석 태스크

## 2. Auto-Promotion Logic (핵심 기능)

`Auto-Claude`의 "Auto-Promotion" 개념을 Ralph Loop에 적용합니다.
테스트 통과 및 검증 단계에서 성공한 태스크는 다음 단계로 "승격"되며, 실패한 태스크는 "강등"되거나 재시도 큐로 이동합니다.

```typescript
// lib/queue/types.ts

export type TaskStatus = 
  | 'queued' 
  | 'running' 
  | 'validating'  // 테스트 실행 중
  | 'promoted'    // 성공 -> 다음 단계(Review/Merge)로 자동 이동
  | 'demoted'     // 실패 반복 -> 백그라운드로 이동
  | 'failed';

export interface QueueItem {
  taskId: string;
  priority: number; // 1-100
  failures: number;
  lastErrorHash?: string;
  promotionScore: number; // 테스트 통과율, 소요 시간 등으로 계산
}
```

### Promotion Strategy (승격 전략)

```typescript
// lib/queue/promotion-manager.ts

export class PromotionManager {
  
  /**
   * 태스크 실행 결과 처리
   */
  async handleTaskResult(taskId: string, result: ExecutionResult): Promise<TaskAction> {
    if (result.success) {
      // 1. 성공 시: 점수 계산
      const score = this.calculateScore(result);
      
      // 2. Auto-Promotion 조건 체크 (예: 테스트 100% 통과 + Lint 에러 0)
      if (score >= 90) {
        return { type: 'promote', targetStage: 'review' };
      }
      return { type: 'complete' };
      
    } else {
      // 3. 실패 시: Smart Demotion
      // 동일 에러가 3번 반복되면(Circular Fix), 우선순위를 대폭 낮추고 개발자 개입 요청
      if (this.isCircularFailure(taskId, result.error)) {
        return { type: 'demote', reason: 'circular_fix_detected' };
      }
      
      return { type: 'retry', priorityAdjustment: -10 }; // 우선순위 약간 낮춤
    }
  }

  private calculateScore(result: ExecutionResult): number {
    // 테스트 커버리지, 실행 속도, 변경 라인 수 등을 종합
    return 0; // TODO: Implement scoring logic
  }
}
```

## 3. Concurrency Control & UI Stability

- **Resource Locking**: 동일한 파일을 수정하는 태스크 동시 실행 방지 (Git Lock 활용)
- **Status Consistency (from Auto-Claude)**: 
  - Kanban 보드에서 태스크 상태가 빈번하게 바뀔 때 발생하는 "Flip-flopping" 현상을 방지하기 위해 **Optimistic UI 업데이트와 서버 상태 확인 간의 순서 보장(Sequence Lock)** 로직을 구현합니다.
  - 상태 변경 요청 시 `lastUpdated` 타임스탬프를 체크하여 이전 요청이 나중에 도착하는 문제를 방지합니다.
- **Throttling**: 에이전트 API Rate Limit 고려하여 실행 속도 조절

---

## 4. Implementation Plan

1. **Redis/In-Memory Queue**: `bullmq` 또는 가벼운 인메모리 큐로 시작
2. **Worker Pool**: `Phase 7`의 Orchestrator를 워커로 활용
3. **Promotion Logic**: 위 `PromotionManager` 구현 및 연동
