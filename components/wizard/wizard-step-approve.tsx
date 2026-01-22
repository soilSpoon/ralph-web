"use client";

import { CheckCircle2, Rocket, ShieldCheck, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WizardFormData } from "@/lib/hooks/use-wizard-state";

interface WizardStepApproveProps {
  formData: WizardFormData;
}

export function WizardStepApprove({ formData }: WizardStepApproveProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <Rocket className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">준비가 완료되었습니다!</h3>
        <p className="text-muted-foreground">
          승인 버튼을 누르면 Ralph AI 에이전트가 코딩을 시작합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>검토 완료</span>
          </div>
          <p className="text-sm text-muted-foreground">
            PRD 세부 사항 및 사용자 스토리가 생성되었습니다.
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4 text-primary" />
            <span>자동 자동화</span>
          </div>
          <p className="text-sm text-muted-foreground">
            에이전트가 워크트리를 생성하고 구현을 시작합니다.
          </p>
        </div>
      </div>

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>알림</AlertTitle>
        <AlertDescription>
          작업이 시작되면 [터미널] 탭에서 에이전트의 진행 상황을 실시간으로
          확인할 수 있습니다.
        </AlertDescription>
      </Alert>

      <div className="p-6 border-2 border-dashed rounded-xl bg-primary/5 text-center">
        <p className="text-sm font-medium text-primary">
          프로젝트: {formData.description.substring(0, 50)}...
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          현재 단계에서 승인하면 취소할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
