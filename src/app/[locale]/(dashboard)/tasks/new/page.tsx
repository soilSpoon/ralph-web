"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect } from "react";
import { createTask } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardStepApprove } from "@/components/wizard/wizard-step-approve";
import { WizardStepClarify } from "@/components/wizard/wizard-step-clarify";
import { WizardStepDescribe } from "@/components/wizard/wizard-step-describe";
import { WizardStepReview } from "@/components/wizard/wizard-step-review";
import { slideIn } from "@/lib/animations";
import { useWizardState } from "@/lib/hooks/use-wizard-state";

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTaskPageContent />
    </Suspense>
  );
}

function NewTaskPageContent() {
  const t = useTranslations("Wizard");
  const searchParams = useSearchParams();
  const descriptionParam = searchParams.get("description");

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

  useEffect(() => {
    if (descriptionParam && !formData.description) {
      setFormData({ description: descriptionParam });
    }
  }, [descriptionParam, setFormData, formData.description]);

  const handleNext = async () => {
    if (isLastStep) {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      if (formData.generatedPRD) {
        formDataToSend.append("prd", JSON.stringify(formData.generatedPRD));
      }
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
          <h1 className="heading-1">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("step", { current: stepIndex + 1, total: steps.length })}
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
              {t(`steps.${step}`)}
            </span>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{t(`steps.${currentStep}`)}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={slideIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
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
                  <WizardStepReview
                    formData={formData}
                    onFormDataChange={setFormData}
                  />
                )}

                {currentStep === "approve" && (
                  <WizardStepApprove formData={formData} />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={isFirstStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
          <Button onClick={handleNext}>
            {isLastStep ? t("approve") : t("next")}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
