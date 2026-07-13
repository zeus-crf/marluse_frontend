import { Component, inject } from "@angular/core";
import { ExportService } from "../../services/export.service";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";

@Component({
  selector: 'app-pedido-comprovante',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './locacao-comprovante.component.html',
  styleUrl: './locacao-comprovante.component.css'
})

export class LocacaoComprovanteComponent {

     hoje = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
    );

    exportService = inject(ExportService)
    locacao = this.exportService.locacao
    formato = this.exportService.formato
}