import React from 'react';
import { ConservacaoStatus, ResponsavelTipo } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'gold' | 'turq' | 'green' | 'gray' | 'critico' | 'atencao' | 'regular' | 'bom';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'sm',
  dot = false,
  className = ''
}) => {
  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';

  switch (variant) {
    case 'orange':
    case 'critico':
      colorClasses = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      dotColor = 'bg-orange-400';
      break;
    case 'gold':
    case 'atencao':
      colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      dotColor = 'bg-amber-400';
      break;
    case 'turq':
    case 'regular':
      colorClasses = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      dotColor = 'bg-cyan-400';
      break;
    case 'green':
    case 'bom':
      colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
      break;
    case 'gray':
    default:
      colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
      dotColor = 'bg-slate-400';
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-md ${colorClasses} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />}
      {children}
    </span>
  );
};

export const StatusConservacaoBadge: React.FC<{ status: ConservacaoStatus }> = ({ status }) => {
  const map: Record<ConservacaoStatus, { label: string; variant: 'critico' | 'atencao' | 'regular' | 'bom' }> = {
    critico: { label: 'Crítico', variant: 'critico' },
    atencao: { label: 'Atenção', variant: 'atencao' },
    regular: { label: 'Regular', variant: 'regular' },
    bom: { label: 'Bom', variant: 'bom' },
  };

  const item = map[status];
  return (
    <Badge variant={item.variant} dot>
      {item.label}
    </Badge>
  );
};

export const ResponsavelBadge: React.FC<{ responsavel?: ResponsavelTipo | string }> = ({ responsavel }) => {
  if (!responsavel) return null;
  const isNaila = responsavel.includes('Naila');
  return (
    <Badge variant={isNaila ? 'orange' : 'turq'}>
      {responsavel}
    </Badge>
  );
};
