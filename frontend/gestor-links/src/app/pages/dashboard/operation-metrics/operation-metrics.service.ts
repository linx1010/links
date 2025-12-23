import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface OperationalResponse {
  status: boolean;
  period: string;
  detalhes: any[];
  totais_por_status: Record<string, number>;
  totais_por_recurso?: Record<string, number>;
  totais_por_cliente?: Record<string, number>;
  total_geral: number;
  total_agendas: number;
}

@Injectable({
  providedIn: 'root'
})
export class OperationMetricsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHoursByResource(): Observable<OperationalResponse> {
    return this.http.get<OperationalResponse>(`${this.apiUrl}/operational/hours-by-resource`);
  }

  getHoursByClient(): Observable<OperationalResponse> {
    return this.http.get<OperationalResponse>(`${this.apiUrl}/operational/hours-by-client`);
  }
}
