import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
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

type Periodo = 'mes' | 'trimestre' | 'semestre' | 'ano' | 'custom';

@Component({
  selector: 'app-locacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, DataTableComponent, NovaLocacaoModalComponent],
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

  // ── Modais ─────────────────────────────────────────────────
  showModalCriar   = false;
  showModalDetalhe = false;
  showModalFiltros = false;
  locacaoSelecionada: LocacaoResponse | null = null;

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
    showView:   true,
    showEdit:   true,
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
    this.cdr.detectChanges();
  }

  aplicarPeriodoCustom(): void {
    if (this.customInicio && this.customFim) {
      this.filtro = { ...this.filtro, inicio: this.customInicio, fim: this.customFim };
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

  // ── Modal Filtros ──────────────────────────────────────────
  abrirModalFiltros(): void  { this.showModalFiltros = true; }
  fecharModalFiltros(): void { this.showModalFiltros = false; }

  onAplicarFiltros(filtros: LocacoesFiltroCompleto): void {
    this.filtro = filtros;
    this.showModalFiltros = false;
  }

  onLimparFiltros(): void {
    this.filtro = { status: 'TODOS', formaPagamento: 'TODOS', inicio: '', fim: '', minValor: null, maxValor: null };
    this.showModalFiltros = false;
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
