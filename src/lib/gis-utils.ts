import * as turf from '@turf/turf';
import { MapFeature } from './db';

export const calculateSpatialMetrics = (type: 'line' | 'area', coordinates: [number, number][]) => {
  if (coordinates.length < 2) return { distance: 0, area: 0 };
  
  if (type === 'line') {
    const line = turf.lineString(coordinates.map(c => [c[1], c[0]]));
    const distance = turf.length(line, { units: 'kilometers' });
    return { distance: parseFloat(distance.toFixed(3)), area: 0 };
  } else {
    // Para polígonos, o turf precisa que o primeiro e último ponto sejam iguais
    const polygonCoords = [...coordinates, coordinates[0]];
    const poly = turf.polygon([polygonCoords.map(c => [c[1], c[0]])]);
    const area = turf.area(poly); // em metros quadrados
    const areaKm2 = area / 1_000_000;
    
    // Distância (perímetro)
    const line = turf.lineString(polygonCoords.map(c => [c[1], c[0]]));
    const perimeter = turf.length(line, { units: 'kilometers' });
    
    return { 
      distance: parseFloat(perimeter.toFixed(3)), 
      area: parseFloat(areaKm2.toFixed(4)),
      areaM2: parseFloat(area.toFixed(2))
    };
  }
};

export const generateAIPrompt = (feature: MapFeature) => {
  const { type, category, properties } = feature;
  const metrics = properties.area 
    ? `Área: ${properties.area} km² (${(properties.area * 1000000).toFixed(2)} m²)` 
    : `Extensão: ${properties.distance} km`;

  return `
    Analise tecnicamente este trecho de engenharia rodoviária:
    - Tipo: ${type}
    - Categoria: ${category}
    - ${metrics}
    - Descrição: ${properties.description || 'N/A'}

    Com base nas normas DER/DNIT, por favor:
    1. Sugira normas técnicas aplicáveis (ex: ET-P00).
    2. Identifique possíveis riscos técnicos (erosão, drenagem, solo).
    3. Sugira soluções de engenharia (espessura de pavimentação, tipos de bueiros).
    4. Estime um orçamento preliminar baseado em valores de mercado para obras similares.
    5. Verifique inconsistências com padrões técnicos rodoviários.
    
    Responda de forma estruturada e profissional.
  `;
};

export const exportToGeoJSON = (features: MapFeature[]) => {
  const geojson = {
    type: 'FeatureCollection',
    features: features.map(f => ({
      type: 'Feature',
      geometry: {
        type: f.type === 'point' ? 'Point' : f.type === 'line' ? 'LineString' : 'Polygon',
        coordinates: f.type === 'area' 
          ? [[...f.coordinates, f.coordinates[0]].map(c => [c[1], c[0]])]
          : f.coordinates.map(c => [c[1], c[0]])
      },
      properties: {
        ...f.properties,
        name: f.name,
        category: f.category,
        createdAt: f.createdAt
      }
    }))
  };
  return JSON.stringify(geojson, null, 2);
};
