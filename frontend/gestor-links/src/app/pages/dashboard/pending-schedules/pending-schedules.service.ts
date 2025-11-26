import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
export interface UserReportStatus {
  schedule_id: number;
  user_id: number;
  status: 'pending' | 'rejected';
  start_time: string;
  client_id: number;
  client_name: string;
}
@Injectable({
  providedIn: 'root'
})
export class PendingSchedulesService {
  constructor(private http: HttpClient) {}

  getGroupedPendingSchedulesByLead(leadId: number): Observable<PendingScheduleGroup[]> {
    return this.http.get<PendingScheduleGroup[]>(`http://localhost:3000/reports/pending-by-lead/${leadId}`);
  }

  getReportsByUserStatus(userId: number): Observable<UserReportStatus[]> {
    return this.http.get<UserReportStatus[]>(`http://localhost:3000/reports/by-user-status/${userId}`);
  }

  approve(scheduleId: number, userId: number): Observable<void> {
    // Em breve: chamada real
    return new Observable<void>((observer) => {
      console.log(`Approved schedule ${scheduleId} for user ${userId}`);
      observer.next();
      observer.complete();
    });
  }

  reject(scheduleId: number, userId: number): Observable<void> {
    // Em breve: chamada real
    return new Observable<void>((observer) => {
      console.log(`Rejected schedule ${scheduleId} for user ${userId}`);
      observer.next();
      observer.complete();
    });
  }

  remind(scheduleId: number, userId: number): Observable<void> {
    // Em breve: chamada real
    return new Observable<void>((observer) => {
      console.log(`Reminder sent to user ${userId} for schedule ${scheduleId}`);
      observer.next();
      observer.complete();
    });
  }
}
