import { updateStepsStatus } from "../src/helperFunctions/formHelper";
import { FormData } from "../src/types/express";

const mockFormData: FormData = {
  requestId: "12345",
  assetTitle: "Test Asset",
  dataAsset: "Test Data Asset",
  ownedBy: "John Doe",
  completedSections: 0,
  status: "IN PROGRESS",
  overviewSections: {},
  contactPoint: {},
  steps: {
    "data-type": {
      id: "data-type",
      status: "NOT STARTED",
      name: "Data type",
      value: {},
      nextStep: "data-subjects",
      errorMessage: ""
    },
    "data-subjects": {
      id: "data-subjects",
      status: "NOT STARTED",
      name: "Data subjects",
      value: {},
      nextStep: "project-aims",
      errorMessage: ""
    },
  },
  stepHistory: [],
};

describe("updateStepsStatus function", () => {
  beforeEach(() => {
    // Reset the mock FormData object before each test
    mockFormData.completedSections = 0;
    mockFormData.status = "IN PROGRESS";
    for (const step in mockFormData.steps) {
      mockFormData.steps[step].status = "NOT STARTED";
    }
  });

  it('should mark the current step as "COMPLETED"', () => {
    const currentStep = "data-type";
    const stepValue = {
      personal: { checked: true },
      special: { checked: false },
      none: { checked: false },
    };
    const returnToStart = false;

    updateStepsStatus(currentStep, stepValue, mockFormData, returnToStart);

    expect(mockFormData.steps[currentStep].status).toBe("COMPLETED");
  });

  it('should mark the current step as "IN PROGRESS"', () => {
    const currentStep = "data-type";
    const stepValue = {
      personal: { checked: false },
      special: { checked: false },
      none: { checked: false },
    };
    const returnToStart = true;

    updateStepsStatus(currentStep, stepValue, mockFormData, returnToStart);

    expect(mockFormData.steps[currentStep].status).toBe("IN PROGRESS");
  });
});
