import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (control && control.invalid && control.touched) {
      <span class="text-xs text-red-500 mt-0.5 flex items-center gap-1">
        <i class="pi pi-times-circle text-[10px]"></i>
        {{ mensagem }}
      </span>
    }
  `
})
export class FieldErrorComponent {
  @Input() control: AbstractControl | null = null;

  get mensagem(): string {
    if (!this.control?.errors) return '';
    const erros = this.control.errors;

    if (erros['required'])   return 'Campo obrigatório';
    if (erros['email'])      return 'E-mail inválido';
    if (erros['minlength'])  return `Mínimo ${erros['minlength'].requiredLength} caracteres`;
    if (erros['maxlength'])  return `Máximo ${erros['maxlength'].requiredLength} caracteres`;
    if (erros['cpfInvalido'])     return 'CPF inválido';
    if (erros['cnpjInvalido'])    return 'CNPJ inválido';
    if (erros['telefoneInvalido']) return 'Telefone inválido';

    return 'Campo inválido';
  }
}
