import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationCaptureProps {
  onCapture: (location: { latitude: number; longitude: number; googleMapsLink: string }) => void;
}

export function LocationCapture({ onCapture }: LocationCaptureProps) {
  const [loading, setLoading] = useState(false);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        onCapture({ latitude, longitude, googleMapsLink });
        toast.success("Localização capturada!");
        setLoading(false);
      },
      (error) => {
        toast.error("Não foi possível capturar sua localização.");
        setLoading(false);
      }
    );
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      onClick={captureLocation} 
      className="w-full gap-2 h-12 border-dashed border-primary text-primary font-bold"
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
      Usar Minha Localização Atual
    </Button>
  );
}
