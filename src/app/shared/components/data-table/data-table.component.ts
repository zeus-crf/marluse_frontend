import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TableColumn, TableActionConfig } from './data-table.models';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, RippleModule, TooltipModule, ConfirmDialogModule],
  templateUrl: './data-table.component.html',
  providers: [ConfirmationService],
})
export class DataTableComponent {

  private confirmationService = inject(ConfirmationService);

  /** Definição das colunas */
  @Input() columns: TableColumn[] = [];

  /** Dados da tabela */
  @Input() rows: any[] = [];

  @Input() loading = false;

  /** Mensagem exibida quando não há dados */
  @Input() emptyMessage = 'Nenhum registro encontrado';

  /** Configuração dos botões de ação */
  @Input() actions: TableActionConfig = {
    showView:   true,
    showEdit:   true,
    showDelete: true,
    deleteHeader: 'Confirmar exclusão',
  };

  @Output() verDetalhe = new EventEmitter<any>();
  @Output() editar     = new EventEmitter<any>();
  @Output() excluir    = new EventEmitter<any>();

  get showActions(): boolean {
    return !!(this.actions.showView || this.actions.showEdit || this.actions.showDelete);
  }

  /** Total de colunas + coluna de ações (se existir) */
  get totalCols(): number {
    return this.columns.length + (this.showActions ? 1 : 0);
  }

  get viewIcon():   string { return this.actions.viewIcon   ?? 'pi pi-eye'; }
  get viewTooltip():string { return this.actions.viewTooltip ?? 'Visualizar'; }
  get editIcon():   string { return this.actions.editIcon   ?? 'pi pi-pencil'; }
  get editTooltip():string { return this.actions.editTooltip ?? 'Editar'; }
  get deleteIcon(): string { return this.actions.deleteIcon  ?? 'pi pi-trash'; }
  get deleteTooltip():string { return this.actions.deleteTooltip ?? 'Excluir'; }

  confirmarExclusao(row: any): void {
    const message = this.actions.deleteMessageFn
      ? this.actions.deleteMessageFn(row)
      : 'Deseja excluir este registro?';

    this.confirmationService.confirm({
      message,
      header:       this.actions.deleteHeader      ?? 'Confirmar exclusão',
      icon:         this.actions.deleteIcon        ?? 'pi pi-trash',
      acceptLabel:  this.actions.deleteAcceptLabel ?? 'Confirmar',
      rejectLabel:  'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.excluir.emit(row),
    });
  }

  // ── Helpers de célula ──────────────────────────────────────

  getCellValue(col: TableColumn, row: any, index: number): any {
    if (col.valueFn) return col.valueFn(row, index);
    return row[col.field];
  }

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(iso: string | Date): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
  }
}
