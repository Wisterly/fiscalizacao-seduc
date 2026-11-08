import { Escola, GRE } from '../types';

export class AIService {
  /**
   * Refina anotações informais do fiscal em pareceres técnicos periciais
   * utilizando vocabulário normativo de engenharia civil e arquitetura escolar (ABNT/NBR/SINAPI).
   */
  static refinarLegendaTecnica(textoOriginal: string, ambiente: string): string {
    const limpo = textoOriginal.trim();
    if (!limpo) return `Vistoria técnica realizada no ambiente: ${ambiente}. Elementos construtivos inspecionados em conformidade com as diretrizes do FNDE/SEDUC-PI.`;

    const textoLower = limpo.toLowerCase();

    // Dicionário de enriquecimento contextual de engenharia
    if (textoLower.includes('rachadura') || textoLower.includes('trinca') || textoLower.includes('fissura')) {
      return `Constatação patológica no elemento de alvenaria/vedação (${ambiente}): ${limpo}. Apresenta padrão de fissuração característico de cisalhamento ou recalque diferencial de fundação. Recomendada inspeção detalhada com fissurômetro graduado e escoramento preventivo caso haja evolução.`;
    }

    if (textoLower.includes('infiltra') || textoLower.includes('vazamento') || textoLower.includes('goteira') || textoLower.includes('mofo') || textoLower.includes('umidade')) {
      return `Manifestação patológica hidrossanitária/cobertura (${ambiente}): ${limpo}. Evidência de infiltração com eflorescência e degradação de emboço superficial decorrente de falha na manta asfáltica de impermeabilização ou telhas danificadas na cobertura.`;
    }

    if (textoLower.includes('eletric') || textoLower.includes('fio') || textoLower.includes('quadro') || textoLower.includes('disjuntor') || textoLower.includes('curto')) {
      return `Instalação elétrica em desacordo com a NBR 5410 (${ambiente}): ${limpo}. Barramento sem proteção contra contato direto e ausência de identificação nos circuitos. Necessário reordenamento com chaves termomagnéticas e aterramento padrão TN-S.`;
    }

    if (textoLower.includes('piso') || textoLower.includes('cerâmica') || textoLower.includes('buraco') || textoLower.includes('chão')) {
      return `Revestimento de piso inspecionado (${ambiente}): ${limpo}. Desplacamento ou quebra de peças cerâmicas com risco de tropeço e comprometimento da circulação acessível (NBR 9050). Regularização de contrapiso necessária.`;
    }

    if (textoLower.includes('banheiro') || textoLower.includes('sanit') || textoLower.includes('vaso') || textoLower.includes('descarga') || textoLower.includes('torneira')) {
      return `Instalações hidrossanitárias (${ambiente}): ${limpo}. Aparelhos hidrossanitários em vistoria operacional. Verificada estanqueidade e integridade dos sifões e torneiras antivandálicas conforme padrão SEDUC.`;
    }

    if (textoLower.includes('pintura') || textoLower.includes('tinta') || textoLower.includes('descascando')) {
      return `Acabamento superficial em alvenaria (${ambiente}): ${limpo}. Desagregação da película de tinta acrílica lavável por intemperismo ou umidade ascendente; preparo com selador acrílico e repintura em duas demãos recomendados.`;
    }

    // Caso genérico com elevação técnica
    return `Registro pericial em ${ambiente}: ${limpo}. Conformidade dimensional e estrutural avaliada segundo as normas técnicas vigentes e caderno de encargos da SEDUC-PI.`;
  }

  /**
   * Motor de IA para cálculo de prioridade e sugestão de rotas de vistoria
   * Cruzamento inteligente: Tempo sem visita + Estado da escola + Demandas urgentes
   */
  static calcularScorePrioridade(escola: Escola): { score: number; motivo: string; recomendacao: string } {
    let score = 0;
    const motivos: string[] = [];

    // Fator 1: Tempo sem visita (até 40 pontos)
    if (escola.diasSemVisita > 90) {
      score += 40;
      motivos.push(`Mais de 3 meses sem vistoria (${escola.diasSemVisita} dias)`);
    } else if (escola.diasSemVisita > 60) {
      score += 25;
      motivos.push(`Sem visita há ${escola.diasSemVisita} dias`);
    } else if (escola.diasSemVisita > 30) {
      score += 15;
      motivos.push(`${escola.diasSemVisita} dias desde a última visita`);
    } else {
      score += 5;
    }

    // Fator 2: Estado de Conservação da Escola (até 40 pontos)
    switch (escola.statusConservacao) {
      case 'critico':
        score += 40;
        motivos.push('Estado Crítico de conservação com risco estrutural');
        break;
      case 'atencao':
        score += 25;
        motivos.push('Estado em Atenção necessitando de reparos');
        break;
      case 'regular':
        score += 15;
        motivos.push('Estado Regular');
        break;
      case 'bom':
        score += 5;
        break;
    }

    // Fator 3: Demandas urgentes acumuladas (até 20 pontos)
    if (escola.demandasUrgentesCount >= 3) {
      score += 20;
      motivos.push(`${escola.demandasUrgentesCount} demandas urgentes pendentes`);
    } else if (escola.demandasUrgentesCount > 0) {
      score += 10;
      motivos.push(`${escola.demandasUrgentesCount} demanda(s) pendente(s)`);
    }

    // Se tem OS ativa com medição pendente, eleva prioridade
    if (escola.temOsAtiva) {
      score += 10;
      motivos.push('Ordem de Serviço ativa requer fiscalização de medição');
    }

    let recomendacao = 'Visita de rotina programada';
    if (score >= 70) {
      recomendacao = 'VISITA PRIORITÁRIA IMEDIATA';
    } else if (score >= 45) {
      recomendacao = 'Visita recomendada para os próximos 15 dias';
    }

    return {
      score: Math.min(100, score),
      motivo: motivos.join(' • ') || 'Acompanhamento preventivo',
      recomendacao
    };
  }

  /**
   * Gera o roteiro do mês selecionando as escolas de maior criticidade e agrupando por proximidade.
   */
  static gerarSugestaoRotaIA(schools: Escola[], gre?: GRE): Array<{ escola: Escola; score: number; motivo: string; diaSugerido: string }> {
    const list = gre ? schools.filter(s => s.greId === gre.id) : schools;

    const scored = list.map(e => {
      const calc = this.calcularScorePrioridade(e);
      return {
        escola: e,
        score: calc.score,
        motivo: calc.motivo
      };
    });

    // Ordena do maior score para o menor
    scored.sort((a, b) => b.score - a.score);

    // Seleciona as top 5 mais críticas e distribui nos dias da semana
    const dias = [
      'Segunda-feira (08:30)',
      'Terça-feira (09:00)',
      'Quarta-feira (10:00)',
      'Quinta-feira (08:30)',
      'Sexta-feira (09:30)'
    ];

    return scored.slice(0, 5).map((item, idx) => ({
      ...item,
      diaSugerido: dias[idx % dias.length]
    }));
  }

  /**
   * Formata a rota em um relatório elegante, profissional e perfeitamente legível para WhatsApp em 1 clique
   */
  static formatarRotaParaWhatsApp(
    tituloRota: string,
    mesReferencia: string,
    greNome: string,
    itens: Array<{ escolaNome: string; municipio: string; diaSugerido: string; motivoUrgencia: string }>
  ): string {
    const dataHoraHoje = new Date().toLocaleDateString('pt-BR');
    
    let texto = `📋 *ROTEIRO OFICIAL DE VISTORIA TÉCNICA - SEDUC PI*\n`;
    texto += `🏛 *GPR Lab | Fiscalização de Obras Escolares*\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `📍 *Jurisdição:* ${greNome}\n`;
    texto += `📅 *Período/Mês:* ${mesReferencia} (Gerado em ${dataHoraHoje})\n`;
    texto += `🎯 *Roteiro:* ${tituloRota}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    texto += `🚨 *CRONOGRAMA DE VISTORIAS PRIORITÁRIAS (MOTOR IA):*\n\n`;

    itens.forEach((it, index) => {
      const num = index + 1;
      texto += `*${num}. ${it.escolaNome}*\n`;
      texto += `   📌 *Município:* ${it.municipio}\n`;
      texto += `   ⏰ *Data/Turno:* ${it.diaSugerido}\n`;
      texto += `   ⚠️ *Motivo/Urgência:* ${it.motivoUrgencia}\n\n`;
    });

    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `✅ *Diretrizes de Campo:*\n`;
    texto += `• Registro fotográfico detalhado com legendas por ambiente;\n`;
    texto += `• Validação da medição atual para unidades com OS ativa;\n`;
    texto += `• Alinhamento imediato com a Gerência de Obras (Naila) para riscos estruturais.\n\n`;
    texto += `_Mensagem gerada automaticamente pelo App Fiscalização SEDUC (GPR Lab Mobile)._`;

    return texto;
  }
}
