/**
 * Cognify Pipeline - SimpleMem 스타일 Semantic Lossless Restatement
 *
 * 원리:
 * - 대명사 제거 (He, She, It, They → 실제 엔티티)
 * - 상대 시간 → 절대 시간 변환
 * - 최근 5개 사실 기반 중복 방지
 */

export interface CognifyInput {
  rawLog: string;
  context: {
    agent?: string;
    file?: string;
    function?: string;
    currentTime?: string;
    taskId?: string;
    commitHash?: string;
  };
}

export interface CognifyResult {
  atomicFact: string;
  isDuplicate: boolean;
  metadata: {
    originalLog: string;
    processedAt: string;
    context: CognifyInput["context"];
  };
}

// 최근 5개 사실 저장소
let recentFacts: string[] = [];

/**
 * 최근 사실 설정 (테스트용)
 */
export function setRecentFacts(facts: string[]): void {
  recentFacts = facts.slice(-5);
}

/**
 * 최근 사실 추가
 */
export function addRecentFact(fact: string): void {
  recentFacts.push(fact);
  if (recentFacts.length > 5) {
    recentFacts.shift();
  }
}

/**
 * 대명사 제거 및 문맥 주입
 */
function resolvePronouns(
  text: string,
  context: CognifyInput["context"],
): string {
  let result = text;

  // 대명사 → 에이전트/파일/함수로 치환
  const pronounMap: { readonly [key: string]: string } = {
    He: context.agent || "the agent",
    She: context.agent || "the agent",
    It: context.file || "the target",
    They: "the agents",
    he: context.agent || "the agent",
    she: context.agent || "the agent",
    it: context.file || "the target",
    they: "the agents",
  };

  for (const pronoun in pronounMap) {
    const replacement = pronounMap[pronoun];
    const regex = new RegExp(`\\b${pronoun}\\b`, "g");
    result = result.replace(regex, replacement);
  }

  // 문맥 정보 주입
  if (context.file && !result.includes(context.file)) {
    result = `${result} in ${context.file}`;
  }

  if (context.function && !result.includes(context.function)) {
    result = `${result} (function: ${context.function})`;
  }

  return result;
}

/**
 * 상대 시간 → 절대 시간 변환
 */
function resolveRelativeTime(
  text: string,
  currentTime: string | undefined,
): string {
  if (!currentTime) return text;

  const baseDate = new Date(currentTime);
  let result = text;

  const relativeTimeMap: { readonly [key: string]: number } = {
    tomorrow: 1,
    yesterday: -1,
    "next week": 7,
    "last week": -7,
  };

  for (const relative in relativeTimeMap) {
    const dayOffset = relativeTimeMap[relative];
    if (text.toLowerCase().includes(relative)) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const absoluteDate = targetDate.toISOString().split("T")[0];
      result = result.replace(new RegExp(relative, "gi"), absoluteDate);
    }
  }

  return result;
}

/**
 * 중복 검사 (Jaccard 유사도 기반)
 */
function checkDuplicate(newFact: string): boolean {
  const newWords = new Set(newFact.toLowerCase().split(/\s+/));

  for (const existingFact of recentFacts) {
    const existingWords = new Set(existingFact.toLowerCase().split(/\s+/));

    // Jaccard 유사도 계산
    const intersection = new Set(
      [...newWords].filter((x) => existingWords.has(x)),
    );
    const union = new Set([...newWords, ...existingWords]);

    const similarity = intersection.size / union.size;

    // 30% 이상 유사하면 중복으로 판단
    if (similarity > 0.3) {
      return true;
    }
  }

  return false;
}

/**
 * Cognify - SimpleMem 스타일 재진술
 */
export async function cognify(input: CognifyInput): Promise<CognifyResult> {
  // 1. 대명사 제거 및 문맥 주입
  let atomicFact = resolvePronouns(input.rawLog, input.context);

  // 2. 상대 시간 → 절대 시간 변환
  atomicFact = resolveRelativeTime(atomicFact, input.context.currentTime);

  // 3. 중복 검사
  const isDuplicate = checkDuplicate(atomicFact);

  // 중복이 아니면 최근 사실에 추가
  if (!isDuplicate) {
    addRecentFact(atomicFact);
  }

  return {
    atomicFact,
    isDuplicate,
    metadata: {
      originalLog: input.rawLog,
      processedAt: new Date().toISOString(),
      context: input.context,
    },
  };
}
