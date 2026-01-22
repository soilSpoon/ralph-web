"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { WizardFormData } from "@/lib/hooks/use-wizard-state";
import type { ClarifyQuestion } from "@/lib/prd/generator";

interface WizardStepClarifyProps {
  formData: WizardFormData;
  onFormDataChange: (data: Partial<WizardFormData>) => void;
}

export function WizardStepClarify({
  formData,
  onFormDataChange,
}: WizardStepClarifyProps) {
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/prd/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: formData.description }),
        });
        const data = await response.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formData.description && questions.length === 0) {
      fetchQuestions();
    } else if (!formData.description) {
      setLoading(false);
    }
  }, [formData.description, questions.length]);

  const handleUpdateAnswer = (
    questionId: string,
    answer: string | string[] | boolean,
  ) => {
    onFormDataChange({
      clarifications: {
        ...formData.clarifications,
        [questionId]: answer,
      },
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questions.map((q) => {
        const value = formData.clarifications[q.id];
        const stringValue = typeof value === "string" ? value : "";

        return (
          <div key={q.id} className="space-y-4">
            <Label htmlFor={q.id} className="text-base font-semibold">
              {q.question}
            </Label>

            {q.type === "choice" && q.options && (
              <RadioGroup
                value={stringValue}
                onValueChange={(value) => handleUpdateAnswer(q.id, value)}
                className="space-y-2"
              >
                {q.options.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                    <Label
                      htmlFor={`${q.id}-${option}`}
                      className="font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {q.type === "text" && (
              <Textarea
                placeholder="여기에 답변을 입력하세요..."
                value={stringValue}
                onChange={(e) => handleUpdateAnswer(q.id, e.target.value)}
                rows={3}
              />
            )}
          </div>
        );
      })}

      {questions.length === 0 && !loading && (
        <p className="text-muted-foreground text-center py-8">
          추가 질문이 없습니다. 다음 단계로 진행해주세요.
        </p>
      )}
    </div>
  );
}
