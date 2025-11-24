// calendar.service.ts
// Serviço responsável por todas as operações da Agenda:
// - buscar agenda
// - criar evento único
// - criar eventos em lote (replicação)
// - concluir evento
// - excluir evento
// - upload de relatório
// - listar relatórios
// - download de relatório
// - aprovar/rejeitar relatório

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  
  private apiUrl = 'http://localhost:3000/calendar';       // rotas já existentes do backend
  private reportsUrl = 'http://localhost:3000/reports';    // rotas para relatórios

  constructor(private http: HttpClient) {}

  // ------------------------------------------------------------------------
  // 🔵 BUSCAR AGENDA
  // ------------------------------------------------------------------------
  getAgenda(tipo: string, id: number): Observable<any[]> {
    const url = `${this.apiUrl}?type=${tipo}&id=${id}`;
    return this.http.get<any[]>(url).pipe(
      catchError((err: any) => {
        console.error('Erro ao buscar agenda:', err);
        return of([]);
      })
    );
  }

  // ------------------------------------------------------------------------
  // 🟢 CRIAR EVENTO ÚNICO
  // ------------------------------------------------------------------------
  createAgenda(payload: {
    type: string;
    id: number;
    date: string;
    title: string;
    description?: string;
    user_id: number[] | number;
    location?: string;
    role?: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload).pipe(
      catchError((err: any) => {
        console.error('Erro ao criar agenda:', err);
        return of(null);
      })
    );
  }

  // ------------------------------------------------------------------------
  // 🟢 CRIAR EVENTOS EM LOTE (replicação)
  // ------------------------------------------------------------------------
  createAgendaBatch(payload: {
    type: string;
    id: number;
    title: string;
    description?: string;
    user_id: number[] | number;
    dates: string[]; // lista de datas YYYY-MM-DD
    location?: string;
    role?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/batch`, payload).pipe(
      catchError((err: any) => {
        console.error('Erro ao criar agendas em lote:', err);
        return of({ success: false, error: 'Falha na criação em lote' });
      })
    );
  }

  // ------------------------------------------------------------------------
  // 🟡 CONCLUIR EVENTO (toggle open/completed)
  // ------------------------------------------------------------------------
  completeAgenda(schedule: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, schedule).pipe(
      catchError((err: any) => {
        console.error('Erro ao concluir evento:', err);
        return of(null);
      })
    );
  }

  // ------------------------------------------------------------------------
  // 🔴 EXCLUIR EVENTO
  // ------------------------------------------------------------------------
  deleteEvento(tipo: string, id: number, date: string, title: string): Observable<any> {
    const payload = { type: tipo, id, date, title };
    return this.http.post<any>(`${this.apiUrl}/delete`, payload).pipe(
      catchError((err: any) => {
        console.error('Erro ao excluir evento:', err);
        return of(null);
      })
    );
  }

  // ========================================================================
  //                🔴 🔴 🔴  FUNÇÕES PARA RELATÓRIOS  🔴 🔴 🔴
  // ========================================================================

  // ------------------------------------------------------------------------
  // UPLOAD DE RELATÓRIO
  // ------------------------------------------------------------------------
  uploadRelatorio(payload: any): Observable<any> {
    return this.http.post<any>(`${this.reportsUrl}/upload`, payload).pipe(
      catchError((err: any) => {
        console.error('Erro ao enviar relatório:', err);
        return of(null);
      })
    );
  }

  // ------------------------------------------------------------------------
  // LISTAR RELATÓRIOS
  // ------------------------------------------------------------------------
  getRelatorios(schedule_id: number, report_date: string): Observable<any> {
    const body = { schedule_id, report_date };
    return this.http.post<any>(`${this.reportsUrl}/list`, body).pipe(
      catchError((err: any) => {
        console.error('Erro ao buscar relatórios:', err);
        return of({ reports: [] });
      })
    );
  }

  // ------------------------------------------------------------------------
  // BAIXAR RELATÓRIO
  // ------------------------------------------------------------------------
  downloadRelatorio(report_id: number): Observable<any> {
    return this.http.post<any>(`${this.reportsUrl}/download`, { report_id }).pipe(
      catchError((err: any) => {
        console.error('Erro ao baixar relatório:', err);
        return of(null);
      })
    );
  }

  // ------------------------------------------------------------------------
  // APROVAR OU REJEITAR RELATÓRIO
  // ------------------------------------------------------------------------
  approveReport(payload: {
    action: string;
    report_id: number;
    approve: boolean;
  }): Observable<any> {
    return this.http.post<any>(`${this.reportsUrl}/approve`, payload).pipe(
      catchError((err: any) => {
        console.error('Erro ao aprovar/rejeitar relatório:', err);
        return of(null);
      })
    );
  }
}
