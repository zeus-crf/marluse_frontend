import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { PedidoResponse, StatusPedido, ParcelaResponse } from '../../models/vendas.models';
import { VendasService } from '../../vendas.service';

@Component({
    selector: 'app-pedido-detalhe-modal',
    standalone: true,
    imports: [CommonModule, DialogModule, TagModule],
    templateUrl: './pedido-detalhe-modal.component.html',
})
export class PedidoDetalheModalComponent implements OnChanges {

    private vendasService = inject(VendasService);
    private cdr          = inject(ChangeDetectorRef);

    @Input() visible = false;
    @Input() pedido: PedidoResponse | null = null;
    @Input() salvando = false;

    @Output() fechar        = new EventEmitter<void>();
    @Output() pagar         = new EventEmitter<string>();
    @Output() cancelar      = new EventEmitter<string>();
    @Output() parcelaPaga   = new EventEmitter<ParcelaResponse | null>();

    parcelas: ParcelaResponse[] = [];
    loadingParcelas = false;
    pagandoParcela: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        const visibleOn  = changes['visible']?.currentValue === true;
        const pedidoMuda = !!changes['pedido']?.currentValue;
        if ((visibleOn || pedidoMuda) && this.visible && this.pedido) {
            this.carregarDetalhe();
        }
        if (changes['visible']?.currentValue === false) {
            this.parcelas        = [];
            this.pagandoParcela  = null;
        }
    }

    private carregarDetalhe(): void {
    if (!this.pedido) return;
    this.loadingParcelas = true;
    this.vendasService.getByPedidoId(this.pedido.id).subscribe({
        next: pedido => {
            this.parcelas       = pedido.parcelas ?? [];
            this.loadingParcelas = false;
            this.cdr.detectChanges();
        },
        error: () => { this.loadingParcelas = false; }
    });
}

    pagarParcela(parcelaId: string): void {
        if (!this.pedido) return;
        this.pagandoParcela = parcelaId;
        this.vendasService.patchPagarParcela(parcelaId).subscribe({
            next: () => {
                const hoje = new Date();
                const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
                this.parcelas = this.parcelas.map(p =>
                    p.id === parcelaId
                        ? { ...p, status: 'PAGO' as const, dataPagamento: dataHoje }
                        : p
                );
                this.pagandoParcela = null;
                this.cdr.detectChanges();
                // Notifica o pai para atualizar o badge na tabela
                const allPago = this.parcelas.every(p => p.status === 'PAGO');
                const proxima = allPago
                    // Todas pagas → emite a última para mostrar "N/N pagas" na tabela
                    ? ([...this.parcelas].sort((a, b) => b.numeroParcela - a.numeroParcela)[0] ?? null)
                    : (this.parcelas.find(p => p.status === 'PENDENTE') ?? null);
                this.parcelaPaga.emit(proxima);
                // Se todas pagas, marca o pedido inteiro como PAGO
                if (allPago && this.podePagar) {
                    this.pagar.emit(this.pedido!.id);
                }
            },
            error: () => {
                this.pagandoParcela = null;
                this.cdr.detectChanges();
            }
        });
    }

    get podePagar(): boolean {
        return !!this.pedido && this.pedido.status !== 'PAGO' && this.pedido.status !== 'CANCELADO';
    }

    get podeCancelar(): boolean {
        return !!this.pedido && this.pedido.status !== 'CANCELADO';
    }

    get parcelasPagasCount(): number {
        return this.parcelas.filter(p => p.status === 'PAGO').length;
    }

    isVencida(parcela: ParcelaResponse): boolean {
        if (!parcela.dataVencimento || parcela.status !== 'PENDENTE') return false;
        return new Date(parcela.dataVencimento + 'T12:00:00') < new Date();
    }

    getStatusParcelaLabel(parcela: ParcelaResponse): string {
        if (parcela.status === 'PAGO')      return 'Pago';
        if (parcela.status === 'CANCELADO') return 'Cancelado';
        return this.isVencida(parcela) ? 'Vencida' : 'Pendente';
    }

    getSeverity(status: StatusPedido): 'success' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'PAGO':       return 'success';
            case 'CONFIRMADO': return 'warn';
            case 'PENDENTE':   return 'danger';
            case 'CANCELADO':  return 'danger';
            case 'ORCAMENTO':  return 'secondary';
        }
    }

    getStatusLabel(status: StatusPedido): string {
        const labels: Record<StatusPedido, string> = {
            ORCAMENTO:  'Orçamento',
            CONFIRMADO: 'Confirmado',
            PENDENTE:   'Vencido',
            PAGO:       'Pago',
            CANCELADO:  'Cancelado',
        };
        return labels[status];
    }

    getPagamentoLabel(forma: string): string {
        const labels: Record<string, string> = {
            DINHEIRO:       'Dinheiro',
            PIX:            'PIX',
            CARTAO_DEBITO:  'Cartão Débito',
            CARTAO_CREDITO: 'Cartão Crédito',
            BOLETO:         'Boleto',
            FIADO:          'Fiado',
        };
        return labels[forma] ?? forma;
    }

    formatCurrency(v: number): string {
        return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    formatData(iso: string): string {
        if (!iso) return '';
        const [year, month, day] = iso.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }

    formatNumero(n: number): string {
        return String(n ?? 0).padStart(3, '0');
    }
}
