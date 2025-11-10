import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionLoader } from "./QuestionLoader/QuestionLoader";
import LoadingScreen from "@/components/LoadingScreen";
import type { QuestionSchema } from "./QuestionLoader/types";
import { useGenerationForm } from "./useGenerationForm";

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
  validateSchema?: Parameters<typeof useGenerationForm>[0]["validateSchema"];
  isSubmitting?: boolean;
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
  isSubmitting = false,
}: GenerationFormProps) {
  const {
    total,
    step,
    direction,
    answers,
    error,
    q,
    progress,
    currentError,
    handleChange,
    handlePrev,
    handleNext,
  } = useGenerationForm({
    questions,
    initialValues,
    validateSchema,
    onSubmit,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-x-0 top-0 z-50">
        <Progress value={isSubmitting ? 100 : progress} />
      </div>
      <header className="w-full px-6 flex items-end justify-between gap-4 pt-6">
        <div className="min-w-0">
          <h1 className="text-lg font-medium">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {total > 0
            ? isSubmitting
              ? `Step ${total} / ${total}`
              : `Step ${step + 1} / ${total}`
            : null}
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-6">
        <div className="w-full max-w-2xl space-y-4">
          <AnimatePresence mode="wait" initial={false}>
            {isSubmitting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <LoadingScreen message="Generating your preview…" />
              </motion.div>
            ) : q ? (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
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
          {!isSubmitting && error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {!isSubmitting ? (
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
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default GenerationForm;
