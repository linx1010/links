import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialIndicatorsService, FinancialKpisResponse, StatusCounts, ReceitaUsuarioItem } from './financial-indicators.service';
import { Chart, registerables } from 'chart.js';
import { HttpClientModule } from '@angular/common/http';


Chart.register(...registerables);

@Component({
  selector: 'app-financial-indicators',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './financial-indicators.component.html',
  styleUrls: ['./financial-indicators.component.scss']
})
export class FinancialIndicatorsComponent implements OnInit {
  indicadores: any = {};
  agendasUltimos3Meses: Array<{ mes: string; aprovadas: number; pendentes: number }> = [];
  agendasPorTipoRecurso: Array<{ tipo: string; total: number }> = [];

  constructor(private financialService: FinancialIndicatorsService) {}

  ngOnInit(): void {
    this.financialService.getIndicadores().subscribe((data: FinancialKpisResponse) => {
      // KPIs principais
      this.indicadores = {
        totalAgendasConcluidas: data.statusCounts.approved + data.statusCounts.pending,
        receitaEstimada: this.getUltimaReceita(data.receitaPorMes),
        taxaAprovacaoRelatorios: this.calcTaxaAprovacao(data.statusCounts),
        percentualPendencias: this.calcPercentualPendencias(data.statusCounts)
      };

      // Gráfico stacked: aprovadas vs pendentes por mês
      const meses = Object.keys(data.receitaPorMes);
      this.agendasUltimos3Meses = meses.map(mes => ({
        mes,
        aprovadas: data.statusCounts.approved,
        pendentes: data.statusCounts.pending
      }));

      // Gráfico polar: somar todos os meses por tipo de contrato
      const receitasPorTipo: Record<string, number> = {};

      Object.values(data.receitaPorUsuario).forEach((usuariosMes: ReceitaUsuarioItem[]) => {
        usuariosMes.forEach((u: ReceitaUsuarioItem) => {
          receitasPorTipo[u.contract_type] = (receitasPorTipo[u.contract_type] || 0) + u.total_mes;
        });
      });

      // Transforma em array para o gráfico
      this.agendasPorTipoRecurso = Object.entries(receitasPorTipo).map(([tipo, total]) => ({
        tipo,
        total
      }));


      // Inicializa gráficos
      this.initStackedChart();
      this.initPolarChart();
    });
  }

  private getUltimaReceita(receitaPorMes: Record<string, number>): number {
    const meses = Object.keys(receitaPorMes);
    const ultimoMes = meses[meses.length - 1];
    return receitaPorMes[ultimoMes] ?? 0;
  }

  private calcTaxaAprovacao(statusCounts: StatusCounts): number {
    const values = Object.values(statusCounts) as number[]; // cast explícito
    const total = values.reduce((acc, v) => acc + v, 0);
    return total > 0 ? Math.round((statusCounts.approved / total) * 100) : 0;
  }

  private calcPercentualPendencias(statusCounts: StatusCounts): number {
    const values = Object.values(statusCounts) as number[]; // cast explícito
    const total = values.reduce((acc, v) => acc + v, 0);
    return total > 0 ? Math.round((statusCounts.pending / total) * 100) : 0;
  }


  private initStackedChart() {
    new Chart('stackedChartClientes', {
      type: 'bar',
      data: {
        labels: this.agendasUltimos3Meses.map(a => a.mes),
        datasets: [
          {
            label: 'Aprovadas',
            data: this.agendasUltimos3Meses.map(a => a.aprovadas),
            backgroundColor: '#66BB6A'
          },
          {
            label: 'Pendentes',
            data: this.agendasUltimos3Meses.map(a => a.pendentes),
            backgroundColor: '#EF5350'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { x: { stacked: true }, y: { stacked: true } }
      }
    });
  }

  private initPolarChart() {
    new Chart('polarChartRecursos', {
      type: 'polarArea',
      data: {
        labels: this.agendasPorTipoRecurso.map(r => r.tipo),
        datasets: [{
          label: 'Total Alocado',
          data: this.agendasPorTipoRecurso.map(r => r.total),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC']
        }]
      },
      options: { responsive: true }
    });
  }
}
