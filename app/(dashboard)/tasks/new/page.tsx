"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWizardState, WizardStep } from "@/lib/hooks/use-wizard-state";
import { WizardStepDescribe } from "@/components/wizard/wizard-step-describe";
import { WizardStepClarify } from "@/components/wizard/wizard-step-clarify";
import { WizardStepReview } from "@/components/wizard/wizard-step-review";
import { WizardStepApprove } from "@/components/wizard/wizard-step-approve";

import { createTask } from "@/app/actions";

export default function NewTaskPage() {
  const {
    currentStep,
    stepIndex,
    steps,
    isFirstStep,
    isLastStep,
    formData,
    nextStep,
    prevStep,
    setFormData,
  } = useWizardState();

  const handleNext = async () => {
    if (isLastStep) {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      await createTask(formDataToSend);
    } else {
      nextStep();
    }
  };

  return (
    <div className="container-custom py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="heading-1">✨ New Task</h1>
          <p className="text-muted-foreground mt-2">
            Step {stepIndex + 1} of {steps.length}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex-1 h-2 rounded-full ${
                  index <= stepIndex ? "bg-primary" : "bg-muted"
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
              className={
                currentStep === step ? "font-medium" : "text-muted-foreground"
              }
            >
              {getStepTitle(step)}
            </span>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle(currentStep)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === "describe" && (
              <WizardStepDescribe
                formData={formData}
                onFormDataChange={setFormData}
              />
            )}

            {currentStep === "clarify" && (
              <WizardStepClarify
                formData={formData}
                onFormDataChange={setFormData}
              />
            )}

            {currentStep === "review" && (
              <WizardStepReview formData={formData} />
            )}

            {currentStep === "approve" && <WizardStepApprove />}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={isFirstStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext}>
            {isLastStep ? "Approve & Create" : "Next"}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStepTitle(step: WizardStep): string {
  const titles: Record<WizardStep, string> = {
    describe: "💬 Your Request",
    clarify: "🤖 AI Clarifying Questions",
    review: "📄 Review PRD",
    approve: "✅ Final Approval",
  };
  return titles[step];
}
