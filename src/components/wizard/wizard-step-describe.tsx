"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WizardFormData } from "@/lib/hooks/use-wizard-state";

interface WizardStepDescribeProps {
  formData: WizardFormData;
  onFormDataChange: (data: Partial<WizardFormData>) => void;
}

export function WizardStepDescribe({
  formData,
  onFormDataChange,
}: WizardStepDescribeProps) {
  const descriptionId = useId();
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={descriptionId}>무엇을 만들고 싶으신가요?</Label>
        <Textarea
          id={descriptionId}
          placeholder="사용자 인증 기능을 추가하고 싶어요. 이메일/비밀번호 로그인과 OAuth (Google, GitHub) 지원이 필요합니다."
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          rows={6}
        />
      </div>
    </div>
  );
}
