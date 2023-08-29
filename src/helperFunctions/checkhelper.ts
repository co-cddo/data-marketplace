export const titles = [
    {name: 'Purpose of the data share section', 
    steps: [
      'data-type',
      'data-subjects',
      'project-aims',
      'data-required',
      'benefits',
      'data-access',
      'impact',
      'date'
    ]},
    {
      name: 'Legal power and gateway',
      steps: [ 'legal-power', 'legal-gateway', 'legal-review' ]
    },
    {
      name: 'Data protection',
      steps: [
        'lawful-basis-personal',
        'lawful-basis-special',
        'data-travel',
        'role',
        'protection-review'
        ]
    },
    {
      name: 'Data governance, security and technology',
      steps: [ 'delivery', 'format', 'disposal', 'security-review' ]
    }
    
  ]
  interface replaceAnswerType {
    [key: string]: unknown 
  }
  interface replaceType {
    [key: string]: replaceAnswerType
  }
  
  
  
 export const replace: replaceType = {
    role: {
      controller: "Controler",
      joint: "Joint controller",
      processor: "Processor",
      "don't know": "I don't know"
    },
    "legal-gateway": {
      yes: "Yes, there is a legal gateway for acquiring this data",
      other: "We have other legal grounds for acquiring this data",
      "we-dont-know": "We don't know"
    },
    "legal-review": {
      yes: "Yes",
      no: "No"
    },
    "legal-power": {
      yes: "Yes, we believe we have the legal power to do this",
      no: "No, we don't have the legal power to request this",
      "we-dont-know": "We don't know"
    },
    format: {
      csv: "CSV file",
      sql: "SQL dataset",
      something: "Something else"
    },
    delivery: {
      "third-party": "Through secure third-party software",
      physical: "Something else",
      something: "Something else"
    },
    "data-type": {
      personal: "Personal data",
      special: "Special category data",
      none: "Anonymised data"
    },
    "data-travel": {
      no: "No, the data will only travel through the UK.",
      yes: "Yes, it will leave the UK"
    },
    "data-access": {
      no: "No, only my organisation needs access",
      yes: "Yes, we are collaborating with other organisations"
    },
    "lawful-basis-special": {
      "reasons-of-public-interest": "Reasons of substantial public interest (with a basis in law)",
      "legal-claim-or-judicial-acts": "Legal claims or judicial acts",
      "public-health": "Public health (with a basis in law)",
      "health-or-social-care": "Health or social care (with a basis in law)",
      "social-employment-security-and-protection": "Employment, social security and social protection (if authorised by law)",
      "vital-interests": "Vital interests",
      "explicit-consent": "Explicit consent",
      "public-by-data-subject": "Made public by the data subject",
      "archiving-researching-statistics": "Archiving, research and statistics (with a basis in law)",
      "not-for-profit-bodies": "Not-for-profit bodies"
    },
    "lawful-basis-personal": {
      "public-task": "Public Task",
      "legal-obligation": "Legal obligation",
      contract: "Contract",
      "legitimate-interests": "Legitimate interests",
      consent: "Consent",
      "vital-interest": "Vital interests",
      "law-enforcement": "Law enforcement"
    },
    benefits: {
      "decision-making": "Evidence for public policy decision-making",
      "service-delivery": "Evidence for public service delivery",
      "benefit-people": "Evidence for decisions which are likely to benefit people in the UK",
      "allocate-and-evaluate-funding": "Evidence for decisions about how to allocate and evaluate funding",
      "social-economic-trends": "Help understand social or economic trends",
      "needs-of-the-public": "Help understand the needs of the public",
      "statistical-information": "Improve existing statistical information",
      "existing-research-or-statistics": "Challenge or validate existing research or statistics",
      "something-else": "Something else"
    }
  }