import * as turf from '@turf/turf';
import { MapFeature } from './db';

export const calculateSpatialMetrics = (type: 'line' | 'area', coordinates: [number, number][]) => {
  if (coordinates.length < 2) return { distance: 0, area: 0 };
  
  if (type === 'line') {
    const line = turf.lineString(coordinates.map((c: [number, number]) => [c[1], c[0]]));
    const distance = turf.length(line, { units: 'kilometers' });
    return { distance: parseFloat(distance.toFixed(3)), area: 0 };
  } else {
    // Para polígonos, o turf precisa que o primeiro e último ponto sejam iguais
    const polygonCoords = [...coordinates, coordinates[0]];
    const poly = turf.polygon([polygonCoords.map((c: [number, number]) => [c[1], c[0]])]);
    const area = turf.area(poly); // em metros quadrados
    const areaKm2 = area / 1_000_000;
    
    // Distância (perímetro)
    const line = turf.lineString(polygonCoords.map((c: [number, number]) => [c[1], c[0]]));
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
    Analise tecnicamente este trecho de engenharia rodoviária para o InfraFlow GIS:
    - Tipo: ${type}
    - Categoria: ${category}
    - ${metrics}
    - Descrição: ${properties.description || 'N/A'}

    Com base nas normas DER/DNIT e critérios de engenharia rodoviária, por favor realize uma análise geoespacial:
    1. Recomendações de Drenagem: Baseado no tipo de geometria, sugira bueiros, valetas ou sarjetas.
    2. Riscos de Topografia: Identifique se a área pode ter declividade crítica (análise teórica).
    3. Normas Técnicas: Cite normas específicas (ex: ET-DE-P00/001).
    4. Estimativa de Volume: Se aplicável, estime volume de terraplenagem preliminar.
    5. Proximidade Hídrica: Alerte sobre a necessidade de análise de bacia hidrográfica se for área de drenagem.
    
    Responda em português, de forma técnica e objetiva para engenheiros.
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
          ? [[...f.coordinates, f.coordinates[0]].map((c: [number, number]) => [c[1], c[0]])]
          : f.type === 'point' ? [f.coordinates[1], f.coordinates[0]] : f.coordinates.map((c: [number, number]) => [c[1], c[0]])
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

export const exportToKML = (features: MapFeature[]) => {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>InfraFlow GIS Export</name>
    <Style id="lineStyle">
      <LineStyle><color>ff0000ff</color><width>4</width></LineStyle>
    </Style>
    <Style id="polyStyle">
      <PolyStyle><color>4d0000ff</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>`;

  features.forEach(f => {
    kml += `
    <Placemark>
      <name>${f.name}</name>
      <description>${f.properties.description || ''} - Categoria: ${f.category}</description>
      <styleUrl>${f.type === 'line' ? '#lineStyle' : f.type === 'area' ? '#polyStyle' : ''}</styleUrl>`;
    
    if (f.type === 'point') {
      kml += `
      <Point>
        <coordinates>${f.coordinates[1]},${f.coordinates[0]},0</coordinates>
      </Point>`;
    } else if (f.type === 'line') {
      kml += `
      <LineString>
        <coordinates>${f.coordinates.map((c: [number, number]) => `${c[1]},${c[0]},0`).join(' ')}</coordinates>
      </LineString>`;
    } else if (f.type === 'area') {
      const coords = [...f.coordinates, f.coordinates[0]];
      kml += `
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coords.map((c: [number, number]) => `${c[1]},${c[0]},0`).join(' ')}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>`;
    }
    
    kml += `
    </Placemark>`;
  });

  kml += `
  </Document>
</kml>`;
  return kml;
};
