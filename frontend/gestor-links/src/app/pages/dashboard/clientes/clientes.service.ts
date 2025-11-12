import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id?: number;
  organization_id: number;
  name: string;
  code?: string;
  default_currency?: string;
  payment_terms_days?: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private apiUrl = 'http://localhost:3000/clients'; // ajuste se necessário

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, {
    });
  }

  createClient(client: Client): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      data: client
    });
  }

updateClient(client: Client): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${client.id}`, client);
}


 
  // DELETE a user (opcional)
    deleteClient(id: number): Observable<Client> {
      return this.http.delete<Client>(`${this.apiUrl}/${id}`);
    }
}
