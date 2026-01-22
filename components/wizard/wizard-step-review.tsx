"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { WizardFormData } from "@/lib/hooks/use-wizard-state";

interface WizardStepReviewProps {
  formData: WizardFormData;
  onFormDataChange: (data: Partial<WizardFormData>) => void;
}

export function WizardStepReview({
  formData,
  onFormDataChange,
}: WizardStepReviewProps) {
  const [loading, setLoading] = useState(!formData.generatedPRD);

  useEffect(() => {
    const generatePRD = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/prd/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: formData.description,
            answers: formData.clarifications,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.prd) {
            onFormDataChange({ generatedPRD: data.prd });
          }
        }
      } catch (error) {
        console.error("Failed to generate PRD:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!formData.generatedPRD) {
      generatePRD();
    }
  }, [
    formData.description,
    formData.clarifications,
    formData.generatedPRD,
    onFormDataChange,
  ]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const prdData = formData.generatedPRD;

  if (!prdData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">생성된 PRD 리뷰</h3>
        <div className="h-[500px] w-full rounded-md border p-6 bg-muted/30 flex items-center justify-center text-muted-foreground">
          PRD 생성 중 오류가 발생했거나 데이터가 없습니다.
        </div>
        <p className="text-sm text-muted-foreground italic">
          * 내용을 검토해주세요. 승인하면 코드 구현이 시작됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">생성된 PRD 리뷰</h3>
      <ScrollArea className="h-[500px] w-full rounded-md border p-6 bg-muted/30">
        <div className="border rounded-xl p-6 bg-muted/20 prose prose-sm max-w-none dark:prose-invert">
          <h2 className="text-xl font-bold mb-4">{prdData.project}</h2>

          <h3 className="text-lg font-semibold border-b pb-1">🎯 Goals</h3>
          <ul>
            {prdData.goals.map((goal, i) => (
              <li key={i}>{goal}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold border-b pb-1">
            📝 User Stories
          </h3>
          {prdData.stories.map((story) => (
            <div key={story.id} className="mb-4">
              <p className="font-medium mb-1 font-semibold">{story.title}</p>
              <p className="text-xs text-muted-foreground mb-1">
                {story.description}
              </p>
              <ul className="text-xs mt-1 space-y-1">
                {story.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="list-disc ml-4">
                    {ac}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h3 className="text-lg font-semibold border-b pb-1">🚫 Non-Goals</h3>
          <ul>
            {prdData.nonGoals.map((ng, i) => (
              <li key={i}>{ng}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold border-b pb-1">
            📈 Success Metrics
          </h3>
          <ul>
            {prdData.successMetrics.map((sm, i) => (
              <li key={i}>{sm}</li>
            ))}
          </ul>
        </div>
      </ScrollArea>
      <p className="text-sm text-muted-foreground italic">
        * 내용을 검토해주세요. 승인하면 코드 구현이 시작됩니다.
      </p>
    </div>
  );
}
