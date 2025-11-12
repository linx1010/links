import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private apiUrl = 'http://localhost:3000/calendar';

  constructor(private http: HttpClient) {}

  getAgenda(tipo: string, id: number): Observable<any[]> {
    const url = `${this.apiUrl}?type=${tipo}&id=${id}`;
    return this.http.get<any[]>(url).pipe(
      catchError(err => {
        console.error('Erro ao buscar agenda:', err);
        return of([]);
      })
    );
  }
  createAgenda(
    payload: {
      type: string;
      id: number;
      date: string;
      title: string;
      description: string;
      user_id: number[];
    }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload).pipe(
      catchError(err => {
        console.error('Erro ao criar agenda:', err);
        return of(null);
      })
    );
  }
  completeAgenda(scheduleId: any): Observable<any> {
  return this.http.put<any>(this.apiUrl,  scheduleId );
  }


}
