/* eslint-disable no-empty */
/* eslint-disable no-useless-escape */
import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type PreviewWindowProps = {
  html: string;
  css: string;
  height?: string;
};

export default function PreviewWindow({
  html,
  css,
  height = "70vh",
}: PreviewWindowProps) {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const srcDoc = React.useMemo(() => {
    const base = `html,body{margin:0;padding:0;background:#1e1e1e;}`;
    return `<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>${base}</style><style>${css}</style></head><body>${html}</body></html>`;
  }, [html, css]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <div className="my-16">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-lg border bg-card"
        style={{ height }}
      >
        <ResizablePanel defaultSize={55} minSize={30} className="bg-background">
          <div className="h-full w-full p-2">
            <iframe
              ref={iframeRef}
              title="preview"
              srcDoc={srcDoc}
              className="h-full w-full rounded-md"
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={30} className="bg-background">
          <div className="h-full w-full p-2">
            <Tabs defaultValue="html" className="h-full">
              <div className="mb-2 flex items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(html)}
                      >
                        Copy HTML
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy HTML</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(css)}
                      >
                        Copy CSS
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy CSS</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <TabsContent value="html" className="h-[calc(100%-2.5rem)]">
                <ScrollArea className="h-full rounded-md border p-2">
                  <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {html}
                  </pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="css" className="h-[calc(100%-2.5rem)]">
                <ScrollArea className="h-full rounded-md border p-2">
                  <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {css}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
