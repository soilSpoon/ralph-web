"use client";

import { CheckCircle2, ChevronDown, ChevronUp, Layout } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import type { WizardFormData } from "@/lib/hooks/use-wizard-state";

interface WizardStepReviewProps {
  formData: WizardFormData;
  onFormDataChange: (data: Partial<WizardFormData>) => void;
  onConfirm: () => void;
  isOrchestrating: boolean;
}

export function WizardStepReview({
  formData,
  onFormDataChange,
  onConfirm,
  isOrchestrating,
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

  const prdData = formData.generatedPRD;
  const [openStories, setOpenStories] = useState<string[]>([]);

  const goalsWithIds = useMemo(
    () =>
      prdData?.goals.map((g) => ({ id: crypto.randomUUID(), text: g })) || [],
    [prdData?.goals],
  );

  const nonGoalsWithIds = useMemo(
    () =>
      prdData?.nonGoals.map((g) => ({ id: crypto.randomUUID(), text: g })) ||
      [],
    [prdData?.nonGoals],
  );

  const successMetricsWithIds = useMemo(
    () =>
      prdData?.successMetrics.map((g) => ({
        id: crypto.randomUUID(),
        text: g,
      })) || [],
    [prdData?.successMetrics],
  );

  const storiesWithIds = useMemo(
    () =>
      prdData?.stories.map((s) => ({
        id: crypto.randomUUID(),
        story: {
          ...s,
          criteriaWithIds: s.acceptanceCriteria.map((c) => ({
            id: crypto.randomUUID(),
            text: c,
          })),
        },
      })) || [],
    [prdData?.stories],
  );

  const toggleStory = (id: string) => {
    setOpenStories((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  if (loading || !prdData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">PRD 생성 중...</h3>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{prdData.project}</h3>
          <p className="text-muted-foreground">{prdData.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b pb-1">🎯 Goals</h3>
          <ul>
            {goalsWithIds.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b pb-1">
            👤 User Stories
          </h3>
          <div className="space-y-2 mt-2">
            {storiesWithIds.map(({ id, story }) => (
              <Collapsible
                key={id}
                open={openStories.includes(id)}
                onOpenChange={() => toggleStory(id)}
                className="border rounded-md p-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{story.title}</span>
                  <CollapsibleTrigger
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      className: "h-6 w-6 p-0",
                    })}
                  >
                    {openStories.includes(id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle</span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <p className="text-sm text-muted-foreground mt-1">
                    {story.description}
                  </p>
                  <ul className="text-xs mt-1 space-y-1">
                    {story.criteriaWithIds.map((ac) => (
                      <li key={ac.id} className="list-disc ml-4">
                        {ac.text}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b pb-1">🚫 Non-Goals</h3>
          <ul>
            {nonGoalsWithIds.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b pb-1">
            📊 Success Metrics
          </h3>
          <ul>
            {successMetricsWithIds.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onConfirm} disabled={isOrchestrating}>
          {isOrchestrating ? (
            <>
              <Layout className="mr-2 h-4 w-4 animate-spin" />
              Creating Tasks...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve & Start
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
