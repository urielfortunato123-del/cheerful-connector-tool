import { Loader2 } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";

export default function MapView() {
  const [GISContainer, setGISContainer] = useState<ComponentType | null>(null);

  useEffect(() => {
    let mounted = true;

    import("./gis/GISContainer").then((module) => {
      if (mounted) setGISContainer(() => module.default);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full h-full">
      {GISContainer ? (
        <GISContainer />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-muted/20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
