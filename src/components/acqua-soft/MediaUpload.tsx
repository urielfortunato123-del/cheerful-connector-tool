import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Image as ImageIcon, Video, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
}

export function MediaUpload({ onUpload, maxFiles = 5 }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<{ name: string; url: string; type: string }[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Você só pode enviar até ${maxFiles} arquivos.`);
      return;
    }

    setUploading(true);
    const newFiles = [...files];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `atendimentos/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('atendimentos_media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('atendimentos_media')
          .getPublicUrl(filePath);

        newFiles.push({ name: file.name, url: publicUrl, type: file.type });
      } catch (error) {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }

    setFiles(newFiles);
    onUpload(newFiles.map(f => f.url));
    setUploading(false);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUpload(newFiles.map(f => f.url));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div key={i} className="relative group w-20 h-20 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
            {file.type.startsWith('image/') ? (
              <img src={file.url} alt="Preview" className="w-full h-full object-cover" />
            ) : file.type.startsWith('video/') ? (
              <Video className="h-8 w-8 text-slate-400" />
            ) : file.type.startsWith('audio/') ? (
              <Music className="h-8 w-8 text-slate-400" />
            ) : (
              <FileText className="h-8 w-8 text-slate-400" />
            )}
            <button
              onClick={() => removeFile(i)}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {files.length < maxFiles && (
          <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-[10px] text-slate-400 mt-1">Anexar</span>
            <input type="file" className="hidden" multiple onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
      </div>
      {uploading && <p className="text-xs text-muted-foreground animate-pulse">Enviando arquivos...</p>}
    </div>
  );
}
