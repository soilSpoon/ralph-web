"use client";

import { useCallback, useState } from "react";
import { PRD } from "../prd/generator";

export type WizardStep = "describe" | "clarify" | "review" | "approve";

const STEPS: WizardStep[] = ["describe", "clarify", "review", "approve"];

export interface WizardFormData {
  description: string;
  clarifications: Record<string, string | string[] | boolean>;
  generatedPRD: PRD | null;
  approved: boolean;
}

const initialFormData: WizardFormData = {
  description: "",
  clarifications: {},
  generatedPRD: null,
  approved: false,
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
