# Plano de Implementação: Upgrades Profissionais InfraFlow

Vou implementar as 4 melhorias sugeridas para elevar o InfraFlow ao nível de software corporativo de infraestrutura pesada.

## 1. Relatórios Técnicos Automatizados (PDF)
*   Implementar motor de geração de PDF usando `jspdf` e `jspdf-autotable`.
*   Criar templates profissionais para "Diário de Obra" e "Boletim de Medição".
*   Adicionar botões de "Exportar Relatório" nas telas correspondentes.

## 2. Dashboard Georreferenciado Ativo
*   Integrar os dados de `measurements` e `dailyLogs` ao componente `MapView`.
*   Implementar marcadores no mapa que mostram detalhes ao clicar (fotos, serviços, datas).
*   Permitir filtragem por estaca (km) ou projeto no mapa.

## 3. Assistente de Campo por Voz com IA
*   Implementar interface de gravação de áudio nas telas de entrada de dados.
*   Criar `server-fn` para transcrição e processamento via IA (LLM) para extrair entidades técnicas (clima, equipe, serviços).
*   Preenchimento automático dos formulários a partir do áudio.

## 4. Inteligência de Custos (Importador SICRO/DER)
*   Criar funcionalidade para importar tabelas de preços via Excel/PDF (usando OCR se necessário).
*   Implementar alertas visuais de "Budget Overrun" nas medições.
*   Dashboard de evolução financeira Real vs Orçado.

## Detalhes Técnicos
*   **Storage:** Utilização do Dexie (IndexedDB) para persistência total offline de relatórios e mapas.
*   **PDF:** Geração client-side para garantir funcionamento sem internet.
*   **IA:** Integração com modelos capazes de entender terminologia de engenharia rodoviária brasileira (CBUQ, BGTC, Estacas, etc).

---
*Vou iniciar a implementação destas funcionalidades agora.*