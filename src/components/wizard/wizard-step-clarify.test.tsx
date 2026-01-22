import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ClarifyQuestion } from "@/lib/prd/generator";
import { createMockWizardFormData, render } from "@/test/utils";
import { WizardStepClarify } from "./wizard-step-clarify";

const mockOnFormDataChange = vi.fn();

describe("WizardStepClarify", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and display questions on mount", async () => {
    const mockQuestions: ClarifyQuestion[] = [
      {
        id: "q1",
        question: "What is your goal?",
        type: "choice",
        options: ["A. Learn", "B. Build"],
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ questions: mockQuestions })),
    );

    const { getByText } = render(
      <WizardStepClarify
        formData={createMockWizardFormData({
          description: "Test description",
          clarifications: {},
        })}
        onFormDataChange={mockOnFormDataChange}
      />,
    );

    await waitFor(() => {
      expect(getByText("What is your goal?")).toBeInTheDocument();
      expect(getByText("A. Learn")).toBeInTheDocument();
    });
  });

  it("should handle choice selection", async () => {
    const mockQuestions: ClarifyQuestion[] = [
      {
        id: "q1",
        question: "Choose one",
        type: "choice",
        options: ["Option 1", "Option 2"],
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ questions: mockQuestions })),
    );

    const { getByLabelText } = render(
      <WizardStepClarify
        formData={createMockWizardFormData({
          description: "Test",
          clarifications: {},
        })}
        onFormDataChange={mockOnFormDataChange}
      />,
    );

    await waitFor(() => {
      const radio = getByLabelText("Option 1");
      fireEvent.click(radio);
    });

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      clarifications: { q1: "Option 1" },
    });
  });

  it("should display loading state initially", () => {
    vi.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <WizardStepClarify
        formData={createMockWizardFormData({
          description: "Test",
          clarifications: {},
        })}
        onFormDataChange={mockOnFormDataChange}
      />,
    );

    // Check for skeletons (simple check for "animation-pulse" class or structure)
    // Skeletons usually have some specific class from shadcn/ui or just check if content is not there
    // Here we check if questions are NOT there yet.
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should handle fetch error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("API Error"));

    const { getByText } = render(
      <WizardStepClarify
        formData={createMockWizardFormData({
          description: "Test",
          clarifications: {},
        })}
        onFormDataChange={mockOnFormDataChange}
      />,
    );

    await waitFor(() => {
      expect(
        getByText("추가 질문이 없습니다. 다음 단계로 진행해주세요."),
      ).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
