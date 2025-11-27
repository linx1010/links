import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para tipar o retorno do backend
export interface DashboardTotals {
  approval: {
    missing: number;
    pending: number;
    rejected: number;
    approved: number;
  };
  upload: {
    missing: number;
    pending: number;
    rejected: number;
    approved?: number; // opcional, caso não venha
  };
  global: {
    missing: number;
    pending?: number;
    rejected?: number;
    approved?: number;
  };
  monthly: {
    month: string;
    missing: number;
    pending: number;
    rejected: number;
    approved: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private baseUrl = 'http://localhost:3000/reports';

  constructor(private http: HttpClient) {}

  // Chama o endpoint único do dashboard
  getDashboardTotals(userId: number, leadId: number): Observable<DashboardTotals> {
    return this.http.post<DashboardTotals>(`${this.baseUrl}/dashboard-totals`, {
      user_id: userId,
      lead_id: leadId
    });
  }
}
