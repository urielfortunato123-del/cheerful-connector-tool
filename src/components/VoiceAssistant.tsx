import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2, Play, Square, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/lib/db";

interface VoiceAssistantProps {
  onTranscript: (data: { clima?: string; equipe?: string; observacoes?: string; servico?: string }) => void;
  context?: string;
}

export function VoiceAssistant({ onTranscript, context }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Simulação de processamento via IA (Backend real usaria o audioBlob)
        // Em um cenário real, enviaríamos para uma edge function que usa Whisper + GPT
        setTimeout(() => {
          setIsProcessing(false);
          toast.success("Áudio processado pela IA do InfraFlow");
          
          // Mock de extração de dados
          onTranscript({
            clima: "Bom / Ensolarado",
            equipe: "Pavimentação - Equipe A",
            observacoes: "Processado via assistente de voz: Execução de imprimação na estaca 120.",
            servico: "CBUQ Faixa C"
          });
        }, 2000);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      toast.info("Gravando áudio... Descreva o campo.");
    } catch (err) {
      toast.error("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase text-primary/60 mb-1">Assistente de Campo IA</p>
        <p className="text-xs text-muted-foreground italic">
          {isRecording ? "Ouvindo relato..." : isProcessing ? "Processando relatório técnico..." : "Clique para descrever o serviço via voz"}
        </p>
      </div>
      
      <Button
        size="icon"
        variant={isRecording ? "destructive" : "default"}
        className={`h-10 w-10 rounded-full shadow-lg transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <Square className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
