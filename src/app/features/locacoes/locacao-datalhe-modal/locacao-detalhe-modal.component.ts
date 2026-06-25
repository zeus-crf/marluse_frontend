import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { LocacaoResponse, StatusLocacao } from '../models/locacoes.models';

@Component({
    selector: 'app-locacao-detalhe-modal',
    standalone: true,
    imports: [CommonModule, DialogModule, TagModule],
    templateUrl: './locacao-detalhe-modal.component.html',
})

export class LocacaoDetalheModalComponent {

    @Input() visible = false;                          // ✅ typo corrigido: visable → visible
    @Input() locacao: LocacaoResponse | null = null;
    @Input() salvando = false;

    @Output() fechar   = new EventEmitter<void>();
    @Output() devolver = new EventEmitter<LocacaoResponse>();
    @Output() cancelar = new EventEmitter<LocacaoResponse>();

    get podeDevolver(): boolean {
        return !!this.locacao &&
               this.locacao.status !== 'DEVOLVIDA' &&
               this.locacao.status !== 'CANCELADA' &&
               this.locacao.status !== 'ORCAMENTO';  // ✅ orçamento não pode ser devolvido
    }

    get podeCancelar(): boolean {
        return !!this.locacao && this.locacao.status !== 'CANCELADA';
    }

    getSeverity(status: StatusLocacao): 'success' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'ATIVA':      return 'secondary';   // ✅ separado de CANCELADA
            case 'ATRASADA':   return 'danger';
            case 'DEVOLVIDA':  return 'success';
            case 'CANCELADA':  return 'secondary';
            case 'ORCAMENTO':  return 'warn';
        }
    }

    getStatusLabel(status: StatusLocacao): string {
        const labels: Record<StatusLocacao, string> = {
            ORCAMENTO:  'Orçamento',
            ATIVA:      'Ativa',            // ✅ capitalização correta
            ATRASADA:   'Atrasada',
            DEVOLVIDA:  'Devolvida',
            CANCELADA:  'Cancelada',
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
