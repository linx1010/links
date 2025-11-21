import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  totalUploadPendentes: number = 0;
  totalAprovacaoPendentes: number = 0;
  isTechLead: boolean = false;

  ngOnInit() {
    const role = localStorage.getItem('userRole') || '';
    this.isTechLead = role === 'manager' || role === 'admin';

    // dados mockados
    this.totalUploadPendentes = 5;
    this.totalAprovacaoPendentes = 3;

    this.renderBarChart();
   if (this.isTechLead) {
      setTimeout(() => this.renderPieChart(), 0);
    }
  }

  renderBarChart() {
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: ['Setembro', 'Outubro', 'Novembro'],
        datasets: [
          {
            label: 'Enviados',
            data: [8, 10, 7],
            backgroundColor: '#27ae60'
          },
          {
            label: 'Pendentes',
            data: [3, 2, 5],
            backgroundColor: '#c0392b'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
  }

  renderPieChart() {
    
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['Não enviados', 'Enviados pendentes', 'Aprovados'],
        datasets: [
          {
            data: [4, 3, 6],
            backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71']
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}
