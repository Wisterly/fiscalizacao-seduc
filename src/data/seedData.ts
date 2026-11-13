import { GRE, Escola, Ambiente, OrdemServico, Demanda, AlertaUrgente, RotaVistoria, TarefaDoDia, Levantamento } from '../types';
import inepSchoolsJson from './inepSchools.json';
import ordensServicoAtaJson from './ordensServicoAta.json';

export const INITIAL_GRES: GRE[] = [
  { id: 'gre-01', numero: 1, nome: '01ª GRE - Parnaíba', sede: 'Parnaíba', municipios: ['Parnaíba', 'Ilha Grande', 'Luís Correia', 'Buriti dos Lopes'], isFavorite: true },
  { id: 'gre-02', numero: 2, nome: '02ª GRE - Barras', sede: 'Barras', municipios: ['Barras', 'Batalha', 'Esperantina', 'Joaquim Pires', 'Porto'], isFavorite: false },
  { id: 'gre-03', numero: 3, nome: '03ª GRE - Piripiri', sede: 'Piripiri', municipios: ['Piripiri', 'Pedro II', 'Piracuruca', 'Capitão de Campos', 'Brasileira'], isFavorite: true },
  { id: 'gre-04', numero: 4, nome: '04ª GRE - Teresina Centro/Norte', sede: 'Teresina Centro/Norte', municipios: ['Teresina'], isFavorite: true },
  { id: 'gre-05', numero: 5, nome: '05ª GRE - Campo Maior', sede: 'Campo Maior', municipios: ['Campo Maior', 'Castelo do Piauí', 'São Miguel do Tapuio', 'Altos', 'Sigefredo Pacheco'], isFavorite: false },
  { id: 'gre-06', numero: 6, nome: '06ª GRE - Regeneração', sede: 'Regeneração', municipios: ['Regeneração', 'Amarante', 'Angical do Piauí', 'Jardim do Mulato'], isFavorite: false },
  { id: 'gre-07', numero: 7, nome: '07ª GRE - Valença do Piauí', sede: 'Valença do Piauí', municipios: ['Valença do Piauí', 'Inhuma', 'Elesbão Veloso', 'Novo Oriente'], isFavorite: false },
  { id: 'gre-08', numero: 8, nome: '08ª GRE - Oeiras', sede: 'Oeiras', municipios: ['Oeiras', 'Santa Cruz do Piauí', 'Tanque do Piauí', 'Santo Inácio do Piauí'], isFavorite: true },
  { id: 'gre-09', numero: 9, nome: '09ª GRE - Picos', sede: 'Picos', municipios: ['Picos', 'Francisco Santos', 'Santana do Piauí', 'Bocaina'], isFavorite: true },
  { id: 'gre-10', numero: 10, nome: '10ª GRE - Floriano', sede: 'Floriano', municipios: ['Floriano', 'Jerumenha', 'Guadalupe', 'Nazaré do Piauí', 'Francisco Ayres'], isFavorite: true },
  { id: 'gre-11', numero: 11, nome: '11ª GRE - Uruçuí', sede: 'Uruçuí', municipios: ['Uruçuí', 'Ribeiro Gonçalves', 'Baixa Grande do Ribeiro', 'Antônio Almeida'], isFavorite: false },
  { id: 'gre-12', numero: 12, nome: '12ª GRE - São João do Piauí', sede: 'São João do Piauí', municipios: ['São João do Piauí', 'Simplício Mendes', 'Bela Vista do Piauí'], isFavorite: false },
  { id: 'gre-13', numero: 13, nome: '13ª GRE - São Raimundo Nonato', sede: 'São Raimundo Nonato', municipios: ['São Raimundo Nonato', 'São Lourenço', 'Dom Inocêncio'], isFavorite: false },
  { id: 'gre-14', numero: 14, nome: '14ª GRE - Bom Jesus', sede: 'Bom Jesus', municipios: ['Bom Jesus', 'Cristino Castro', 'Currais', 'Palmeira do Piauí', 'Redenção do Gurguéia'], isFavorite: true },
  { id: 'gre-15', numero: 15, nome: '15ª GRE - Corrente', sede: 'Corrente', municipios: ['Corrente', 'Cristalândia do Piauí', 'Gilbués', 'Monte Alegre do Piauí', 'Parnaguá'], isFavorite: false },
  { id: 'gre-16', numero: 16, nome: '16ª GRE - Fronteiras', sede: 'Fronteiras', municipios: ['Fronteiras', 'Pio IX', 'Caldeirão Grande do Piauí', 'São Julião'], isFavorite: false },
  { id: 'gre-17', numero: 17, nome: '17ª GRE - Paulistana', sede: 'Paulistana', municipios: ['Paulistana', 'Betânia do Piauí', 'Acauã', 'Queimada Nova', 'Jacobina do Piauí'], isFavorite: false },
  { id: 'gre-18', numero: 18, nome: '18ª GRE - Grande Teresina', sede: 'Grande Teresina', municipios: ['Altos', 'José de Freitas', 'União', 'Demerval Lobão', 'Monsenhor Gil', 'Miguel Alves'], isFavorite: true },
  { id: 'gre-19', numero: 19, nome: '19ª GRE - Teresina Sul', sede: 'Teresina Sul', municipios: ['Teresina'], isFavorite: true },
  { id: 'gre-20', numero: 20, nome: '20ª GRE - Teresina Leste', sede: 'Teresina Leste', municipios: ['Teresina'], isFavorite: false },
  { id: 'gre-21', numero: 21, nome: '21ª GRE - Teresina Sudeste', sede: 'Teresina Sudeste', municipios: ['Teresina'], isFavorite: true },
];

// Enriquecimento opcional de status/OS para escolas vinculadas aos fluxos de acompanhamento
const DEMO_SCHOOL_OVERRIDES: Record<string, Partial<Escola>> = {
  'inep-22026924': { statusConservacao: 'atencao', dataUltimaVistoria: '2026-10-18', diasSemVisita: 21, demandasUrgentesCount: 2, temOsAtiva: true, osId: 'os-140' },
  'inep-22027661': { statusConservacao: 'critico', dataUltimaVistoria: '2026-08-12', diasSemVisita: 88, demandasUrgentesCount: 4, temOsAtiva: true, osId: 'os-141' },
  'inep-22022376': { statusConservacao: 'bom', dataUltimaVistoria: '2026-10-25', diasSemVisita: 14, demandasUrgentesCount: 1, temOsAtiva: true, osId: 'os-089' },
  'inep-22010467': { statusConservacao: 'critico', dataUltimaVistoria: '2026-07-20', diasSemVisita: 111, demandasUrgentesCount: 3, temOsAtiva: false },
  'inep-22082298': { statusConservacao: 'bom', dataUltimaVistoria: '2026-10-02', diasSemVisita: 37, demandasUrgentesCount: 0, temOsAtiva: true, osId: 'os-042' },
  'inep-22133968': { statusConservacao: 'atencao', dataUltimaVistoria: '2026-08-30', diasSemVisita: 70, demandasUrgentesCount: 2, temOsAtiva: false },
  'inep-22098704': { statusConservacao: 'critico', dataUltimaVistoria: '2026-07-08', diasSemVisita: 123, demandasUrgentesCount: 3, temOsAtiva: false },
};

export const INITIAL_SCHOOLS: Escola[] = (inepSchoolsJson as Escola[]).map((school) => {
  const override = DEMO_SCHOOL_OVERRIDES[school.id];
  return override ? { ...school, ...override } : school;
});

export const INITIAL_AMBIENTES: Ambiente[] = [
  { id: 'amb-1', nome: 'Sala de Aula', isPadrao: true },
  { id: 'amb-2', nome: 'Laboratório de Informática', isPadrao: true },
  { id: 'amb-3', nome: 'Laboratório de Ciências', isPadrao: true },
  { id: 'amb-4', nome: 'Biblioteca', isPadrao: true },
  { id: 'amb-5', nome: 'Administrativo / Diretoria', isPadrao: true },
  { id: 'amb-6', nome: 'Cozinha / Refeitório', isPadrao: true },
  { id: 'amb-7', nome: 'Banheiros Coletivos', isPadrao: true },
  { id: 'amb-8', nome: 'Banheiro PCD', isPadrao: true },
  { id: 'amb-9', nome: 'Pátio Coberto / Quadra Poliesportiva', isPadrao: true },
];

export const INITIAL_OS: OrdemServico[] = ordensServicoAtaJson as OrdemServico[];

export const INITIAL_ALERTAS: AlertaUrgente[] = [
  {
    id: 'alt-1',
    titulo: 'Urgente: Falar com a Naila (Gerente)',
    descricao: 'Rachadura estrutural com trinca a 45º identificada no bloco B do CETI Prof Pinheiro Machado. Risco de escoramento.',
    prioridade: 'critica',
    responsavel: 'Naila',
    linkModulo: 'demandas',
    targetId: 'inep-22027661',
    dataCriacao: 'Hoje às 07:30',
    resolvido: false
  },
  {
    id: 'alt-2',
    titulo: 'Finalizar Orçamento Pendente',
    descricao: 'Orçamento de reforma do muro desabado no CETI Rocha Neto (Oeiras) precisa de liberação para planilha SINAPI SEDUC.',
    prioridade: 'alta',
    responsavel: 'Fiscal',
    linkModulo: 'orcamentos',
    targetId: 'inep-22133968',
    dataCriacao: 'Ontem',
    resolvido: false
  },
  {
    id: 'alt-3',
    titulo: 'Pedir Projeto aos Arquitetos',
    descricao: 'Cobrar projeto executivo de cobertura da quadra poliesportiva do CETI Paulistana para instrução do processo licitatório.',
    prioridade: 'alta',
    responsavel: 'Arquitetos',
    linkModulo: 'demandas',
    targetId: 'inep-22098704',
    dataCriacao: '05/11/2026',
    resolvido: false
  },
  {
    id: 'alt-4',
    titulo: 'Acompanhar Medição de 65%',
    descricao: 'Conferir assentamento cerâmico e instalações hidrossanitárias do CETI Gov. João Clímaco d\'Almeida antes de liberar 4ª medição.',
    prioridade: 'alta',
    responsavel: 'Fiscal',
    linkModulo: 'orcamentos',
    targetId: 'os-140',
    dataCriacao: '06/11/2026',
    resolvido: false
  }
];

export const INITIAL_DEMANDAS: Demanda[] = [
  {
    id: 'dem-1',
    titulo: 'Avisar Gerente Naila sobre rachadura crítica na Pinheiro Machado',
    descricao: 'Solicitar emissão de laudo emergencial e verificar possibilidade de transferência provisória das turmas da sala 04.',
    tipo: 'gerencia_naila',
    responsavel: 'Naila',
    prioridade: 'alta',
    dataLimite: '2026-11-10',
    alertFrequency: 'todos_os_dias',
    diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    escolaId: 'inep-22027661',
    escolaNome: 'CETI PROF PINHEIRO MACHADO',
    concluida: false,
    dataCriacao: '2026-11-06'
  },
  {
    id: 'dem-2',
    titulo: 'Montar Memorial Descritivo - Elétrica CETI Paulistana',
    descricao: 'Especificar disjuntores caixa moldada, barramentos de cobre e cabeamento de 50mm² para entrada de alta tensão.',
    tipo: 'memorial',
    responsavel: 'Fiscal',
    prioridade: 'alta',
    dataLimite: '2026-11-14',
    alertFrequency: 'dias_semana',
    diasSemana: ['Seg', 'Qua', 'Sex'],
    escolaId: 'inep-22098704',
    escolaNome: 'CETI PAULISTANA',
    concluida: false,
    dataCriacao: '2026-11-04'
  },
  {
    id: 'dem-3',
    titulo: 'Cobrar Equipe de Arquitetos da SEDUC',
    descricao: 'Exigir planta baixa em DWG atualizada e corte transversal da cozinha industrial do CETI Min. Petrônio Portella.',
    tipo: 'arquitetura',
    responsavel: 'Arquitetos',
    prioridade: 'media',
    dataLimite: '2026-11-18',
    alertFrequency: 'dias_semana',
    diasSemana: ['Ter', 'Qui'],
    escolaId: 'inep-22015221',
    escolaNome: 'CETI MINISTRO PETRONIO PORTELLA',
    concluida: false,
    dataCriacao: '2026-11-02'
  },
  {
    id: 'dem-4',
    titulo: 'Elaborar Planilha de Orçamento - Muro CETI Rocha Neto',
    descricao: 'Levantar quantitativo de alvenaria de bloco cerâmico e vigas de coroamento com cotação SINAPI Piauí desonerado.',
    tipo: 'orcamento',
    responsavel: 'Fiscal',
    prioridade: 'alta',
    dataLimite: '2026-11-12',
    alertFrequency: 'todos_os_dias',
    diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    escolaId: 'inep-22133968',
    escolaNome: 'CETI ROCHA NETO',
    concluida: false,
    dataCriacao: '2026-11-05'
  }
];

export const INITIAL_TAREFAS: TarefaDoDia[] = [
  { id: 'tar-1', titulo: 'Conferir avanço do reboco e rampa PCD', escolaOuLocal: 'CETI Gov. João Clímaco d\'Almeida', horario: '08:30', prioridade: 'urgente', concluida: false },
  { id: 'tar-2', titulo: 'Fotografar fissuras na viga da sala 04', escolaOuLocal: 'CETI Prof Pinheiro Machado', horario: '10:45', prioridade: 'urgente', concluida: false },
  { id: 'tar-3', titulo: 'Alinhar percentual de medição de 65% com engenheiro da Poty', escolaOuLocal: 'Escritório Poty / Canteiro', horario: '14:00', prioridade: 'normal', concluida: false },
  { id: 'tar-4', titulo: 'Encaminhar laudo prévio no WhatsApp da Gerente Naila', escolaOuLocal: 'SEDUC Central', horario: '16:30', prioridade: 'urgente', concluida: false },
];

export const INITIAL_LEVANTAMENTOS: Levantamento[] = [
  {
    id: 'lev-1',
    escolaId: 'inep-22026924',
    greId: 'gre-04',
    dataHora: '18/10/2026 09:40',
    motivoVisita: 'Medição da 4ª etapa da OS 140/2026 e fiscalização dos acabamentos hidrossanitários.',
    observacoesDiretora: 'Direção solicitou urgência na conclusão dos banheiros dos alunos para evitar transtornos no retorno das aulas integrais.',
    ambientesQuantitativo: {
      'amb-1': 10,
      'amb-2': 1,
      'amb-6': 1,
      'amb-7': 2,
      'amb-8': 2,
      'amb-9': 1
    },
    fotos: [
      {
        id: 'foto-101',
        url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
        ambienteId: 'amb-8',
        ambienteNome: 'Banheiro PCD',
        legendaOriginal: 'Piso cerâmico antiderrapante e barras de apoio em inox instaladas.',
        legendaTecnicaIA: 'Conferência de acessibilidade NBR 9050: Barras de transferência em aço inox AISI 304 instaladas e piso cerâmico PEI 5 com coeficiente de atrito conforme especificado no Memorial Descritivo.',
        isUrgente: false,
        dataHora: '18/10/2026 10:15'
      },
      {
        id: 'foto-102',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
        ambienteId: 'amb-1',
        ambienteNome: 'Sala de Aula',
        legendaOriginal: 'Pintura látex acrílica nas paredes e troca de portas em andamento.',
        legendaTecnicaIA: 'Execução de emboço e demãos preliminares de tinta acrílica fosca lavável sobre alvenaria; esquadrias de madeira maciça com ferragens reforçadas em estágio de ajuste.',
        isUrgente: false,
        dataHora: '18/10/2026 10:35'
      }
    ],
    status: 'concluido',
    concluidoPor: 'Eng. Fiscal SEDUC / GPR'
  },
  {
    id: 'lev-2',
    escolaId: 'inep-22027661',
    greId: 'gre-21',
    dataHora: '12/08/2026 14:15',
    motivoVisita: 'Vistoria emergencial por chamado da direção escolar relatando trincas nas paredes.',
    observacoesDiretora: 'Direção relatou estalos ouvidos durante a noite chuvosa e teme desabamento do teto da sala de aula 04.',
    ambientesQuantitativo: {
      'amb-1': 8,
      'amb-4': 1,
      'amb-5': 1,
      'amb-7': 2
    },
    fotos: [
      {
        id: 'foto-201',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        ambienteId: 'amb-1',
        ambienteNome: 'Sala de Aula',
        legendaOriginal: 'Rachadura diagonal perto da janela da sala 04.',
        legendaTecnicaIA: 'Fissuração em ângulo de 45º característica de recalque diferencial de fundação ou cisalhamento na alvenaria portante sob verga da esquadria; requer escoramento cautelar imediato e monitoramento com fissurômetro.',
        isUrgente: true,
        urgenciaNota: 'Urgente: Falar logo com a Naila para interditar sala 04 e providenciar escoramento.',
        responsavelUrgencia: 'Naila',
        diasAlerta: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
        dataHora: '12/08/2026 14:40'
      }
    ],
    status: 'concluido',
    concluidoPor: 'Eng. Fiscal SEDUC / GPR'
  }
];

export const INITIAL_ROTAS: RotaVistoria[] = [
  {
    id: 'rota-01',
    titulo: 'Roteiro de Alta Criticidade - Novembro/2026',
    mesReferencia: 'Novembro 2026',
    greId: 'gre-04',
    status: 'planejada',
    resumoIA: 'Roteiro prioritário com base em dias sem vistorias e relatórios de risco estrutural.',
    itens: [
      { escolaId: 'inep-22027661', diaSugerido: '10/11/2026 (Segunda)', ordem: 1, motivoUrgencia: 'Estado Crítico (88 dias sem visita) • Trinca estrutural ativa' },
      { escolaId: 'inep-22010467', diaSugerido: '11/11/2026 (Terça)', ordem: 2, motivoUrgencia: 'Estado Crítico (111 dias sem visita) • Reforma geral do telhado' },
      { escolaId: 'inep-22098704', diaSugerido: '13/11/2026 (Quinta)', ordem: 3, motivoUrgencia: 'Estado Crítico (123 dias sem visita) • 3 demandas pendentes com arquitetos' },
      { escolaId: 'inep-22015221', diaSugerido: '14/11/2026 (Sexta)', ordem: 4, motivoUrgencia: 'Vistoria programada de rotina • Cozinha industrial' }
    ]
  }
];
