export type CellType = 'text' | 'currency' | 'date' | 'mono' | 'tag' | 'computed';

export interface TableColumn {
  /** Campo do objeto (não usado em 'computed', mas útil como chave única) */
  field: string;
  header: string;
  width?: string;
  type?: CellType;

  /** Para type 'tag': retorna a severidade PrimeNG */
  tagSeverityFn?: (value: any, row?: any) => 'success' | 'warn' | 'danger' | 'secondary';

  /** Para type 'tag': retorna o texto do badge */
  tagLabelFn?: (value: any, row?: any) => string;

  /** Para type 'computed' ou 'mono': valor calculado a partir da linha */
  valueFn?: (row: any, index?: number) => string;

  /** Aplica truncate ao conteúdo da célula */
  truncate?: boolean;
}

export interface TableActionConfig {
  /** Exibir botão de visualizar (padrão: true) */
  showView?: boolean;
  /** Exibir botão de ação secundária / editar (padrão: true) */
  showEdit?: boolean;
  /** Exibir botão de ação destrutiva / excluir (padrão: true) */
  showDelete?: boolean;

  /** Ícone do botão de visualizar (padrão: 'pi pi-eye') */
  viewIcon?: string;
  /** Tooltip do botão de visualizar (padrão: 'Visualizar') */
  viewTooltip?: string;

  /** Ícone do botão de editar (padrão: 'pi pi-pencil') */
  editIcon?: string;
  /** Tooltip do botão de editar (padrão: 'Editar') */
  editTooltip?: string;

  /** Ícone do botão de excluir (padrão: 'pi pi-trash') */
  deleteIcon?: string;
  /** Tooltip do botão de excluir (padrão: 'Excluir') */
  deleteTooltip?: string;

  /** Mensagem do confirm — recebe a linha como argumento */
  deleteMessageFn?: (row: any) => string;
  /** Cabeçalho do confirm */
  deleteHeader?: string;
  /** Texto do botão de aceitar no confirm (padrão: 'Excluir') */
  deleteAcceptLabel?: string;
}
