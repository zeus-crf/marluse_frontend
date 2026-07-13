import { Component, inject } from "@angular/core";
import { ExportService } from "../../services/export.service";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";

@Component({
  selector: 'app-pedido-comprovante',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './pedido-comprovante.component.html',
  styleUrl: './pedido-comprovante.component.css'
})



export class PedidoComprovanteComponent {

     hoje = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
    );

exportService = inject(ExportService)
pedido = this.exportService.pedido
formato = this.exportService.formato
}