import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PendingScheduleDetail {
  schedule_id: number;
  start_time: string;
  user_id: number;
  user_name: string;
  status: 'missing' | 'pending'| 'approved'| 'rejected';
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
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getGroupedPendingSchedulesByLead(leadId: number): Observable<PendingScheduleGroup[]> {
    return this.http.get<PendingScheduleGroup[]>(`${this.baseUrl}/reports/pending-by-lead/${leadId}`);
  }

  getReportsByUserStatus(userId: number): Observable<UserReportStatus[]> {
    return this.http.get<UserReportStatus[]>(`${this.baseUrl}/reports/by-user-status/${userId}`);
  }

  downloadReport(reportId: number) {
    return this.http.post(`${this.baseUrl}/reports/download`, { report_id: reportId });
  }

  approve(scheduleId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reports/approve`, { schedule_id: scheduleId, user_id: userId });
  }

  reject(scheduleId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reports/reject`, { schedule_id: scheduleId, user_id: userId });
  }
  updateStatus(scheduleId: number, userId: number, status: 'approved' | 'rejected',reviewerId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reports/update-status`, {
      schedule_id: scheduleId,
      user_id: userId,
      status,
      reviewed_by: reviewerId
    });
  }


  remind(scheduleId: number, userId: number): Observable<void> {
    // Se tiver rota específica para remind, ajuste aqui
    return new Observable<void>((observer) => {
      console.log(`Reminder sent to user ${userId} for schedule ${scheduleId}`);
      observer.next();
      observer.complete();
    });
  }
}
