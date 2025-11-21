// calendar.service.ts
// Serviço responsável por todas as operações da Agenda:
// - buscar agenda
// - criar evento
// - concluir evento
// - upload de relatório
// - listar relatórios
// - download de relatório
// - aprovar/rejeitar relatório

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ---------------------------------------------------
// IMPORTANTE:
// Estou mantendo sua URL antiga para continuar compatível,
// mas agora também adiciono rota /reports para uploads e etc.
// ---------------------------------------------------
@Injectable({ providedIn: 'root' })
export class CalendarService {
  
  private apiUrl = 'http://localhost:3000/calendar';       // rotas já existentes do seu backend
  private reportsUrl = 'http://localhost:3000/reports';    // nova API para uploads/relatórios

  constructor(private http: HttpClient) {}

  // ------------------------------------------------------------------------
  // 🔵 BUSCAR AGENDA (já existia, mantido)
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
  // 🟢 CRIAR EVENTO NA AGENDA (já existia, mantido)
  // ------------------------------------------------------------------------
  createAgenda(payload: {
    type: string;
    id: number;
    date: string;
    title: string;
    description: string;
    user_id: number[];
  }): Observable<any> {

    return this.http.post<any>(this.apiUrl, payload).pipe(
      catchError((err: any) => {
        console.error('Erro ao criar agenda:', err);
        return of(null);
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

  // ========================================================================
  //                🔴 🔴 🔴  NOVAS FUNÇÕES PARA RELATÓRIOS  🔴 🔴 🔴
  // ========================================================================

  // ------------------------------------------------------------------------
  // 🔴 UPLOAD DO RELATÓRIO DO EVENTO
  // Chamado em: enviarArquivo()
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
  // 🟣 LISTAR RELATÓRIOS DO EVENTO (por schedule_id + data)
  // Chamado em: carregarRelatorios()
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
  // 🔵 BAIXAR RELATÓRIO (retorna base64)
  // Chamado em: baixarRelatorio()
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
  // 🔴 EXCLUIR EVENTO (helper)
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

  // ------------------------------------------------------------------------
  // 🟠 APROVAR OU REJEITAR RELATÓRIO
  // Chamado em: aprovarRelatorio()
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
