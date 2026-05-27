import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

declare module "jspdf" {
  interface jsPDF {
    autoTable: any;
  }
}

export const generateProfessionalPDF = async (type: 'DailyLog' | 'Measurement', data: any, projectName: string) => {
  const doc = new jsPDF();
  const now = format(new Date(), "dd/MM/yyyy HH:mm");
  
  // Header Professional
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INFRAFLOW", 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("SISTEMA DE GESTÃO DE INFRAESTRUTURA RODoviária", 15, 28);
  
  doc.setFontSize(14);
  const title = type === 'DailyLog' ? "RELATÓRIO DIÁRIO DE OBRA (RDO)" : "BOLETIM DE MEDIÇÃO (BM)";
  doc.text(title, 210 - 15, 25, { align: 'right' });

  // Project Info Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO PROJETO", 15, 55);
  
  doc.autoTable({
    startY: 60,
    head: [['Campo', 'Informação']],
    body: [
      ['Projeto', projectName],
      ['Data de Emissão', now],
      ['Tipo de Relatório', type === 'DailyLog' ? 'Diário de Obra' : 'Medição Técnica'],
      ['Status', 'Operacional / Validado'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85] },
  });

  // Content Section
  const contentStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("DETALHAMENTO TÉCNICO", 15, contentStartY);

  if (type === 'DailyLog') {
    doc.autoTable({
      startY: contentStartY + 5,
      head: [['Data', 'Clima', 'Equipe', 'Observações']],
      body: [[
        format(data.data, "dd/MM/yyyy"),
        data.clima || "N/A",
        data.equipe || "N/A",
        data.observacoes || "Sem observações registradas."
      ]],
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] },
    });
  } else {
    doc.autoTable({
      startY: contentStartY + 5,
      head: [['Serviço', 'Quantidade', 'Unidade', 'Valor Unit.', 'Total']],
      body: [[
        data.tipoServico,
        data.quantidade,
        data.unidade,
        `R$ ${data.valor.toLocaleString('pt-BR')}`,
        `R$ ${(data.quantidade * data.valor).toLocaleString('pt-BR')}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] },
    });
  }

  // Photos Section if available
  if (data.fotos && data.fotos.length > 0) {
    const photoY = (doc as any).lastAutoTable.finalY + 15;
    if (photoY < 250) {
      doc.text("REGISTRO FOTOGRÁFICO", 15, photoY);
      let currentX = 15;
      let currentY = photoY + 5;
      
      data.fotos.slice(0, 4).forEach((foto: string, index: number) => {
        try {
          doc.addImage(foto, 'JPEG', currentX, currentY, 40, 30);
          currentX += 45;
          if (index === 1) {
            currentX = 15;
            currentY += 35;
          }
        } catch (e) {
          console.error("Erro ao adicionar foto ao PDF", e);
        }
      });
    }
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `InfraFlow - Documento gerado eletronicamente em ${now} - Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(`${type}_${projectName}_${format(new Date(), "yyyyMMdd")}.pdf`);
};
