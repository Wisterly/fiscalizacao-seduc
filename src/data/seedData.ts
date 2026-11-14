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

export const INITIAL_SCHOOLS: Escola[] = inepSchoolsJson as Escola[];

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

// Dados 100% limpos para cadastro pelo usuário
export const INITIAL_ALERTAS: AlertaUrgente[] = [];
export const INITIAL_DEMANDAS: Demanda[] = [];
export const INITIAL_TAREFAS: TarefaDoDia[] = [];
export const INITIAL_LEVANTAMENTOS: Levantamento[] = [];
export const INITIAL_ROTAS: RotaVistoria[] = [];
