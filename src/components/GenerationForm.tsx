/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { z } from "zod";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionLoader } from "@/components/QuestionLoader/QuestionLoader";
import type { QuestionSchema } from "@/components/QuestionLoader/types";

export type GenerationFormProps = {
  questions: QuestionSchema[];
  initialValues?: Record<string, string>;
  title?: string;
  description?: string;
  nextLabel?: string;
  prevLabel?: string;
  submitLabel?: string;
  onSubmit?: (answers: Record<string, string>) => void;
  onCancel?: () => void;
  validateSchema?: z.ZodTypeAny;
};

export function GenerationForm({
  questions,
  initialValues,
  title = "Generate from Figma",
  description = "Enter your credentials to continue",
  nextLabel = "Next",
  prevLabel = "Back",
  submitLabel = "Generate",
  onSubmit,
  onCancel,
  validateSchema,
}: GenerationFormProps) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-x-0 top-0 z-50">
        <Progress value={progress} />
      </div>
      <header className="w-full px-6 flex items-end justify-between gap-4 pt-6">
        <div className="min-w-0">
          <h1 className="text-lg font-medium">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {total > 0 ? `Step ${step + 1} / ${total}` : null}
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-6">
        <div className="w-full max-w-2xl space-y-4">
          <AnimatePresence mode="wait" initial={false}>
            {q ? (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <QuestionLoader
                  question={q}
                  value={answers[q.id] || ""}
                  onChange={handleChange}
                  error={error || currentError || undefined}
                  inputClassName="h-12 text-base"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex items-center justify-between pt-2 pb-6">
            {step > 0 ? (
              <Button variant="outline" onClick={handlePrev}>
                {prevLabel}
              </Button>
            ) : onCancel ? (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext}>
              {step < total - 1 ? nextLabel : submitLabel}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GenerationForm;
