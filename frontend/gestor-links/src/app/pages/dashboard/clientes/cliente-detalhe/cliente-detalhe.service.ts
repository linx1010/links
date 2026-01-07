import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClienteDetalheService {

  private apiUrl = 'http://localhost:3000'; // ajuste se necessário

  constructor(private http: HttpClient) {}

  // ============================================================
  // CLIENTE
  // ============================================================

  getClient(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`);
  }

  updateClient(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/clients/${id}`, data);
  }

  // ============================================================
  // CONTATOS
  // ============================================================

  getContacts(clientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${clientId}/contacts`);
  }

  addContact(clientId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${clientId}/contacts`, data);
  }

  deleteContact(clientId: number, contactId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${clientId}/contacts/${contactId}`);
  }

  // ============================================================
  // CONTRATOS
  // ============================================================

  getContracts(clientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${clientId}/contracts`);
  }

  addContract(clientId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${clientId}/contracts`, data);
  }

  deleteContract(clientId: number, contractId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${clientId}/contracts/${contractId}`);
  }

  // ============================================================
  // INVOICES
  // ============================================================

  getInvoices(clientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${clientId}/invoices`);
  }

  addInvoice(clientId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${clientId}/invoices`, data);
  }

  deleteInvoice(clientId: number, invoiceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${clientId}/invoices/${invoiceId}`);
  }
}
