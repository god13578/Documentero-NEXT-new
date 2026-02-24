"use client";

import { useParams } from "next/navigation";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import FieldSidebar from "./FieldSidebar";
import TemplateEditor from "./TemplateEditor";

type Props = {
  templateId?: string;
};

export default function BuilderShell({ templateId }: Props) {
  const params = useParams();
  const resolvedTemplateId = templateId ?? (params?.id as string | undefined);

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="h-12 border-b flex items-center px-4 font-semibold">
        Documentero Builder (IDE)
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <FieldSidebar templateId={resolvedTemplateId} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80}>
          <TemplateEditor templateId={resolvedTemplateId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
