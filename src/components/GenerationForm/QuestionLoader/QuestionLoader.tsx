import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { QuestionSchema, QuestionLoaderProps } from "./types";

export function QuestionLoader({
  question,
  value,
  onChange,
  error,
  disabled,
  inputClassName,
  onPrev,
  onNext,
  onCancel,
  isFirstStep,
  isLastStep,
  prevLabel,
  nextLabel,
  submitLabel,
}: QuestionLoaderProps) {
  const inputId = React.useId();
  const name = question.id;
  const hasArrayErrors = Array.isArray(error);
  const errorArray = hasArrayErrors
    ? (error as Array<{ message?: string } | undefined>)
    : error
    ? [{ message: String(error) }]
    : undefined;

  return (
    <div className="space-y-4">
      <Field data-invalid={!!error}>
        <FieldLabel>
          <Label htmlFor={inputId}>
            {question.label}
            {question.required ? " *" : ""}
          </Label>
        </FieldLabel>
        {question.description ? (
          <FieldDescription>{question.description}</FieldDescription>
        ) : null}

        <FieldContent>
          {renderControl({
            question,
            id: inputId,
            name,
            value: value ?? "",
            disabled: !!disabled,
            onChange,
            inputClassName,
            invalid: !!error,
          })}
          <FieldError errors={errorArray} />
        </FieldContent>
      </Field>

      <div className="flex items-center justify-between pt-2 pb-6">
        {isFirstStep ? (
          onCancel ? (
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          ) : (
            <div />
          )
        ) : (
          <Button variant="outline" onClick={onPrev}>
            {prevLabel || "Back"}
          </Button>
        )}
        <Button onClick={onNext}>
          {isLastStep ? submitLabel || "Submit" : nextLabel || "Next"}
        </Button>
      </div>
    </div>
  );
}

function renderControl({
  question,
  id,
  name,
  value,
  disabled,
  onChange,
  inputClassName,
  invalid,
}: {
  question: QuestionSchema;
  id: string;
  name: string;
  value: string;
  disabled: boolean;
  onChange: (id: string, value: string) => void;
  inputClassName?: string;
  invalid?: boolean;
}) {
  const inputType =
    question.type === "password"
      ? "password"
      : question.type === "url"
      ? "url"
      : "text";
  return (
    <Input
      id={id}
      name={name}
      type={inputType}
      value={value}
      disabled={disabled}
      placeholder={question.placeholder}
      aria-invalid={invalid ? true : undefined}
      onChange={(e) => onChange(name, e.target.value)}
      className={inputClassName}
    />
  );
}

export default QuestionLoader;
