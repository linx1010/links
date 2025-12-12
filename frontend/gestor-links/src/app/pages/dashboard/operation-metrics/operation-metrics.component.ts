import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { OperationMetricsService } from './operation-metrics.service';
import{Router} from '@angular/router'

@Component({
  selector: 'app-operation-metrics',
  templateUrl: './operation-metrics.component.html',
  styleUrls: ['./operation-metrics.component.scss']
})
export class OperationMetricsComponent implements OnInit {
  // KPIs
  totalWorkforceAllocated: number = 0;
  totalClientAgenda: number = 0;

  // Referências para os canvases
  @ViewChild('approvalRateCanvas') approvalRateCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hoursComparisonCanvas') hoursComparisonCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('resourceUtilizationCanvas') resourceUtilizationCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private metricsService: OperationMetricsService,
    private router:Router
  ) {}

  ngOnInit(): void {
    // KPIs
    this.totalWorkforceAllocated = this.metricsService.getTotalWorkforceAllocated();
    this.totalClientAgenda = this.metricsService.getTotalClientAgenda();
  }

  ngAfterViewInit(): void {
    // Gráfico 1: Taxa de aprovação
    new Chart(this.approvalRateCanvas.nativeElement, {
      type: 'doughnut',
      data: this.metricsService.getApprovalRateData(),
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#333' }
          },
          title: {
            text: 'Approval Rate',
            color: '#333'
          }
        }
      }
    });

    // Gráfico 2: Horas agendadas vs realizadas
    new Chart(this.hoursComparisonCanvas.nativeElement, {
      type: 'line',
      data: this.metricsService.getHoursComparisonData(),
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#333' }
          },
          title: {
            text: 'Scheduled vs Realized Hours',
            color: '#333'
          }
        },
        scales: {
          x: {
            ticks: { color: '#333' }
          },
          y: {
            ticks: { color: '#333' }
          }
        }
      }
    });

    // Gráfico 3: Ociosidade dos recursos
    new Chart(this.resourceUtilizationCanvas.nativeElement, {
      type: 'bar',
      data: this.metricsService.getResourceUtilizationData(),
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#333' }
          },
          title: {
            text: 'Resource Utilization',
            color: '#333'
          }
        },
        scales: {
          x: {
            ticks: { color: '#333' }
          },
          y: {
            ticks: { color: '#333' }
          }
        }
      }
    });
    // 🔑 Navegação para o timesheet
  }
  irParaTimesheet(): void {
    this.router.navigate([
      '/dashboard/operation-metrics/details/timesheet-resources'
    ]);
  }
}
