import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import GISToolbar, { GISTool } from "./GISToolbar";
import GISSidebar from "./GISSidebar";
import GISModuleModal from "./GISModuleModal";
import GISAIInsights from "./GISAIInsights";
import GISProjectSelector from "./GISProjectSelector";
import GISProjectModal from "./GISProjectModal";
import { MapFeature, db, Project } from "@/lib/db";
import { toast } from "sonner";
import { exportToGeoJSON, exportToKML } from "@/lib/gis-utils";
import { LayerService } from "@/services/gis/LayerService";

// Lazy load GISMap to avoid SSR issues with Leaflet
const GISMap = lazy(() => import("./GISMap"));

export type BaseLayer = 'satellite' | 'topography' | 'dark' | 'streets' | 'google-satellite' | 'mapbox-satellite' | 'esri-world';
export type EngineeringLayer = 'obras' | 'drenagem' | 'pavimentacao' | 'contratos' | 'sinalizacao' | 'hidrografia' | 'curvas_nivel';

export default function GISContainer() {
  const [activeTool, setActiveTool] = useState<GISTool>('select');
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<MapFeature | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isInspectionMode, setIsInspectionMode] = useState(false);
  
  // Layer Management State
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayer>('dark');
  const [activeEngineeringLayers, setActiveEngineeringLayers] = useState<Set<EngineeringLayer>>(new Set(['obras', 'drenagem']));
  
  // GPS State
  const [gpsMode, setGpsMode] = useState<'standard' | 'high_precision' | 'economy' | 'engineering'>('standard');
  const [isGpsActive, setIsGpsActive] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsClient(true);
      await LayerService.seedInitialData();
      await loadData();
    };
    init();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [fData, pData] = await Promise.all([
        db.mapFeatures.toArray(),
        db.projects.toArray()
      ]);
      setFeatures(fData);
      setProjects(pData);
    } catch (error) {
      console.error("Erro ao carregar dados do GIS:", error);
    }
  }, []);

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
    setIsEditMode(false);
    setIsModuleModalOpen(true);
    setActiveTool('select');
    
    toast.success("Geometria capturada com sucesso!");
  };

  const handleFeatureUpdate = async (id: number, updates: Partial<MapFeature>) => {
    await db.mapFeatures.update(id, { ...updates, updatedAt: Date.now() });
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f));
    toast.success("Dados geoespaciais atualizados.");
  };

  const handleEditRequest = (feature: MapFeature) => {
    setPendingFeature(feature);
    setIsEditMode(true);
    setIsModuleModalOpen(true);
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

  const handleExport = (format: 'geojson' | 'kml' = 'geojson') => {
    let data = '';
    let filename = '';
    
    if (format === 'geojson') {
      data = exportToGeoJSON(features);
      filename = `InfraFlow_GIS_${new Date().toISOString()}.geojson`;
    } else {
      data = exportToKML(features);
      filename = `InfraFlow_GIS_${new Date().toISOString()}.kml`;
    }

    const blob = new Blob([data], { type: format === 'geojson' ? 'application/json' : 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    toast.success(`Exportação ${format.toUpperCase()} concluída.`);
  };

  const handleModuleExecution = async (dest: string, projectId: number, unit?: string) => {
    if (!pendingFeature) return;

    if (dest === 'save') {
      setIsModuleModalOpen(false);
      return;
    }

    const finalUnit = unit || (pendingFeature.type === 'line' ? 'km' : 'km²');
    const quantity = pendingFeature.properties.distance || pendingFeature.properties.area || 0;

    if (dest === 'budget' || dest === 'measurement') {
      if (dest === 'measurement') {
        await db.measurements.add({
          projectId,
          tipoServico: `Levantamento GIS: ${pendingFeature.name}`,
          quantidade: quantity,
          unidade: finalUnit,
          valor: 0,
          data: Date.now(),
          coordinates: pendingFeature.coordinates
        });
      } else {
        await db.budgets.add({
          projectId,
          itens: [{ descricao: pendingFeature.name, quantidade: quantity, unidade: finalUnit, valorUnitario: 0 }],
          valorTotal: 0,
          dataBase: new Date().toLocaleDateString(),
        });
      }
      toast.success(`Enviado para ${dest === 'budget' ? 'Orçamento' : 'Medição'}!`);
    }

    if (dest === 'memorial') {
      await db.memorials.add({
        projectId,
        conteudo: `Memorial Descritivo Técnico gerado via IA para o trecho ${pendingFeature.name}. Extensão: ${quantity}${finalUnit}. Baseado em Normas DER/DNIT.`,
        dataCriacao: Date.now()
      });
      toast.success("Memorial Técnico gerado!");
    }

    setIsModuleModalOpen(false);
    setPendingFeature(null);
  };

  const toggleEngineeringLayer = (layer: EngineeringLayer) => {
    setActiveEngineeringLayers(prev => {
      const next = new Set(prev);
      const isActivating = !next.has(layer);
      
      if (isActivating) {
        next.add(layer);
        toast.info(`Camada ${layer.toUpperCase()} ativada. Sincronizando dados...`, {
          description: "Geo-IA analisando possíveis conflitos e riscos...",
          duration: 3000
        });
      } else {
        next.delete(layer);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-background shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
      <GISSidebar 
        features={features}
        onSelect={(f) => setSelectedFeatureId(f.id!)}
        onDelete={handleDelete}
        onEdit={handleEditRequest}
        onDuplicate={handleDuplicate}
        onExport={() => handleExport('geojson')}
        onExportKML={() => handleExport('kml')}
        activeBaseLayer={activeBaseLayer}
        onBaseLayerChange={setActiveBaseLayer}
        activeEngineeringLayers={activeEngineeringLayers}
        onEngineeringLayerToggle={toggleEngineeringLayer}
        gpsMode={gpsMode}
        onGpsModeChange={setGpsMode}
        isGpsActive={isGpsActive}
        onGpsToggle={() => setIsGpsActive(!isGpsActive)}
      />

      <div className="flex-1 relative h-full">
        <GISToolbar 
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          isInspectionMode={isInspectionMode}
          onInspectionModeToggle={() => setIsInspectionMode(!isInspectionMode)}
          onClear={() => {
            if (selectedFeatureId) handleDelete(selectedFeatureId);
          }}
          onSave={() => toast.success("Base de dados GIS sincronizada localmente.")}
          onAI={() => {
            if (!selectedFeatureId) {
              toast.error("Selecione um objeto no mapa para análise IA.");
              return;
            }
            setIsAIInsightsOpen(true);
          }}
        />

        <GISAIInsights 
          isOpen={isAIInsightsOpen}
          onClose={() => setIsAIInsightsOpen(false)}
          feature={features.find(f => f.id === selectedFeatureId) || null}
        />

        {isClient ? (
          <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse flex items-center justify-center"><span className="text-xs font-bold">INICIANDO MOTOR GRÁFICO...</span></div>}>
            <GISMap 
              activeTool={activeTool}
              features={features}
              onFeatureCreate={handleFeatureCreate}
              selectedFeatureId={selectedFeatureId}
              onSelectFeature={setSelectedFeatureId}
              activeBaseLayer={activeBaseLayer}
              activeEngineeringLayers={activeEngineeringLayers}
              isGpsActive={isGpsActive}
              gpsMode={gpsMode}
              isInspectionMode={isInspectionMode}
            />
          </Suspense>
        ) : (
          <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center"><span className="text-xs font-bold font-mono">CARREGANDO GIS...</span></div>
        )}
      </div>

      <GISModuleModal 
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        feature={pendingFeature}
        projects={projects}
        isEditMode={isEditMode}
        onExecute={handleModuleExecution}
        onUpdate={handleFeatureUpdate}
      />
    </div>
  );
}
