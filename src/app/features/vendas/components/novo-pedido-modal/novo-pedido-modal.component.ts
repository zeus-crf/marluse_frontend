import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { VendasService } from '../../vendas.service';
import {
  PedidoResponse, ProdutoSimples, ClienteSimples, FormaPagamento, StatusPedido
} from '../../models/vendas.models';
import { SelectComponent, SelectOption } from '../../../../../shared/components/select/select.component';


interface ItemForm {
  produtoId: string;
  produtoNome: string;
  precoUnitario: number;
  quantidade: number;
}

@Component({
  selector: 'app-novo-pedido-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SelectComponent],
  templateUrl: './novo-pedido-modal.component.html',
})
export class NovoPedidoModalComponent {
  private service = inject(VendasService);

  @Input() visible = false;
  @Input() produtos: ProdutoSimples[] = [];
  @Input() clientes: ClienteSimples[] = [];
  @Input() loadingDados = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() pedidoCriado = new EventEmitter<PedidoResponse>();

  // Form state
  tipo: 'PEDIDO' | 'ORCAMENTO' = 'PEDIDO';
  dataVencimento = '';
  clienteId = '';
  observacao = '';
  formaPagamento: FormaPagamento | '' = '';
  
  itens: ItemForm[] = [this.novoItem()];
  salvando = false;

  readonly tipoOpcoes: { val: 'PEDIDO' | 'ORCAMENTO'; label: string }[] = [
    { val: 'PEDIDO',    label: 'Venda'     },
    { val: 'ORCAMENTO', label: 'Orçamento' },
  ];

  readonly formasPagamento: { valor: FormaPagamento; label: string }[] = [
    { valor: 'PIX',            label: 'PIX'      },
    { valor: 'DINHEIRO',       label: 'Dinheiro' },
    { valor: 'CARTAO_CREDITO', label: 'Crédito'  },
    { valor: 'CARTAO_DEBITO',  label: 'Débito'   },
    { valor: 'FIADO',          label: 'Fiado'    },
    { valor: 'BOLETO',         label: 'Boleto'   },
  ];

  get isFiado(): boolean { return this.formaPagamento === 'FIADO'; }

  get clienteOptions(): SelectOption[] {
    return this.clientes.map(c => ({ value: c.id, label: c.nome }));
  }

  get produtoOptions(): SelectOption[] {
    return this.produtos.map(p => ({ value: p.id, label: p.nome }));
  }

  get total(): number {
    return this.itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0);
  }

  get formValida(): boolean {
    return (
      !!this.formaPagamento &&
      this.itens.length > 0 &&
      this.itens.every(i => i.produtoId && i.quantidade > 0)
    );
  }

  novoItem(): ItemForm {
    return { produtoId: '', produtoNome: '', precoUnitario: 0, quantidade: 1 };
  }

  adicionarLinha(): void {
    this.itens = [...this.itens, this.novoItem()];
  }

  removerLinha(index: number): void {
    this.itens = this.itens.filter((_, i) => i !== index);
  }

  incrementarQty(item: ItemForm): void {
    item.quantidade++;
  }

  decrementarQty(index: number): void {
    const item = this.itens[index];
    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      this.removerLinha(index);
    }
  }

  onProdutoChange(item: ItemForm): void {
    const produto = this.produtos.find(p => p.id === item.produtoId);
    if (produto) {
      item.produtoNome = produto.nome;
      item.precoUnitario = Number(produto.preco);
    }
  }

  salvar(): void {
    if (!this.formValida) return;
    this.salvando = true;
    const status: StatusPedido = this.tipo === 'ORCAMENTO' ? 'ORCAMENTO' : 'CONFIRMADO';
    this.service.postPedidos({
      clienteId:      this.clienteId || undefined,
      formaPagamento: this.formaPagamento as FormaPagamento,
      itens:          this.itens.map(i => ({ productId: i.produtoId, quantidade: i.quantidade })),
      status,
      dataVencimento: this.isFiado && this.dataVencimento ? this.dataVencimento : undefined,
      observacao: this.observacao,
    }).subscribe({
      next: (pedido) => {
        this.pedidoCriado.emit(pedido);
        this.resetForm();
        this.salvando = false;
      },
      error: () => { this.salvando = false; },
    });
  }

  fecharModal(): void {
    this.resetForm();
    this.fechar.emit();
  }

  private resetForm(): void {
    this.tipo          = 'PEDIDO';
    this.dataVencimento = '';
    this.clienteId     = '';
    this.formaPagamento = '';
    this.itens         = [this.novoItem()];
    this.observacao = '';
  }

  rowTotal(item: ItemForm): number { return item.precoUnitario * item.quantidade; }

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  trackByIndex(index: number): number { return index; }
}