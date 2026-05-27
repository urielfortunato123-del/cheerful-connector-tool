export interface LibraryCategory {
  id: string;
  label: string;
  children?: LibraryCategory[];
}

export const LIBRARY_HIERARCHY: LibraryCategory[] = [
  {
    id: 'der-sp-tecnicas',
    label: 'DER-SP → Técnicas',
    children: [
      { id: 'et', label: 'ET' },
      { id: 'drenagem', label: 'Drenagem' },
      { id: 'edificacoes', label: 'Edificações' },
      { id: 'estruturas', label: 'Estruturas' },
      { id: 'geotecnia', label: 'Geotecnia' },
      { id: 'iluminacao', label: 'Iluminação' },
      { id: 'meio-ambiente', label: 'Meio Ambiente' },
      { id: 'pavimentacao', label: 'Pavimentação' },
      { id: 'servicos-preliminares', label: 'Serviços Preliminares' },
      { id: 'sinalizacao', label: 'Sinalização' },
      { id: 'terraplenagem', label: 'Terraplenagem' },
    ],
  },
  {
    id: 'der-sp-ip',
    label: 'DER-SP → IP',
    children: [
      { id: 'estradas-vicinais', label: 'Estradas Vicinais' },
      { id: 'cadastro-interferencias', label: 'Cadastro de Interferências' },
      { id: 'as-built', label: 'As Built' },
      { id: 'supervisao-obras', label: 'Supervisão de Obras' },
      { id: 'desapropriacao', label: 'Desapropriação' },
    ],
  },
  {
    id: 'der-sp-projetos',
    label: 'DER-SP → Projetos',
    children: [
      { id: 'proj-drenagem', label: 'Drenagem' },
      { id: 'proj-estruturas', label: 'Estruturas' },
      { id: 'proj-pavimentacao', label: 'Pavimentação' },
      { id: 'proj-terraplenagem', label: 'Terraplenagem' },
    ],
  },
  {
    id: 'der-sp-pps',
    label: 'DER-SP → Projeto Padrão PPS',
    children: [
      { id: 'pps-drenagem', label: 'Drenagem' },
      { id: 'pps-oae', label: 'OAE' },
      { id: 'pps-geometria', label: 'Geometria' },
      { id: 'pps-seguranca', label: 'Segurança' },
      { id: 'pps-pavimentacao', label: 'Pavimentação' },
    ],
  },
  {
    id: 'dnit',
    label: 'DNIT',
    children: [
      { id: 'dnit-normas', label: 'Normas' },
      { id: 'dnit-manuais', label: 'Manuais' },
      { id: 'dnit-instrucoes', label: 'Instruções' },
    ],
  },
  {
    id: 'abnt',
    label: 'ABNT',
    children: [
      { id: 'abnt-construcao', label: 'Construção Civil' },
      { id: 'abnt-sinalizacao', label: 'Sinalização' },
    ],
  },
];
