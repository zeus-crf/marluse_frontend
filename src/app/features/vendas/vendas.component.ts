import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { VendasService } from './vendas.service';
import {
  PedidoResponse,
  ProdutoSimples,
  ClienteSimples,
  StatusPedido,
} from './models/vendas.models';
import { VendasTableComponent } from './components/vendas-table/vendas-table.component';
import { NovoPedidoModalComponent } from './components/novo-pedido-modal/novo-pedido-modal.component';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, ToastModule, VendasTableComponent, NovoPedidoModalComponent],
  templateUrl: './vendas.component.html',
  styleUrl: './vendas.component.scss',
  providers: [MessageService],
})
export class VendasComponent implements OnInit {
  private service = inject(VendasService);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  // ── Dados ──────────────────────────────────────────────────
  pedidos: PedidoResponse[] = [];
  produtos: ProdutoSimples[] = [];
  clientes: ClienteSimples[] = [];

  // ── Loading ────────────────────────────────────────────────
  loading = true;
  salvando = false;
  loadingModal = false;

  // ── Filtros ────────────────────────────────────────────────
  busca = '';
  statusFiltro: StatusPedido | 'TODOS' = 'TODOS';
  filtroInicio = '';
  filtroFim = '';

  // ── Modais ─────────────────────────────────────────────────
  showModalCriar = false;
  showModalDetalhe = false;
  showModalFiltros = false;
  pedidoSelecionado: PedidoResponse | null = null;

  // ── Donut "Por Status" ─────────────────────────────────────
  donutSeries: number[] = [];
  donutChart: any = { type: 'donut', height: 200, fontFamily: 'inherit' };
  donutColors = ['#22c55e', '#f59e0b', '#ef4444'];
  donutLabels = ['Pago', 'Pendente', 'Cancelado'];
  donutLegend: any = { show: false };
  donutDataLabels: any = { enabled: false };
  donutPlotOptions: any = { pie: { donut: { size: '72%' } } };
  donutStroke: any = { width: 0 };
  donutTooltip: any = { y: { formatter: (v: number) => this.formatCurrency(v) } };

  // ── Barras horizontais "Top Clientes" ──────────────────────
  barHSeries: any[] = [];
  barHChart: any = { type: 'bar', height: 220, toolbar: { show: false }, fontFamily: 'inherit' };
  barHPlotOptions: any = { bar: { horizontal: true, barHeight: '60%', borderRadius: 3 } };
  barHColors = ['#3b82f6'];
  barHDataLabels: any = { enabled: false };
  barHGrid: any = {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  };
  barHXaxis: any = {
    labels: {
      formatter: (v: number) => this.formatCurrency(v),
      style: { colors: '#94a3b8', fontSize: '11px' },
    },
  };
  barHYaxis: any = { labels: { style: { colors: '#64748b', fontSize: '12px' } } };
  barHTooltip: any = { y: { formatter: (v: number) => this.formatCurrency(v) } };


  tipos: { val: "PEDIDO" | "ORCAMENTO"; label: string }[] = [
  { val: "PEDIDO", label: "Venda" },
  { val: "ORCAMENTO", label: "Orçamento" }
];

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.loading = true;
    this.service.getPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.atualizarGraficos();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── KPIs (calculados a partir da lista) ────────────────────
  get vendasMes(): number {
    const agora = new Date();
    return this.pedidos
      .filter((p) => {
        const data = new Date(p.createdAt);
        return (
          data.getMonth() === agora.getMonth() &&
          data.getFullYear() === agora.getFullYear() &&
          (p.status === 'PAGO' || p.status === 'CONFIRMADO')
        );
      })
      .reduce((acc, p) => acc + Number(p.valorTotal), 0);
  }

  get totalRegistros(): number {
    return this.pedidos.length;
  }

  get totalPendentes(): number {
    return this.pedidos.filter(
      (p) => p.formaPagamento === 'FIADO' && p.status !== 'PAGO'
    ).length;
  }

  // ── Filtro client-side ─────────────────────────────────────
  get pedidosFiltrados(): PedidoResponse[] {
    return this.pedidos.filter((p) => {
      const termo = this.busca.toLowerCase();
      const matchBusca =
        !this.busca ||
        p.clienteNome.toLowerCase().includes(termo) ||
        p.itens.some((i) => i.produtoNome.toLowerCase().includes(termo));

      const matchStatus =
        this.statusFiltro === 'TODOS' || p.status === this.statusFiltro;

      const data = p.createdAt ? p.createdAt.split('T')[0] : '';
      const matchInicio = !this.filtroInicio || data >= this.filtroInicio;
      const matchFim = !this.filtroFim || data <= this.filtroFim;

      return matchBusca && matchStatus && matchInicio && matchFim;
    });
  }

  get temFiltroAtivo(): boolean {
    return !!(this.filtroInicio || this.filtroFim || this.statusFiltro !== 'TODOS');
  }

  get donutTotal(): number {
    return this.donutSeries.reduce((a, b) => a + b, 0);
  }

  // ── Gráficos ───────────────────────────────────────────────
  private atualizarGraficos(): void {
    const soma = (filtro: (p: PedidoResponse) => boolean) =>
      this.pedidos.filter(filtro).reduce((acc, p) => acc + Number(p.valorTotal), 0);

    this.donutSeries = [
      soma((p) => p.status === 'PAGO'),
      soma((p) => ['CONFIRMADO', 'PENDENTE', 'ORCAMENTO'].includes(p.status)),
      soma((p) => p.status === 'CANCELADO'),
    ];

    const mapa = new Map<string, number>();
    for (const p of this.pedidos) {
      if (p.status === 'CANCELADO') continue;
      mapa.set(p.clienteNome, (mapa.get(p.clienteNome) ?? 0) + Number(p.valorTotal));
    }

    const top6 = Array.from(mapa.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    this.barHSeries = [
      { name: 'Total', data: top6.map(([nome, valor]) => ({ x: nome, y: valor })) },
    ];
  }

  // ── Modal Criar ────────────────────────────────────────────
  abrirModalCriar(): void {
    this.showModalCriar = true;
    this.loadingModal = true;
    forkJoin({
      produtos: this.service.getProdutos(),
      clientes: this.service.getClientes(),
    }).subscribe({
      next: ({ produtos, clientes }) => {
        this.produtos = produtos;
        this.clientes = clientes;
        this.loadingModal = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  fecharModalCriar(): void {
    this.showModalCriar = false;
  }

  onPedidoCriado(pedido: PedidoResponse): void {
    this.pedidos = [pedido, ...this.pedidos];
    this.atualizarGraficos();
    this.showModalCriar = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Pedido criado',
      detail: `Venda para ${pedido.clienteNome} registrada com sucesso`,
      life: 3000,
    });
    this.cdr.detectChanges();
  }

  // ── Modal Detalhe ──────────────────────────────────────────
  abrirDetalhe(pedido: PedidoResponse): void {
    this.pedidoSelecionado = pedido;
    this.showModalDetalhe = true;
  }

  fecharDetalhe(): void {
    this.showModalDetalhe = false;
    this.pedidoSelecionado = null;
  }

  onPagar(id: string): void {
    this.salvando = true;
    this.service.patchPagarPedido(id).subscribe({
      next: (pedidoAtualizado) => {
        this.atualizarNaLista(pedidoAtualizado);
        this.salvando = false;
        this.fecharDetalhe();
        this.messageService.add({
          severity: 'success',
          summary: 'Pago',
          detail: 'Pagamento registrado com sucesso',
          life: 3000,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.salvando = false;
        this.cdr.detectChanges();
      },
    });
  }

  onCancelar(id: string): void {
    this.salvando = true;
    this.service.patchCancelarPedido(id).subscribe({
      next: (pedidoAtualizado) => {
        this.atualizarNaLista(pedidoAtualizado);
        this.salvando = false;
        this.fecharDetalhe();
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelado',
          detail: 'Pedido cancelado',
          life: 3000,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.salvando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Modal Filtros ──────────────────────────────────────────
  abrirModalFiltros(): void {
    this.showModalFiltros = true;
  }



  fecharModalFiltros(): void {
    this.showModalFiltros = false;
  }

  onAplicarFiltros(filtros: { inicio: string; fim: string; status: StatusPedido | 'TODOS' }): void {
    this.filtroInicio = filtros.inicio;
    this.filtroFim = filtros.fim;
    this.statusFiltro = filtros.status;
    this.showModalFiltros = false;
  }

  onLimparFiltros(): void {
    this.filtroInicio = '';
    this.filtroFim = '';
    this.statusFiltro = 'TODOS';
    this.showModalFiltros = false;
  }

  // ── Helpers ────────────────────────────────────────────────
  private atualizarNaLista(pedidoAtualizado: PedidoResponse): void {
    this.pedidos = this.pedidos.map((p) =>
      p.id === pedidoAtualizado.id ? pedidoAtualizado : p
    );
    this.atualizarGraficos();
  }

  numeroVenda(index: number): string {
    return 'V' + String(index + 1).padStart(3, '0');
  }

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  formatProdutos(pedido: PedidoResponse): string {
    return pedido.itens.map((i) => `${i.produtoNome} × ${i.quantidade}`).join(', ');
  }

  statusBadgeClass(status: StatusPedido): Record<string, boolean> {
    return {
      'px-2.5 py-1 rounded-lg text-xs font-semibold': true,
      'bg-green-100 text-green-700': status === 'PAGO',
      'bg-yellow-100 text-yellow-700': status === 'CONFIRMADO' || status === 'PENDENTE',
      'bg-gray-100 text-gray-600': status === 'ORCAMENTO',
      'bg-red-100 text-red-600': status === 'CANCELADO',
    };
  }

  
}
