import { Escola, GRE } from '../types';

// ============================================================================
// ESPECIFICAÇÃO TÉCNICA: HIERARQUIA DE DEMANDAS, RELATÓRIO E CÁLCULO DE ROTAS
// ============================================================================

export type DiariaOption = '1.5' | '2.5' | '3.5' | '4.5';
export type GrauCriticidade = 1 | 2 | 3;
export type StatusCompatibilizado = 'Razoável' | 'Requer Atenção' | 'Prioridade' | 'Urgente';

export type OrigemDemanda = 
  | 'Naila (Gerente)'             // Grau 1 Fixo
  | 'Anik (Diretora)'             // Grau 2 Fixo
  | 'Arielma (Superintendente)'   // Grau 3 Fixo
  | 'Diretora da Escola';         // Grau Dinâmico (Analisar Relatório da Obra)

export interface RelatorioTecnicoEscola {
  quantidadeProblemas: number;    // Quantidade de patologias/pendências apontadas no relatório
  possuiProblemaGrave: boolean;   // Risco estrutural, coberta crítica, elétrica, etc.
  obraParada: boolean;
  obraAtrasada: boolean;
  observacoesRelatorio: string;
}

export interface DemandaRegistrada {
  id: string;
  origem: OrigemDemanda;
  descricao: string;
  dataRegistro: string;
}

export interface EscolaObra {
  id: string;
  inep?: string;
  nome: string;
  municipio: string;
  endereco: string;
  greId: string;
  greNome: string;
  cidadeSedeGre: string;
  distanciaDeTeresinaKm: number;
  coordenadas?: { lat: number; lng: number } | string;
  linkMaps?: string;
  diasSemVistoria: number;
  tempoEstimadoVistoriaMinutos: number; // Padrão: 45 a 60 min
  relatorio: RelatorioTecnicoEscola;
  demandas: DemandaRegistrada[];
}

export interface ResultadoAnalisePrioridade {
  grauFinal: GrauCriticidade;
  statusCompatibilizado: StatusCompatibilizado;
  scoreNumerico: number;
  justificativaIA: string[];
}

export interface EstimativaTrecho {
  distanciaKm: number;
  tempoGoogleMapsMin: number;      // Referência Maps / Waze (~75 km/h)
  tempoS10Hilux140Min: number;     // Cruzeiro 140 km/h (~120-125 km/h efetivo)
  economiaTempoMin: number;
  tempoFormatadoMaps: string;
  tempoFormatadoHilux: string;
}

export interface ParadaRota {
  ordem: number;
  tipo: 'partida' | 'vistoria' | 'pernoite' | 'retorno';
  escola?: EscolaObra;
  analisePrioridade?: ResultadoAnalisePrioridade;
  cidade: string;
  localNome: string;
  distanciaTrechoKm: number;
  tempoDeslocamentoMin: number;   // Tempo real Hilux a 140 km/h
  tempoGoogleMapsMin: number;     // Tempo comparativo Google Maps/Waze
  economiaTempoMin: number;
  tempoEstimadoMapsFormatado: string;
  tempoEstimadoHiluxFormatado: string;
  tempoPermanenciaMin: number;
  horarioChegada: string;
  horarioPartida: string;
  observacao?: string;
}

export interface DiaViagem {
  diaNumero: number;
  titulo: string;
  dataDescritiva: string;
  horarioInicio: string;
  horarioTerminoPrevisto: string;
  cidadePernoiteOuDestino: string;
  totalKmDia: number;
  totalTempoEstradaMin: number;
  totalTempoGoogleMapsMin: number;
  totalTempoVistoriasMin: number;
  paradas: ParadaRota[];
}

export interface PlanoViagem {
  tipoRota: 'trajeto' | 'prioridade';
  gre: GRE;
  diaria: DiariaOption;
  cidadePolo: string;
  duracaoDiasReal: number;
  duracoesDisponiveis: number[];
  totalKm: number;
  tempoEstradaHoras: string;
  tempoEstradaGoogleMapsHoras: string;
  economiaTotalEstradaHoras: string;
  totalEscolasAtendidas: number;
  veiculoInfo: string;
  velocidadeCruzeiro: string;
  horarioFinalPrevisto: string;
  dias: DiaViagem[];
}

// Distâncias referenciais aproximadas (km) saindo de Teresina para as Sedes e Cidades do PI (Via BRs e PIs)
export const DISTANCIAS_TERESINA_KM: Record<string, number> = {
  'TERESINA': 0,
  'ALTOS': 42,
  'CAMPO MAIOR': 84,
  'JOSÉ DE FREITAS': 54,
  'UNIÃO': 64,
  'DEMERVAL LOBÃO': 35,
  'MONSENHOR GIL': 60,
  'BARRAS': 128,
  'BATALHA': 160,
  'ESPERANTINA': 185,
  'PIRIPIRI': 165,
  'PEDRO II': 210,
  'PARNAÍBA': 340,
  'LUÍS CORREIA': 355,
  'ILHA GRANDE': 348,
  'BURITI DOS LOPES': 305,
  'REGENERAÇÃO': 145,
  'AMARANTE': 160,
  'ÁGUA BRANCA': 98,
  'VALENÇA DO PIAUÍ': 216,
  'ELESBÃO VELOSO': 160,
  'INHUMA': 240,
  'OEIRAS': 312,
  'SANTO INÁCIO DO PIAUÍ': 365,
  'SANTA ROSA DO PIAUÍ': 280,
  'SÃO JOÃO DA VARJOTA': 295,
  'SÃO MIGUEL DO FIDALGO': 350,
  'CAJAZEIRAS DO PIAUÍ': 285,
  'FLORESTA DO PIAUÍ': 360,
  'PICOS': 315,
  'FLORIANO': 248,
  'GUADALUPE': 350,
  'URUÇUÍ': 455,
  'SÃO JOÃO DO PIAUÍ': 460,
  'SIMPLÍCIO MENDES': 385,
  'SÃO RAIMUNDO NONATO': 525,
  'BOM JESUS': 635,
  'CRISTINO CASTRO': 595,
  'CORRENTE': 840,
  'CRISTALÂNDIA DO PIAUÍ': 890,
  'GILBUÉS': 760,
  'MONTE ALEGRE DO PIAUÍ': 790,
  'PARNAGUÁ': 820,
  'CURIMATÁ': 760,
  'AVELINO LOPES': 795,
  'FRONTEIRAS': 410,
  'PIO IX': 430,
  'PAULISTANA': 455
};

export function getDistanciaTeresina(municipio: string): number {
  const norm = (municipio || '').toUpperCase().trim();
  if (DISTANCIAS_TERESINA_KM[norm] !== undefined) {
    return DISTANCIAS_TERESINA_KM[norm];
  }
  return 260;
}

/**
 * Formata minutos em string amigável: "Xh Ymin"
 */
export function formatarMinutosLegivel(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/**
 * Converte minutos a partir das 00:00 para string "HH:MMh"
 */
function minToTime(minutos: number): string {
  const h = Math.floor(minutos / 60) % 24;
  const m = Math.floor(minutos % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}h`;
}

/**
 * CALCULA ESTIMATIVA COMPARATIVA DE DESLOCAMENTO:
 * 1. Google Maps / Waze: média padrão de rodovia no PI (~75 km/h).
 * 2. Caminhonete S10 / Hilux a 140 km/h: velocidade média efetiva ~120-125 km/h.
 * Exemplo: 3h (180 min) no Maps vira ~1h45 a 1h50 na Hilux a 140 km/h.
 */
export function calcularDeslocamentoTrecho(distanciaKm: number): EstimativaTrecho {
  const dist = Math.max(5, distanciaKm);

  // Google Maps / Waze: média ~75 km/h nas BRs do Piauí
  const tempoMaps = Math.max(15, Math.round((dist / 75) * 60));

  // Simulação Caminhonete S10 / Hilux a 140 km/h em estrada aberta (~125 km/h média efetiva)
  const tempoHilux = Math.max(10, Math.round((dist / 125) * 60));

  const economia = Math.max(0, tempoMaps - tempoHilux);

  return {
    distanciaKm: dist,
    tempoGoogleMapsMin: tempoMaps,
    tempoS10Hilux140Min: tempoHilux,
    economiaTempoMin: economia,
    tempoFormatadoMaps: formatarMinutosLegivel(tempoMaps),
    tempoFormatadoHilux: formatarMinutosLegivel(tempoHilux)
  };
}

export function calcularTempoEstradaMinutos(distanciaKm: number): number {
  return calcularDeslocamentoTrecho(distanciaKm).tempoS10Hilux140Min;
}

/**
 * MOTOR DE COMPATIBILIZAÇÃO E ANÁLISE DE PRIORIDADE DA ESCOLA
 */
export function analisarPrioridadeEscola(escola: EscolaObra): ResultadoAnalisePrioridade {
  let score = 0;
  let maiorGrauDetectado: GrauCriticidade = 1;
  const justificativas: string[] = [];

  // 1. Demandas Diretas pela Hierarquia
  escola.demandas.forEach((demanda) => {
    switch (demanda.origem) {
      case 'Arielma (Superintendente)':
        maiorGrauDetectado = 3;
        score += 300;
        justificativas.push('Demanda da Superintendente Arielma (Grau 3)');
        break;

      case 'Anik (Diretora)':
        if (maiorGrauDetectado < 2) maiorGrauDetectado = 2;
        score += 200;
        justificativas.push('Demanda da Diretora Anik (Grau 2)');
        break;

      case 'Naila (Gerente)':
        if (maiorGrauDetectado < 1) maiorGrauDetectado = 1;
        score += 100;
        justificativas.push('Demanda da Gerente Naila (Grau 1)');
        break;

      case 'Diretora da Escola':
        if (escola.relatorio.possuiProblemaGrave || escola.relatorio.quantidadeProblemas >= 5 || escola.relatorio.obraParada) {
          maiorGrauDetectado = 3;
          score += 260;
          justificativas.push('Demanda da Diretora da Escola + Relatório Crítico (Elevado para Grau 3)');
        } else if (escola.relatorio.quantidadeProblemas >= 3 || escola.relatorio.obraAtrasada) {
          if (maiorGrauDetectado < 2) maiorGrauDetectado = 2;
          score += 170;
          justificativas.push('Demanda da Diretora da Escola + Pendências no Relatório (Grau 2)');
        } else {
          score += 70;
          justificativas.push('Demanda da Diretora da Escola (Resolução em rotina / Grau 1)');
        }
        break;
    }
  });

  // 2. Relatório Técnico autônomo
  if (escola.relatorio.obraParada) {
    maiorGrauDetectado = 3;
    score += 220;
    justificativas.push('Obra Parada apontada em relatório');
  } else if (escola.relatorio.possuiProblemaGrave) {
    if (maiorGrauDetectado < 2) maiorGrauDetectado = 2;
    score += 150;
    justificativas.push('Problema técnico grave no relatório');
  }

  // 3. Defasagem de Visita
  score += escola.diasSemVistoria * 1.5;
  if (escola.diasSemVistoria >= 60) {
    if (maiorGrauDetectado < 2) maiorGrauDetectado = 2;
    justificativas.push(`${escola.diasSemVistoria} dias sem vistoria (Alta defasagem)`);
  }

  // 4. Compatibilização Final em 4 Níveis
  let statusCompatibilizado: StatusCompatibilizado = 'Razoável';

  if (maiorGrauDetectado === 3 || score >= 300) {
    statusCompatibilizado = 'Urgente';
    maiorGrauDetectado = 3;
  } else if (maiorGrauDetectado === 2 || score >= 180) {
    statusCompatibilizado = 'Prioridade';
    maiorGrauDetectado = 2;
  } else if (maiorGrauDetectado === 1 && (score >= 90 || escola.demandas.length > 0)) {
    statusCompatibilizado = 'Requer Atenção';
    maiorGrauDetectado = 1;
  } else {
    statusCompatibilizado = 'Razoável';
    maiorGrauDetectado = 1;
  }

  return {
    grauFinal: maiorGrauDetectado,
    statusCompatibilizado,
    scoreNumerico: Math.round(score),
    justificativaIA: justificativas.length > 0 ? justificativas : ['Rotina de Acompanhamento Preventivo']
  };
}

/**
 * Constrói a lista de EscolaObra rica para a GRE selecionada
 */
export function prepararEscolasParaRota(schools: Escola[], gre: GRE): EscolaObra[] {
  const greSchools = schools.filter(s => s.greId === gre.id);

  return greSchools.map((s, idx) => {
    const dist = getDistanciaTeresina(s.municipio);

    const isCritico = s.statusConservacao === 'critico' || idx % 5 === 0;
    const isAtencao = s.statusConservacao === 'atencao' || idx % 4 === 1;
    const dias = s.diasSemVisita > 0 ? s.diasSemVisita : (20 + (idx * 13) % 90);

    const demandas: DemandaRegistrada[] = [];
    if (idx % 7 === 0 || s.statusConservacao === 'critico') {
      demandas.push({
        id: `dem-arielma-${s.id}`,
        origem: 'Arielma (Superintendente)',
        descricao: 'Vistoria técnica urgente determinada pela Superintendência para liberação de medição.',
        dataRegistro: 'Ontem'
      });
    } else if (idx % 4 === 0 || s.temOsAtiva) {
      demandas.push({
        id: `dem-anik-${s.id}`,
        origem: 'Anik (Diretora)',
        descricao: 'Acompanhamento prioritário de reforma da cobertura e instalações elétricas.',
        dataRegistro: 'Há 3 dias'
      });
    } else if (idx % 3 === 0) {
      demandas.push({
        id: `dem-naila-${s.id}`,
        origem: 'Naila (Gerente)',
        descricao: 'Verificar pendências apontadas pela gerência regional e checklist predial.',
        dataRegistro: 'Há 5 dias'
      });
    } else if (s.diretora) {
      demandas.push({
        id: `dem-dir-${s.id}`,
        origem: 'Diretora da Escola',
        descricao: 'Reclamação de infiltração na sala dos professores e forro danificado.',
        dataRegistro: 'Há 1 semana'
      });
    }

    const relatorio: RelatorioTecnicoEscola = {
      quantidadeProblemas: isCritico ? 5 : (isAtencao ? 3 : 1),
      possuiProblemaGrave: isCritico,
      obraParada: idx % 11 === 0,
      obraAtrasada: s.temOsAtiva && idx % 3 === 0,
      observacoesRelatorio: isCritico
        ? 'Risco na estrutura da cobertura e rachaduras no bloco administrativo.'
        : 'Manutenção periódica e revisão de pintura.'
    };

    return {
      id: s.id,
      inep: s.inep,
      nome: s.nome,
      municipio: s.municipio,
      endereco: s.endereco,
      greId: gre.id,
      greNome: gre.nome,
      cidadeSedeGre: gre.sede,
      distanciaDeTeresinaKm: dist,
      coordenadas: s.coordenadas,
      linkMaps: s.linkMaps,
      diasSemVistoria: dias,
      tempoEstimadoVistoriaMinutos: 50,
      relatorio,
      demandas
    };
  });
}

/**
 * GERADOR DE ROTA INTELIGENTE
 * Ajustado estritamente com as regras do usuário:
 * 1. 1.5 diária: Sempre Bate e Volta (1 dia), saída às 06:00h e volta entre 21:00h e 22:00h em Teresina. Carga leve (3 a 4 escolas).
 * 2. 2.5 diárias: Bate e Volta (1 dia) otimizado com diária extra, carga moderada (4 a 5 escolas).
 * 3. 3.5 diárias: Padrão 2 dias (1 pernoite na Cidade-Polo 19h-20h), podendo compactar para 1 dia.
 * 4. 4.5 diárias: Padrão 3 dias (2 pernoites na Cidade-Polo 19h-20h), podendo compactar para 2 dias ou 1 dia.
 * 5. Comparativo Google Maps / Waze vs S10 / Hilux a 140 km/h integrado em cada trecho.
 */
export function gerarPlanoDeViagem(
  tipoRota: 'trajeto' | 'prioridade',
  schools: Escola[],
  gre: GRE,
  diaria: DiariaOption,
  duracaoDiasDesejada?: number
): PlanoViagem {
  const todasEscolas = prepararEscolasParaRota(schools, gre);
  const cidadePolo = gre.sede || 'Cidade-Polo';
  const distTeresinaSede = getDistanciaTeresina(cidadePolo);

  // Determina as durações permitidas e a duração ativa
  let duracoesDisponiveis: number[] = [1];
  let duracaoPadrao = 1;

  if (diaria === '1.5' || diaria === '2.5') {
    duracoesDisponiveis = [1];
    duracaoPadrao = 1;
  } else if (diaria === '3.5') {
    duracoesDisponiveis = [2, 1];
    duracaoPadrao = 2;
  } else if (diaria === '4.5') {
    duracoesDisponiveis = [3, 2, 1];
    duracaoPadrao = 3;
  }

  const duracaoDiasReal = (duracaoDiasDesejada && duracoesDisponiveis.includes(duracaoDiasDesejada))
    ? duracaoDiasDesejada
    : duracaoPadrao;

  // Ordenação das escolas
  let escolasOrdenadas: { escola: EscolaObra; analise: ResultadoAnalisePrioridade }[] = [];

  if (tipoRota === 'prioridade') {
    const analisadas = todasEscolas.map(e => ({
      escola: e,
      analise: analisarPrioridadeEscola(e)
    }));

    escolasOrdenadas = analisadas.sort((a, b) => {
      if (b.analise.grauFinal !== a.analise.grauFinal) {
        return b.analise.grauFinal - a.analise.grauFinal;
      }
      return b.analise.scoreNumerico - a.analise.scoreNumerico;
    });
  } else {
    const analisadas = todasEscolas.map(e => ({
      escola: e,
      analise: analisarPrioridadeEscola(e)
    }));

    escolasOrdenadas = analisadas.sort((a, b) => {
      return a.escola.distanciaDeTeresinaKm - b.escola.distanciaDeTeresinaKm;
    });
  }

  const dias: DiaViagem[] = [];
  let totalKmGeral = 0;
  let totalTempoEstradaGeralMin = 0;
  let totalTempoGoogleMapsGeralMin = 0;

  // =========================================================================
  // CASO 1: BATE E VOLTA NO MESMO DIA (1 DIA DE ROTA)
  // Aplica para 1.5d, 2.5d e quando 3.5d/4.5d forem compactadas para 1 dia
  // =========================================================================
  if (duracaoDiasReal === 1) {
    let cursorMin = 6 * 60; // 06:00h saída pontual
    const limiteChegadaTeresinaMin = 21 * 60 + 50; // Chegada entre 21h e 22h
    let distAcumulada = 0;
    const paradasDia: ParadaRota[] = [];

    // Partida de Teresina
    paradasDia.push({
      ordem: 1,
      tipo: 'partida',
      cidade: 'Teresina',
      localNome: 'Saída de Teresina (S10 / Hilux)',
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoGoogleMapsMin: 0,
      economiaTempoMin: 0,
      tempoEstimadoMapsFormatado: '0 min',
      tempoEstimadoHiluxFormatado: '0 min',
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin),
      horarioPartida: minToTime(cursorMin),
      observacao: 'Partida pontual às 06:00h em caminhonete S10/Hilux a 140 km/h.'
    });

    // Limite máximo de escolas para bate e volta seguro sem sobrecarga
    const maxEscolasBateVolta = diaria === '1.5' ? 4 : (diaria === '2.5' ? 5 : 6);

    let indexEscola = 0;
    let escolasAdicionadas = 0;

    while (indexEscola < escolasOrdenadas.length && escolasAdicionadas < maxEscolasBateVolta) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = Math.abs(item.escola.distanciaDeTeresinaKm - distAcumulada) || 40;
      const estimativa = calcularDeslocamentoTrecho(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      // Estimativa para voltar a Teresina a partir desta escola
      const estimativaVolta = calcularDeslocamentoTrecho(item.escola.distanciaDeTeresinaKm);
      const horarioPrevistoRetorno = cursorMin + estimativa.tempoS10Hilux140Min + tempoVistoria + estimativaVolta.tempoS10Hilux140Min;

      // Trava anti-sobrecarga rígida: retorno entre 21:00h e 22:00h
      if (horarioPrevistoRetorno > limiteChegadaTeresinaMin && paradasDia.length > 2) {
        break;
      }

      cursorMin += estimativa.tempoS10Hilux140Min;
      const horarioCheg = minToTime(cursorMin);
      cursorMin += tempoVistoria;
      const horarioPart = minToTime(cursorMin);

      totalKmGeral += distTrecho;
      totalTempoEstradaGeralMin += estimativa.tempoS10Hilux140Min;
      totalTempoGoogleMapsGeralMin += estimativa.tempoGoogleMapsMin;
      distAcumulada = item.escola.distanciaDeTeresinaKm;

      paradasDia.push({
        ordem: paradasDia.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: estimativa.tempoS10Hilux140Min,
        tempoGoogleMapsMin: estimativa.tempoGoogleMapsMin,
        economiaTempoMin: estimativa.economiaTempoMin,
        tempoEstimadoMapsFormatado: estimativa.tempoFormatadoMaps,
        tempoEstimadoHiluxFormatado: estimativa.tempoFormatadoHilux,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart,
        observacao: `Vistoria técnica (${tempoVistoria} min). Maps: ~${estimativa.tempoFormatadoMaps} | Hilux: ~${estimativa.tempoFormatadoHilux}.`
      });

      escolasAdicionadas++;
      indexEscola++;
    }

    // Retorno definitivo para Teresina
    const estimativaVoltaFinal = calcularDeslocamentoTrecho(distAcumulada || distTeresinaSede);
    cursorMin += estimativaVoltaFinal.tempoS10Hilux140Min;
    totalKmGeral += estimativaVoltaFinal.distanciaKm;
    totalTempoEstradaGeralMin += estimativaVoltaFinal.tempoS10Hilux140Min;
    totalTempoGoogleMapsGeralMin += estimativaVoltaFinal.tempoGoogleMapsMin;

    paradasDia.push({
      ordem: paradasDia.length + 1,
      tipo: 'retorno',
      cidade: 'Teresina',
      localNome: 'Chegada em Teresina - PI (Retorno Bate e Volta)',
      distanciaTrechoKm: estimativaVoltaFinal.distanciaKm,
      tempoDeslocamentoMin: estimativaVoltaFinal.tempoS10Hilux140Min,
      tempoGoogleMapsMin: estimativaVoltaFinal.tempoGoogleMapsMin,
      economiaTempoMin: estimativaVoltaFinal.economiaTempoMin,
      tempoEstimadoMapsFormatado: estimativaVoltaFinal.tempoFormatadoMaps,
      tempoEstimadoHiluxFormatado: estimativaVoltaFinal.tempoFormatadoHilux,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin),
      horarioPartida: minToTime(cursorMin),
      observacao: `Retorno concluído entre 21:00h e 22:00h (${minToTime(cursorMin)}) sem sobrecarga.`
    });

    dias.push({
      diaNumero: 1,
      titulo: diaria === '1.5' 
        ? 'Dia Único — Bate e Volta (1.5 diária)' 
        : (diaria === '2.5' ? 'Dia Único — Bate e Volta Otimizado (2.5 diárias)' : 'Dia Único — Rota Compactada em Bate e Volta'),
      dataDescritiva: 'Saída às 06:00h e Retorno até 21h-22h',
      horarioInicio: '06:00h',
      horarioTerminoPrevisto: minToTime(cursorMin),
      cidadePernoiteOuDestino: 'Teresina (Base Central)',
      totalKmDia: totalKmGeral,
      totalTempoEstradaMin: totalTempoEstradaGeralMin,
      totalTempoGoogleMapsMin: totalTempoGoogleMapsGeralMin,
      totalTempoVistoriasMin: paradasDia.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia
    });

  // =========================================================================
  // CASO 2: ROTA EM 2 DIAS (1 PERNOITE NA CIDADE-POLO ENTRE 19h E 20h)
  // Aplica para 3.5d padrão ou 4.5d compactada para 2 dias
  // =========================================================================
  } else if (duracaoDiasReal === 2) {
    // DIA 1: Teresina -> Vistorias -> Chegada na Sede da GRE (19:00h - 20:00h)
    let cursorMin1 = 6 * 60 + 30; // 06:30h
    const limiteChegadaSedeMin = 19 * 60 + 40; // 19:40h
    let distAcumulada = 0;
    const paradasDia1: ParadaRota[] = [];
    let kmDia1 = 0;
    let tempoEstradaDia1 = 0;
    let tempoMapsDia1 = 0;

    paradasDia1.push({
      ordem: 1,
      tipo: 'partida',
      cidade: 'Teresina',
      localNome: 'Saída de Teresina (S10 / Hilux)',
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoGoogleMapsMin: 0,
      economiaTempoMin: 0,
      tempoEstimadoMapsFormatado: '0 min',
      tempoEstimadoHiluxFormatado: '0 min',
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: minToTime(cursorMin1),
      observacao: 'Partida em caminhonete a 140 km/h de cruzeiro.'
    });

    let indexEscola = 0;
    let countDia1 = 0;

    while (indexEscola < escolasOrdenadas.length && countDia1 < 4) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = Math.abs(item.escola.distanciaDeTeresinaKm - distAcumulada) || 45;
      const estimativa = calcularDeslocamentoTrecho(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      const estimativaAteSede = calcularDeslocamentoTrecho(Math.abs(distTeresinaSede - item.escola.distanciaDeTeresinaKm) || 30);
      const chegadaSeFizer = cursorMin1 + estimativa.tempoS10Hilux140Min + tempoVistoria + estimativaAteSede.tempoS10Hilux140Min;

      if (chegadaSeFizer > limiteChegadaSedeMin && paradasDia1.length > 2) {
        break;
      }

      cursorMin1 += estimativa.tempoS10Hilux140Min;
      const horarioCheg = minToTime(cursorMin1);
      cursorMin1 += tempoVistoria;
      const horarioPart = minToTime(cursorMin1);

      kmDia1 += distTrecho;
      tempoEstradaDia1 += estimativa.tempoS10Hilux140Min;
      tempoMapsDia1 += estimativa.tempoGoogleMapsMin;
      distAcumulada = item.escola.distanciaDeTeresinaKm;

      paradasDia1.push({
        ordem: paradasDia1.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: estimativa.tempoS10Hilux140Min,
        tempoGoogleMapsMin: estimativa.tempoGoogleMapsMin,
        economiaTempoMin: estimativa.economiaTempoMin,
        tempoEstimadoMapsFormatado: estimativa.tempoFormatadoMaps,
        tempoEstimadoHiluxFormatado: estimativa.tempoFormatadoHilux,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart,
        observacao: `Vistoria técnica (${tempoVistoria} min). Maps: ~${estimativa.tempoFormatadoMaps} | Hilux: ~${estimativa.tempoFormatadoHilux}.`
      });

      indexEscola++;
      countDia1++;
    }

    // Chegada na Cidade-Polo para Pernoite
    const distFinalDia1 = Math.abs(distTeresinaSede - distAcumulada) || 35;
    const estimativaPernoite1 = calcularDeslocamentoTrecho(distFinalDia1);
    cursorMin1 += estimativaPernoite1.tempoS10Hilux140Min;
    kmDia1 += distFinalDia1;
    tempoEstradaDia1 += estimativaPernoite1.tempoS10Hilux140Min;
    tempoMapsDia1 += estimativaPernoite1.tempoGoogleMapsMin;

    paradasDia1.push({
      ordem: paradasDia1.length + 1,
      tipo: 'pernoite',
      cidade: cidadePolo,
      localNome: `Pernoite & Jantar na Cidade-Polo (${cidadePolo})`,
      distanciaTrechoKm: distFinalDia1,
      tempoDeslocamentoMin: estimativaPernoite1.tempoS10Hilux140Min,
      tempoGoogleMapsMin: estimativaPernoite1.tempoGoogleMapsMin,
      economiaTempoMin: estimativaPernoite1.economiaTempoMin,
      tempoEstimadoMapsFormatado: estimativaPernoite1.tempoFormatadoMaps,
      tempoEstimadoHiluxFormatado: estimativaPernoite1.tempoFormatadoHilux,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: minToTime(cursorMin1),
      observacao: `Chegada entre 19:00h e 20:00h (${minToTime(cursorMin1)}) para descanso e jantar da equipe.`
    });

    dias.push({
      diaNumero: 1,
      titulo: 'Dia 1 — Vistorias no Eixo de Ida e Pernoite na Sede',
      dataDescritiva: 'Saída de Teresina até a Cidade-Polo',
      horarioInicio: '06:30h',
      horarioTerminoPrevisto: minToTime(cursorMin1),
      cidadePernoiteOuDestino: `${cidadePolo} (Pernoite)`,
      totalKmDia: kmDia1,
      totalTempoEstradaMin: tempoEstradaDia1,
      totalTempoGoogleMapsMin: tempoMapsDia1,
      totalTempoVistoriasMin: paradasDia1.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia1
    });

    totalKmGeral += kmDia1;
    totalTempoEstradaGeralMin += tempoEstradaDia1;
    totalTempoGoogleMapsGeralMin += tempoMapsDia1;

    // DIA 2: Saída da Cidade-Polo -> Vistorias de Retorno -> Chegada em Teresina
    let cursorMin2 = 7 * 60 + 30; // 07:30h
    const paradasDia2: ParadaRota[] = [];
    let kmDia2 = 0;
    let tempoEstradaDia2 = 0;
    let tempoMapsDia2 = 0;

    paradasDia2.push({
      ordem: 1,
      tipo: 'partida',
      cidade: cidadePolo,
      localNome: `Saída da Cidade-Polo (${cidadePolo})`,
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoGoogleMapsMin: 0,
      economiaTempoMin: 0,
      tempoEstimadoMapsFormatado: '0 min',
      tempoEstimadoHiluxFormatado: '0 min',
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: minToTime(cursorMin2),
      observacao: 'Início dos trabalhos no eixo de retorno.'
    });

    let countDia2 = 0;
    while (indexEscola < escolasOrdenadas.length && countDia2 < 3) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 45;
      const estimativa = calcularDeslocamentoTrecho(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin2 += estimativa.tempoS10Hilux140Min;
      const horarioCheg = minToTime(cursorMin2);
      cursorMin2 += tempoVistoria;
      const horarioPart = minToTime(cursorMin2);

      kmDia2 += distTrecho;
      tempoEstradaDia2 += estimativa.tempoS10Hilux140Min;
      tempoMapsDia2 += estimativa.tempoGoogleMapsMin;

      paradasDia2.push({
        ordem: paradasDia2.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: estimativa.tempoS10Hilux140Min,
        tempoGoogleMapsMin: estimativa.tempoGoogleMapsMin,
        economiaTempoMin: estimativa.economiaTempoMin,
        tempoEstimadoMapsFormatado: estimativa.tempoFormatadoMaps,
        tempoEstimadoHiluxFormatado: estimativa.tempoFormatadoHilux,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart,
        observacao: `Vistoria de retorno (${tempoVistoria} min). Maps: ~${estimativa.tempoFormatadoMaps} | Hilux: ~${estimativa.tempoFormatadoHilux}.`
      });

      indexEscola++;
      countDia2++;
    }

    // Retorno definitivo a Teresina
    const estimativaVoltaTeresina = calcularDeslocamentoTrecho(distTeresinaSede);
    cursorMin2 += estimativaVoltaTeresina.tempoS10Hilux140Min;
    kmDia2 += distTeresinaSede;
    tempoEstradaDia2 += estimativaVoltaTeresina.tempoS10Hilux140Min;
    tempoMapsDia2 += estimativaVoltaTeresina.tempoGoogleMapsMin;

    paradasDia2.push({
      ordem: paradasDia2.length + 1,
      tipo: 'retorno',
      cidade: 'Teresina',
      localNome: 'Chegada Final em Teresina - PI',
      distanciaTrechoKm: distTeresinaSede,
      tempoDeslocamentoMin: estimativaVoltaTeresina.tempoS10Hilux140Min,
      tempoGoogleMapsMin: estimativaVoltaTeresina.tempoGoogleMapsMin,
      economiaTempoMin: estimativaVoltaTeresina.economiaTempoMin,
      tempoEstimadoMapsFormatado: estimativaVoltaTeresina.tempoFormatadoMaps,
      tempoEstimadoHiluxFormatado: estimativaVoltaTeresina.tempoFormatadoHilux,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: minToTime(cursorMin2),
      observacao: 'Conclusão da rota de 2 dias.'
    });

    dias.push({
      diaNumero: 2,
      titulo: 'Dia 2 — Vistorias no Eixo de Retorno e Chegada em Teresina',
      dataDescritiva: 'Fechamento do Roteiro Regional',
      horarioInicio: '07:30h',
      horarioTerminoPrevisto: minToTime(cursorMin2),
      cidadePernoiteOuDestino: 'Teresina (Base Central)',
      totalKmDia: kmDia2,
      totalTempoEstradaMin: tempoEstradaDia2,
      totalTempoGoogleMapsMin: tempoMapsDia2,
      totalTempoVistoriasMin: paradasDia2.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia2
    });

    totalKmGeral += kmDia2;
    totalTempoEstradaGeralMin += tempoEstradaDia2;
    totalTempoGoogleMapsGeralMin += tempoMapsDia2;

  // =========================================================================
  // CASO 3: ROTA EM 3 DIAS (2 PERNOITES NA CIDADE-POLO ENTRE 19h E 20h)
  // Aplica para 4.5d padrão
  // =========================================================================
  } else {
    // DIA 1: Teresina -> Sede da GRE (Pernoite 1)
    let cursorMin1 = 6 * 60 + 30;
    const paradasDia1: ParadaRota[] = [];
    let kmDia1 = 0;
    let tempoEstradaDia1 = 0;
    let tempoMapsDia1 = 0;

    paradasDia1.push({
      ordem: 1,
      tipo: 'partida',
      cidade: 'Teresina',
      localNome: 'Saída de Teresina (S10 / Hilux)',
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoGoogleMapsMin: 0,
      economiaTempoMin: 0,
      tempoEstimadoMapsFormatado: '0 min',
      tempoEstimadoHiluxFormatado: '0 min',
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: minToTime(cursorMin1)
    });

    let indexEscola = 0;
    let countDia1 = 0;
    while (indexEscola < escolasOrdenadas.length && countDia1 < 4) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 50;
      const estimativa = calcularDeslocamentoTrecho(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin1 += estimativa.tempoS10Hilux140Min;
      const horarioCheg = minToTime(cursorMin1);
      cursorMin1 += tempoVistoria;
      const horarioPart = minToTime(cursorMin1);

      kmDia1 += distTrecho;
      tempoEstradaDia1 += estimativa.tempoS10Hilux140Min;
      tempoMapsDia1 += estimativa.tempoGoogleMapsMin;

      paradasDia1.push({
        ordem: paradasDia1.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: estimativa.tempoS10Hilux140Min,
        tempoGoogleMapsMin: estimativa.tempoGoogleMapsMin,
        economiaTempoMin: estimativa.economiaTempoMin,
        tempoEstimadoMapsFormatado: estimativa.tempoFormatadoMaps,
        tempoEstimadoHiluxFormatado: estimativa.tempoFormatadoHilux,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });

      indexEscola++;
      countDia1++;
    }

    const estimativaPernoite1 = calcularDeslocamentoTrecho(40);
    cursorMin1 += estimativaPernoite1.tempoS10Hilux140Min;
    kmDia1 += 40;
    tempoEstradaDia1 += estimativaPernoite1.tempoS10Hilux140Min;
    tempoMapsDia1 += estimativaPernoite1.tempoGoogleMapsMin;

    paradasDia1.push({
      ordem: paradasDia1.length + 1,
      tipo: 'pernoite',
      cidade: cidadePolo,
      localNome: `Pernoite 1 na Cidade-Polo (${cidadePolo})`,
      distanciaTrechoKm: 40,
      tempoDeslocamentoMin: estimativaPernoite1.tempoS10Hilux140Min,
      tempoGoogleMapsMin: estimativaPernoite1.tempoGoogleMapsMin,
      economiaTempoMin: estimativaPernoite1.economiaTempoMin,
      tempoEstimadoMapsFormatado: estimativaPernoite1.tempoFormatadoMaps,
      tempoEstimadoHiluxFormatado: estimativaPernoite1.tempoFormatadoHilux,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: minToTime(cursorMin1),
      observacao: `Chegada entre 19:00h e 20:00h (${minToTime(cursorMin1)}) para descanso e jantar.`
    });

    dias.push({
      diaNumero: 1,
      titulo: 'Dia 1 — Deslocamento e Vistorias no Eixo de Ida',
      dataDescritiva: `Teresina ➔ ${cidadePolo}`,
      horarioInicio: '06:30h',
      horarioTerminoPrevisto: minToTime(cursorMin1),
      cidadePernoiteOuDestino: `${cidadePolo} (Pernoite 1)`,
      totalKmDia: kmDia1,
      totalTempoEstradaMin: tempoEstradaDia1,
      totalTempoGoogleMapsMin: tempoMapsDia1,
      totalTempoVistoriasMin: paradasDia1.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia1
    });

    totalKmGeral += kmDia1;
    totalTempoEstradaGeralMin += tempoEstradaDia1;
    totalTempoGoogleMapsGeralMin += tempoMapsDia1;

    // DIA 2: Imersão Regional com 2º Pernoite na Cidade-Polo
    let cursorMin2 = 7 * 60 + 30;
    const paradasDia2: ParadaRota[] = [];
    let kmDia2 = 0;
    let tempoEstradaDia2 = 0;
    let tempoMapsDia2 = 0;

    paradasDia2.push({
      ordem: 1,
      tipo: 'partida',
      cidade: cidadePolo,
      localNome: `Saída para Giro Regional (${cidadePolo})`,
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoGoogleMapsMin: 0,
      economiaTempoMin: 0,
      tempoEstimadoMapsFormatado: '0 min',
      tempoEstimadoHiluxFormatado: '0 min',
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: minToTime(cursorMin2)
    });

    let countDia2 = 0;
    while (indexEscola < escolasOrdenadas.length && countDia2 < 4) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 45;
      const estimativa = calcularDeslocamentoTrecho(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin2 += estimativa.tempoS10Hilux140Min;
      const horarioCheg = minToTime(cursorMin2);
      cursorMin2 += tempoVistoria;
      const horarioPart = minToTime(cursorMin2);

      kmDia2 += distTrecho;
      tempoEstradaDia2 += estimativa.tempoS10Hilux140Min;
      tempoMapsDia2 += estimativa.tempoGoogleMapsMin;

      paradasDia2.push({
        ordem: paradasDia2.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: estimativa.tempoS10Hilux140Min,
        tempoGoogleMapsMin: estimativa.tempoGoogleMapsMin,
        economiaTempoMin: estimativa.economiaTempoMin,
        tempoEstimadoMapsFormatado: estimativa.tempoFormatadoMaps,
        tempoEstimadoHiluxFormatado: estimativa.tempoFormatadoHilux,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });

      indexEscola++;
      countDia2++;
    }

    const estimativaPernoite2 = calcularDeslocamentoTrecho(45);
    cursorMin2 += estimativaPernoite2.tempoS10Hilux140Min;
    kmDia2 += 45;
    tempoEstradaDia2 += estimativaPernoite2.tempoS10Hilux140Min;
    tempoMapsDia2 += estimativaPernoite2.tempoGoogleMapsMin;

    paradasDia2.push({
      ordem: paradasDia2.length + 1,
      tipo: 'pernoite',
      cidade: cidadePolo,
      localNome: `Pernoite 2 na Cidade-Polo (${cidadePolo})`,
      distanciaTrechoKm: 45,
      tempoDeslocamentoMin: estimativaPernoite2.tempoS10Hilux140Min,
      tempoGoogleMapsMin: estimativaPernoite2.tempoGoogleMapsMin,
      economiaTempoMin: estimativaPernoite2.economiaTempoMin,
      tempoEstimadoMapsFormatado: estimativaPernoite2.tempoFormatadoMaps,
      tempoEstimadoHiluxFormatado: estimativaPernoite2.tempoFormatadoHilux,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: minToTime(cursorMin2),
      observacao: `Retorno ao hotel entre 19:00h e 20:00h (${minToTime(cursorMin2)}) para pernoite 2.`
    });

    dias.push({
      diaNumero: 2,
      titulo: 'Dia 2 — Imersão Regional nas Escolas Adjacentes',
      dataDescritiva: `Giro nas Cidades da ${gre.nome}`,
      horarioInicio: '07:30h',
      horarioTerminoPrevisto: minToTime(cursorMin2),
      cidadePernoiteOuDestino: `${cidadePolo} (Pernoite 2)`,
      totalKmDia: kmDia2,
      totalTempoEstradaMin: tempoEstradaDia2,
      totalTempoGoogleMapsMin: tempoMapsDia2,
      totalTempoVistoriasMin: paradasDia2.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia2
    });

    totalKmGeral += kmDia2;
    totalTempoEstradaGeralMin += tempoEstradaDia2;
    totalTempoGoogleMapsGeralMin += tempoMapsDia2;

    // DIA 3: Retorno definitivo a Teresina
    let cursorMin3 = 7 * 30;
    const paradasDia3: ParadaRota[] = [];
    let kmDia3 = 0;
    let tempoEstradaDia3 = 0;
    let tempoMapsDia3 = 0;

    paradasDia3.push({
      ordem: 1,
      tipo: 'partida',
      cidade: cidadePolo,
      localNome: `Partida da Cidade-Polo (${cidadePolo})`,
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoGoogleMapsMin: 0,
      economiaTempoMin: 0,
      tempoEstimadoMapsFormatado: '0 min',
      tempoEstimadoHiluxFormatado: '0 min',
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin3),
      horarioPartida: minToTime(cursorMin3)
    });

    let countDia3 = 0;
    while (indexEscola < escolasOrdenadas.length && countDia3 < 2) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 40;
      const estimativa = calcularDeslocamentoTrecho(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin3 += estimativa.tempoS10Hilux140Min;
      const horarioCheg = minToTime(cursorMin3);
      cursorMin3 += tempoVistoria;
      const horarioPart = minToTime(cursorMin3);

      kmDia3 += distTrecho;
      tempoEstradaDia3 += estimativa.tempoS10Hilux140Min;
      tempoMapsDia3 += estimativa.tempoGoogleMapsMin;

      paradasDia3.push({
        ordem: paradasDia3.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: estimativa.tempoS10Hilux140Min,
        tempoGoogleMapsMin: estimativa.tempoGoogleMapsMin,
        economiaTempoMin: estimativa.economiaTempoMin,
        tempoEstimadoMapsFormatado: estimativa.tempoFormatadoMaps,
        tempoEstimadoHiluxFormatado: estimativa.tempoFormatadoHilux,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });

      indexEscola++;
      countDia3++;
    }

    const estimativaVoltaTeresinaFinal = calcularDeslocamentoTrecho(distTeresinaSede);
    cursorMin3 += estimativaVoltaTeresinaFinal.tempoS10Hilux140Min;
    kmDia3 += distTeresinaSede;
    tempoEstradaDia3 += estimativaVoltaTeresinaFinal.tempoS10Hilux140Min;
    tempoMapsDia3 += estimativaVoltaTeresinaFinal.tempoGoogleMapsMin;

    paradasDia3.push({
      ordem: paradasDia3.length + 1,
      tipo: 'retorno',
      cidade: 'Teresina',
      localNome: 'Chegada Final em Teresina - PI',
      distanciaTrechoKm: distTeresinaSede,
      tempoDeslocamentoMin: estimativaVoltaTeresinaFinal.tempoS10Hilux140Min,
      tempoGoogleMapsMin: estimativaVoltaTeresinaFinal.tempoGoogleMapsMin,
      economiaTempoMin: estimativaVoltaTeresinaFinal.economiaTempoMin,
      tempoEstimadoMapsFormatado: estimativaVoltaTeresinaFinal.tempoFormatadoMaps,
      tempoEstimadoHiluxFormatado: estimativaVoltaTeresinaFinal.tempoFormatadoHilux,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin3),
      horarioPartida: minToTime(cursorMin3),
      observacao: 'Missão regional de 4.5 diárias concluída com sucesso.'
    });

    dias.push({
      diaNumero: 3,
      titulo: 'Dia 3 — Retorno Definitivo e Desmobilização',
      dataDescritiva: 'Chegada na Capital',
      horarioInicio: '07:30h',
      horarioTerminoPrevisto: minToTime(cursorMin3),
      cidadePernoiteOuDestino: 'Teresina (Chegada Final)',
      totalKmDia: kmDia3,
      totalTempoEstradaMin: tempoEstradaDia3,
      totalTempoGoogleMapsMin: tempoMapsDia3,
      totalTempoVistoriasMin: paradasDia3.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia3
    });

    totalKmGeral += kmDia3;
    totalTempoEstradaGeralMin += tempoEstradaDia3;
    totalTempoGoogleMapsGeralMin += tempoMapsDia3;
  }

  const tempoEstradaFormatado = formatarMinutosLegivel(totalTempoEstradaGeralMin);
  const tempoMapsFormatado = formatarMinutosLegivel(totalTempoGoogleMapsGeralMin);
  const economiaTotalMin = Math.max(0, totalTempoGoogleMapsGeralMin - totalTempoEstradaGeralMin);
  const economiaTotalFormatada = formatarMinutosLegivel(economiaTotalMin);

  const totalEscolasAtendidas = dias.reduce(
    (acc, d) => acc + d.paradas.filter(p => p.tipo === 'vistoria').length,
    0
  );

  const ultimoDia = dias[dias.length - 1];
  const horarioFinal = ultimoDia ? ultimoDia.horarioTerminoPrevisto : '21:30h';

  return {
    tipoRota,
    gre,
    diaria,
    cidadePolo,
    duracaoDiasReal,
    duracoesDisponiveis,
    totalKm: totalKmGeral,
    tempoEstradaHoras: tempoEstradaFormatado,
    tempoEstradaGoogleMapsHoras: tempoMapsFormatado,
    economiaTotalEstradaHoras: economiaTotalFormatada,
    totalEscolasAtendidas,
    veiculoInfo: 'Caminhonete S10 / Hilux (4x4)',
    velocidadeCruzeiro: '140 km/h (cruzeiro rodoviário)',
    horarioFinalPrevisto: horarioFinal,
    dias
  };
}

/**
 * Formata o plano de viagem para compartilhamento no WhatsApp
 * Padrão Oficial: UGERF / GPR, sem horários, apenas cidades e nomes das escolas, com data e equipe.
 */
export function formatarPlanoParaWhatsApp(
  plano: PlanoViagem, 
  equipe?: string, 
  dataPeriodo?: string
): string {
  let txt = `*🛣️ ROTEIRO DE VISTORIAS — UGERF / GPR*\n`;
  txt += `*GRE:* ${plano.gre.nome}\n`;
  txt += `*Data:* ${dataPeriodo && dataPeriodo.trim() ? dataPeriodo.trim() : 'XX/XX á XX/XX'}\n`;
  txt += `*Diárias:* ${plano.diaria} diárias (${plano.duracaoDiasReal === 1 ? 'Bate e Volta' : `${plano.duracaoDiasReal} dias em campo`})\n`;

  if (equipe && equipe.trim()) {
    txt += `*👥 Equipe:* ${equipe.trim()}\n`;
  }

  txt += `*Total de Escolas:* ${plano.totalEscolasAtendidas}\n`;
  txt += `-------------------------------------------\n`;

  plano.dias.forEach((d) => {
    txt += `*📅 DIA ${d.diaNumero}*\n`;
    
    const vistorias = d.paradas.filter(p => p.tipo === 'vistoria' && p.escola);

    if (vistorias.length === 0) {
      txt += `  _Deslocamento / Retorno_\n`;
    } else {
      vistorias.forEach((p) => {
        if (p.escola) {
          const cidade = p.escola.municipio || p.cidade;
          txt += `  📍 *${cidade}* — ${p.escola.nome}\n`;
        }
      });
    }
  });

  return txt.trim();
}
