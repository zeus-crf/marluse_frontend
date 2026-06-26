import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import {
  ProdutoRequest,
  ProdutoAtualizarRequest,
  ProdutoResponse,
  UnidadeMedida,
} from '../models/estoque.models';

interface ProdutoForm {
  nome: string;
  descricao: string;
  preco: number | null;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  medida: UnidadeMedida;
}

@Component({
  selector: 'app-novo-produto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
  templateUrl: './novo-produto-modal.component.html',
})
export class NovoProdutoModalComponent implements OnChanges {
  @Input() visible  = false;
  @Input() produto: ProdutoResponse | null = null;
  @Input() salvando = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<ProdutoRequest | ProdutoAtualizarRequest>();

  form: ProdutoForm = this.formVazio();

  get isEdicao(): boolean { return !!this.produto; }
  get titulo():   string  { return this.isEdicao ? 'Editar produto' : 'Novo produto'; }

  readonly unidades: { value: UnidadeMedida; label: string }[] = [
    { value: 'SACO',          label: 'Saco' },
    { value: 'METRO',         label: 'Metro (m)' },
    { value: 'METRO_QUADRADO',label: 'Metro quadrado (m²)' },
    { value: 'LITRO',         label: 'Litro' },
    { value: 'PECA',          label: 'Peça' },
    { value: 'KG',            label: 'Kg' },
    { value: 'ROLO',          label: 'Rolo' },
    { value: 'BALDE',         label: 'Balde' },
  ];

  ngOnChanges(): void {
    if (!this.visible) return;
    if (this.produto) {
      this.form = {
        nome:               this.produto.nome,
        descricao:          this.produto.descricao ?? '',
        preco:              Number(this.produto.preco),
        quantidadeEstoque:  this.produto.quantidadeEstoque,
        estoqueMinimo:      this.produto.estoqueMinimo,
        medida:             this.produto.medida,
      };
    } else {
      this.form = this.formVazio();
    }
  }

  get formValido(): boolean {
    return !!this.form.nome?.trim() && this.form.preco !== null && this.form.preco > 0;
  }

  onSalvar(): void {
    if (!this.formValido) return;

    if (this.isEdicao) {
      const payload: ProdutoAtualizarRequest = {
        nome:              this.form.nome.trim(),
        descricao:         this.form.descricao?.trim() || undefined,
        preco:             this.form.preco!,
        quantidadeEstoque: this.form.quantidadeEstoque,
        estoqueMinimo:     this.form.estoqueMinimo,
        medida:            this.form.medida,
      };
      this.salvar.emit(payload);
    } else {
      const payload: ProdutoRequest = {
        nome:              this.form.nome.trim(),
        descricao:         this.form.descricao?.trim() || undefined,
        preco:             this.form.preco!,
        quantidadeEstoque: this.form.quantidadeEstoque,
        estoqueMinimo:     this.form.estoqueMinimo,
        medida:            this.form.medida,
      };
      this.salvar.emit(payload);
    }
  }

  private formVazio(): ProdutoForm {
    return { nome: '', descricao: '', preco: null, quantidadeEstoque: 0, estoqueMinimo: 0, medida: 'PECA' };
  }
}
