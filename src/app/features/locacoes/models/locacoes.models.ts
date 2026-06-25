import { ItemPedidoRequest } from "../../vendas/models/vendas.models";

export type StatusLocacao = 'ATIVA' | 'DEVOLVIDA' | 'ATRASADA' | 'CANCELADA';
export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'BOLETO' | 'FIADO';


export interface ItemLocacaoResponse {
    id: string;
    produtoId: string;
    produtoNome: string;
    quantidade: number;
    precoDiaria: number
    subTotal: number;

}

export interface ItemLocacaoRequest {
    produtoId: number;
    quantidade: number;
}

export interface LocacaoRespose {
    id: string;
    clienteId: string;
    clienteNome: string;
    status: StatusLocacao;
    formaPagamento: FormaPagamento;
    dataRetirada: string;
    dataDevolucaoPrevista: string
    dataDevolucaoReal: string;
    valorTotal: number;
    observacao: string;
    itens: ItemLocacaoResponse[];
    createdAt: string;
}

export interface LocacaoResquest {
    clienteId: string;
    formaPagamento: FormaPagamento;
    dataRetirada: string;
    dataDevolucaoPrevista: string;
    itens: ItemPedidoRequest[];
}

export interface ItemPedidoForm {
  productId: string;
  produtoNome: string;
  preco: number;
  quantidade: number;
}

export interface LocacaoFiltro {
    inicio: string;
    fim: string;
}

export interface VendasFiltroCompleto {
  status: StatusLocacao | 'TODOS';
  formaPagamento: FormaPagamento | 'TODOS';
  inicio: string;
  fim: string;
  minValor: number | null;
  maxValor: number | null;
}
