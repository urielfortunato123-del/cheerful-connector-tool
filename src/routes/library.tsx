import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { DocumentUpload } from "@/components/library/DocumentUpload";
import { DocumentGrid } from "@/components/library/DocumentGrid";
import { AskAI } from "@/components/library/AskAI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <div className="space-y-6">
      <LibraryHeader />

      <Tabs defaultValue="documents" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="ask">Pergunte à IA</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="documents" className="mt-0">
          <DocumentGrid />
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <DocumentUpload onUploadSuccess={() => setActiveTab("documents")} />
        </TabsContent>

        <TabsContent value="ask" className="mt-0">
          <AskAI />
        </TabsContent>
      </Tabs>
    </div>
  );
}
