interface SampleRole {
    value: string
    text: string
}

type SampleRoles = Record<string, SampleRole>

export const sampleRoles: SampleRoles = {
    lawyer: { value: "lawyer", text: "Lawyer" },

    "data-protection-officer": {
        value: "data-protection-officer",
        text: "Data protection officer",
    },
};
