import "@/test/env";
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { WizardStepDescribe } from "./wizard-step-describe";

afterEach(() => {
  cleanup();
});

describe("WizardStepDescribe", () => {
  const mockFormData = { description: "" };

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
    const formData = { description: "Test description" };
    const { getByDisplayValue } = render(
      <WizardStepDescribe formData={formData} onFormDataChange={() => {}} />,
    );

    expect(getByDisplayValue("Test description")).toBeTruthy();
  });

  it("should call onFormDataChange when typing", async () => {
    const user = userEvent.setup();

    // Controlled component wrapper for testing interactions
    function TestComponent() {
      const [formData, setFormData] = useState({ description: "" });
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
