import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { PedidoResponse, StatusPedido } from '../../models/vendas.models';

@Component({
  selector: 'app-vendas-table',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, RippleModule, TooltipModule, ConfirmDialogModule],
  templateUrl: './vendas-table.component.html',
  providers: [ConfirmationService],
})
export class VendasTableComponent {

  private confirmationService = inject(ConfirmationService);

  @Input() pedidos: PedidoResponse[] = [];
  @Input() loading = false;

  @Output() verDetalhe = new EventEmitter<PedidoResponse>();
  @Output() editar     = new EventEmitter<PedidoResponse>();
  @Output() excluir    = new EventEmitter<PedidoResponse>();

  confirmarExclusao(pedido: PedidoResponse): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a venda de ${pedido.clienteNome} no valor de ${this.formatCurrency(pedido.valorTotal)}?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.excluir.emit(pedido),
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  numeroVenda(index: number): string {
    return 'V' + String(index + 1).padStart(3, '0');
  }

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  formatProdutos(pedido: PedidoResponse): string {
    return pedido.itens.map((i) => `${i.produtoNome} × ${i.quantidade}`).join(', ');
  }

  getSeverity(status: StatusPedido): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'PAGO':       return 'success';
      case 'CONFIRMADO':
      case 'PENDENTE':   return 'warn';
      case 'CANCELADO':  return 'danger';
      case 'ORCAMENTO':  return 'secondary';
    }
  }

  getStatusLabel(status: StatusPedido): string {
    const labels: Record<StatusPedido, string> = {
      ORCAMENTO:  'Orçamento',
      PENDENTE:   'Pendente',
      CONFIRMADO: 'Confirmado',
      PAGO:       'Pago',
      CANCELADO:  'Cancelado',
    };
    return labels[status];
  }
}
