import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn, TableActionConfig } from '../../../shared/components/data-table/data-table.models';
import { LocacaoService } from './locacoes.service';
import {
  ClienteSimples,
  LocacaoResponse,
  LocacoesFiltroCompleto,
  ProdutoSimples,
  StatusLocacao,
} from '../models/locacoes.models';
import { NovaLocacaoModalComponent } from "../nova-locacao-modal/nova-locacao-modal.component";
import { LocacaoDetalheModalComponent } from "../locacao-datalhe-modal/locacao-detalhe-modal.component";
import { LocacaoEdicaoModalComponent } from "../locacao-edicao-modal/locacao-edicao-modal.component";
import { LocacaoFiltrosModalComponent } from "../locacao-filtros-modal/locacao-filtros-modal.component";
import { LocacaoEdicaoPayload } from "./locacoes.service";

type Periodo = 'mes' | 'trimestre' | 'semestre' | 'ano' | 'custom';

@Component({
  selector: 'app-locacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, NgApexchartsModule, DataTableComponent, NovaLocacaoModalComponent, LocacaoDetalheModalComponent, LocacaoEdicaoModalComponent, LocacaoFiltrosModalComponent],
  templateUrl: './locacoes.component.html',
  styleUrl: './locacoes.component.scss',
  providers: [MessageService],
})
export class LocacoesComponent implements OnInit {

  private cdr            = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private service        = inject(LocacaoService);

  // ── Dados ──────────────────────────────────────────────────
  locacoes: LocacaoResponse[] = [];
  produtos: ProdutoSimples[]  = [];
  clientes: ClienteSimples[]  = [];

  // ── Loading ────────────────────────────────────────────────
  loading      = true;
  salvando     = false;
  loadingModal = false;

  // ── Período ────────────────────────────────────────────────
  periodoAtivo: Periodo = 'mes';
  customInicio = '';
  customFim    = '';

  readonly periodos: { label: string; value: Periodo }[] = [
    { label: 'Este mês',  value: 'mes'       },
    { label: 'Trimestre', value: 'trimestre' },
    { label: 'Semestre',  value: 'semestre'  },
    { label: 'Este ano',  value: 'ano'       },
    { label: 'Período',   value: 'custom'    },
  ];

  // ── Filtros ────────────────────────────────────────────────
  busca = '';
  filtro: LocacoesFiltroCompleto = {
    status: 'TODOS', formaPagamento: 'TODOS',
    inicio: '', fim: '', minValor: null, maxValor: null,
  };

  // ── Gráficos ApexCharts ────────────────────────────────────
  // Bar — faturamento
  barSeries:      any[] = [];
  barChart:       any = { type: 'bar', height: 200, toolbar: { show: false }, fontFamily: 'inherit' };
  barPlotOptions: any = { bar: { columnWidth: '55%', borderRadius: 3, borderRadiusApplication: 'end' } };
  barColors           = ['#3b82f6'];
  barDataLabels:  any = { enabled: false };
  barGrid:        any = { borderColor: '#f1f5f9', strokeDashArray: 4 };
  barXaxis:       any = { categories: [], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#94a3b8', fontSize: '12px' } } };
  barYaxis:       any = { labels: { formatter: (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${v}`, style: { colors: '#94a3b8', fontSize: '11px' } } };
  barTooltip:     any = { y: { formatter: (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) } };

  // Donut — status
  donutSeries:      number[]  = [];
  donutChart:       any = { type: 'donut', height: 200, fontFamily: 'inherit' };
  donutColors:      string[]  = [];
  donutLabels:      string[]  = [];
  donutLegend:      any = { position: 'bottom', fontSize: '11px', itemMargin: { horizontal: 6 } };
  donutDataLabels:  any = { enabled: false };
  donutPlotOptions: any = { pie: { donut: { size: '65%' } } };
  donutStroke:      any = { width: 0 };
  donutTooltip:     any = { y: { formatter: (v: number) => `${v} locação(ões)` } };

  // ── Modais ─────────────────────────────────────────────────
  showModalCriar   = false;
  showModalDetalhe = false;
  showModalEdicao  = false;
  showModalFiltros = false;
  locacaoSelecionada: LocacaoResponse | null = null;
  salvandoEdicao = false;

  // ── Configuração DataTable ─────────────────────────────────
  readonly colunasLocacoes: TableColumn[] = [
    { field: 'clienteNome',          header: 'Cliente',    width: '18%', type: 'text' },
    {
      field: '__equipamentos',
      header: 'Equipamentos',
      width: '26%',
      type: 'computed',
      truncate: true,
      valueFn: (l: LocacaoResponse) =>
        l.itens.map(i => `${i.produtoNome} × ${i.quantidade}`).join(', '),
    },
    { field: 'dataRetirada',          header: 'Retirada',   width: '11%', type: 'date' },
    { field: 'dataDevolucaoPrevista', header: 'Devolução',  width: '11%', type: 'date' },
    {
      field: '__diasRestantes',
      header: 'Prazo',
      width: '10%',
      type: 'computed',
      valueFn: (l: LocacaoResponse) => this.prazoLabel(l),
    },
    { field: 'valorTotal', header: 'Total', width: '12%', type: 'currency' },
    {
      field: 'status',
      header: 'Status',
      width: '12%',
      type: 'tag',
      tagSeverityFn: (val: StatusLocacao) => this.getSeverity(val),
      tagLabelFn:    (val: StatusLocacao) => this.getStatusLabel(val),
    },
  ];

  readonly acoesLocacoes: TableActionConfig = {
    showExtra:    true,
    extraIcon:    'pi pi-pencil',
    extraTooltip: 'Editar',
    showView:     true,
    showEdit:     true,
    editIcon:    'pi pi-check-circle',
    editTooltip: 'Devolver',
    showDelete:  true,
    deleteIcon:    'pi pi-times-circle',
    deleteTooltip: 'Cancelar',
    deleteHeader:  'Confirmar cancelamento',
    deleteAcceptLabel: 'Cancelar locação',
    deleteMessageFn: (l: LocacaoResponse) =>
      `Cancelar a locação de ${l.clienteNome}? O estoque será restaurado.`,
  };

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.carregarLocacoes();
    this.selectPeriodo('mes');
  }

  // ── Carregamento ───────────────────────────────────────────
  carregarLocacoes(): void {
    this.loading = true;
    this.service.getLocacoes().subscribe({
      next: (locacoes) => {
        this.locacoes = locacoes;
        this.loading  = false;
        this.recalcularGraficos();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Período ────────────────────────────────────────────────
  selectPeriodo(p: Periodo): void {
    this.periodoAtivo = p;
    if (p === 'custom') {
      this.customInicio = this.filtro.inicio;
      this.customFim    = this.filtro.fim;
    } else {
      this.aplicarPeriodo(p);
    }
  }

  private aplicarPeriodo(p: Periodo): void {
    const hoje  = new Date();
    let   start = new Date(hoje);
    if      (p === 'mes')       start = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    else if (p === 'trimestre') start.setMonth(hoje.getMonth() - 2);
    else if (p === 'semestre')  start.setMonth(hoje.getMonth() - 5);
    else if (p === 'ano')       start.setFullYear(hoje.getFullYear() - 1);
    this.filtro = {
      ...this.filtro,
      inicio: start.toISOString().split('T')[0],
      fim:    hoje.toISOString().split('T')[0],
    };
    this.recalcularGraficos();
    this.cdr.detectChanges();
  }

  aplicarPeriodoCustom(): void {
    if (this.customInicio && this.customFim) {
      this.filtro = { ...this.filtro, inicio: this.customInicio, fim: this.customFim };
      this.recalcularGraficos();
      this.cdr.detectChanges();
    }
  }

  periodoButtonClass(value: Periodo): Record<string, boolean> {
    const active = this.periodoAtivo === value;
    return {
      'bg-blue-600 text-white font-semibold':          active,
      'text-gray-500 hover:bg-slate-100 font-medium':  !active,
      'px-3 py-1.5 text-xs rounded-lg transition-colors': true,
    };
  }

    limparFiltroButtonClass(_: Periodo): Record<string, boolean> {
    return {
      'px-3 py-1.5 text-xs rounded-lg transition-colors font-medium': true,
      'text-red-500 hover:bg-red-50 border border-red-200': true,
    };
  }


  // ── KPIs ───────────────────────────────────────────────────
  get totalAtivas(): number {
    return this.locacoesFiltradas.filter(l => l.status === 'ATIVA').length;
  }

  get totalAtrasadas(): number {
    return this.locacoesFiltradas.filter(l => this.isAtrasada(l)).length;
  }

  get totalDevolvidas(): number {
    return this.locacoesFiltradas.filter(l => l.status === 'DEVOLVIDA').length;
  }

  get faturamentoMes(): number {
    return this.locacoesFiltradas
      .filter(l => l.status !== 'CANCELADA')
      .reduce((acc, l) => acc + Number(l.valorTotal), 0);
  }

  // ── Gráficos ───────────────────────────────────────────────

  /** Recalcula e atualiza os dois gráficos ApexCharts. Chamar após qualquer mudança de dados/filtro. */
  recalcularGraficos(): void {
    this.recalcularBarFaturamento();
    this.recalcularDonutStatus();
  }

  private recalcularBarFaturamento(): void {
    const filtradas   = this.locacoesFiltradas;
    const inicio      = this.filtro.inicio;
    const fim         = this.filtro.fim;
    const diasPeriodo = (inicio && fim)
      ? Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 86_400_000)
      : 365;
    const isDia = diasPeriodo <= 31;

    const buckets = new Map<string, number>();
    for (const l of filtradas) {
      if (l.status !== 'DEVOLVIDA') continue;
      const chave = isDia ? l.dataRetirada.slice(0, 10) : l.dataRetirada.slice(0, 7);
      buckets.set(chave, (buckets.get(chave) ?? 0) + Number(l.valorTotal));
    }

    // Preenche buckets zerados para eixo contínuo
    if (inicio && fim) {
      const cur = new Date(inicio);
      const end = new Date(fim);
      while (cur <= end) {
        const k = isDia ? cur.toISOString().slice(0, 10) : cur.toISOString().slice(0, 7);
        if (!buckets.has(k)) buckets.set(k, 0);
        isDia ? cur.setDate(cur.getDate() + 1) : cur.setMonth(cur.getMonth() + 1);
      }
    }

    const chaves  = [...buckets.keys()].sort();
    const valores = chaves.map(c => +(buckets.get(c) ?? 0).toFixed(2));
    const labels  = chaves.map(c => {
      if (isDia) {
        const d = new Date(c + 'T00:00:00');
        return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit' });
      }
      const [ano, mes] = c.split('-');
      return new Date(+ano, +mes - 1)
        .toLocaleString('pt-BR', { month: 'short' })
        .replace('.', '')
        .replace(/^\w/, x => x.toUpperCase());
    });

    this.barSeries = [{ name: 'Faturamento', data: valores }];
    this.barXaxis  = {
      ...this.barXaxis,
      categories: labels,
      labels: {
        rotate:       isDia ? -45 : 0,
        rotateAlways: isDia,
        style: { colors: '#94a3b8', fontSize: isDia ? '10px' : '12px' },
      },
    };
  }

  private recalcularDonutStatus(): void {
    const filtradas = this.locacoesFiltradas;
    const colorMap: Record<string, string> = {
      ATIVA:     '#3b82f6',
      ATRASADA:  '#ef4444',
      DEVOLVIDA: '#22c55e',
      CANCELADA: '#94a3b8',
      ORCAMENTO: '#f59e0b',
    };
    const labelMap: Record<string, string> = {
      ATIVA: 'Ativa', ATRASADA: 'Atrasada',
      DEVOLVIDA: 'Devolvida', CANCELADA: 'Cancelada', ORCAMENTO: 'Orçamento',
    };
    const counts: Record<string, number> = {
      ATIVA:     filtradas.filter(l => l.status === 'ATIVA').length,
      ATRASADA:  filtradas.filter(l => l.status === 'ATRASADA').length,
      DEVOLVIDA: filtradas.filter(l => l.status === 'DEVOLVIDA').length,
      CANCELADA: filtradas.filter(l => l.status === 'CANCELADA').length,
      ORCAMENTO: filtradas.filter(l => l.status === 'ORCAMENTO').length,
    };
    const entries = Object.entries(counts).filter(([, v]) => v > 0);

    this.donutSeries = entries.map(([, v]) => v);
    this.donutLabels = entries.map(([k]) => labelMap[k]);
    this.donutColors = entries.map(([k]) => colorMap[k]);
  }

  // ── Alertas de urgência ────────────────────────────────────
  /** Locações atrasadas: status ATRASADA ou ATIVA com devolução vencida */
  get alertasAtrasadas(): LocacaoResponse[] {
    const hoje = this.hoje();
    return this.locacoes.filter(l =>
      l.status === 'ATRASADA' ||
      (l.status === 'ATIVA' && l.dataDevolucaoPrevista < hoje)
    );
  }

  /** Locações ATIVAS que vencem nos próximos 3 dias (sem contar as já vencidas) */
  get alertasVencendo(): LocacaoResponse[] {
    const hoje  = this.hoje();
    const em3   = this.diasAPartirDeHoje(3);
    return this.locacoes.filter(l =>
      l.status === 'ATIVA' &&
      l.dataDevolucaoPrevista >= hoje &&
      l.dataDevolucaoPrevista <= em3
    );
  }

  get temAlertas(): boolean {
    return this.alertasAtrasadas.length > 0 || this.alertasVencendo.length > 0;
  }

  // ── Filtro client-side ─────────────────────────────────────
  get locacoesFiltradas(): LocacaoResponse[] {
    return this.locacoes.filter(l => {
      const termo      = this.busca.toLowerCase();
      const matchBusca = !this.busca ||
        l.clienteNome.toLowerCase().includes(termo) ||
        l.itens.some(i => i.produtoNome.toLowerCase().includes(termo));

      const matchStatus = this.filtro.status === 'TODOS' || l.status === this.filtro.status;
      const matchPgto   = this.filtro.formaPagamento === 'TODOS' || l.formaPagamento === this.filtro.formaPagamento;

      const data        = l.dataRetirada ?? '';
      const matchInicio = !this.filtro.inicio || data >= this.filtro.inicio;
      const matchFim    = !this.filtro.fim    || data <= this.filtro.fim;

      const valor    = Number(l.valorTotal);
      const matchMin = this.filtro.minValor === null || valor >= this.filtro.minValor;
      const matchMax = this.filtro.maxValor === null || valor <= this.filtro.maxValor;

      return matchBusca && matchStatus && matchPgto && matchInicio && matchFim && matchMin && matchMax;
    });
  }

  get temFiltroAtivo(): boolean {
    const f = this.filtro;
    const temFiltroModal   = f.status !== 'TODOS' || f.formaPagamento !== 'TODOS' || f.minValor !== null || f.maxValor !== null;
    const temPeriodoCustom = this.periodoAtivo === 'custom' && !!(f.inicio || f.fim);
    return temFiltroModal || temPeriodoCustom;
  }

  // ── Modal Criar ────────────────────────────────────────────
  abrirModalCriar(): void {
    this.showModalCriar = true;
    this.loadingModal   = true;
    forkJoin({
      produtos: this.service.getProdutos(),
      clientes: this.service.getClientes(),
    }).subscribe({
      next: ({ produtos, clientes }) => {
        this.produtos     = produtos;
        this.clientes     = clientes;
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

  onLocacaoCriada(locacao: LocacaoResponse): void {
    this.locacoes = [locacao, ...this.locacoes];
    this.showModalCriar = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Locação criada',
      detail: `Locação para ${locacao.clienteNome} registrada com sucesso`,
      life: 3000,
    });
    this.cdr.detectChanges();
  }

  // ── Modal Detalhe ──────────────────────────────────────────
  abrirDetalhe(locacao: LocacaoResponse): void {
    this.locacaoSelecionada  = locacao;
    this.showModalDetalhe = true;
  }

  fecharDetalhe(): void {
    this.showModalDetalhe    = false;
    this.locacaoSelecionada  = null;
  }

  // ── Modal Edição ───────────────────────────────────────────
  abrirModalEdicao(locacao: LocacaoResponse): void {
    this.locacaoSelecionada = locacao;
    this.showModalEdicao    = true;
  }

  fecharModalEdicao(): void {
    this.showModalEdicao    = false;
    this.locacaoSelecionada = null;
  }

  onLocacaoEditada(payload: LocacaoEdicaoPayload): void {
    if (!this.locacaoSelecionada) return;
    this.salvandoEdicao = true;
    this.service.patchEditar(this.locacaoSelecionada.id, payload).subscribe({
      next: (atualizada) => {
        this.atualizarNaLista(atualizada);
        this.salvandoEdicao = false;
        this.showModalEdicao = false;
        this.locacaoSelecionada = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Atualizado',
          detail: `Locação de ${atualizada.clienteNome} atualizada`,
          life: 3000,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.salvandoEdicao = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar a locação', life: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  // ── Modal Filtros ──────────────────────────────────────────
  abrirModalFiltros(): void  { this.showModalFiltros = true; }
  fecharModalFiltros(): void { this.showModalFiltros = false; }

  onAplicarFiltros(filtros: LocacoesFiltroCompleto): void {
    this.filtro = filtros;
    this.showModalFiltros = false;
    this.recalcularGraficos();
  }

  onLimparFiltros(): void {
    this.filtro = { status: 'TODOS', formaPagamento: 'TODOS', inicio: '', fim: '', minValor: null, maxValor: null };
    this.showModalFiltros = false;
    this.selectPeriodo('mes');
  }

  // ── Ações da tabela ────────────────────────────────────────
  onDevolver(locacao: LocacaoResponse): void {
    if (locacao.status !== 'ATIVA' && locacao.status !== 'ATRASADA') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Apenas locações ativas ou atrasadas podem ser devolvidas',
        life: 3000,
      });
      return;
    }
    this.salvando = true;
    this.service.patchDevolver(locacao.id).subscribe({
      next: (atualizada) => {
        this.atualizarNaLista(atualizada);
        this.salvando = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Devolvido',
          detail: `Locação de ${atualizada.clienteNome} devolvida com sucesso`,
          life: 3000,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.salvando = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível registrar a devolução', life: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  onCancelar(locacao: LocacaoResponse): void {
    this.salvando = true;
    this.service.patchCancelar(locacao.id).subscribe({
      next: (atualizada) => {
        this.atualizarNaLista(atualizada);
        this.salvando = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelado',
          detail: `Locação de ${atualizada.clienteNome} cancelada`,
          life: 3000,
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.salvando = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível cancelar a locação', life: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  private atualizarNaLista(atualizada: LocacaoResponse): void {
    this.locacoes = this.locacoes.map(l => l.id === atualizada.id ? atualizada : l);
  }

  formatCurrency(v: number): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /** Retorna '+N dias' se atrasada, 'Hoje', ou 'N dias' se no prazo */
  prazoLabel(l: LocacaoResponse): string {
    if (l.status === 'DEVOLVIDA' || l.status === 'CANCELADA') return '—';
    const hoje  = new Date(this.hoje());
    const prev  = new Date(l.dataDevolucaoPrevista);
    const diff  = Math.round((prev.getTime() - hoje.getTime()) / 86_400_000);
    if (diff < 0)  return `+${Math.abs(diff)}d atraso`;
    if (diff === 0) return 'Hoje';
    return `${diff}d restantes`;
  }

  isAtrasada(l: LocacaoResponse): boolean {
    return l.status === 'ATRASADA' ||
      (l.status === 'ATIVA' && l.dataDevolucaoPrevista < this.hoje());
  }

  diasEmAtraso(l: LocacaoResponse): number {
    const hoje = new Date(this.hoje());
    const prev = new Date(l.dataDevolucaoPrevista);
    return Math.max(0, Math.round((hoje.getTime() - prev.getTime()) / 86_400_000));
  }

  diasParaVencer(l: LocacaoResponse): number {
    const hoje = new Date(this.hoje());
    const prev = new Date(l.dataDevolucaoPrevista);
    return Math.max(0, Math.round((prev.getTime() - hoje.getTime()) / 86_400_000));
  }

  getSeverity(status: StatusLocacao): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'ATIVA':      return 'success';
      case 'DEVOLVIDA':  return 'secondary';
      case 'ATRASADA':   return 'danger';
      case 'CANCELADA':  return 'warn';
      case 'ORCAMENTO': return 'secondary'
    }
  }

  getStatusLabel(status: StatusLocacao): string {
    const labels: Record<StatusLocacao, string> = {
      ATIVA: 'Ativa', DEVOLVIDA: 'Devolvida', ATRASADA: 'Atrasada', CANCELADA: 'Cancelada', ORCAMENTO: 'orcamento' ,
    };
    return labels[status];
  }

  private hoje(): string {
    return new Date().toISOString().split('T')[0];
  }

  private diasAPartirDeHoje(dias: number): string {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString().split('T')[0];
  }
}
