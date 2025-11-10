import "./App.css";
import GenerationForm from "@/components/GenerationForm";
import { generationQuestions } from "@/components/QuestionLoader/questions";

function App() {
  const initialValues = {
    apiKey: import.meta.env?.VITE_FIGMA_API_KEY || "",
    fileUrl: import.meta.env?.VITE_FIGMA_FILE_URL || "",
  };
  return (
    <main className="min-h-screen bg-background text-foreground">
      <GenerationForm
        questions={generationQuestions}
        initialValues={initialValues}
        onSubmit={(answers) => {
          console.log("Submitted answers", answers);
        }}
      />
    </main>
  );
}

export default App;
