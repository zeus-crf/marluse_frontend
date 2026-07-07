export type UnidadeMedida = 'SACO' | 'METRO' | 'METRO_QUADRADO' | 'LITRO' | 'PECA' | 'KG' | 'ROLO' | 'BALDE';
export type StatusEstoque = 'OK' | 'BAIXO' | 'ZERADO';
export type TabFiltroEstoque = 'TODOS' | StatusEstoque;

export interface ProdutoRequest {
  nome: string;
  descricao?: string;
  valorCompra: number;
  preco: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  medida: UnidadeMedida;
}

export interface ProdutoResponse {
  id: string;
  nome: string;
  descricao: string;
  valorCompra: number;
  preco: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  estoqueBaixo: boolean;
  medida: UnidadeMedida;
}

export interface ProdutoAtualizarRequest {
  nome: string;
  descricao?: string;
  valorCompra: number;
  preco: number;
  estoqueMinimo: number;
  quantidadeEstoque: number;
  medida: UnidadeMedida;
}

export interface EstoqueFiltroCompleto {
  medida:   UnidadeMedida | 'TODOS';
  minPreco: number | null;
  maxPreco: number | null;
  minQtd:   number | null;
  maxQtd:   number | null;
}

export const FILTRO_ESTOQUE_PADRAO: EstoqueFiltroCompleto = {
  medida:   'TODOS',
  minPreco: null,
  maxPreco: null,
  minQtd:   null,
  maxQtd:   null,
};
