import * as React from "react";
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
}: GenerationFormProps) {
  const total = questions.length;
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>(
    initialValues || {}
  );
  const [error, setError] = React.useState<string | null>(null);

  const q = questions[step];
  const progress = total > 0 ? Math.round((step / total) * 100) : 0;

  function validate(
    _id: string,
    value: string,
    type: QuestionSchema["type"],
    required?: boolean
  ) {
    const v = (value || "").trim();
    if (required && v.length === 0) return "This field is required";
    if (type === "url" && v.length > 0 && !/^https?:\/\//i.test(v))
      return "Enter a valid URL";
    return null;
  }

  const currentValue = q ? answers[q.id] || "" : "";
  const currentError = q
    ? validate(q.id, currentValue, q.type, q.required)
    : null;

  function handleChange(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setError(null);
  }

  function handlePrev() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function handleNext() {
    if (!q) return;
    const err = validate(q.id, answers[q.id] || "", q.type, q.required);
    if (err) {
      setError(err);
      return;
    }
    if (step < total - 1) {
      setStep((s) => Math.min(total - 1, s + 1));
      return;
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
          {q ? (
            <QuestionLoader
              question={q}
              value={answers[q.id] || ""}
              onChange={handleChange}
              error={error || currentError || undefined}
              inputClassName="h-12 text-base"
            />
          ) : null}
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
