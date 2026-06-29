import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ClienteRequest, ClienteAtualizarRequest, ClienteResponse } from '../../models/clientes.models';

@Component({
  selector: 'app-novo-cliente-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './novo-cliente-modal.component.html',
})
export class NovoClienteModalComponent implements OnChanges {

  @Input() visible = false;
  @Input() clienteEdit: ClienteResponse | null = null;
  @Input() salvando = false;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<ClienteRequest | ClienteAtualizarRequest>();

  // ── Estado do formulário ──────────────────────────────────
  nome           = '';
  cpfCnpj        = '';
  telefone       = '';
  email          = '';
  endereco       = '';
  consumidorFinal = true; // PF por padrão

  get modoEdicao(): boolean {
    return this.clienteEdit !== null;
  }

  get titulo(): string {
    return this.modoEdicao ? 'Editar cliente' : 'Novo cliente';
  }

  get tipoPessoa(): string {
    return this.consumidorFinal ? 'Pessoa Física (PF)' : 'Pessoa Jurídica (PJ)';
  }

  ngOnChanges(): void {
    if (this.visible) {
      if (this.clienteEdit) {
        this.nome            = this.clienteEdit.nome;
        this.cpfCnpj         = this.clienteEdit.cpfCnpj  ?? '';
        this.telefone        = this.clienteEdit.telefone  ?? '';
        this.email           = this.clienteEdit.email     ?? '';
        this.endereco        = this.clienteEdit.endereco  ?? '';
        this.consumidorFinal = this.clienteEdit.consumidorFinal;
      } else {
        this.resetar();
      }
    }
  }

  private resetar(): void {
    this.nome            = '';
    this.cpfCnpj         = '';
    this.telefone        = '';
    this.email           = '';
    this.endereco        = '';
    this.consumidorFinal = true;
  }

  onSalvar(): void {
    if (!this.nome.trim()) return;

    if (this.modoEdicao) {
      const payload: ClienteAtualizarRequest = {
        nome:     this.nome.trim(),
        cpfCnpj:  this.cpfCnpj  || undefined,
        telefone: this.telefone  || undefined,
        email:    this.email     || undefined,
        endereco: this.endereco  || undefined,
      };
      this.salvar.emit(payload);
    } else {
      const payload: ClienteRequest = {
        nome:            this.nome.trim(),
        cpfCnpj:         this.cpfCnpj  || undefined,
        telefone:        this.telefone  || undefined,
        email:           this.email     || undefined,
        endereco:        this.endereco  || undefined,
        consumidorFinal: this.consumidorFinal,
      };
      this.salvar.emit(payload);
    }
  }

  onFechar(): void {
    this.fechar.emit();
  }
}
