import "./App.css";
import GenerationForm from "@/components/GenerationForm";
import { generationQuestions } from "@/components/QuestionLoader/questions";
import { z } from "zod";

function App() {
  const initialValues = {
    apiKey: import.meta.env?.VITE_FIGMA_API_KEY || "",
    fileUrl: import.meta.env?.VITE_FIGMA_FILE_URL || "",
  };
  const validateSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    fileUrl: z.string().url("Enter a valid URL"),
  });
  return (
    <main className="min-h-screen bg-background text-foreground">
      <GenerationForm
        questions={generationQuestions}
        initialValues={initialValues}
        validateSchema={validateSchema}
        onSubmit={(answers) => {
          console.log("Submitted answers", answers);
        }}
      />
    </main>
  );
}

export default App;
