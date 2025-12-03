import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialIndicatorsService } from './financial-indicators.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
   selector: 'app-financial-indicators',
  standalone: true,
  imports: [CommonModule],   // <-- necessário para pipes como currency, date, number, ngFor etc.
  templateUrl: './financial-indicators.component.html',
  styleUrls: ['./financial-indicators.component.scss']
})
export class FinancialIndicatorsComponent implements OnInit {
  indicadores: any;
  agendasPorCliente: any[] = [];
  agendasPorTipo: any[] = [];

  constructor(private financialService: FinancialIndicatorsService) {}

  ngOnInit(): void {
    this.indicadores = this.financialService.getIndicadores();
    this.agendasPorCliente = this.financialService.getAgendasPorCliente();
    this.agendasPorTipo = this.financialService.getAgendasPorTipoAtuacao();

    this.initBarChart();
    this.initPieChart();
  }

  initBarChart() {
    new Chart('barChartClientes', {
      type: 'bar',
      data: {
        labels: this.agendasPorCliente.map(c => c.cliente),
        datasets: [{
          label: 'Agendas',
          data: this.agendasPorCliente.map(c => c.total),
          backgroundColor: '#42A5F5'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  initPieChart() {
    new Chart('pieChartAtuacao', {
      type: 'pie',
      data: {
        labels: this.agendasPorTipo.map(t => t.tipo),
        datasets: [{
          data: this.agendasPorTipo.map(t => t.total),
          backgroundColor: ['#66BB6A', '#FFA726', '#AB47BC']
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}
