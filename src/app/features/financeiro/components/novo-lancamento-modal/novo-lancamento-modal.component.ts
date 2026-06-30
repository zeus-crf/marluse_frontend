import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import {
  LancamentoFinanceiroRequest,
  LancamentoFinanceiroResponse,
  TipoLancamento,
  StatusLancamento,
  Recorrencia,
} from '../../models/financeiro.models';
import { ClienteSimples } from '../../../vendas/models/vendas.models';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { SelectSearchComponent } from '../../../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-novo-lancamento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SelectComponent, SelectSearchComponent],
  templateUrl: './novo-lancamento-modal.component.html',
})
export class NovoLancamentoModalComponent implements OnChanges {

  @Input() visible  = false;
  @Input() salvando = false;
  @Input() clientes: ClienteSimples[] = [];

  @Output() fechar            = new EventEmitter<void>();
  @Output() lancamentoCriado  = new EventEmitter<LancamentoFinanceiroRequest>();

  // ── Formulário ────────────────────────────────────────────
  tipo:           TipoLancamento  = 'RECEITA';
  descricao       = '';
  categoria       = '';
  valor:          number | null   = null;
  dataVencimento  = '';
  status:         StatusLancamento = 'PENDENTE';
  clienteId:      string | null   = null;
  recorrente      = false;
  recorrencia:    Recorrencia     = 'MENSAL';

  readonly categoriasSugeridas = [
    'Venda', 'Locação', 'Serviço', 'Aluguel', 'Salário',
    'Fornecedor', 'Utilidades', 'Imposto', 'Manutenção', 'Outro',
  ];

  readonly recorrencias: { label: string; value: Recorrencia }[] = [
    { label: 'Diária',   value: 'DIARIA'  },
    { label: 'Semanal',  value: 'SEMANAL' },
    { label: 'Mensal',   value: 'MENSAL'  },
    { label: 'Anual',    value: 'ANUAL'   },
  ];

  readonly opcoesStatus = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'PAGO',     label: 'Pago'     },
  ];

  get clienteOptions() {
    return [
      { value: '', label: '— Nenhum —' },
      ...this.clientes.map(c => ({ value: c.id, label: c.nome })),
    ];
  }

  get formValido(): boolean {
    return !!this.descricao.trim()
      && !!this.categoria.trim()
      && (this.valor ?? 0) > 0
      && !!this.dataVencimento;
  }

  ngOnChanges(): void {
    if (this.visible) this.resetar();
  }

  setTipo(t: TipoLancamento): void {
    this.tipo = t;
  }

  onSalvar(): void {
    if (!this.formValido) return;

    const payload: LancamentoFinanceiroRequest = {
      tipo:           this.tipo,
      descricao:      this.descricao.trim(),
      categoria:      this.categoria.trim(),
      valor:          this.valor!,
      dataVencimento: this.dataVencimento,
      status:         this.status,
      clienteId:      this.clienteId || null,
      recorrencia:    this.recorrente ? this.recorrencia : null,
    };

    this.lancamentoCriado.emit(payload);
  }

  onFechar(): void {
    this.fechar.emit();
  }

  private resetar(): void {
    this.tipo          = 'RECEITA';
    this.descricao     = '';
    this.categoria     = '';
    this.valor         = null;
    this.dataVencimento = new Date().toISOString().split('T')[0];
    this.status        = 'PENDENTE';
    this.clienteId     = null;
    this.recorrente    = false;
    this.recorrencia   = 'MENSAL';
  }
}
