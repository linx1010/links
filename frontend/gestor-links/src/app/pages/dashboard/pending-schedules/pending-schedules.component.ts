import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { UploadReportComponent } from '../../../shared/upload-report/upload-report.component';
import {
  PendingSchedulesService,
  PendingScheduleGroup,
  UserReportStatus
} from './pending-schedules.service';

import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-pending-schedules',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule
  ],
  templateUrl: './pending-schedules.component.html',
  styleUrls: ['./pending-schedules.component.scss']
})
export class PendingSchedulesComponent implements OnInit {
  groupedSchedules: PendingScheduleGroup[] = [];
  userReports: UserReportStatus[] = [];
  groupedReports: { [date: string]: any[] } = {};

  groupBy: 'client' | 'day' = 'day'; // default
  
  loading = false;
  error = '';
  expandedClientId: number | null = null;

  constructor(
    private service: PendingSchedulesService,
    private route: ActivatedRoute,
    private dialog:MatDialog  
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // pega o parâmetro da rota
    this.route.queryParams.subscribe(params => {
      this.groupBy = params['groupBy'] || 'day';
      this.loadData();
    });
    // this.loadGroupedSchedules();
    // this.loadUserReports();
  }
  loadData(): void {
    if (this.groupBy === 'client') {
      this.loadGroupedSchedules();
    } else {
      this.loadUserReports();
    }
  }
  loadGroupedSchedules(): void {
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? Number(userIdStr) : NaN;

    if (isNaN(userId)) {
      this.error = 'Invalid userId in localStorage';
      this.loading = false;
      return;
    }

    this.service.getGroupedPendingSchedulesByLead(userId).subscribe({
      next: (data) => {
        this.groupedSchedules = data;
        console.log('Grouped schedules:', data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading schedules';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadUserReports(): void {
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? Number(userIdStr) : NaN;

    if (isNaN(userId)) {
      this.error = 'Invalid userId';
      this.loading = false;
      return;
    }

    this.service.getReportsByUserStatus(userId).subscribe({
      next: (data) => {
        this.userReports = data;
        this.groupReportsByDate();
        console.log('User reports:', data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading reports';
        this.loading = false;
        console.error(err);
      }
    });
  }

  groupReportsByDate(): void {
    this.groupedReports = this.userReports.reduce((acc: Record<string, any[]>, report) => {
      const date = report.start_time.split(' ')[0]; // só a parte da data
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(report);
      return acc;
    }, {} as Record<string, any[]>);
  }

  onUpload(report: UserReportStatus): void {
    console.log('Upload clicado para:', report);

    const dialogRef = this.dialog.open(UploadReportComponent, {
      width: '500px',
      data: { event: report } // passa o report como "event"
    });

    dialogRef.componentInstance.finished.subscribe((updatedReport: UserReportStatus) => {
      dialogRef.close();
      report.status = updatedReport.status;
      this.loadPendingSchedules(); // recarrega a lista após upload
    });
  }

  loadPendingSchedules() {
    // sua lógica para recarregar os reports pendentes
  }


  getReportsGroupedByDate(): { date: string; reports: UserReportStatus[] }[] {
    const grouped: { [key: string]: UserReportStatus[] } = {};

    for (const report of this.userReports) {
      const safeDate = report.start_time.replace(' ', 'T');
      const dateKey = new Date(safeDate).toISOString().split('T')[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(report);
    }

    return Object.entries(grouped).map(([date, reports]) => ({ date, reports }));
  }

  uploadReport(scheduleId: number): void {
    alert(`Upload para agenda ${scheduleId}`);
  }

  toggleClient(clientId: number): void {
    this.expandedClientId = this.expandedClientId === clientId ? null : clientId;
  }

  approve(scheduleId: number, userId: number): void {
    this.service.approve(scheduleId, userId).subscribe(() => this.loadGroupedSchedules());
  }

  reject(scheduleId: number, userId: number): void {
    this.service.reject(scheduleId, userId).subscribe(() => this.loadGroupedSchedules());
  }

  remind(scheduleId: number, userId: number): void {
    this.service.remind(scheduleId, userId).subscribe(() => alert('Reminder sent'));
  }
}
