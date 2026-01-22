import { describe, expect, it } from "vitest";
import { createMockWizardFormData, render } from "../../../test/utils";
import { WizardStepApprove } from "./wizard-step-approve";

describe("WizardStepApprove", () => {
  it("should render approval confirmation", () => {
    const { getByText } = render(
      <WizardStepApprove
        formData={createMockWizardFormData({
          description: "My Awesome Project",
        })}
      />,
    );

    expect(getByText("준비가 완료되었습니다!")).toBeInTheDocument();
    expect(getByText(/My Awesome Project/)).toBeInTheDocument();
  });
});
