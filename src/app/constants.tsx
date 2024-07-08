import DEFAULT_USER_IMAGE from "@/images/default-user-picture.jpg";

export const API_BASE_URL = 'https://us-central1-mkr-it.cloudfunctions.net/api';

export interface OfferedService {
  id:
  | "photographer"
  | "videographer"
  | "drone_photographer"
  | "home_stager"
  | "inspector"
  | "appraiser"
  | "title_company"
  | "mortgage_lender"
  | "real_state_attorney"
  | "insurance_agent"
  | "moving_company"
  | "landscaper"
  | "contractor" // do we need this?
  | "interior_designer"
  | "cleaning_service"
  | "marketing_agency"
  | "signsetter"
  | "handyman"
  | "marketing"
  | "online_course";
  name: string;
  fields: Record<string, any>[];
}

export const OFFERED_SERVICES: OfferedService[] = [
  {
    name: "Photographer",
    id: "photographer",
    fields: [
      {
        id: "portfolio",
        type: "file",
        label: "Portfolio",
        description:
          "Provide a portfolio in PDF format",
        placeholder: "https://www.example.com",
      },
      {
        id: "equipment",
        type: "text",
        label: "Equipment",
        description: "List the equipment you use",
        placeholder: "Canon EOS 5D Mark IV",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a photographer? (years)",
        placeholder: "5",
        parse: "number",
      },
      {
        id: "editing_skills",
        type: "select",
        label: "Editing Skills",
        description: "How skilled are you at editing photos?",
        options: [
          {
            value: "none",
            label: "None",
          },
          {
            value: "basic",
            label: "Basic",
          },
          {
            value: "intermediate",
            label: "Intermediate",
          },
          {
            value: "advanced",
            label: "Advanced",
          },
        ],
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    name: "Videographer",
    id: "videographer",
    fields: [
      {
        id: "portfolio",
        type: "file",
        label: "Portfolio",
        description:
          "Provide a portfolio in PDF format",
        placeholder: "https://www.example.com",
      },
      {
        id: "equipment",
        type: "text",
        label: "Equipment",
        description: "List the equipment you use",
        placeholder: "Canon EOS 5D Mark IV",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a videographer? (years)",
        placeholder: "5",
      },
      {
        id: "editing_skills",
        type: "select",
        label: "Editing Skills",
        description: "How skilled are you at editing videos?",
        options: [
          {
            value: "none",
            label: "None",
          },
          {
            value: "basic",
            label: "Basic",
          },
          {
            value: "intermediate",
            label: "Intermediate",
          },
          {
            value: "advanced",
            label: "Advanced",
          },
        ],
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    name: "Drone Photographer",
    id: "drone_photographer",
    fields: [
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a drone photographer? (years)",
        placeholder: "5",
        parse: "number",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "ffa_certified",
        type: "checkbox",
        label: "FFA Certified",
        description: "Are you FFA certified?",
        parse: "boolean",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    name: "Home Stager",
    id: "home_stager",
    fields: [
      {
        id: "portfolio",
        type: "file",
        label: "Portfolio",
        description:
          "Provide a portfolio in PDF format",
        placeholder: "https://www.example.com",
      },
      {
        id: "design_qualifications",
        type: "text",
        label: "Design Qualifications",
        description: "What are your qualifications?",
        placeholder: "5",
        parse: "number",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
    ],
  },
  {
    id: "inspector",
    name: "Inspector",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "InterNACHI, ASHI, NAHI",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been an inspector? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "appraiser",
    name: "Appraiser",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been an appraiser? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "title_company",
    name: "Title Company",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "title_search",
        type: "checkbox",
        label: "Title Search",
        description: "Do you provide title search services?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "mortgage_lender",
    name: "Mortgage Lender",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a mortgage lender? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "real_state_attorney",
    name: "Real State Attorney",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a real state attorney? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "insurance_agent",
    name: "Insurance Agent",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been an insurance agent? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "moving_company",
    name: "Moving Company",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a moving company? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "handyman",
    name: "Handyman",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a handyman? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "landscaper",
    name: "Landscaper",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a landscaper? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  // {
  //   id: "contractor",
  //   name: "Contractor",
  //   fields: [
  //     {
  //       id: "certifications",
  //       type: "text",
  //       label: "Certifications",
  //       description: "Which certifications do you have?",
  //       placeholder: "ALTA, NALTEA",
  //     },
  //     {
  //       id: "experience",
  //       type: "text",
  //       label: "Experience",
  //       description: "How long have you been a contractor? (years)",
  //       placeholder: "4",
  //       parse: "number",
  //     },
  //     {
  //       id: "sample_report",
  //       type: "text",
  //       label: "Sample Report",
  //       description: "Provide a link to a sample report",
  //       placeholder: "https://www.example.com",
  //     },
  //     {
  //       id: "pricing",
  //       type: "text",
  //       label: "Pricing",
  //       placeholder: "100",
  //       description: "What is your pricing for your services? (value per hour)",
  //       parse: "number",
  //     },
  //     {
  //       id: "insurance",
  //       type: "checkbox",
  //       label: "Insurance",
  //       description: "Do you have insurance?",
  //       parse: "boolean",
  //     },
  //   ],
  // },
  {
    name: "Online Course",
    id: "online_course",
    fields: [
      {
        id: "portfolio",
        type: "file",
        label: "Portfolio",
        description:
          "Provide a portfolio in PDF format",
        placeholder: "https://www.example.com",
      },
      {
        id: "course_qualifications",
        type: "text",
        label: "Qualifications",
        description: "What are your qualifications?",
        placeholder: "Qualified in ...",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
    ],
  },
  {
    id: "interior_designer",
    name: "Interior designer",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a interior designer? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "portfolio",
        type: "file",
        label: "Portfolio",
        description:
          "Provide a portfolio in PDF format",
        placeholder: "https://www.example.com",
      },
      {
        id: "design_skills",
        type: "select",
        label: "Design Skills",
        description: "What is your level of expertise in interior design?",
        options: [
          {
            value: "none",
            label: "None",
          },
          {
            value: "basic",
            label: "Basic",
          },
          {
            value: "intermediate",
            label: "Intermediate",
          },
          {
            value: "advanced",
            label: "Advanced",
          },
        ],
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "cleaning_service",
    name: "Cleaning Service",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a cleaning service? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "signsetter",
    name: "Sign setter",
    fields: [
      {
        id: "certifications",
        type: "text",
        label: "Certifications",
        description: "Which certifications do you have?",
        placeholder: "ALTA, NALTEA",
      },
      {
        id: "experience",
        type: "text",
        label: "Experience",
        description: "How long have you been a sign setter? (years)",
        placeholder: "4",
        parse: "number",
      },
      {
        id: "sample_report",
        type: "text",
        label: "Sample Report",
        description: "Provide a link to a sample report",
        placeholder: "https://www.example.com",
      },
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Agency",
    fields: [
      {
        id: "pricing",
        type: "text",
        label: "Pricing",
        placeholder: "100",
        description: "What is your pricing for your services? (value per hour)",
        parse: "number",
      },
      {
        id: "insurance",
        type: "checkbox",
        label: "Insurance",
        description: "Do you have insurance?",
        parse: "boolean",
      },
    ],
  },
];

export { DEFAULT_USER_IMAGE };
