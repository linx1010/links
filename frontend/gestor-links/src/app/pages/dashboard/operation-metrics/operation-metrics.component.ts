import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto'; // ✔ CORRETO para standalone
import { OperationMetricsService, OperationalResponse } from './operation-metrics.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-operation-metrics',
  standalone: true,
  templateUrl: './operation-metrics.component.html',
  styleUrls: ['./operation-metrics.component.scss'],
  imports: [
    CommonModule,
    HttpClientModule
  ]
})
export class OperationMetricsComponent implements OnInit {

  // KPIs
  totalWorkforceAllocated = 0;   // horas por recurso
  totalClientAgenda = 0;         // horas por cliente

  statusRecurso: Record<string, number> = {};
  statusCliente: Record<string, number> = {};

  // Gráficos
  @ViewChild('approvalRateCanvas') approvalRateCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hoursComparisonCanvas') hoursComparisonCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('resourceUtilizationCanvas') resourceUtilizationCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private metricsService: OperationMetricsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResourceMetrics();
    this.loadClientMetrics();
  }

  private loadResourceMetrics() {
    this.metricsService.getHoursByResource().subscribe((res: OperationalResponse) => {
      this.totalWorkforceAllocated = Number(res.total_geral.toFixed(1));

      // arredonda cada status
      this.statusRecurso = Object.fromEntries(
        Object.entries(res.totais_por_status).map(([k, v]) => [k, Number(v.toFixed(1))])
      );

      // arredonda horas por recurso
      if (res.totais_por_recurso) {
        res.totais_por_recurso = Object.fromEntries(
          Object.entries(res.totais_por_recurso).map(([k, v]) => [k, Number(v.toFixed(1))])
        );
      }

      this.initResourceUtilizationChart(res.totais_por_recurso || {});
    });
  }

  private loadClientMetrics() {
    this.metricsService.getHoursByClient().subscribe((res: OperationalResponse) => {
      this.totalClientAgenda = Number(res.total_agendas.toFixed(1));

      this.statusCliente = Object.fromEntries(
        Object.entries(res.totais_por_status).map(([k, v]) => [k, Number(v.toFixed(1))])
      );

      if (res.totais_por_cliente) {
        res.totais_por_cliente = Object.fromEntries(
          Object.entries(res.totais_por_cliente).map(([k, v]) => [k, Number(v.toFixed(1))])
        );
      }

      this.initHoursComparisonChart(res.totais_por_cliente || {});
    });
  }


  ngAfterViewInit(): void {
    this.initApprovalRateChart();
  }

  // ---------------- GRÁFICOS ----------------

  private initApprovalRateChart() {
    new Chart(this.approvalRateCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Missing', 'Rejected'],
        datasets: [{
          data: [
            this.statusRecurso['approved'] || 0,
            this.statusRecurso['pending'] || 0,
            this.statusRecurso['missing'] || 0,
            this.statusRecurso['rejected'] || 0
          ],
          backgroundColor: ['#4CAF50', '#FFC107', '#9E9E9E', '#F44336']
        }]
      }
    });
  }

  private initHoursComparisonChart(data: Record<string, number>) {
    new Chart(this.hoursComparisonCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Horas por Cliente',
          data: Object.values(data),
          borderColor: '#2196F3',
          fill: false
        }]
      }
    });
  }

  private initResourceUtilizationChart(data: Record<string, number>) {
    new Chart(this.resourceUtilizationCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Horas por Recurso',
          data: Object.values(data),
          backgroundColor: '#3F51B5'
        }]
      }
    });
  }

  irParaTimesheet(): void {
    this.router.navigate(['/dashboard/operation-metrics/details/timesheet-resources']);
  }
}
