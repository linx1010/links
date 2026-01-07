import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { ClientsService, Client } from './clientes.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'code', 'default_currency', 'payment_terms_days', 'actions'];
  dataSource = new MatTableDataSource<Client>([]);
  loading = false;
  error = '';
  showCadastro = false;
  novoClient: Client = {
    organization_id: 1,
    name: '',
    code: '',
    default_currency: 'BRL',
    payment_terms_days: 15
  };

  constructor(
    private clientsService: ClientsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar clientes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleCadastro(): void {
    this.showCadastro = !this.showCadastro;
  }

  cancelarCadastro(): void {
    this.showCadastro = false;
    this.novoClient = {
      organization_id: 1,
      name: '',
      code: '',
      default_currency: 'BRL',
      payment_terms_days: 15
    };
  }

  salvarCadastro(): void {
    if (!this.novoClient.name) {
      alert('Nome é obrigatório');
      return;
    }

    this.clientsService.createClient(this.novoClient).subscribe({
      next: () => {
        this.loadClients();
        this.cancelarCadastro();
      },
      error: (err) => {
        console.error('Erro ao salvar cliente', err);
      }
    });
  }

  atualizar2(client: Client): void {
    const dialogRef = this.dialog.open(ClientsDialogFormComponent, {
      width: '400px',
      data: { ...client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clientsService.updateClient(result).subscribe({
          next: () => this.loadClients(),
          error: (err) => console.error('Erro ao atualizar cliente', err)
        });
      }
    });
  }
  atualizar(client: any) { 
    this.router.navigate(['/dashboard/clientes', client.id]); 
  }

  visualizar(client: Client): void {
    this.dialog.open(ClientsDialogViewComponent, {
      width: '400px',
      data: client
    });
  }
  abrirCalendario(client:Client):void{
    sessionStorage.setItem('nameOrig',client.name)
    sessionStorage.setItem('pageOrig','clientes')
    this.router.navigate(['/dashboard/calendar','client',client.id])
  }

  deletar(client: Client): void {
    if (confirm(`Deseja realmente excluir o cliente "${client.name}"?`)) {
      this.clientsService.deleteClient(client.id!).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error('Erro ao excluir cliente', err)
      });
    }
  }
}

/* ===========================================
   Dialog de Formulário
   =========================================== */
@Component({
  selector: 'app-clients-dialog-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './clientes.dialog.form.html'
})
export class ClientsDialogFormComponent {
  constructor(
    public dialogRef: MatDialogRef<ClientsDialogFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Client
  ) {}
}

/* ===========================================
   Dialog de Visualização
   =========================================== */
@Component({
  selector: 'app-clients-dialog-view',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './clientes.dialog.view.html'
})
export class ClientsDialogViewComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Client) {}
}
