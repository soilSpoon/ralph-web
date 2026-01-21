"use client";

import { WizardFormData } from "@/lib/hooks/use-wizard-state";

interface WizardStepReviewProps {
  formData: WizardFormData;
}

export function WizardStepReview({ formData }: WizardStepReviewProps) {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <h3>생성된 PRD (Preview)</h3>

        <h4>개요</h4>
        <p>{formData.description || "설명이 입력되지 않았습니다."}</p>

        <h4>선택된 옵션</h4>
        <ul>
          <li>인증 방식: {formData.authMethod || "미선택"}</li>
          <li>
            비밀번호 재설정:{" "}
            {formData.passwordReset === undefined
              ? "미선택"
              : formData.passwordReset
                ? "필요함"
                : "불필요"}
          </li>
          <li>OAuth 제공자: {formData.oauthProviders?.join(", ") || "없음"}</li>
        </ul>

        {formData.additionalComments && (
          <>
            <h4>추가 의견</h4>
            <p>{formData.additionalComments}</p>
          </>
        )}

        {/* Placeholder for AI generated content */}
        <h4>기술 스택 (AI 추천)</h4>
        <ul>
          <li>NextAuth.js</li>
          <li>PostgreSQL</li>
          <li>Prisma ORM</li>
        </ul>
      </div>
    </div>
  );
}
