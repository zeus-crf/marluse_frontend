export type TipoCliente    = 'PF' | 'PJ';
export type TabFiltroCliente = 'TODOS' | TipoCliente;

export interface PedidosResumo {
  id: string;
  numero: number;
  status: string;
  formaPagamento: string;
  valorTotal: number;
  dataMovimento: string;
}

export interface LocacaoResumo {
  id: string;
  numero: number;
  status: string;
  formaPagamento: string;
  valorTotal: number;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
}

export interface ClienteRequest {
  nome:           string;
  cpfCnpj?:       string;
  telefone?:      string;
  email?:         string;
  endereco?:      string;
  consumidorFinal: boolean;
}

export interface ClienteResponse {
  id:             string;
  nome:           string;
  cpfCnpj:        string;
  telefone:       string;
  email:          string;
  endereco:       string;
  consumidorFinal: boolean;
  ativo:          boolean;
  totalGasto:     number;
}

export interface ClienteAtualizarRequest {
  nome:      string;
  cpfCnpj?:  string;
  telefone?: string;
  email?:    string;
  endereco?: string;
}

export interface ClienteFiltroCompleto {
  tipoCliente:  TabFiltroCliente;
  dataInicial:  string | null;
  dataFinal:    string | null;
  minCompras:   number | null;
  maxCompras:   number | null;
}

export interface ClienteHistoricoResponse {
  pedidos: PedidosResumo[];
  locacoes: LocacaoResumo[];
}

export const FILTRO_CLIENTE_PADRAO: ClienteFiltroCompleto = {
  tipoCliente: 'TODOS',
  dataInicial: null,
  dataFinal:   null,
  minCompras:  null,
  maxCompras:  null,
};
