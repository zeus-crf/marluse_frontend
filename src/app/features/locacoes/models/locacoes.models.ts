export type StatusLocacao = 'ATIVA' | 'DEVOLVIDA' | 'ATRASADA' | 'CANCELADA' | 'ORCAMENTO';
export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'BOLETO' | 'FIADO';

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
  clienteId: string | null;
  clienteNome: string;
  status: StatusLocacao;
  formaPagamento: FormaPagamento;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal: string | null;
  valorTotal: number;
  observacao: string | null;
  itens: ItemLocacaoResponse[];
  createdAt: string;
}

export interface LocacaoRequest {
  clienteId?: string | null;
  formaPagamento: FormaPagamento;
  dataRetirada: string;           // ISO date: "yyyy-MM-dd"
  dataDevolucaoPrevista: string;  // ISO date: "yyyy-MM-dd"
  itens: ItemLocacaoRequest[];
  observacao?: string | null;
  status?: StatusLocacao | null;  // opcional — backend padrão ATIVA; use ORCAMENTO para orçamento
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
