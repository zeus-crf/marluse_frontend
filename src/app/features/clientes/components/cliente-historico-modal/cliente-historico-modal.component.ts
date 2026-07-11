import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ClienteResponse, ClienteHistoricoResponse } from '../../models/clientes.models';
import { ClientesService } from '../../clientes/clientes.service';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
type Tab = 'vendas' | 'locacoes';

@Component({
  selector: 'app-cliente-historico-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, TagModule],
  templateUrl: './cliente-historico-modal.component.html',
})
export class ClienteHistoricoModalComponent implements OnChanges {

  private clientesService = inject(ClientesService);

  @Input() visible = false;
  @Input() cliente: ClienteResponse | null = null;

  @Output() fechar = new EventEmitter<void>();

  historico: ClienteHistoricoResponse | null = null;
  loading = false;
  tabAtiva: Tab = 'vendas';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente'] && this.cliente) {
      this.tabAtiva = 'vendas';
      this.carregarHistorico(this.cliente.id);
    }
    if (changes['cliente'] && !this.cliente) {
      this.historico = null;
    }
  }

  private carregarHistorico(id: string): void {
    this.loading = true;
    this.historico = null;
    this.clientesService.getHistorico(id).subscribe({
      next: h => { this.historico = h; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  statusPedidoLabel(status: string): string {
    const map: Record<string, string> = {
      CONFIRMADO: 'Confirmado', PAGO: 'Pago', ORCAMENTO: 'Orçamento', CANCELADO: 'Cancelado',
    };
    return map[status] ?? status;
  }

  statusPedidoSeverity(status: string): Severity {
    const map: Record<string, Severity> = {
      CONFIRMADO: 'info', PAGO: 'success', ORCAMENTO: 'secondary', CANCELADO: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  statusLocacaoLabel(status: string): string {
    const map: Record<string, string> = {
      ATIVA: 'Ativa', ATRASADA: 'Atrasada', DEVOLVIDA: 'Devolvida', CANCELADA: 'Cancelada',
    };
    return map[status] ?? status;
  }

  statusLocacaoSeverity(status: string): Severity {
    const map: Record<string, Severity> = {
      ATIVA: 'info', ATRASADA: 'warn', DEVOLVIDA: 'success', CANCELADA: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  onFechar(): void {
    this.fechar.emit();
  }
}
