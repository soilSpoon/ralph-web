"use client";

import { useCallback, useState } from "react";

export type WizardStep = "describe" | "clarify" | "review" | "approve";

const STEPS: WizardStep[] = ["describe", "clarify", "review", "approve"];

export interface WizardFormData {
  description: string;
  authMethod?: "jwt" | "session" | "recommend";
  passwordReset?: boolean;
  oauthProviders?: string[];
  additionalComments?: string;
}

const initialFormData: WizardFormData = {
  description: "",
  authMethod: undefined,
  passwordReset: undefined,
  oauthProviders: [],
  additionalComments: "",
};

export function useWizardState() {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormDataState] =
    useState<WizardFormData>(initialFormData);

  const currentStep = STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  const nextStep = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const setFormData = useCallback((data: Partial<WizardFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  const reset = useCallback(() => {
    setStepIndex(0);
    setFormDataState(initialFormData);
  }, []);

  return {
    currentStep,
    stepIndex,
    isFirstStep,
    isLastStep,
    formData,
    nextStep,
    prevStep,
    setFormData,
    reset,
    steps: STEPS,
  };
}
