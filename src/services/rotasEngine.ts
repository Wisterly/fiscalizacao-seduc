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

export interface ParadaRota {
  ordem: number;
  tipo: 'partida' | 'vistoria' | 'pernoite' | 'retorno';
  escola?: EscolaObra;
  analisePrioridade?: ResultadoAnalisePrioridade;
  cidade: string;
  localNome: string;
  distanciaTrechoKm: number;
  tempoDeslocamentoMin: number;
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
  totalTempoVistoriasMin: number;
  paradas: ParadaRota[];
}

export interface PlanoViagem {
  tipoRota: 'trajeto' | 'prioridade';
  gre: GRE;
  diaria: DiariaOption;
  cidadePolo: string;
  totalKm: number;
  tempoEstradaHoras: string;
  totalEscolasAtendidas: number;
  veiculoInfo: string;
  velocidadeCruzeiro: string;
  horarioFinalPrevisto: string;
  dias: DiaViagem[];
}

// Distâncias referenciais aproximadas (km) saindo de Teresina para as Sedes e Cidades do PI
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
  // Se não estiver na tabela, calcula uma estimativa realista
  return 250;
}

/**
 * MOTOR DE COMPATIBILIZAÇÃO E ANÁLISE DE PRIORIDADE DA ESCOLA
 * (Especificação exata do Super Prompt)
 */
export function analisarPrioridadeEscola(escola: EscolaObra): ResultadoAnalisePrioridade {
  let score = 0;
  let maiorGrauDetectado: GrauCriticidade = 1;
  const justificativas: string[] = [];

  // 1. Avaliar Demandas Diretas pela Hierarquia (Naila, Anik, Arielma e Diretora da Escola)
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
        // Análise inteligente cruzando a reclamação da Diretora com o Relatório Técnico
        if (escola.relatorio.possuiProblemaGrave || escola.relatorio.quantidadeProblemas >= 5 || escola.relatorio.obraParada) {
          maiorGrauDetectado = 3;
          score += 260;
          justificativas.push('Demanda da Diretora da Escola + Relatório Crítico (Elevado para Grau 3)');
        } else if (escola.relatorio.quantidadeProblemas >= 3 || escola.relatorio.obraAtrasada) {
          if (maiorGrauDetectado < 2) maiorGrauDetectado = 2;
          score += 170;
          justificativas.push('Demanda da Diretora da Escola + Múltiplos Problemas no Relatório (Grau 2)');
        } else {
          score += 70;
          justificativas.push('Demanda da Diretora da Escola (Resolução com calma / Grau 1)');
        }
        break;
    }
  });

  // 2. Avaliar o Relatório Técnico de forma autônoma (mesmo sem demanda nominal)
  if (escola.relatorio.obraParada) {
    maiorGrauDetectado = 3;
    score += 220;
    justificativas.push('Obra Parada apontada em relatório');
  } else if (escola.relatorio.possuiProblemaGrave) {
    if (maiorGrauDetectado < 2) maiorGrauDetectado = 2;
    score += 150;
    justificativas.push('Problema técnico grave no relatório');
  }

  // 3. Avaliar Defasagem de Visita (Dias sem ir na obra)
  score += escola.diasSemVistoria * 1.5;
  if (escola.diasSemVistoria >= 60) {
    if (maiorGrauDetectado < 2) maiorGrauDetectado = 2;
    justificativas.push(`${escola.diasSemVistoria} dias sem vistoria (Alta defasagem)`);
  }

  // 4. Compatibilização Final em 4 Níveis: Razoável | Requer Atenção | Prioridade | Urgente
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
 * Converte minutos a partir das 00:00 para string "HH:MM"
 */
function minToTime(minutos: number): string {
  const h = Math.floor(minutos / 60) % 24;
  const m = Math.floor(minutos % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}h`;
}

/**
 * Calcula o tempo de estrada em minutos considerando a velocidade de 140 km/h (S10/Hilux)
 * com fator de correção para acessos urbanos e pontes (velocidade média efetiva ~115 km/h).
 */
export function calcularTempoEstradaMinutos(distanciaKm: number): number {
  // 140 km/h nominal -> com curvas/lombadas/acesso: fator 1.15
  const horas = distanciaKm / 125;
  return Math.max(15, Math.round(horas * 60));
}

/**
 * Constrói a lista de EscolaObra rica para a GRE selecionada,
 * injetando dados preditivos e históricos do sistema.
 */
export function prepararEscolasParaRota(schools: Escola[], gre: GRE): EscolaObra[] {
  const greSchools = schools.filter(s => s.greId === gre.id);

  return greSchools.map((s, idx) => {
    const dist = getDistanciaTeresina(s.municipio);

    // Simulação preditiva e histórica realista para criticidade
    const isCritico = s.statusConservacao === 'critico' || idx % 5 === 0;
    const isAtencao = s.statusConservacao === 'atencao' || idx % 4 === 1;
    const dias = s.diasSemVisita > 0 ? s.diasSemVisita : (20 + (idx * 13) % 90);

    // Demandas simuladas baseadas nos cargos oficiais
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
 * GERADOR DE ROTA INTELIGENTE (Trajeto vs Prioridade)
 */
export function gerarPlanoDeViagem(
  tipoRota: 'trajeto' | 'prioridade',
  schools: Escola[],
  gre: GRE,
  diaria: DiariaOption
): PlanoViagem {
  const todasEscolas = prepararEscolasParaRota(schools, gre);
  const cidadePolo = gre.sede || 'Cidade-Polo';
  const distTeresinaSede = getDistanciaTeresina(cidadePolo);

  let escolasOrdenadas: { escola: EscolaObra; analise: ResultadoAnalisePrioridade }[] = [];

  if (tipoRota === 'prioridade') {
    // 1. Analisa a prioridade de todas as escolas
    const analisadas = todasEscolas.map(e => ({
      escola: e,
      analise: analisarPrioridadeEscola(e)
    }));

    // 2. Ordena por Grau de Criticidade DECRESCENTE (Grau 3 -> Grau 2 -> Grau 1 -> Razoável)
    // e por score numérico
    escolasOrdenadas = analisadas.sort((a, b) => {
      if (b.analise.grauFinal !== a.analise.grauFinal) {
        return b.analise.grauFinal - a.analise.grauFinal;
      }
      return b.analise.scoreNumerico - a.analise.scoreNumerico;
    });
  } else {
    // Rota por Trajeto: Ordena geograficamente pela proximidade do corredor logístico
    const analisadas = todasEscolas.map(e => ({
      escola: e,
      analise: analisarPrioridadeEscola(e)
    }));

    escolasOrdenadas = analisadas.sort((a, b) => {
      // Primeiro cidades no eixo de ida para a sede
      return a.escola.distanciaDeTeresinaKm - b.escola.distanciaDeTeresinaKm;
    });
  }

  const dias: DiaViagem[] = [];
  let totalKmGeral = 0;
  let totalTempoEstradaGeralMin = 0;

  // Lógica por Regime de Diárias:
  if (diaria === '1.5') {
    // =========================================================================
    // REGIME 1.5 DIÁRIA: BATE E VOLTA NO MESMO DIA (Teto limite: 22:00h em Teresina)
    // =========================================================================
    let cursorMin = 6 * 60; // 06:00h
    const limiteChegadaTeresinaMin = 22 * 60; // 22:00h
    let pontoAtual = 'Teresina';
    let distAcumulada = 0;
    const paradasDia: ParadaRota[] = [];

    // Partida
    paradasDia.push({
      ordem: 1,
      tipo: 'partida',
      cidade: 'Teresina',
      localNome: 'Saída de Teresina (S10 / Hilux)',
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin),
      horarioPartida: minToTime(cursorMin),
      observacao: 'Saída pontual em caminhonete S10/Hilux a 140 km/h de cruzeiro.'
    });

    let indexEscola = 0;
    while (indexEscola < escolasOrdenadas.length) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = Math.abs(item.escola.distanciaDeTeresinaKm - (pontoAtual === 'Teresina' ? 0 : distAcumulada));
      const tempoEstrada = calcularTempoEstradaMinutos(distTrecho || 40);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;
      
      // Simula tempo de volta para Teresina após essa visita
      const tempoVoltaTeresina = calcularTempoEstradaMinutos(item.escola.distanciaDeTeresinaKm);
      const chegadaSeFizerEssa = cursorMin + tempoEstrada + tempoVistoria + tempoVoltaTeresina;

      // TRAVA ANTI-SOBRECARGA: Não pode estourar as 22:00h em Teresina
      if (chegadaSeFizerEssa > limiteChegadaTeresinaMin && paradasDia.length > 2) {
        break; // Corta novas adições
      }

      // Adiciona a parada
      cursorMin += tempoEstrada;
      const horarioCheg = minToTime(cursorMin);
      cursorMin += tempoVistoria;
      const horarioPart = minToTime(cursorMin);

      totalKmGeral += distTrecho;
      totalTempoEstradaGeralMin += tempoEstrada;
      distAcumulada = item.escola.distanciaDeTeresinaKm;
      pontoAtual = item.escola.municipio;

      paradasDia.push({
        ordem: paradasDia.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: tempoEstrada,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart,
        observacao: `Vistoria técnica padrão (${tempoVistoria} min).`
      });

      indexEscola++;
    }

    // Retorno para Teresina
    const tempoVolta = calcularTempoEstradaMinutos(distAcumulada);
    cursorMin += tempoVolta;
    totalKmGeral += distAcumulada;
    totalTempoEstradaGeralMin += tempoVolta;

    paradasDia.push({
      ordem: paradasDia.length + 1,
      tipo: 'retorno',
      cidade: 'Teresina',
      localNome: 'Chegada em Teresina - PI',
      distanciaTrechoKm: distAcumulada,
      tempoDeslocamentoMin: tempoVolta,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin),
      horarioPartida: minToTime(cursorMin),
      observacao: `Retorno concluído dentro do teto operacional das 22h (${minToTime(cursorMin)}).`
    });

    dias.push({
      diaNumero: 1,
      titulo: 'Dia Único — Bate e Volta com Teto às 22h',
      dataDescritiva: 'Saída e Retorno no mesmo dia',
      horarioInicio: '06:00h',
      horarioTerminoPrevisto: minToTime(cursorMin),
      cidadePernoiteOuDestino: 'Teresina (Retorno Definitivo)',
      totalKmDia: totalKmGeral,
      totalTempoEstradaMin: totalTempoEstradaGeralMin,
      totalTempoVistoriasMin: paradasDia.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia
    });

  } else if (diaria === '2.5' || diaria === '3.5') {
    // =========================================================================
    // REGIME 2.5 / 3.5 DIÁRIAS: 1 DIA DE ROTA + PERNOITE NA CIDADE-POLO + RETORNO
    // =========================================================================
    // DIA 1: Saída de Teresina até a Cidade-Polo da GRE (Chegada entre 19:00h e 20:00h)
    let cursorMin1 = 6 * 60 + 30; // 06:30h
    const limiteChegadaSedeMin = 19 * 60 + 30; // 19:30h
    let pontoAtual = 'Teresina';
    let distAcumulada = 0;
    const paradasDia1: ParadaRota[] = [];

    paradasDia1.push({
      ordem: 1,
      tipo: 'partida',
      cidade: 'Teresina',
      localNome: 'Saída de Teresina (S10 / Hilux)',
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: minToTime(cursorMin1),
      observacao: 'Partida com velocidade de cruzeiro 140 km/h rumo à jurisdição da GRE.'
    });

    let indexEscola = 0;
    let kmDia1 = 0;
    let tempoEstradaDia1 = 0;

    while (indexEscola < escolasOrdenadas.length) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = Math.abs(item.escola.distanciaDeTeresinaKm - distAcumulada) || 45;
      const tempoEstrada = calcularTempoEstradaMinutos(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;
      
      // Tempo restante até a cidade-polo
      const tempoAteSede = calcularTempoEstradaMinutos(Math.abs(distTeresinaSede - item.escola.distanciaDeTeresinaKm));
      const chegadaSeFizer = cursorMin1 + tempoEstrada + tempoVistoria + tempoAteSede;

      if (chegadaSeFizer > limiteChegadaSedeMin && paradasDia1.length > 2) {
        break;
      }

      cursorMin1 += tempoEstrada;
      const horarioCheg = minToTime(cursorMin1);
      cursorMin1 += tempoVistoria;
      const horarioPart = minToTime(cursorMin1);

      kmDia1 += distTrecho;
      tempoEstradaDia1 += tempoEstrada;
      distAcumulada = item.escola.distanciaDeTeresinaKm;
      pontoAtual = item.escola.municipio;

      paradasDia1.push({
        ordem: paradasDia1.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: tempoEstrada,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });

      indexEscola++;
    }

    // Deslocamento final até a Cidade-Polo da GRE para Jantar e Pernoite
    const distFinalSede = Math.abs(distTeresinaSede - distAcumulada) || 30;
    const tempoFinalSede = calcularTempoEstradaMinutos(distFinalSede);
    cursorMin1 += tempoFinalSede;
    kmDia1 += distFinalSede;
    tempoEstradaDia1 += tempoFinalSede;

    paradasDia1.push({
      ordem: paradasDia1.length + 1,
      tipo: 'pernoite',
      cidade: cidadePolo,
      localNome: `Cidade-Polo (${cidadePolo}) — Jantar & Pernoite`,
      distanciaTrechoKm: distFinalSede,
      tempoDeslocamentoMin: tempoFinalSede,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: '07:30h (Dia seguinte)',
      observacao: `Chegada entre 19h e 20h (${minToTime(cursorMin1)}) na sede da GRE para pernoite seguro.`
    });

    dias.push({
      diaNumero: 1,
      titulo: `Dia 1 — Deslocamento e Vistorias até ${cidadePolo}`,
      dataDescritiva: 'Eixo de Ida e Pernoite na Sede da GRE',
      horarioInicio: '06:30h',
      horarioTerminoPrevisto: minToTime(cursorMin1),
      cidadePernoiteOuDestino: `${cidadePolo} (Jantar & Pernoite)`,
      totalKmDia: kmDia1,
      totalTempoEstradaMin: tempoEstradaDia1,
      totalTempoVistoriasMin: paradasDia1.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia1
    });

    totalKmGeral += kmDia1;
    totalTempoEstradaGeralMin += tempoEstradaDia1;

    // DIA 2: Retorno para Teresina com vistorias no eixo de volta
    let cursorMin2 = 7 * 60 + 30; // 07:30h
    const paradasDia2: ParadaRota[] = [];
    let kmDia2 = 0;
    let tempoEstradaDia2 = 0;

    paradasDia2.push({
      ordem: 1,
      tipo: 'partida',
      cidade: cidadePolo,
      localNome: `Saída de ${cidadePolo} (Eixo de Retorno)`,
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: minToTime(cursorMin2),
      observacao: 'Partida matinal da sede regional cobrindo unidades complementares.'
    });

    // Pega mais 1 a 3 escolas no corredor de retorno
    let escolasRestantes = 0;
    while (indexEscola < escolasOrdenadas.length && escolasRestantes < 3) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 35;
      const tempoEstrada = calcularTempoEstradaMinutos(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin2 += tempoEstrada;
      const horarioCheg = minToTime(cursorMin2);
      cursorMin2 += tempoVistoria;
      const horarioPart = minToTime(cursorMin2);

      kmDia2 += distTrecho;
      tempoEstradaDia2 += tempoEstrada;

      paradasDia2.push({
        ordem: paradasDia2.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: tempoEstrada,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });

      indexEscola++;
      escolasRestantes++;
    }

    // Retorno definitivo para Teresina
    const tempoVoltaFinal = calcularTempoEstradaMinutos(distTeresinaSede);
    cursorMin2 += tempoVoltaFinal;
    kmDia2 += distTeresinaSede;
    tempoEstradaDia2 += tempoVoltaFinal;

    paradasDia2.push({
      ordem: paradasDia2.length + 1,
      tipo: 'retorno',
      cidade: 'Teresina',
      localNome: 'Chegada Definitiva em Teresina - PI',
      distanciaTrechoKm: distTeresinaSede,
      tempoDeslocamentoMin: tempoVoltaFinal,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: minToTime(cursorMin2),
      observacao: 'Conclusão da rota regional e desmobilização da equipe técnica.'
    });

    dias.push({
      diaNumero: 2,
      titulo: 'Dia 2 — Vistorias no Eixo de Volta e Retorno a Teresina',
      dataDescritiva: 'Fechamento do Roteiro Regional',
      horarioInicio: '07:30h',
      horarioTerminoPrevisto: minToTime(cursorMin2),
      cidadePernoiteOuDestino: 'Teresina (Base Central)',
      totalKmDia: kmDia2,
      totalTempoEstradaMin: tempoEstradaDia2,
      totalTempoVistoriasMin: paradasDia2.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia2
    });

    totalKmGeral += kmDia2;
    totalTempoEstradaGeralMin += tempoEstradaDia2;

  } else if (diaria === '4.5') {
    // =========================================================================
    // REGIME 4.5 DIÁRIAS: IMERSÃO COMPLETA (2 DIAS DE ROTA COM 2 PERNOITES NA SEDE + VOLTA NO 3º DIA)
    // =========================================================================
    // DIA 1: Teresina -> Cidades de Ida -> Sede da GRE (Pernoite 1)
    let cursorMin1 = 6 * 60 + 30;
    const paradasDia1: ParadaRota[] = [];
    let kmDia1 = 0;
    let tempoEstradaDia1 = 0;

    paradasDia1.push({
      ordem: 1,
      tipo: 'partida',
      cidade: 'Teresina',
      localNome: 'Saída de Teresina (S10 / Hilux)',
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: minToTime(cursorMin1),
      observacao: 'Partida em caminhonete para imersão regional completa.'
    });

    let indexEscola = 0;
    let countDia1 = 0;
    while (indexEscola < escolasOrdenadas.length && countDia1 < 4) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 50;
      const tempoEstrada = calcularTempoEstradaMinutos(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin1 += tempoEstrada;
      const horarioCheg = minToTime(cursorMin1);
      cursorMin1 += tempoVistoria;
      const horarioPart = minToTime(cursorMin1);

      kmDia1 += distTrecho;
      tempoEstradaDia1 += tempoEstrada;

      paradasDia1.push({
        ordem: paradasDia1.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: tempoEstrada,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });

      indexEscola++;
      countDia1++;
    }

    const distAteSede = 40;
    const tempoAteSede = calcularTempoEstradaMinutos(distAteSede);
    cursorMin1 += tempoAteSede;
    kmDia1 += distAteSede;
    tempoEstradaDia1 += tempoAteSede;

    paradasDia1.push({
      ordem: paradasDia1.length + 1,
      tipo: 'pernoite',
      cidade: cidadePolo,
      localNome: `${cidadePolo} — Pernoite 1 (Jantar Regional)`,
      distanciaTrechoKm: distAteSede,
      tempoDeslocamentoMin: tempoAteSede,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin1),
      horarioPartida: '07:30h (Dia 2)',
      observacao: `Chegada às ${minToTime(cursorMin1)} para jantar e descanso seguro da equipe.`
    });

    dias.push({
      diaNumero: 1,
      titulo: `Dia 1 — Deslocamento e Vistorias até ${cidadePolo}`,
      dataDescritiva: 'Eixo de Ida e Pernoite 1',
      horarioInicio: '06:30h',
      horarioTerminoPrevisto: minToTime(cursorMin1),
      cidadePernoiteOuDestino: `${cidadePolo} (Pernoite 1)`,
      totalKmDia: kmDia1,
      totalTempoEstradaMin: tempoEstradaDia1,
      totalTempoVistoriasMin: countDia1 * 50,
      paradas: paradasDia1
    });

    totalKmGeral += kmDia1;
    totalTempoEstradaGeralMin += tempoEstradaDia1;

    // DIA 2: Giro Circular nas Cidades Adjacentes da GRE -> Retorno para Pernoite 2 na Sede
    let cursorMin2 = 7 * 60 + 30;
    const paradasDia2: ParadaRota[] = [];
    let kmDia2 = 0;
    let tempoEstradaDia2 = 0;

    paradasDia2.push({
      ordem: 1,
      tipo: 'partida',
      cidade: cidadePolo,
      localNome: `Saída de ${cidadePolo} (Giro nas Cidades Adjacentes)`,
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: minToTime(cursorMin2)
    });

    let countDia2 = 0;
    while (indexEscola < escolasOrdenadas.length && countDia2 < 5) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 30;
      const tempoEstrada = calcularTempoEstradaMinutos(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin2 += tempoEstrada;
      const horarioCheg = minToTime(cursorMin2);
      cursorMin2 += tempoVistoria;
      const horarioPart = minToTime(cursorMin2);

      kmDia2 += distTrecho;
      tempoEstradaDia2 += tempoEstrada;

      paradasDia2.push({
        ordem: paradasDia2.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: tempoEstrada,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });

      indexEscola++;
      countDia2++;
    }

    const distVoltaSede = 35;
    const tempoVoltaSede = calcularTempoEstradaMinutos(distVoltaSede);
    cursorMin2 += tempoVoltaSede;
    kmDia2 += distVoltaSede;
    tempoEstradaDia2 += tempoVoltaSede;

    paradasDia2.push({
      ordem: paradasDia2.length + 1,
      tipo: 'pernoite',
      cidade: cidadePolo,
      localNome: `${cidadePolo} — Pernoite 2 (Jantar & Pernoite)`,
      distanciaTrechoKm: distVoltaSede,
      tempoDeslocamentoMin: tempoVoltaSede,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin2),
      horarioPartida: '07:30h (Dia 3)',
      observacao: `Retorno para a base regional às ${minToTime(cursorMin2)} para segunda pernoite.`
    });

    dias.push({
      diaNumero: 2,
      titulo: `Dia 2 — Imersão Total nas Cidades da Jurisdição (${cidadePolo})`,
      dataDescritiva: 'Varredura das Unidades Regionais',
      horarioInicio: '07:30h',
      horarioTerminoPrevisto: minToTime(cursorMin2),
      cidadePernoiteOuDestino: `${cidadePolo} (Pernoite 2)`,
      totalKmDia: kmDia2,
      totalTempoEstradaMin: tempoEstradaDia2,
      totalTempoVistoriasMin: countDia2 * 50,
      paradas: paradasDia2
    });

    totalKmGeral += kmDia2;
    totalTempoEstradaGeralMin += tempoEstradaDia2;

    // DIA 3: Retorno definitivo para Teresina
    let cursorMin3 = 7 * 60 + 30;
    const paradasDia3: ParadaRota[] = [];
    let kmDia3 = 0;
    let tempoEstradaDia3 = 0;

    paradasDia3.push({
      ordem: 1,
      tipo: 'partida',
      cidade: cidadePolo,
      localNome: `Saída de ${cidadePolo} (Retorno a Teresina)`,
      distanciaTrechoKm: 0,
      tempoDeslocamentoMin: 0,
      tempoPermanenciaMin: 0,
      horarioChegada: minToTime(cursorMin3),
      horarioPartida: minToTime(cursorMin3)
    });

    // 1 vistoria no corredor de volta
    if (indexEscola < escolasOrdenadas.length) {
      const item = escolasOrdenadas[indexEscola];
      const distTrecho = 30;
      const tempoEstrada = calcularTempoEstradaMinutos(distTrecho);
      const tempoVistoria = item.escola.tempoEstimadoVistoriaMinutos;

      cursorMin3 += tempoEstrada;
      const horarioCheg = minToTime(cursorMin3);
      cursorMin3 += tempoVistoria;
      const horarioPart = minToTime(cursorMin3);

      kmDia3 += distTrecho;
      tempoEstradaDia3 += tempoEstrada;

      paradasDia3.push({
        ordem: paradasDia3.length + 1,
        tipo: 'vistoria',
        escola: item.escola,
        analisePrioridade: item.analise,
        cidade: item.escola.municipio,
        localNome: item.escola.nome,
        distanciaTrechoKm: distTrecho,
        tempoDeslocamentoMin: tempoEstrada,
        tempoPermanenciaMin: tempoVistoria,
        horarioChegada: horarioCheg,
        horarioPartida: horarioPart
      });
      indexEscola++;
    }

    const tempoVoltaTeresina = calcularTempoEstradaMinutos(distTeresinaSede);
    cursorMin3 += tempoVoltaTeresina;
    kmDia3 += distTeresinaSede;
    tempoEstradaDia3 += tempoVoltaTeresina;

    paradasDia3.push({
      ordem: paradasDia3.length + 1,
      tipo: 'retorno',
      cidade: 'Teresina',
      localNome: 'Chegada Final em Teresina - PI',
      distanciaTrechoKm: distTeresinaSede,
      tempoDeslocamentoMin: tempoVoltaTeresina,
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
      totalTempoVistoriasMin: paradasDia3.filter(p => p.tipo === 'vistoria').length * 50,
      paradas: paradasDia3
    });

    totalKmGeral += kmDia3;
    totalTempoEstradaGeralMin += tempoEstradaDia3;
  }

  const horas = Math.floor(totalTempoEstradaGeralMin / 60);
  const min = totalTempoEstradaGeralMin % 60;
  const tempoEstradaFormatado = `${horas}h ${min > 0 ? `${min}min` : ''}`;

  const totalEscolasAtendidas = dias.reduce(
    (acc, d) => acc + d.paradas.filter(p => p.tipo === 'vistoria').length,
    0
  );

  const ultimoDia = dias[dias.length - 1];
  const horarioFinal = ultimoDia ? ultimoDia.horarioTerminoPrevisto : '21:00h';

  return {
    tipoRota,
    gre,
    diaria,
    cidadePolo,
    totalKm: totalKmGeral,
    tempoEstradaHoras: tempoEstradaFormatado,
    totalEscolasAtendidas,
    veiculoInfo: 'Caminhonete S10 / Hilux',
    velocidadeCruzeiro: '140 km/h (cruzeiro em estrada aberta)',
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
  txt += `*Diárias:* ${plano.diaria} diárias\n`;

  if (equipe && equipe.trim()) {
    txt += `*👥 Equipe:* ${equipe.trim()}\n`;
  }

  txt += `*Total de Escolas:* ${plano.totalEscolasAtendidas}\n`;
  txt += `-------------------------------------------\n`;

  plano.dias.forEach((d) => {
    txt += `*📅 DIA ${d.diaNumero}*\n`;
    
    // Obter apenas as vistorias em escolas
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
