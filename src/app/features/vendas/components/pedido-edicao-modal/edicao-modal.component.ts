import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { PedidoResponse, FormaPagamento } from '../../models/vendas.models';

@Component({
  selector: 'app-pedido-edicao-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './edicao-modal.component.html',
})
export class PedidoEdicaoModalComponent {

  @Input() visible = false;
  @Input() salvando = false;

  @Input() set pedido(p: PedidoResponse | null) {
    this._pedido = p;
    this.formaPagamento = p?.formaPagamento ?? '';
    this.observacao     = p?.observacao    ?? '';
  }
  get pedido(): PedidoResponse | null { return this._pedido; }
  private _pedido: PedidoResponse | null = null;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<{ observacao: string; formaPagamento: FormaPagamento }>();

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
