/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  fetchFigmaFileFromEnv,
  fetchFigmaFile,
  normalizeFile,
  createIndex,
  generateFromIndex,
} from "./lib/figma";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [apiKey, setApiKey] = useState<string>(
    import.meta.env?.VITE_FIGMA_API_KEY || ""
  );
  const [fileUrl, setFileUrl] = useState<string>(
    import.meta.env?.VITE_FIGMA_FILE_URL || ""
  );

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const srcDoc = useMemo(() => {
    if (!html) return "";
    const base = `html,body{margin:0;padding:0;background:transparent;}`;
    const cssText = `<style>${base}</style><style>${css}</style>`;
    const script = `
      <script>
        (function(){
          function send(){
            try{
              var h = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight
              );
              parent.postMessage({ __figmaPreviewHeight: h }, '*');
            }catch(e){}
          }
          new ResizeObserver(send).observe(document.body);
          window.addEventListener('load', send);
          setTimeout(send, 0);
        })();
      <\/script>`;
    return `<!DOCTYPE html><html><head><meta charset=\"utf-8\">${cssText}</head><body>${html}${script}</body></html>`;
  }, [html, css]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as any;
      if (data && typeof data.__figmaPreviewHeight === "number") {
        const h = Math.max(0, Math.round(data.__figmaPreviewHeight));
        if (iframeRef.current) iframeRef.current.style.height = `${h}px`;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const file =
        apiKey && fileUrl
          ? await fetchFigmaFile({ apiKey, fileUrlOrKey: fileUrl })
          : await fetchFigmaFileFromEnv();
      const norm = normalizeFile(file);
      const index = createIndex(norm);
      const { html, css } = generateFromIndex(index);
      setHtml(html);
      setCss(css);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Figma → HTML/CSS Preview</h1>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <input
          placeholder="VITE_FIGMA_API_KEY"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="min-w-[220px] px-3 py-2 rounded border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-400"
        />
        <input
          placeholder="VITE_FIGMA_FILE_URL"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className="min-w-[220px] flex-1 px-3 py-2 rounded border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 text-white text-sm font-medium"
        >
          {loading ? "Generating..." : "Generate from Figma"}
        </button>
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <h2 className="text-sm font-medium mb-1">HTML</h2>
          <pre className="font-mono text-xs bg-zinc-900 text-zinc-200 p-3 rounded max-h-96 overflow-auto whitespace-pre-wrap">
            {html}
          </pre>
          <h2 className="text-sm font-medium mt-3 mb-1">CSS</h2>
          <pre className="font-mono text-xs bg-zinc-900 text-zinc-200 p-3 rounded max-h-96 overflow-auto whitespace-pre-wrap">
            {css}
          </pre>
        </div>
        <div>
          <h2 className="text-sm font-medium mb-1">Preview</h2>
          <iframe
            title="preview"
            ref={iframeRef}
            srcDoc={srcDoc}
            className="w-full border border-zinc-700 rounded bg-white"
            style={{ height: html ? 0 : undefined }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
