import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PendingScheduleDetail {
  schedule_id: number;
  start_time: string;
  user_id: number;
  user_name: string;
  status: 'missing' | 'pending';
}

export interface PendingScheduleGroup {
  client_id: number;
  client_name: string;
  schedules: PendingScheduleDetail[];
}

@Injectable({
  providedIn: 'root'
})
export class PendingSchedulesService {
  constructor() {}

  getGroupedPendingSchedulesByLead(leadId: number): Observable<PendingScheduleGroup[]> {
    const mockGrouped: PendingScheduleGroup[] = [
      {
        client_id: 1,
        client_name: 'Banco Alfa',
        schedules: [
          {
            schedule_id: 24,
            start_time: '2025-11-25T00:00:00',
            user_id: 5,
            user_name: 'Bruno Costa',
            status: 'missing'
          },
          {
            schedule_id: 24,
            start_time: '2025-11-25T00:00:00',
            user_id: 9,
            user_name: 'Leandro Oliveira',
            status: 'pending'
          }
        ]
      },
      {
        client_id: 3,
        client_name: 'Prefeitura Municipal',
        schedules: [
          {
            schedule_id: 25,
            start_time: '2025-11-26T00:00:00',
            user_id: 4,
            user_name: 'Alice Silva',
            status: 'missing'
          },
          {
            schedule_id: 26,
            start_time: '2025-11-27T00:00:00',
            user_id: 9,
            user_name: 'Leandro Oliveira',
            status: 'pending'
          }
        ]
      }
    ];
    return of(mockGrouped);
  }

  approve(scheduleId: number, userId: number): Observable<void> {
    console.log(`Approved schedule ${scheduleId} for user ${userId}`);
    return of();
  }

  reject(scheduleId: number, userId: number): Observable<void> {
    console.log(`Rejected schedule ${scheduleId} for user ${userId}`);
    return of();
  }

  remind(scheduleId: number, userId: number): Observable<void> {
    console.log(`Reminder sent to user ${userId} for schedule ${scheduleId}`);
    return of();
  }
}
