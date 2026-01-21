'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type WizardStep = 'describe' | 'clarify' | 'review' | 'approve';

export default function NewTaskPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('describe');
  const [description, setDescription] = useState('');

  const steps: WizardStep[] = ['describe', 'clarify', 'review', 'approve'];
  const currentStepIndex = steps.indexOf(currentStep);

  const stepTitles: Record<WizardStep, string> = {
    describe: 'Describe',
    clarify: 'Clarify',
    review: 'Review',
    approve: 'Approve',
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  return (
    <div className="container-custom py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="heading-1">✨ New Task</h1>
          <p className="text-muted-foreground mt-2">Step {currentStepIndex + 1} of {steps.length}</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
              {index < steps.length - 1 && <div className="w-2" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          {steps.map((step) => (
            <span
              key={step}
              className={currentStep === step ? 'font-medium' : 'text-muted-foreground'}
            >
              {stepTitles[step]}
            </span>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle(currentStep)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 'describe' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">무엇을 만들고 싶으신가요?</Label>
                  <Textarea
                    id="description"
                    placeholder="사용자 인증 기능을 추가하고 싶어요. 이메일/비밀번호 로그인과 OAuth (Google, GitHub) 지원이 필요합니다."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            )}

            {currentStep === 'clarify' && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">몇 가지 확인이 필요합니다:</p>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>1. 인증 방식</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="jwt" name="auth" value="jwt" />
                        <Label htmlFor="jwt">JWT (토큰 기반)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="session" name="auth" value="session" />
                        <Label htmlFor="session">Session (서버 세션)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="recommend" name="auth" value="recommend" />
                        <Label htmlFor="recommend">잘 모르겠어요 (AI 추천)</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>2. 비밀번호 재설정 기능이 필요한가요?</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="reset-yes" name="reset" value="yes" />
                        <Label htmlFor="reset-yes">네</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="reset-no" name="reset" value="no" />
                        <Label htmlFor="reset-no">아니오</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>3. OAuth 제공자를 선택해주세요 (복수 선택)</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="google" />
                        <Label htmlFor="google">Google</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="github" />
                        <Label htmlFor="github">GitHub</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="apple" />
                        <Label htmlFor="apple">Apple</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">4. 추가 의견이 있다면 작성해주세요 (선택)</Label>
                    <Textarea id="comments" rows={3} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3>생성된 PRD</h3>
                  <h4>개요</h4>
                  <p>사용자 인증 기능 구현</p>
                  <ul>
                    <li>JWT 기반 인증</li>
                    <li>OAuth 지원 (Google, GitHub)</li>
                  </ul>
                  <h4>기술 스택</h4>
                  <ul>
                    <li>NextAuth.js</li>
                    <li>PostgreSQL</li>
                    <li>Prisma ORM</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 'approve' && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">
                    PRD가 생성되었습니다. 승인하면 태스크가 큐에 등록되고 Ralph Loop가 실행됩니다.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStepIndex === steps.length - 1 ? 'Approve & Create' : 'Next'}
            {currentStepIndex < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStepTitle(step: WizardStep): string {
  const titles: Record<WizardStep, string> = {
    describe: '💬 Your Request',
    clarify: '🤖 AI Clarifying Questions',
    review: '📄 Review PRD',
    approve: '✅ Final Approval',
  };
  return titles[step];
}
