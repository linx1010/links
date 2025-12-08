import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';
import { TasksService, DashboardTotals } from './tasks.service'; // importa o service

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
  totalUploadAguardando: number = 0; 
  totalAprovacaoPendentes: number = 0;
  isTechLead: boolean = false;
  userId: number = 0;
  userName: string = ''

  constructor(private router: Router, private tasksService: TasksService) {}

  ngOnInit() {
    const role = localStorage.getItem('userRole') || '';
    this.isTechLead = role === 'manager' || role === 'admin';

    const userIdStr = (localStorage.getItem('userId'));
    this.userId = userIdStr ? Number(userIdStr) : NaN;
    const leadIdStr = localStorage.getItem('userId');
    const leadId = leadIdStr ? Number(leadIdStr) : NaN;
    const userName = localStorage.getItem('userName');
    this.userName = userName ? userName : 'Usuário';

    if (!isNaN(this.userId) && !isNaN(leadId)) {
      this.tasksService.getDashboardTotals(this.userId, leadId).subscribe((res: DashboardTotals) => {
        // cards
        this.totalUploadPendentes = res.upload.missing +  res.upload.rejected;
        this.totalUploadAguardando = res.upload.pending; 
        this.totalAprovacaoPendentes = res.approval.missing + res.approval.pending + res.approval.rejected;

        // gráficos
        this.renderBarChart(res.monthly);
        if (this.isTechLead) {
          this.renderPieChart(res.global);
        }
      });
    }
  }

  goToApproval(): void {
    this.router.navigate(['/dashboard/pending-schedules']);
  }
  

  goToPending(groupBy: 'client' | 'day'): void {
    this.router.navigate(['/dashboard/pending-schedules'], {
      queryParams: { groupBy }
    });
  }
  abrirCalendarioDoUsuario(): void {
    if (this.userName && this.userId) {
      sessionStorage.setItem('nameOrig', this.userName);
      sessionStorage.setItem('pageOrig', 'recursos');
      this.router.navigate(['/dashboard/calendar', 'user', this.userId]);
    }
  }


  renderBarChart(monthlyData: any[]) {
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: monthlyData.map(m => m.month),
        datasets: [
          { label: 'Missing', data: monthlyData.map(m => m.missing), backgroundColor: '#e74c3c', stack: 'RADs' },
          { label: 'Pending', data: monthlyData.map(m => m.pending), backgroundColor: '#f1c40f', stack: 'RADs' },
          { label: 'Rejected', data: monthlyData.map(m => m.rejected), backgroundColor: '#c0392b', stack: 'RADs' },
          { label: 'Approved', data: monthlyData.map(m => m.approved), backgroundColor: '#27ae60', stack: 'RADs' }
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

  renderPieChart(globalData: any) {
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: Object.keys(globalData),
        datasets: [
          {
            data: Object.values(globalData),
            backgroundColor: ['#e74c3c', '#f1c40f', '#c0392b', '#27ae60']
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
