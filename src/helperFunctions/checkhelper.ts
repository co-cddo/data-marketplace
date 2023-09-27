// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const replace: any = {
  "data-type": {
    data: {
      personal: "Personal data",
      special: "Special category data",
      none: "Neither personal or special category data",
    },
    type: "checked",
  },
  "data-subjects": { type: "string" },
  "project-aims": { type: "object" },
  "data-required": { type: "string" },
  benefits: {
    data: {
      "decision-making": "Evidence for public policy decision-making",
      "service-delivery": "Evidence for public service delivery",
      "benefit-people":
        "Evidence for decisions which are likely to benefit people in the UK",
      "allocate-and-evaluate-funding":
        "Evidence for decisions about how to allocate and evaluate funding",
      "social-economic-trends": "Help understand social or economic trends",
      "needs-of-the-public": "Help understand the needs of the public",
      "statistical-information": "Improve existing statistical information",
      "existing-research-or-statistics":
        "Challenge or validate existing research or statistics",
      "something-else": "Something else",
    },
    type: "checked",
  },
  "data-access": {
    data: {
      no: { res: "No", attach: "" },
      yes: { res: "Yes", attach: "other-orgs", title: "Organisations:" },
    },
    type: "list",
  },
  impact: { type: "string" },
  date: { type: "date" },
  "legal-power": {
    data: {
      yes: "Yes",
      no: "No",
      "we-dont-know": "We don't know",
    },
    type: "checked",
  },
  "legal-gateway": {
    data: {
      yes: "Yes",
      other: "We have other legal grounds for acquiring this data",
      "we-dont-know": "We don't know",
    },
    type: "checked",
  },
  "legal-review": {
    data: {
      yes: "Yes",
      no: "No",
    },
    type: "radio",
  },
  "lawful-basis-personal": {
    data: {
      "public-task": "Public Task",
      "legal-obligation": "Legal obligation",
      contract: "Contract",
      "legitimate-interests": "Legitimate interests",
      consent: "Consent",
      "vital-interest": "Vital interests",
      "law-enforcement": "Law enforcement",
    },
    type: "checked",
  },
  "lawful-basis-special": {
    data: {
      "reasons-of-public-interest":
        "Reasons of substantial public interest (with a basis in law)",
      "legal-claim-or-judicial-acts": "Legal claims or judicial acts",
      "public-health": "Public health (with a basis in law)",
      "health-or-social-care": "Health or social care (with a basis in law)",
      "social-employment-security-and-protection":
        "Employment, social security and social protection (if authorised by law)",
      "vital-interests": "Vital interests",
      "explicit-consent": "Explicit consent",
      "public-by-data-subject": "Made public by the data subject",
      "archiving-researching-statistics":
        "Archiving, research and statistics (with a basis in law)",
      "not-for-profit-bodies": "Not-for-profit bodies",
    },
    type: "checked",
  },
  "lawful-basis-special-public-interest": {
    data: {
      statutory: "Statutory and government purposes",
      administration: "Administration of justice and parliamentary purposes",
      equality: "Equality of opportunity or treatment",
      "preventing-detecting": "Preventing or detecting unlawful acts",
      protecting: "Protecting the public",
      "regulatory-requirements": "Regulatory requirements",
      journalism: "Journalism, academia, art and literature",
      "preventing-fraud": "Preventing fraud",
      suspicion: "Suspicion of terrorist financing or money laundering",
      support:
        "Support for individuals with a particular disability or medical condition",
      counselling: "Counselling",
      "safeguarding-children":
        "Safeguarding of children and individuals at risk",
      "safeguarding-economic":
        "Safeguarding of economic well-being of certain individuals",
      insurance: "Insurance",
      "occupational-pensions": "Occupational pensions",
      "political-parties": "Political parties",
      elected: "Elected representatives responding to requests",
      disclosure: "Disclosure to elected representatives",
      informing: "Informing elected representatives about prisoners",
      "legal-judgments": "Publication of legal judgments",
      "anti-doping": "Anti-doping in sport",
      standards: "Standards of behaviour in sport",
    },
    type: "checked",
  },
  "data-travel": {
    data: {
      no: { res: "No", attach: "" },
      yes: { res: "Yes", attach: "data-travel-location", title: "Countries:" },
    },
    type: "list",
  },
  role: {
    data: {
      controller: "Controller",
      joint: "Joint controller",
      processor: "Processor",
      "don't know": "I don't know",
    },
    type: "radio",
  },
  "protection-review": {
    data: {
      yes: "Yes",
      no: "No",
    },
    type: "radio",
  },
  delivery: {
    data: {
      "third-party": "Through secure third-party software",
      physical: "Physical delivery",
      something: "Something else",
    },
    type: "checked",
  },
  format: {
    data: {
      csv: "CSV file",
      sql: "SQL dataset",
      something: "Something else",
    },
    type: "checked",
  },
  "security-review": {
    data: {
      yes: "Yes",
      no: "No",
    },
    type: "radio",
  },
  disposal: { type: "string" },
};

export const month : {[k: string]: string} = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December"
}

export const dayNumber : {[k: string]: number} = {
  "01": 1,
  "02": 2,
  "03": 3,
  "04": 4,
  "05": 5,
  "06": 6,
  "07": 7,
  "08": 8,
  "09": 9,
}
