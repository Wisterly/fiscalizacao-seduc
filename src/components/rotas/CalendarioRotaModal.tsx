import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Clock, 
  Car, 
  Moon, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DiariaOption } from '../../services/rotasEngine';

interface CalendarioRotaModalProps {
  dataPeriodoAtual: string;
  duracaoDias: number;
  diaria: DiariaOption;
  onConfirmar: (periodoFormatado: string, dataInicioIso: string) => void;
  onClose: () => void;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarioRotaModal: React.FC<CalendarioRotaModalProps> = ({
  dataPeriodoAtual,
  duracaoDias,
  diaria,
  onConfirmar,
  onClose
}) => {
  // Data de referência de Hoje
  const hoje = useMemo(() => new Date(), []);

  // Extrai data inicial pré-existente ou usa hoje
  const dataInicialPadrao = useMemo(() => {
    // Tenta extrair DD/MM do dataPeriodoAtual (ex: "18/11 á 20/11/2026" ou "18/11/2026")
    const match = dataPeriodoAtual.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
    if (match) {
      const dia = parseInt(match[1], 10);
      const mes = parseInt(match[2], 10) - 1;
      const ano = match[3] ? parseInt(match[3], 10) : hoje.getFullYear();
      if (!isNaN(dia) && !isNaN(mes) && mes >= 0 && mes <= 11) {
        return new Date(ano, mes, dia);
      }
    }
    return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  }, [dataPeriodoAtual, hoje]);

  // Mês e Ano sendo visualizados no calendário
  const [currentYear, setCurrentYear] = useState<number>(dataInicialPadrao.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(dataInicialPadrao.getMonth());

  // Data de Início selecionada (Dia de Saída da Hilux / Equipe)
  const [selectedDate, setSelectedDate] = useState<Date>(dataInicialPadrao);

  // Navegação de Mês
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleHoje = () => {
    const agora = new Date();
    setCurrentYear(agora.getFullYear());
    setCurrentMonth(agora.getMonth());
    setSelectedDate(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()));
  };

  // Cálculo da Data Final com base na duração em dias da viagem (levando em conta que 0.5 diária é o dia da volta)
  const rangeInfo = useMemo(() => {
    const inicio = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const dias = Math.max(1, duracaoDias);
    
    // Data final = data início + (dias - 1)
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + (dias - 1));

    // Formatações
    const pad = (n: number) => String(n).padStart(2, '0');
    const dInicio = pad(inicio.getDate());
    const mInicio = pad(inicio.getMonth() + 1);
    const aInicio = inicio.getFullYear();

    const dFim = pad(fim.getDate());
    const mFim = pad(fim.getMonth() + 1);
    const aFim = fim.getFullYear();

    let textoFormatado = '';
    if (dias === 1) {
      textoFormatado = `${dInicio}/${mInicio}/${aInicio}`;
    } else {
      textoFormatado = `${dInicio}/${mInicio} á ${dFim}/${mFim}/${aFim}`;
    }

    const isoInicio = `${aInicio}-${mInicio}-${dInicio}`;

    return {
      inicio,
      fim,
      dias,
      textoFormatado,
      isoInicio,
      dataInicioLegivel: `${dInicio}/${mInicio}/${aInicio}`,
      dataFimLegivel: `${dFim}/${mFim}/${aFim}`
    };
  }, [selectedDate, duracaoDias]);

  // Constrói os dias da grade do mês
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelectedStart: boolean;
      isSelectedEnd: boolean;
      isInRange: boolean;
    }[] = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, d);
      cells.push({
        date,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
        isSelectedStart: false,
        isSelectedEnd: false,
        isInRange: false
      });
    }

    // Normaliza datas para comparação sem horas
    const norm = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const timeStart = norm(rangeInfo.inicio);
    const timeEnd = norm(rangeInfo.fim);
    const timeToday = norm(hoje);

    // Dias do mês atual
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const timeDate = norm(date);

      const isSelectedStart = timeDate === timeStart;
      const isSelectedEnd = timeDate === timeEnd;
      const isInRange = timeDate >= timeStart && timeDate <= timeEnd;
      const isToday = timeDate === timeToday;

      cells.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday,
        isSelectedStart,
        isSelectedEnd,
        isInRange
      });
    }

    // Dias do próximo mês para completar 35 ou 42 células
    const totalCurrentCells = cells.length;
    const remaining = totalCurrentCells % 7 === 0 ? 0 : 7 - (totalCurrentCells % 7);
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      cells.push({
        date,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        isSelectedStart: false,
        isSelectedEnd: false,
        isInRange: false
      });
    }

    return cells;
  }, [currentYear, currentMonth, rangeInfo, hoje]);

  const handleDayClick = (cellDate: Date) => {
    setSelectedDate(new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate()));
    // Se clicou num dia do mês adjacente, sincroniza o mês visualizado
    if (cellDate.getMonth() !== currentMonth) {
      setCurrentMonth(cellDate.getMonth());
      setCurrentYear(cellDate.getFullYear());
    }
  };

  const handleConfirmar = () => {
    onConfirmar(rangeInfo.textoFormatado, rangeInfo.isoInicio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER DO MODAL */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20">
              <CalendarIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Calendário de Viagem</span>
                <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {diaria} Diárias
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione o dia de partida da equipe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NAVEGAÇÃO DE MÊS E ANO */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black text-white tracking-wide">
              {MESES[currentMonth]}
            </span>
            <span className="text-sm font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
              {currentYear}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleHoje}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 transition-colors border border-slate-700"
              title="Voltar para Hoje"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GRADE DO CALENDÁRIO */}
        <div className="p-4 overflow-y-auto">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DIAS_SEMANA.map((dia, idx) => (
              <div 
                key={dia} 
                className={`text-[11px] font-bold uppercase py-1 ${
                  idx === 0 || idx === 6 ? 'text-amber-400/70' : 'text-slate-400'
                }`}
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Células dos dias */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((cell, idx) => {
              const isStart = cell.isSelectedStart;
              const isEnd = cell.isSelectedEnd;
              const inRange = cell.isInRange;

              let bgStyle = 'bg-slate-950/40 text-slate-300 hover:bg-slate-800/70';
              if (!cell.isCurrentMonth) {
                bgStyle = 'text-slate-600 hover:text-slate-400 bg-transparent';
              }

              if (inRange && cell.isCurrentMonth) {
                bgStyle = 'bg-amber-500/15 text-amber-200 border-y border-amber-500/30';
              }

              if (isStart && isEnd) {
                bgStyle = 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/40 scale-105 z-10 rounded-xl border border-amber-300';
              } else if (isStart) {
                bgStyle = 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/40 rounded-l-xl border-l-2 border-y-2 border-amber-300 z-10';
              } else if (isEnd) {
                bgStyle = 'bg-blue-500 text-white font-black shadow-lg shadow-blue-500/40 rounded-r-xl border-r-2 border-y-2 border-blue-300 z-10';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(cell.date)}
                  className={`h-10 sm:h-11 flex flex-col items-center justify-center relative text-xs sm:text-sm font-semibold transition-all active:scale-95 ${bgStyle}`}
                >
                  <span>{cell.dayNumber}</span>
                  {cell.isToday && !isStart && !isEnd && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute bottom-1" />
                  )}
                  {isStart && !isEnd && (
                    <span className="text-[9px] uppercase font-black tracking-tighter leading-none mt-0.5 opacity-90">
                      Saída
                    </span>
                  )}
                  {isEnd && !isStart && (
                    <span className="text-[9px] uppercase font-black tracking-tighter leading-none mt-0.5 opacity-90">
                      Volta
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RESUMO DO CÁLCULO AUTOMÁTICO */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Período Calculado ({rangeInfo.dias} {rangeInfo.dias === 1 ? 'Dia' : 'Dias'})
                </div>
                <div className="text-sm sm:text-base font-black text-amber-300">
                  {rangeInfo.textoFormatado}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block">
                Regime
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                {rangeInfo.dias === 1 ? (
                  <>
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bate e Volta</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                    <span>{rangeInfo.dias - 1} Pernoite(s)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight px-1 flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              O cálculo considera <strong>{diaria} diárias</strong>. A meia diária adicional representa o retorno da equipe a Teresina no último dia ({rangeInfo.dataFimLegivel}).
            </span>
          </div>

          {/* BOTÕES DE CONFIRMAÇÃO */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
