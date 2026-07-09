import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  ProdutoRequest,
  ProdutoAtualizarRequest,
  ProdutoResponse,
  UnidadeMedida,
} from '../models/estoque.models';
import { SelectSearchComponent } from '../../../shared/components/select-search/select-search.component';
import { FieldErrorPipe } from '../../../shared/pipes/field-error.pipe';

@Component({
  selector: 'app-novo-produto-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputNumberModule, SelectSearchComponent, FieldErrorPipe],
  templateUrl: './novo-produto-modal.component.html',
})
export class NovoProdutoModalComponent implements OnChanges {

  private fb = inject(FormBuilder);

  @Input() visible  = false;
  @Input() produto: ProdutoResponse | null = null;
  @Input() salvando = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<ProdutoRequest | ProdutoAtualizarRequest>();

  form = this.fb.group({
    nome:              ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    descricao:         [''],
    valorCompra:       [null as number | null, [Validators.required, Validators.min(0.01)]],
    preco:             [null as number | null, [Validators.required, Validators.min(0.01)]],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
    estoqueMinimo:     [0, [Validators.min(0)]],
    medida:            [null as unknown as UnidadeMedida, [Validators.required]],
  });

  get isEdicao(): boolean { return !!this.produto; }
  get titulo():   string  { return this.isEdicao ? 'Editar produto' : 'Novo produto'; }

  readonly unidades: { value: UnidadeMedida; label: string }[] = [
    { value: 'SACO',           label: 'Saco' },
    { value: 'METRO',          label: 'Metro (m)' },
    { value: 'METRO_QUADRADO', label: 'Metro quadrado (m²)' },
    { value: 'LITRO',          label: 'Litro' },
    { value: 'PECA',           label: 'Peça' },
    { value: 'KG',             label: 'Kg' },
    { value: 'ROLO',           label: 'Rolo' },
    { value: 'BALDE',          label: 'Balde' },
  ];

  ngOnChanges(): void {
    if (!this.visible) return;
    if (this.produto) {
      this.form.reset({
        nome:              this.produto.nome,
        descricao:         this.produto.descricao ?? '',
        valorCompra:       Number(this.produto.valorCompra),
        preco:             Number(this.produto.preco),
        quantidadeEstoque: this.produto.quantidadeEstoque,
        estoqueMinimo:     this.produto.estoqueMinimo,
        medida:            this.produto.medida,
      });
    } else {
      this.form.reset({ nome: '', descricao: '', valorCompra: null, preco: null, quantidadeEstoque: 0, estoqueMinimo: 0, medida: null as unknown as UnidadeMedida });
    }
  }

  onSalvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload = {
      nome:              v.nome!.trim(),
      descricao:         v.descricao?.trim() || undefined,
      valorCompra:       v.valorCompra!,
      preco:             v.preco!,
      quantidadeEstoque: v.quantidadeEstoque!,
      estoqueMinimo:     v.estoqueMinimo ?? 0,
      medida:            v.medida as UnidadeMedida,
    };
    this.salvar.emit(payload);
  }
}
