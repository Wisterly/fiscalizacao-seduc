export type ConservacaoStatus = 'critico' | 'atencao' | 'regular' | 'bom';

export type ResponsavelTipo = 'Naila' | 'Coordenador' | 'Arquitetos' | 'Fiscal' | 'Empresa Construtora';

export interface GRE {
  id: string;
  numero: number;
  nome: string;
  sede: string;
  municipios: string[];
  isFavorite: boolean;
}

export interface Escola {
  id: string;
  inep?: string;
  greId: string;
  nome: string;
  municipio: string;
  endereco: string;
  situacaoImovel?: string;
  situacaoEducacional?: string;
  isManual?: boolean;
  diretora?: string;
  telefone?: string;
  statusConservacao: ConservacaoStatus;
  dataUltimaVistoria: string;
  diasSemVisita: number;
  demandasUrgentesCount: number;
  temOsAtiva: boolean;
  osId?: string;
}

export interface Ambiente {
  id: string;
  nome: string;
  isPadrao: boolean;
}

export interface FotoLevantamento {
  id: string;
  url: string;
  ambienteId: string;
  ambienteNome: string;
  legendaOriginal: string;
  legendaTecnicaIA: string;
  isUrgente: boolean;
  urgenciaNota?: string;
  responsavelUrgencia?: ResponsavelTipo;
  diasAlerta?: string[];
  dataHora: string;
}

export interface Levantamento {
  id: string;
  escolaId: string;
  greId: string;
  dataHora: string;
  motivoVisita: string;
  observacoesDiretora: string;
  ambientesQuantitativo: Record<string, number>;
  fotos: FotoLevantamento[];
  status: 'concluido' | 'rascunho';
  concluidoPor: string;
}

export interface OrdemServico {
  id: string;
  numeroOS: string;
  escolaId: string;
  escolaNome: string;
  greId: string;
  municipio: string;
  objeto: string;
  valorOrcamento: number;
  percentualMedicao: number;
  dataInicio: string;
  prazoFinal: string;
  status: 'ativa' | 'historico' | 'aguardando';
  empresaContratada: string;
  orcamentoPdfSimulado: string;
  memorialDescritivoPdfSimulado: string;
  observacoes: Array<{
    id: string;
    data: string;
    texto: string;
    autor: string;
  }>;
}

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'orcamento' | 'memorial' | 'arquitetura' | 'gerencia_naila' | 'vistoria_urgente' | 'outro';
  responsavel: ResponsavelTipo;
  prioridade: 'alta' | 'media' | 'baixa';
  dataLimite: string;
  alertFrequency: 'todos_os_dias' | 'dias_semana';
  diasSemana: string[]; // ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
  escolaId?: string;
  escolaNome?: string;
  concluida: boolean;
  dataCriacao: string;
}

export interface AlertaUrgente {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'critica' | 'alta';
  responsavel: ResponsavelTipo;
  linkModulo: 'vistorias' | 'orcamentos' | 'demandas' | 'rotas';
  targetId?: string;
  dataCriacao: string;
  resolvido: boolean;
}

export interface RotaItem {
  escolaId: string;
  diaSugerido: string;
  ordem: number;
  motivoUrgencia: string;
}

export interface RotaVistoria {
  id: string;
  titulo: string;
  mesReferencia: string;
  greId: string;
  itens: RotaItem[];
  status: 'planejada' | 'concluida';
  dataConclusao?: string;
  resumoIA: string;
}

export interface TarefaDoDia {
  id: string;
  titulo: string;
  escolaOuLocal: string;
  horario: string;
  prioridade: 'urgente' | 'normal';
  concluida: boolean;
}
