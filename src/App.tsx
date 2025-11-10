import "./App.css";
import GenerationForm from "@/components/GenerationForm";
import { generationQuestions } from "@/components/GenerationForm/QuestionLoader/questions";
import PreviewWindow from "@/components/PreviewWindow";
import JSZip from "jszip";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  fetchFigmaFile,
  fetchFigmaFileFromEnv,
  normalizeFile,
  createIndex,
  generateFromIndex,
} from "./lib/figma";

function App() {
  const initialValues = {
    apiKey: import.meta.env?.VITE_FIGMA_API_KEY || "",
    fileUrl: import.meta.env?.VITE_FIGMA_FILE_URL || "",
  };
  const validateSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    fileUrl: z.string().url("Enter a valid URL"),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<"input" | "results">("input");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");

  async function handleSubmit(answers: Record<string, string>) {
    setIsSubmitting(true);
    try {
      const { apiKey, fileUrl } = answers as {
        apiKey: string;
        fileUrl: string;
      };
      const file =
        apiKey && fileUrl
          ? await fetchFigmaFile({ apiKey, fileUrlOrKey: fileUrl })
          : await fetchFigmaFileFromEnv();
      const norm = normalizeFile(file);
      const index = createIndex(norm);
      const { html, css } = generateFromIndex(index, { cssFormat: "pretty" });
      setHtml(html);
      setCss(css);
      await new Promise((r) => setTimeout(r, 2000));
      setView("results");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function downloadZip() {
    const zip = new JSZip();
    zip.file("index.html", html);
    zip.file("styles.css", css);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {view === "input" ? (
        <GenerationForm
          questions={generationQuestions}
          initialValues={initialValues}
          validateSchema={validateSchema}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <motion.div
          className="px-6 py-6 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Preview</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setView("input")}>
                Back to form
              </Button>
              <Button onClick={downloadZip}>Download .zip</Button>
            </div>
          </div>
          <PreviewWindow html={html} css={css} height="75vh" />
        </motion.div>
      )}
    </main>
  );
}

export default App;
