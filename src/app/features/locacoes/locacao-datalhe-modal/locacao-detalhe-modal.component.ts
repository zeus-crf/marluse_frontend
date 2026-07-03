import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { LocacaoResponse, StatusLocacao, ParcelaResponse } from '../models/locacoes.models';
import { LocacaoService } from '../locacoes/locacoes.service';

@Component({
    selector: 'app-locacao-detalhe-modal',
    standalone: true,
    imports: [CommonModule, DialogModule, TagModule],
    templateUrl: './locacao-detalhe-modal.component.html',
})
export class LocacaoDetalheModalComponent implements OnChanges {

    private locacaoService = inject(LocacaoService);
    private cdr            = inject(ChangeDetectorRef);

    @Input() visible = false;
    @Input() locacao: LocacaoResponse | null = null;
    @Input() salvando = false;

    @Output() fechar      = new EventEmitter<void>();
    @Output() devolver    = new EventEmitter<LocacaoResponse>();
    @Output() cancelar    = new EventEmitter<LocacaoResponse>();
    @Output() confirmar   = new EventEmitter<LocacaoResponse>();
    @Output() parcelaPaga = new EventEmitter<void>();

    parcelas: ParcelaResponse[] = [];
    loadingParcelas = false;
    pagandoParcela: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        const visibleOn   = changes['visible']?.currentValue === true;
        const locacaoMuda = !!changes['locacao']?.currentValue;
        if ((visibleOn || locacaoMuda) && this.visible && this.locacao) {
            this.carregarDetalhe();
        }
        if (changes['visible']?.currentValue === false) {
            this.parcelas       = [];
            this.pagandoParcela = null;
        }
    }

    private carregarDetalhe(): void {
        if (!this.locacao) return;
        this.loadingParcelas = true;
        this.locacaoService.getLocacaoById(this.locacao.id).subscribe({
            next: locacao => {
                this.parcelas        = locacao.parcelas ?? [];
                this.loadingParcelas = false;
                this.cdr.detectChanges();
            },
            error: () => { this.loadingParcelas = false; }
        });
    }

    pagarParcela(parcelaId: string): void {
        if (!this.locacao) return;
        this.pagandoParcela = parcelaId;
        this.locacaoService.patchPagarParcela(parcelaId).subscribe({
            next: () => {
                const hoje = new Date();
                const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
                this.parcelas = this.parcelas.map(p =>
                    p.id === parcelaId
                        ? { ...p, status: 'PAGO' as const, dataPagamento: dataHoje }
                        : p
                );
                this.pagandoParcela = null;
                this.parcelaPaga.emit();
                this.cdr.detectChanges();
            },
            error: () => {
                this.pagandoParcela = null;
                this.cdr.detectChanges();
            }
        });
    }

    get podeConfirmar(): boolean {
        return !!this.locacao && this.locacao.status === 'ORCAMENTO';
    }

    get podeDevolver(): boolean {
        return !!this.locacao &&
               this.locacao.status !== 'DEVOLVIDA' &&
               this.locacao.status !== 'CANCELADA' &&
               this.locacao.status !== 'ORCAMENTO';
    }

    get podeCancelar(): boolean {
        return !!this.locacao && this.locacao.status !== 'CANCELADA';
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

    getSeverity(status: StatusLocacao): 'success' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'ATIVA':      return 'secondary';
            case 'ATRASADA':   return 'danger';
            case 'DEVOLVIDA':  return 'success';
            case 'CANCELADA':  return 'secondary';
            case 'ORCAMENTO':  return 'warn';
        }
    }

    getStatusLabel(status: StatusLocacao): string {
        const labels: Record<StatusLocacao, string> = {
            ORCAMENTO:  'Orçamento',
            ATIVA:      'Ativa',
            ATRASADA:   'Atrasada',
            DEVOLVIDA:  'Devolvida',
            CANCELADA:  'Cancelada',
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
