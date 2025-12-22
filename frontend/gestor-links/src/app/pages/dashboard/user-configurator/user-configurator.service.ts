import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../environment'
export interface Module {
  code: string;
  organization_id: number;
  label: string;
  description: string;
  active: number;
  created_at: string;
  updated_at: string;
}
@Injectable({
  providedIn: 'root'
})
export class UserConfiguratorService {
  private apiUrl = environment.apiUrl; // ajuste conforme sua porta/backend

  constructor(private http: HttpClient) {}

  // Usuário
  getUser(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${user.id}`, user);
  }

  // Módulos
  getUserModules(userId: number, organizationId: number): Observable<any[]> {
    // Se os módulos vierem junto no read_user_by_id, pode não precisar dessa rota separada
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/modules?organization_id=${organizationId}`);
  }

  addUserModule(userId: number, organizationId: number, module: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/modules`, { ...module, organization_id: organizationId });
  }

  // Contratos
  getUserContracts(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/contracts`);
  }

  addUserContract(userId: number, contract: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/contracts`, contract);
  }

  // Invoices
  getUserInvoices(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/invoices`);
  }

  addUserInvoice(userId: number, invoice: any, file: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('invoice_number', invoice.invoice_number);
    formData.append('amount', invoice.amount);
    if (file) {
      formData.append('file', file);
    }
    return this.http.post(`${this.apiUrl}/users/${userId}/invoices`, formData);
  }
  buscarCep(cep: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cep/${cep}`);
  }


  // Troca de senha
  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  // ---------------- MODULES ----------------
    getModules(): Observable<Module[]> {
      return this.http.get<Module[]>(this.apiUrl+'/modules');
    }
  
}
