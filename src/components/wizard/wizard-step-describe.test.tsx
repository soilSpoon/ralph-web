import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { WizardFormData } from "@/lib/hooks/use-wizard-state";
import { WizardStepDescribe } from "./wizard-step-describe";

afterEach(() => {
  cleanup();
});

describe("WizardStepDescribe", () => {
  const mockFormData: WizardFormData = {
    description: "",
    clarifications: {},
    generatedPRD: null,
    approved: false,
  };

  it("should render description label and textarea", () => {
    const { getByLabelText, getByPlaceholderText } = render(
      <WizardStepDescribe
        formData={mockFormData}
        onFormDataChange={() => {}}
      />,
    );

    expect(getByLabelText("무엇을 만들고 싶으신가요?")).toBeTruthy();
    expect(getByPlaceholderText(/사용자 인증 기능/)).toBeTruthy();
  });

  it("should display existing description value", () => {
    const formData: WizardFormData = {
      ...mockFormData,
      description: "Test description",
    };
    const { getByDisplayValue } = render(
      <WizardStepDescribe formData={formData} onFormDataChange={() => {}} />,
    );

    expect(getByDisplayValue("Test description")).toBeTruthy();
  });

  it("should call onFormDataChange when typing", async () => {
    const user = userEvent.setup();

    // Controlled component wrapper for testing interactions
    function TestComponent() {
      const [formData, setFormData] = useState<WizardFormData>(mockFormData);
      return (
        <WizardStepDescribe
          formData={formData}
          onFormDataChange={(newData) =>
            setFormData((prev) => ({ ...prev, ...newData }))
          }
        />
      );
    }

    const { getByRole } = render(<TestComponent />);

    const textarea = getByRole("textbox");
    await user.type(textarea, "New task");

    expect(textarea).toHaveValue("New task");
  });
});
