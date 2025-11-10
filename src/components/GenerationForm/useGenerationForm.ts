/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { z } from "zod";
import type { QuestionSchema } from "./QuestionLoader/types";

export type UseGenerationFormOptions = {
  questions: QuestionSchema[];
  initialValues?: Record<string, string>;
  validateSchema?: z.ZodTypeAny;
  onSubmit?: (answers: Record<string, string>) => void;
};

export function useGenerationForm({
  questions,
  initialValues,
  validateSchema,
  onSubmit,
}: UseGenerationFormOptions) {
  const total = questions.length;
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>(
    initialValues || {}
  );
  const [error, setError] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<1 | -1>(1);

  const q = questions[step];
  const progress = total > 0 ? Math.round((step / total) * 100) : 0;

  function validateField(
    id: string,
    value: string,
    type: QuestionSchema["type"],
    required?: boolean
  ) {
    if (validateSchema && (validateSchema as any)?.shape?.[id]) {
      const res = (validateSchema as any).shape[id].safeParse(value);
      if (!res.success)
        return res.error.issues?.[0]?.message || "Invalid value";
      return null;
    }
    const v = (value || "").trim();
    if (required && v.length === 0) return "This field is required";
    if (type === "url" && v.length > 0 && !/^https?:\/\//i.test(v))
      return "Enter a valid URL";
    return null;
  }

  const currentValue = q ? answers[q.id] || "" : "";
  const currentError = q
    ? validateField(q.id, currentValue, q.type, q.required)
    : null;

  function handleChange(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setError(null);
  }

  function handlePrev() {
    setError(null);
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  function handleNext() {
    if (!q) return;
    const err = validateField(q.id, answers[q.id] || "", q.type, q.required);
    if (err) {
      setError(err);
      return;
    }
    if (step < total - 1) {
      setDirection(1);
      setStep((s) => Math.min(total - 1, s + 1));
      return;
    }
    if (validateSchema) {
      const parsed = validateSchema.safeParse(answers);
      if (!parsed.success) {
        const issue = parsed.error.issues?.[0];
        setError(issue?.message || "Please correct the errors");
        return;
      }
    }
    onSubmit?.(answers);
  }

  return {
    total,
    step,
    direction,
    answers,
    error,
    q,
    progress,
    currentValue,
    currentError,
    setError,
    handleChange,
    handlePrev,
    handleNext,
  } as const;
}
