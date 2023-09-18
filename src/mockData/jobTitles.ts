interface SampleJobTitle {
  value: string;
  text: string;
}

type SampleJobTitles = Record<string, SampleJobTitle>;

export const sampleJobTitles: SampleJobTitles = {
  lawyer: { value: "lawyer", text: "Lawyer" },

  "data-protection-officer": {
    value: "data-protection-officer",
    text: "Data protection officer",
  },
};
