import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { LocacaoService } from '../locacoes/locacoes.service';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { SelectSearchComponent } from '../../../shared/components/select-search/select-search.component';
import { ClienteSimples, FormaPagamento, LocacaoResponse, ProdutoSimples, StatusLocacao } from '../models/locacoes.models';

interface ItemForm {
  produtoId: string;
  produtoNome: string;
  precoUnitario: number;
  quantidade: number;
}

@Component({
    selector: 'app-nova-locacao-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, SelectComponent, SelectSearchComponent],
    templateUrl: './nova-locacao-modal.component.html',
})
export class NovaLocacaoModalComponent {

    private service = inject(LocacaoService);

    @Input() visible = false;
    @Input() produtos: ProdutoSimples[] = [];
    @Input() clientes: ClienteSimples[]  = [];
    @Input() loadingDados = false;

    @Output() fechar = new EventEmitter<void>();
    @Output() locacaoCriada = new EventEmitter<LocacaoResponse>();  // ✅ nome feminino (alinhado com o pai)

    // ✅ tipo tipado — 'LOCACAO' vs 'ORCAMENTO' (não mais string vazia)
    tipo: 'LOCACAO' | 'ORCAMENTO' = 'LOCACAO';
    clienteId        = '';
    observacao       = '';
    dataRetirada     = '';
    dataDevolucaoPrevista = '';
    formaPagamento: FormaPagamento | '' = '';

    itens: ItemForm[] = [this.novoItem()];
    salvando = false;

    readonly tipoOpcoes: { val: 'LOCACAO' | 'ORCAMENTO'; label: string }[] = [
        { val: 'LOCACAO',    label: 'Locação'   },
        { val: 'ORCAMENTO',  label: 'Orçamento' },
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
    get isOrcamento(): boolean { return this.tipo === 'ORCAMENTO'; }

    get clienteOptions(): SelectOption[] {
        return this.clientes.map(c => ({ value: c.id, label: c.nome }));
    }

    get produtoOptions(): SelectOption[] {
        return this.produtos.map(p => ({ value: p.id, label: p.nome }));
    }

    /** Número de dias entre retirada e devolução prevista */
    get dias(): number {
        if (!this.dataRetirada || !this.dataDevolucaoPrevista) return 0;
        const inicio = new Date(this.dataRetirada);
        const fim    = new Date(this.dataDevolucaoPrevista);
        return Math.max(0, (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    }

    /** ✅ Total considera precoDiaria × quantidade × dias */
    get total(): number {
        return this.itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade * this.dias, 0);
    }

    /** ✅ Inclui validação de datas obrigatórias */
    get formValida(): boolean {
        return (
            !!this.formaPagamento &&
            !!this.dataRetirada &&
            !!this.dataDevolucaoPrevista &&
            this.dataDevolucaoPrevista > this.dataRetirada &&
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
            item.produtoNome   = produto.nome;
            item.precoUnitario = Number(produto.preco);
        }
    }

    salvar(): void {
        if (!this.formValida) return;
        this.salvando = true;

        // ✅ status mapeado corretamente — ORCAMENTO ou ATIVA (padrão backend)
        const status: StatusLocacao = this.tipo === 'ORCAMENTO' ? 'ORCAMENTO' : 'ATIVA';

        this.service.postLocacao({
            clienteId:             this.clienteId || undefined,
            formaPagamento:        this.formaPagamento as FormaPagamento,
            dataRetirada:          this.dataRetirada,
            dataDevolucaoPrevista: this.dataDevolucaoPrevista,
            itens:                 this.itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
            observacao:            this.observacao || null,
            status,
        }, this.tipo === 'ORCAMENTO').subscribe({
            next: (locacao) => {
                this.locacaoCriada.emit(locacao);             // ✅ evento com nome correto
                this.resetForm();
                this.salvando = false;
            },
            error: () => {
                this.salvando = false;
            },
        });
    }

    fecharModal(): void {
        this.resetForm();
        this.fechar.emit();
    }

    private resetForm(): void {
        this.tipo                  = 'LOCACAO';               // ✅ valor inicial coerente com o tipo
        this.dataRetirada          = '';
        this.dataDevolucaoPrevista = '';
        this.clienteId             = '';
        this.formaPagamento        = '';
        this.itens                 = [this.novoItem()];
        this.observacao            = '';
    }

    /** ✅ rowTotal também considera os dias */
    rowTotal(item: ItemForm): number {
        return item.precoUnitario * item.quantidade * this.dias;
    }

    formatCurrency(v: number): string {
        return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    trackByIndex(index: number): number { return index; }
}
