export type TipoCliente = 'PF' | 'PJ' | 'TODOS'

export interface ClientesRequest {
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    endereco: string;
    consumidorFinal: boolean;
}

export interface ClienteResponse {
    id: string;
    nome: string;
    cpfCnpj: string;
    telefone:string;
    email: string;
    endereco: string;
    consumidorFinal: boolean;
    ativo: boolean;
}

export interface ClienteAtualizarRequest {
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    endereco: string;
}

export interface CLienteFiltroCompleto {
    tipoCliente: TipoCliente;
    dataInicial: string;
    dataFinal: string;
    minPreco: number | null;
    maxPreco: number | null; 
}

export const FILTRO_CLIENTE_PADRAO: CLienteFiltroCompleto = {
  tipoCliente:   'TODOS',
  minPreco: null,
  maxPreco: null,
  dataInicial: '',
  dataFinal: ''
};


