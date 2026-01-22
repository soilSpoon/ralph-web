import type { Meta, StoryObj } from "@storybook/react";
import type { WizardFormData } from "@/lib/hooks/use-wizard-state";
import { WizardStepApprove } from "./wizard-step-approve";
import { WizardStepClarify } from "./wizard-step-clarify";
import { WizardStepDescribe } from "./wizard-step-describe";
import { WizardStepReview } from "./wizard-step-review";

const meta: Meta = {
  title: "Wizard/Steps",
  parameters: {
    layout: "padded",
  },
};

export default meta;

const emptyFormData: WizardFormData = {
  description: "",
  clarifications: {},
  generatedPRD: null,
  approved: false,
};

export const Step1_Describe: StoryObj<typeof WizardStepDescribe> = {
  render: () => (
    <WizardStepDescribe formData={emptyFormData} onFormDataChange={() => {}} />
  ),
};

export const Step2_Clarify: StoryObj<typeof WizardStepClarify> = {
  render: () => (
    <WizardStepClarify
      formData={{
        ...emptyFormData,
        description: "로그인 기능 구현",
      }}
      onFormDataChange={() => {}}
    />
  ),
};

export const Step3_Review: StoryObj<typeof WizardStepReview> = {
  render: () => (
    <WizardStepReview
      formData={{
        ...emptyFormData,
        description: "로그인 기능 구현",
        clarifications: { auth_method: "JWT" },
        generatedPRD: {
          project: "Demo Project",
          description: "Auth System",
          goals: ["Secure login"],
          stories: [],
          functionalRequirements: [],
          nonGoals: [],
          assumptions: [],
          successMetrics: [],
        },
      }}
      onFormDataChange={() => {}}
      onConfirm={() => {}}
      isOrchestrating={false}
    />
  ),
};

export const Step4_Approve: StoryObj<typeof WizardStepApprove> = {
  render: () => <WizardStepApprove formData={emptyFormData} />,
};
