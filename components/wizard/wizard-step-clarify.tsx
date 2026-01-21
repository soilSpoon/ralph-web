"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { WizardFormData } from "@/lib/hooks/use-wizard-state";

interface WizardStepClarifyProps {
  formData: WizardFormData;
  onFormDataChange: (data: Partial<WizardFormData>) => void;
}

export function WizardStepClarify({
  formData,
  onFormDataChange,
}: WizardStepClarifyProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        몇 가지 확인이 필요합니다:
      </p>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>1. 인증 방식</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="jwt"
                name="auth"
                value="jwt"
                checked={formData.authMethod === "jwt"}
                onChange={() => onFormDataChange({ authMethod: "jwt" })}
              />
              <Label htmlFor="jwt">JWT (토큰 기반)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="session"
                name="auth"
                value="session"
                checked={formData.authMethod === "session"}
                onChange={() => onFormDataChange({ authMethod: "session" })}
              />
              <Label htmlFor="session">Session (서버 세션)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="recommend"
                name="auth"
                value="recommend"
                checked={formData.authMethod === "recommend"}
                onChange={() => onFormDataChange({ authMethod: "recommend" })}
              />
              <Label htmlFor="recommend">잘 모르겠어요 (AI 추천)</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>2. 비밀번호 재설정 기능이 필요한가요?</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="reset-yes"
                name="reset"
                value="yes"
                checked={formData.passwordReset === true}
                onChange={() => onFormDataChange({ passwordReset: true })}
              />
              <Label htmlFor="reset-yes">네</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="reset-no"
                name="reset"
                value="no"
                checked={formData.passwordReset === false}
                onChange={() => onFormDataChange({ passwordReset: false })}
              />
              <Label htmlFor="reset-no">아니오</Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>3. OAuth 제공자를 선택해주세요 (복수 선택)</Label>
          <div className="space-y-2">
            {["google", "github", "apple"].map((provider) => (
              <div key={provider} className="flex items-center space-x-2">
                <Checkbox
                  id={provider}
                  checked={formData.oauthProviders?.includes(provider)}
                  onCheckedChange={(checked) => {
                    const current = formData.oauthProviders || [];
                    if (checked) {
                      onFormDataChange({
                        oauthProviders: [...current, provider],
                      });
                    } else {
                      onFormDataChange({
                        oauthProviders: current.filter((p) => p !== provider),
                      });
                    }
                  }}
                />
                <Label htmlFor={provider} className="capitalize">
                  {provider}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">
            4. 추가 의견이 있다면 작성해주세요 (선택)
          </Label>
          <Textarea
            id="comments"
            rows={3}
            value={formData.additionalComments}
            onChange={(e) =>
              onFormDataChange({ additionalComments: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
