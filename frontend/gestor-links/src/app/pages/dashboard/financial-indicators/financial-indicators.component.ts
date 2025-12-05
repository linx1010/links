import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialIndicatorsService } from './financial-indicators.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-financial-indicators',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-indicators.component.html',
  styleUrls: ['./financial-indicators.component.scss']
})
export class FinancialIndicatorsComponent implements OnInit {
  indicadores: any;
  agendasUltimos3Meses: any[] = [];
  agendasPorTipoRecurso: any[] = [];

  constructor(private financialService: FinancialIndicatorsService) {}

  ngOnInit(): void {
    // KPIs
    this.indicadores = this.financialService.getIndicadores();

    // Dados para gráficos
    this.agendasUltimos3Meses = this.financialService.getAgendasUltimos3Meses();
    this.agendasPorTipoRecurso = this.financialService.getAgendasPorTipoRecurso();

    // Inicializa gráficos
    this.initStackedChart();
    this.initPolarChart();
  }

  // Gráfico stacked: agendas aprovadas vs pendentes nos últimos 3 meses
  initStackedChart() {
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
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true }
        }
      }
    });
  }

  // Gráfico polar/radar: distribuição por tipo de recurso
  initPolarChart() {
    new Chart('polarChartRecursos', {
      type: 'polarArea', // pode trocar para 'radar'
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
