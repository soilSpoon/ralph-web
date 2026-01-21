import "@/test/env";
import { describe, it, expect, beforeEach } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { useWizardState } from "./use-wizard-state";

describe("useWizardState", () => {
  it("should initialize with 'describe' step", () => {
    const { result } = renderHook(() => useWizardState());
    expect(result.current.currentStep).toBe("describe");
    expect(result.current.stepIndex).toBe(0);
  });

  it("should move to next step", () => {
    const { result } = renderHook(() => useWizardState());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe("clarify");
    expect(result.current.stepIndex).toBe(1);
  });

  it("should move to previous step", () => {
    const { result } = renderHook(() => useWizardState());

    // First go to step 2
    act(() => {
      result.current.nextStep();
    });

    // Then go back
    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStep).toBe("describe");
    expect(result.current.stepIndex).toBe(0);
  });

  it("should not go before first step", () => {
    const { result } = renderHook(() => useWizardState());

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStep).toBe("describe");
    expect(result.current.stepIndex).toBe(0);
  });

  it("should not go beyond last step", () => {
    const { result } = renderHook(() => useWizardState());

    // Go to last step (approve)
    act(() => {
      result.current.nextStep(); // clarify
      result.current.nextStep(); // review
      result.current.nextStep(); // approve
    });

    expect(result.current.currentStep).toBe("approve");
    expect(result.current.stepIndex).toBe(3);

    // Try to go beyond
    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe("approve");
  });

  it("should track form data", () => {
    const { result } = renderHook(() => useWizardState());

    act(() => {
      result.current.setFormData({ description: "New feature" });
    });

    expect(result.current.formData.description).toBe("New feature");
  });

  it("should indicate if on first/last step", () => {
    const { result } = renderHook(() => useWizardState());

    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);

    // Go to last step
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
      result.current.nextStep();
    });

    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(true);
  });

  it("should reset wizard state", () => {
    const { result } = renderHook(() => useWizardState());

    act(() => {
      result.current.nextStep();
      result.current.setFormData({ description: "Test" });
    });

    expect(result.current.currentStep).toBe("clarify");

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentStep).toBe("describe");
    expect(result.current.formData.description).toBe("");
  });
});
