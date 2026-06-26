export type TipoCliente    = 'PF' | 'PJ';
export type TabFiltroCliente = 'TODOS' | TipoCliente;

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

export const FILTRO_CLIENTE_PADRAO: ClienteFiltroCompleto = {
  tipoCliente: 'TODOS',
  dataInicial: null,
  dataFinal:   null,
  minCompras:  null,
  maxCompras:  null,
};
