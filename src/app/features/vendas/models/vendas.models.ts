export type StatusPedido = 'ORCAMENTO' | 'PENDENTE' | 'CONFIRMADO' | 'PAGO' | 'CANCELADO';

export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'BOLETO' | 'FIADO';

export type UnidadeMedida = 'SACO' | 'METRO' | 'METRO_QUADRADO' | 'LITRO' | 'PECA' | 'KG'| 'ROLO' | 'BALDE';

export interface ItemPedidoResponse {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}
 
export interface PedidoResponse {
  id: string;
  clienteId: string | null;
  clienteNome: string;
  status: StatusPedido;
  formaPagamento: FormaPagamento;
  valorTotal: number;
  observacao: string | null;
  itens: ItemPedidoResponse[];
  createdAt: string;
  dataVencimento: string | null; // 'YYYY-MM-DD', só para FIADO
}

export interface ItemPedidoRequest {
  productId: string;
  quantidade: number;
}
 
export interface PedidoRequest {
  clienteId?: string;
  formaPagamento: FormaPagamento;
  itens: ItemPedidoRequest[];
  observacao?: string;
  status?: StatusPedido;       // omitir = CONFIRMADO (Venda)
  dataVencimento?: string;     // 'YYYY-MM-DD', só para FIADO
}

export interface PedidoAtualizarRequest {
  formaPagamento?: FormaPagamento;
  observacao?: string;
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

export interface ItemPedidoForm {
  productId: string;
  produtoNome: string;
  preco: number;
  quantidade: number;
}

export interface VendasFiltro {
    inicio: string;
    fim: string;
}

export interface VendasFiltroCompleto {
  status: StatusPedido | 'TODOS';
  formaPagamento: FormaPagamento | 'TODOS';
  inicio: string;
  fim: string;
  minValor: number | null;
  maxValor: number | null;
}

export interface ClienteResponse {
    id: string;
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    endereco: string;
    consumidorFinal: boolean;
    ativo: boolean;
}

export interface ProdutoResponse {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    quantidadeEstoque: number;
    estoqueMinimo: number;
    ativo: boolean;
    estoqueBaixo: boolean;
    medida: UnidadeMedida;
}
