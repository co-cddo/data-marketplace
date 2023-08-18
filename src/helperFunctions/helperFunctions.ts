import { DateStep, RequestBody, Step } from "../types/express";

function validateDate(day: number, month: number, year: number): string {
  const errors = new Set<string>();

  if (!day && !month && !year) {
    return ""; // allows date to be null
  }

  const isLeapYear = (year: number) =>
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  if (!day || day < 1 || day > 31) {
    errors.add("invalid_day");
  }

  if (!month || month < 1 || month > 12) {
    errors.add("invalid_month");
  } else if (month === 2) {
    if ((isLeapYear(year) && day > 29) || (!isLeapYear(year) && day > 28)) {
      errors.add("invalid_day");
    }
  } else if ([4, 6, 9, 11].includes(month) && day > 30) {
    errors.add("invalid_day");
  }

  if (
    !year ||
    year < new Date().getFullYear() - 200 ||
    year > new Date().getFullYear() + 200
  ) {
    errors.add("invalid_year");
  }

  // If day, month, and year are present and valid, check for past date
  if (
    !errors.has("invalid_day") &&
    !errors.has("invalid_month") &&
    !errors.has("invalid_year")
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (inputDate <= today) {
      errors.add("past_date");
    }

    if (inputDate.toString() === "Invalid Date") {
      errors.add("invalid_date");
    }
  }

  if (errors.size) {
    // Return the most relevant error message
    if (
      errors.has("invalid_day") &&
      errors.has("invalid_month") &&
      errors.has("invalid_year")
    ) {
      return "Date is invalid.";
    }
    if (errors.has("past_date")) {
      return "Date should be in the future.";
    }
    if (errors.has("invalid_day") && errors.has("invalid_month")) {
      return "Day and month are invalid.";
    }
    if (errors.has("invalid_day") && errors.has("invalid_year")) {
      return "Day and year are invalid.";
    }
    if (errors.has("invalid_month") && errors.has("invalid_year")) {
      return "Month and year are invalid.";
    }
    if (errors.has("invalid_day")) {
      return "Day is invalid.";
    }
    if (errors.has("invalid_month")) {
      return "Month is invalid.";
    }
    if (errors.has("invalid_year")) {
      return "Year is invalid.";
    }
  }

  return ""; // If no errors
}

const validateRequestBody = (step: string, body: RequestBody): string => {
  let errorMessage = "";

  switch (step) {
    case "date": {
      const dateStep: DateStep = body as DateStep;
      errorMessage = validateDate(
        dateStep.day ?? 0,
        dateStep.month ?? 0,
        dateStep.year ?? 0,
      );
      break;
    }

    default:
      errorMessage = "";
  }

  return errorMessage;
};

const extractFormData = (stepData: Step, body: RequestBody) => {
  // Return something that will get set in the 'value' key of the form step
  // Will need to something different depending on whether the input is a radio button
  //  or text field or checkbox etc.
  // All simple radio button-style forms:
  // (As long as the radio group has a name the same as the step id

  const radioFields = ["data-type", "data-access"];
  if (radioFields.includes(stepData.id)) {
    return body[stepData.id];
  }

  const textFields = ["impact", "data-subjects", "data-required"]; // add step names here if using textarea

  if (stepData.id === "project-aims") {
    return {
      aims: body["aims"] || "",
      explanation: body["explanation"] || "",
    };
  } else {
    if (textFields.includes(stepData.id)) {
      return body[stepData.id];
    }
  }

  if (stepData.id === "date") {
    return {
      day: body.day || null,
      month: body.month || null,
      year: body.year || null,
    };
  }

  if (stepData.id === "benefits") {
    return {
      "decision-making": {
        explanation: body["decision-making"],
        checked: body["benefits"]?.includes("decision-making"),
      },
      "service-delivery": {
        explanation: body["service-delivery"],
        checked: body["benefits"]?.includes("service-delivery"),
      },
      "benefit-people": {
        explanation: body["benefit-people"],
        checked: body["benefits"]?.includes("benefit-people"),
      },
      "allocate-and-evaluate-funding": {
        explanation: body["allocate-and-evaluate-funding"],
        checked: body["benefits"]?.includes("allocate-and-evaluate-funding"),
      },
      "social-economic-trends": {
        explanation: body["social-economic-trends"],
        checked: body["benefits"]?.includes("social-economic-trends"),
      },
      "needs-of-the-public": {
        explanation: body["needs-of-the-public"],
        checked: body["benefits"]?.includes("needs-of-the-public"),
      },
      "statistical-information": {
        explanation: body["statistical-information"],
        checked: body["benefits"]?.includes("statistical-information"),
      },
      "existing-research-or-statistics": {
        explanation: body["existing-research-or-statistics"],
        checked: body["benefits"]?.includes("existing-research-or-statistics"),
      },
      "something-else": {
        explanation: body["something-else"],
        checked: body["benefits"]?.includes("something-else"),
      },
    };
  }

  // Other input types can go here
  return;
};

export { extractFormData, validateDate, validateRequestBody };
