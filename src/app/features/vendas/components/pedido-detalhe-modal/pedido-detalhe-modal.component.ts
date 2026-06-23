import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { PedidoResponse, StatusPedido } from '../../models/vendas.models';

@Component({
    selector: 'app-pedido-detalhe-modal',
    standalone: true,
    imports: [CommonModule, DialogModule, TagModule],
    templateUrl: './pedido-detalhe-modal.component.html',
})

export class PedidoDetalheModalComponent {

    @Input() visible = false;
    @Input() pedido: PedidoResponse | null = null;
    @Input() salvando = false;

    @Output() fechar = new EventEmitter<void>();
    @Output() pagar = new EventEmitter<string>();
    @Output() cancelar = new EventEmitter<string>();

    get podePagar(): boolean {
        return !!this.pedido && this.pedido.status !== 'PAGO' && this.pedido.status !== 'CANCELADO'
    }

    get podeCancelar(): boolean {
        return !!this.pedido && this.pedido.status !== 'CANCELADO';
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


   getPagamentoLabel(forma: string): string {
    const labels: Record<string, string> = {
      DINHEIRO:      'Dinheiro',
      PIX:           'PIX',
      CARTAO_DEBITO: 'Cartão Débito',
      CARTAO_CREDITO:'Cartão Crédito',
      BOLETO:        'Boleto',
      FIADO:         'Fiado',
    };
    return labels[forma] ?? forma;
  }

   formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }
}