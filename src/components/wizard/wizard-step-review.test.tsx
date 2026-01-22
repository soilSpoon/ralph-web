import { waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type PRD } from "@/lib/prd/generator";
import { createMockWizardFormData, render } from "@/test/utils";
import { WizardStepReview } from "./wizard-step-review";

const mockOnFormDataChange = vi.fn();

const mockPRD: PRD = {
  project: "Test Project",
  description: "A test project",
  goals: ["Goal 1"],
  stories: [
    {
      id: "us-1",
      taskId: "t1",
      title: "User Story 1",
      description: "As a user...",
      acceptanceCriteria: ["Criteria 1"],
      priority: 1,
      passes: false,
    },
  ],
  functionalRequirements: ["FR 1"],
  nonGoals: ["Non Goal 1"],
  assumptions: ["Assumption 1"],
  successMetrics: ["Metric 1"],
};

describe("WizardStepReview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should generate PRD if not present", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ prd: mockPRD }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(
      <WizardStepReview
        formData={createMockWizardFormData({
          description: "Desc",
          clarifications: {},
          generatedPRD: null,
        })}
        onFormDataChange={mockOnFormDataChange}
      />,
    );

    await waitFor(() => {
      expect(mockOnFormDataChange).toHaveBeenCalledWith({
        generatedPRD: mockPRD,
      });
    });
  });

  it("should display existing PRD", () => {
    const { getByText } = render(
      <WizardStepReview
        formData={createMockWizardFormData({
          description: "Desc",
          clarifications: {},
          generatedPRD: mockPRD,
        })}
        onFormDataChange={mockOnFormDataChange}
      />,
    );

    expect(getByText("Test Project")).toBeInTheDocument();
    expect(getByText("Goal 1")).toBeInTheDocument();
    expect(getByText("User Story 1")).toBeInTheDocument();
  });

  it("should handle API error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("API Fail"));

    const { getByText } = render(
      <WizardStepReview
        formData={createMockWizardFormData({
          description: "Desc",
          clarifications: {},
          generatedPRD: null,
        })}
        onFormDataChange={mockOnFormDataChange}
      />,
    );

    await waitFor(() => {
      expect(
        getByText("PRD 생성 중 오류가 발생했거나 데이터가 없습니다."),
      ).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
