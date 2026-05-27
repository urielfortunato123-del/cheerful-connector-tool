import { db, MapFeature } from "@/lib/db";
import { toast } from "sonner";

export class LayerService {
  /**
   * Semeia dados iniciais para as camadas operacionais caso a base esteja vazia
   */
  static async seedInitialData() {
    const count = await db.mapFeatures.count();
    if (count > 0) return;

    const initialFeatures: Partial<MapFeature>[] = [
      // Obras
      {
        type: 'line',
        category: 'obras',
        name: 'Recuperação Funcional - Lote 01',
        coordinates: [[-23.5505, -46.6333], [-23.5550, -46.6400]],
        properties: { 
          description: 'Empresa: Construtora Rodovias S.A. | Progresso: 45%',
          status: 'Em Execução',
          distance: 1.2
        }
      },
      // Drenagem
      {
        type: 'point',
        category: 'drenagem',
        name: 'Bueiro de Passagem - Km 12',
        coordinates: [-23.5520, -46.6350],
        properties: { 
          description: 'Tipo: BSTC 1.00m | Status: Limpo',
          lastInspection: '2024-05-15'
        }
      },
      // Pavimentação
      {
        type: 'area',
        category: 'pavimentacao',
        name: 'Trecho Experimental - CBUQ Faixa C',
        coordinates: [[-23.5560, -46.6450], [-23.5570, -46.6460], [-23.5580, -46.6440]],
        properties: { 
          description: 'Espessura: 5cm | Material: CAP 50/70',
          area: 0.05
        }
      },
      // Hidrografia
      {
        type: 'line',
        category: 'hidrografia',
        name: 'Córrego das Pedras',
        coordinates: [[-23.5480, -46.6300], [-23.5520, -46.6250]],
        properties: { 
          description: 'Área de Preservação Permanente (APP) - 30m',
          color: '#0ea5e9'
        }
      },
      // Sinalização
      {
        type: 'point',
        category: 'sinalizacao',
        name: 'Radar Fixo - 80km/h',
        coordinates: [-23.5540, -46.6380],
        properties: { 
          description: 'KM 14+500 - Sentido Capital',
          type: 'Radar'
        }
      }
    ];

    try {
      for (const feature of initialFeatures) {
        await db.mapFeatures.add({
          ...feature,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          properties: feature.properties || {}
        } as MapFeature);
      }
      console.log("Dados GIS semeados com sucesso.");
    } catch (error) {
      console.error("Erro ao semear dados GIS:", error);
    }
  }

  static async getFeaturesByCategory(category: string) {
    return await db.mapFeatures.where('category').equals(category).toArray();
  }

  static async toggleLayer(category: string, isActive: boolean) {
    // Aqui poderíamos implementar lógica de lazy loading ou cache
    console.log(`Layer ${category} is now ${isActive ? 'Active' : 'Inactive'}`);
    return isActive;
  }
}
