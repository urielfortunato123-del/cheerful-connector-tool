export const generateWhatsAppMessage = (data: any) => {
  const lines = [
    "*NOVO ATENDIMENTO ACQUA SOFT*",
    "",
    `*Tipo:* ${data.request_type}`,
    `*Nome:* ${data.customer_name}`,
    `*Telefone:* ${data.customer_phone}`,
    `*Cidade:* ${data.city}`,
    `*Bairro:* ${data.neighborhood}`,
    data.address ? `*Endereço:* ${data.address}` : "",
    data.purifier_model ? `*Modelo:* ${data.purifier_model}` : "",
    data.problem_type ? `*Problema:* ${data.problem_type}` : "",
    data.problem_description ? `*Descrição:* ${data.problem_description}` : "",
    data.property_type ? `*Tipo de imóvel:* ${data.property_type}` : "",
    data.floor ? `*Andar:* ${data.floor}` : "",
    data.has_elevator !== undefined ? `*Elevador:* ${data.has_elevator ? 'Sim' : 'Não'}` : "",
    data.has_high_pressure_tank !== undefined ? `*Caixa de alta pressão:* ${data.has_high_pressure_tank ? 'Sim' : 'Não'}` : "",
    data.google_maps_link ? `*Localização:* ${data.google_maps_link}` : "",
    "",
    data.observations ? `*Observações:* ${data.observations}` : ""
  ].filter(line => line !== "").join("\n");

  return encodeURIComponent(lines);
};
