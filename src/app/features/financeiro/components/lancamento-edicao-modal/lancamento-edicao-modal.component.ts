import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import {
  LancamentoFinanceiroResponse,
  LancamentoAtualizarRequest,
  TipoLancamento,
  StatusLancamento,
} from '../../models/financeiro.models';

@Component({
  selector: 'app-lancamento-edicao-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './lancamento-edicao-modal.component.html',
})
export class LancamentoEdicaoModalComponent implements OnChanges {

  @Input() visible    = false;
  @Input() salvando   = false;
  @Input() lancamento: LancamentoFinanceiroResponse | null = null;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<LancamentoAtualizarRequest>();

  // ── Formulário ────────────────────────────────────────────
  tipo:          TipoLancamento   = 'RECEITA';
  descricao      = '';
  categoria      = '';
  valor:         number | null    = null;
  dataVencimento = '';
  status:        StatusLancamento = 'PENDENTE';

  readonly categoriasSugeridas = [
    'Venda', 'Locação', 'Serviço', 'Aluguel', 'Salário',
    'Fornecedor', 'Utilidades', 'Imposto', 'Manutenção', 'Outro',
  ];

  get formValido(): boolean {
    return !!this.descricao.trim()
      && !!this.categoria.trim()
      && (this.valor ?? 0) > 0
      && !!this.dataVencimento;
  }

  ngOnChanges(): void {
    if (this.visible && this.lancamento) {
      this.tipo          = this.lancamento.tipo;
      this.descricao     = this.lancamento.descricao;
      this.categoria     = this.lancamento.categoria;
      this.valor         = this.lancamento.valor;
      this.dataVencimento = this.lancamento.dataVencimento;
      this.status        = this.lancamento.status === 'VENCIDO' ? 'PENDENTE' : this.lancamento.status;
    }
  }

  setTipo(t: TipoLancamento): void {
    this.tipo = t;
  }

  onSalvar(): void {
    if (!this.formValido) return;

    const payload: LancamentoAtualizarRequest = {
      tipo:           this.tipo,
      descricao:      this.descricao.trim(),
      categoria:      this.categoria.trim(),
      valor:          this.valor!,
      dataVencimento: this.dataVencimento,
      status:         this.status,
    };

    this.salvar.emit(payload);
  }

  onFechar(): void {
    this.fechar.emit();
  }
}
