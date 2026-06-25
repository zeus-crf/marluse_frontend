import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { LocacaoResponse, FormaPagamento } from '../models/locacoes.models';

@Component({
  selector: 'app-locacao-edicao-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './locacao-edicao-modal.component.html',
})

export class LocacaoEdicaoModalComponent {

  @Input() visible = false;
  @Input() salvando = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<{ observacao: string; formaPagamento: FormaPagamento }>();


  @Input() set locacao(l: LocacaoResponse | null) { 
    this._locacao = l;
    this.formaPagamento = l?.formaPagamento ?? '';
    this.observacao     = l?.observacao    ?? '';
  }

  get locacao(): LocacaoResponse | null { return this._locacao; }
  private _locacao: LocacaoResponse | null = null;

  get formValida(): boolean {
    return !!this.formaPagamento;
  }

    formaPagamento: FormaPagamento | '' = '';
    observacao = '';
    
readonly formasPagamento: { valor: FormaPagamento; label: string }[] = [
    { valor: 'PIX',            label: 'PIX'      },
    { valor: 'DINHEIRO',       label: 'Dinheiro' },
    { valor: 'CARTAO_CREDITO', label: 'Crédito'  },
    { valor: 'CARTAO_DEBITO',  label: 'Débito'   },
    { valor: 'FIADO',          label: 'Fiado'    },
    { valor: 'BOLETO',         label: 'Boleto'   },
  ];

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  onSalvar(): void {
    if (!this.formaPagamento) return;
    this.salvar.emit({
      observacao:     this.observacao,
      formaPagamento: this.formaPagamento,
    });
  }

  fecharModal(): void {
    this.fechar.emit();
  }
}