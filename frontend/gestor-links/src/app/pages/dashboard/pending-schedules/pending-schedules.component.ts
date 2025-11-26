import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PendingSchedulesService, PendingScheduleGroup } from './pending-schedules.service';
import { MatExpansionModule } from '@angular/material/expansion';

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
  loading = false;
  error = '';
  expandedClientId: number | null = null;

  constructor(private service: PendingSchedulesService) {}

  ngOnInit(): void {
    this.loadGroupedSchedules();
  }

  loadGroupedSchedules(): void {
    this.loading = true;
    this.service.getGroupedPendingSchedulesByLead(9).subscribe({
      next: (data) => {
        this.groupedSchedules = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading schedules';
        this.loading = false;
        console.error(err);
      }
    });
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
