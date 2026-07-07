export type StatusLocacao = 'ATIVA' | 'DEVOLVIDA' | 'ATRASADA' | 'CANCELADA' | 'ORCAMENTO';

export type StatusEntrega = 'PENDENTE' | 'FEITA';

export interface EntregaResponse {
  id: string;
  endereco: string;
  dataPrevista: string | null;
  dataEntrega: string | null;
  status: StatusEntrega;
}

export interface EntregaRequest {
  endereco: string;
  dataPrevista?: string | null;
}

export interface EntregaAtualizarRequest {
  endereco?: string;
  dataPrevista?: string | null;
}
export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'BOLETO' | 'FIADO';
export type TipoDesconto = 'PERCENTUAL' | 'VALOR';

export type StatusLancamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';

export interface ParcelaResponse {
  id: string;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string | null;
  status: StatusLancamento;
  dataPagamento: string | null;
}

export interface ItemLocacaoResponse {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoDiaria: number;
  subtotal: number;           // backend serializa como "subtotal" (sem maiúscula)
}

export interface ItemLocacaoRequest {
  produtoId: string;          // backend espera String, não número
  quantidade: number;
}

export interface LocacaoResponse {
  id: string;
  numero: number;
  clienteId: string | null;
  clienteNome: string;
  status: StatusLocacao;
  formaPagamento: FormaPagamento;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal: string | null;
  valorTotal: number;
  valorBruto: number;
  desconto: number | null;
  tipoDesconto: TipoDesconto | null;
  descontoAplicadoEm: string | null;
  observacao: string | null;
  itens: ItemLocacaoResponse[];
  createdAt: string;
  parcelas: ParcelaResponse[] | null;
  entrega: EntregaResponse | null;
  juros: number | null;
  tipoJuros: TipoDesconto | null;
  jurosAplicadoEm: string | null;
}

export interface LocacaoRequest {
  clienteId?: string | null;
  formaPagamento: FormaPagamento;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  itens: ItemLocacaoRequest[];
  observacao?: string | null;
  status?: StatusLocacao | null;
  desconto?: number | null;
  tipoDesconto?: TipoDesconto | null;
  numeroParcelas?: number;
  primeiroVencimento?: string;
  entrega?: EntregaRequest | null;
  juros?: number | null;
  tipoJuros?: TipoDesconto | null;
}

export interface LocacaoEdicaoRequest {
  formaPagamento: FormaPagamento;
  observacao?: string | null;
  desconto?: number | null;
  tipoDesconto?: TipoDesconto | null;
  juros?: number | null;
  tipoJuros?: TipoDesconto | null;
}

/** Dados do item no formulário de criação */
export interface ItemLocacaoForm {
  produtoId: string;
  produtoNome: string;
  precoDiaria: number;
  quantidade: number;
}

export interface LocacaoFiltro {
  inicio: string;
  fim: string;
}

export interface LocacoesFiltroCompleto {
  status: StatusLocacao | 'TODOS';
  formaPagamento: FormaPagamento | 'TODOS';
  inicio: string;
  fim: string;
  minValor: number | null;
  maxValor: number | null;
}

export interface ProdutoSimples {
  id: string;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
}
 
export interface ClienteSimples {
  id: string;
  nome: string;
}
