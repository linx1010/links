import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserConfiguratorService {
  private mockUser = {
    id: 1,
    name: 'Leandro',
    email: 'leandro@login.com',
    billing_email: 'cobranca@empresa.com',
    finance_email: 'financeiro@empresa.com',
    company_name: 'Minha Empresa LTDA',
    cnpj: '12.345.678/0001-99',
    bank_name: 'Banco XPTO',
    bank_agency: '1234',
    bank_account: '56789-0',
    pix_key: 'leandro@pix.com'
  };

  private mockModules = [
    { module_code: 'MOD001', proficiency_score: 4 },
    { module_code: 'MOD002', proficiency_score: 3 }
  ];

  private mockContracts = [
    { contract_type: 'full_time', base_value: 5000, multiplier: 1, valid_from: '2025-01-01', valid_to: '2025-12-31' }
  ];

  private mockInvoices = [
    { invoice_number: 'INV001', amount: 1500, status: 'pending', file_path: null },
    { invoice_number: 'INV002', amount: 2000, status: 'paid', file_path: '/mock/invoices/inv002.pdf' }
  ];

  constructor() {}

  // Usuário
  getUser(): Observable<any> {
    return of(this.mockUser);
  }

  updateUser(user: any): Observable<any> {
    this.mockUser = { ...this.mockUser, ...user };
    return of(this.mockUser);
  }

  // Módulos
  getUserModules(): Observable<any[]> {
    return of(this.mockModules);
  }

  addUserModule(module: any): Observable<any> {
    this.mockModules.push(module);
    return of(module);
  }

  // Contratos
  getUserContracts(): Observable<any[]> {
    return of(this.mockContracts);
  }

  addUserContract(contract: any): Observable<any> {
    this.mockContracts.push(contract);
    return of(contract);
  }

  // Invoices
  getUserInvoices(): Observable<any[]> {
    return of(this.mockInvoices);
  }

  addUserInvoice(invoice: any, file: File | null): Observable<any> {
    const newInvoice = { ...invoice, status: 'pending', file_path: file ? file.name : null };
    this.mockInvoices.push(newInvoice);
    return of(newInvoice);
  }
}
