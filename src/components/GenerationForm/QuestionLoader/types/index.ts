export type QuestionSchema = {
  id: string;
  type: "text" | "password" | "url";
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
};

export type QuestionValue = string;

export type QuestionLoaderProps = {
  question: QuestionSchema;
  value?: QuestionValue;
  onChange: (id: string, value: QuestionValue) => void;
  error?: string | Array<{ message?: string } | undefined>;
  disabled?: boolean;
  inputClassName?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
};
