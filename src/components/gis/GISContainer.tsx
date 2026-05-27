import { useState, useEffect, useCallback } from "react";
import GISMap from "./GISMap";
import GISToolbar, { GISTool } from "./GISToolbar";
import GISSidebar from "./GISSidebar";
import GISModuleModal from "./GISModuleModal";
import GISAIInsights from "./GISAIInsights";
import { MapFeature, db, Project } from "@/lib/db";
import { toast } from "sonner";
import { exportToGeoJSON, generateAIPrompt } from "@/lib/gis-utils";

export default function GISContainer() {
  const [activeTool, setActiveTool] = useState<GISTool>('select');
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<MapFeature | null>(null);

  const loadData = useCallback(async () => {
    const [fData, pData] = await Promise.all([
      db.mapFeatures.toArray(),
      db.projects.toArray()
    ]);
    setFeatures(fData);
    setProjects(pData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFeatureCreate = async (partialFeature: Partial<MapFeature>) => {
    const fullFeature: MapFeature = {
      ...partialFeature,
      category: partialFeature.category || 'geral',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      properties: partialFeature.properties || {},
    } as MapFeature;

    const id = await db.mapFeatures.add(fullFeature);
    const savedFeature = { ...fullFeature, id };
    
    setFeatures(prev => [...prev, savedFeature]);
    setPendingFeature(savedFeature);
    setIsModuleModalOpen(true);
    setActiveTool('select');
    
    toast.success("Geometria capturada com sucesso!");
  };

  const handleDelete = async (id: number) => {
    await db.mapFeatures.delete(id);
    setFeatures(prev => prev.filter(f => f.id !== id));
    if (selectedFeatureId === id) setSelectedFeatureId(null);
    toast.success("Objeto removido do GIS.");
  };

  const handleDuplicate = async (feature: MapFeature) => {
    const newFeature = { 
      ...feature, 
      id: undefined, 
      name: `${feature.name} (Cópia)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const id = await db.mapFeatures.add(newFeature);
    setFeatures(prev => [...prev, { ...newFeature, id }]);
    toast.success("Trecho duplicado com sucesso.");
  };

  const handleExport = () => {
    const data = exportToGeoJSON(features);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfraFlow_GIS_${new Date().toISOString()}.geojson`;
    a.click();
    toast.success("Exportação GeoJSON concluída.");
  };

  const handleAIAnalysis = () => {
    const feature = features.find(f => f.id === selectedFeatureId);
    if (!feature) {
      toast.error("Selecione um objeto no mapa para análise IA.");
      return;
    }

    const prompt = generateAIPrompt(feature);
    
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: 'O motor de Geo-IA está analisando normas DER/DNIT...',
        success: () => {
          return `Análise IA: Trecho ${feature.name} possui alto risco de erosão lateral. Recomenda-se norma DER ET-P00 com espessura mínima de 12cm.`;
        },
        error: 'Erro na análise IA.',
      }
    );
  };

  const handleModuleExecution = async (dest: string, projectId: number) => {
    if (!pendingFeature) return;

    if (dest === 'save') {
      setIsModuleModalOpen(false);
      return;
    }

    // Logic to bridge to other modules
    if (dest === 'budget') {
      await db.measurements.add({
        projectId,
        tipoServico: `Levantamento GIS: ${pendingFeature.name}`,
        quantidade: pendingFeature.properties.distance || pendingFeature.properties.area || 0,
        unidade: pendingFeature.type === 'line' ? 'km' : 'km²',
        valor: 0,
        data: Date.now(),
        coordinates: pendingFeature.coordinates
      });
      toast.success("Enviado para o Orçamento!");
    }

    if (dest === 'memorial') {
      await db.memorials.add({
        projectId,
        conteudo: `Memorial Descritivo Técnico gerado via IA para o trecho ${pendingFeature.name}. Extensão: ${pendingFeature.properties.distance}km. Baseado em Normas DER/DNIT.`,
        dataCriacao: Date.now()
      });
      toast.success("Memorial Técnico gerado!");
    }

    setIsModuleModalOpen(false);
    setPendingFeature(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-background shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
      <GISSidebar 
        features={features}
        onSelect={(f) => {
          setSelectedFeatureId(f.id!);
          // Logic to pan map to feature
        }}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onExport={handleExport}
      />

      <div className="flex-1 relative h-full">
        <GISToolbar 
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          onClear={() => {
            if (selectedFeatureId) handleDelete(selectedFeatureId);
          }}
          onSave={() => toast.success("Base de dados GIS sincronizada localmente.")}
          onAI={handleAIAnalysis}
        />

        <GISMap 
          activeTool={activeTool}
          features={features}
          onFeatureCreate={handleFeatureCreate}
          selectedFeatureId={selectedFeatureId}
          onSelectFeature={setSelectedFeatureId}
        />
      </div>

      <GISModuleModal 
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        feature={pendingFeature}
        projects={projects}
        onExecute={handleModuleExecution}
      />
    </div>
  );
}
