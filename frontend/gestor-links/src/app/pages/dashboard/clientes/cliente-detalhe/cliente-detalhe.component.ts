import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteDetalheService } from './cliente-detalhe.service';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cliente-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './cliente-detalhe.component.html',
  styleUrls: ['./cliente-detalhe.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClienteDetalheComponent implements OnInit {

  clientId!: number;
  selectedTabIndex = 0;

  client: any = {
    name: '',
    code: '',
    default_currency: 'BRL',
    payment_terms_days: 15
  };

  clientContacts: any[] = [];
  clientContracts: any[] = [];
  clientInvoices: any[] = [];

  newContact: any = {
    name: '',
    email: '',
    phone: '',
    role: ''
  };

  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private service: ClienteDetalheService
  ) {}

  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadClient();
    this.loadContacts();
    this.loadContracts();
    this.loadInvoices();
    setTimeout(() => {
    console.log("DEBUG:", {
      clientContacts: this.clientContacts,
      clientContracts: this.clientContracts,
      clientInvoices: this.clientInvoices
    });
  }, 1500);
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index;
  }

  // ============================================================
  // CLIENTE
  // ============================================================

  loadClient() {
    this.service.getClient(this.clientId).subscribe(res => {
      const found = res.find((c: any) => c.id === this.clientId);
      if (found) this.client = found;
    });
  }

  saveClient() {
    this.service.updateClient(this.clientId, this.client).subscribe(() => {
      alert('Cliente atualizado com sucesso!');
    });
  }

  // ============================================================
  // CONTATOS
  // ============================================================

  loadContacts() {
    this.service.getContacts(this.clientId).subscribe(res => {
      this.clientContacts = res;
    });
  }

  addContact() {
    this.service.addContact(this.clientId, this.newContact).subscribe(() => {
      this.loadContacts();
      this.newContact = { name: '', email: '', phone: '', role: '' };
    });
  }

  removeContact(contactId: number) {
    this.service.deleteContact(this.clientId, contactId).subscribe(() => {
      this.loadContacts();
    });
  }

  // ============================================================
  // CONTRATOS
  // ============================================================

  loadContracts() {
    this.service.getContracts(this.clientId).subscribe(res => {
      this.clientContracts = res;
    });
  }

  addContract() {
    const newContract = {
      contract_type: 'full_time',
      base_value: 1000,
      multiplier: 1,
      valid_from: '2025-01-01',
      valid_to: '2025-12-31'
    };

    this.service.addContract(this.clientId, newContract).subscribe(() => {
      this.loadContracts();
    });
  }

  removeContract(contractId: number) {
    this.service.deleteContract(this.clientId, contractId).subscribe(() => {
      this.loadContracts();
    });
  }

  // ============================================================
  // INVOICES
  // ============================================================

  loadInvoices() {
    this.service.getInvoices(this.clientId).subscribe(res => {
      this.clientInvoices = res;
    });
  }

  addInvoice(number: string, amount: number) {
    const invoice = {
      invoice_number: number,
      amount: amount,
      status: 'pending',
      file_path: null
    };

    this.service.addInvoice(this.clientId, invoice).subscribe(() => {
      this.loadInvoices();
    });
  }

  removeInvoice(invoiceId: number) {
    this.service.deleteInvoice(this.clientId, invoiceId).subscribe(() => {
      this.loadInvoices();
    });
  }

  // ============================================================
  // UPLOAD (mock por enquanto)
  // ============================================================

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
    console.log('Arquivo selecionado:', this.selectedFile);
  }
}
