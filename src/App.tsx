import "./App.css";
import GenerationForm from "@/components/GenerationForm/GenerationForm";
import { generationQuestions } from "@/components/GenerationForm/QuestionLoader/questions";
import PreviewWindow from "@/components/PreviewWindow/PreviewWindow";
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
import { Analytics } from "@vercel/analytics/react";

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
  const [view, setView] = useState<"form" | "results">("form");
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
      await new Promise((r) => setTimeout(r, 1000));
      setView("results");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function downloadZip() {
    const zip = new JSZip();
    const docHtml = `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Figma Export</title>\n    <link rel="stylesheet" href="styles.css" />\n  </head>\n  <body>\n${html}\n  </body>\n</html>`;
    zip.file("index.html", docHtml);
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
      <Analytics />
      {view === "form" ? (
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
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium">Conversion Preview</h1>
              <h2 className="text-muted-foreground text-sm">
                Figma API {`->`} HTML/CSS
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setView("form")}>
                Restart
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
