import type { QuestionSchema } from "./types";

export const generationQuestions: QuestionSchema[] = [
  {
    id: "apiKey",
    type: "password",
    label: "Figma API Key",
    description: "Personal access token used to fetch the Figma file",
    placeholder: "figd_...",
    required: true,
  },
  {
    id: "fileUrl",
    type: "url",
    label: "Figma File URL",
    description: "Link to the Figma file or design URL",
    placeholder: "https://www.figma.com/file/<KEY>/...",
    required: true,
  },
];

export type GenerationAnswers = {
  apiKey: string;
  fileUrl: string;
};
