import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { RecursosService, User } from './recursos.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, FormControl } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { MatSelectModule, MatOption, MatSelect } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastService } from '../../../shared/toast.service';

import { RecursosFormDialog } from './recursos.dialog.form';   // dialog de cadastro/edição
import { RecursosDialog } from './recursos.dialog.view';       // dialog de visualização

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSlideToggleModule
  ], 
  templateUrl: './recursos.component.html',
  styleUrls: ['./recursos.component.scss']
})
export class RecursosComponent implements OnInit {
  users: User[] = [];
  editUser: User | null = null;
  loading = false;
  error = '';
  role: string | null = null;

  rolesPermitidas: string[] = ['admin', 'manager', 'member', 'contractor'];
  modules = new FormControl('');
  moduleList = [
    {code:'SIGAATF',label:'Ativo fixo'},
    {code:'SIGACOM',label:'Compras'}
  ];

  displayedColumns: string[] = ['id','name','email','role','active','actions'];
  modulosFiltrados = [...this.moduleList];
  modulosFiltro: string = '';

  novoUser: any = {
    name: '',
    email: '',
    role: '',
    hourly_rate: null,
    organization_id:'1',
    active: true,
    resource_type: '',              // 👈 novo campo
    availability_expression: '',    // 👈 novo campo
    modulos: [] as { code: string, proficiency: number }[]
  };

  dataSource = new MatTableDataSource<User>([]);

  constructor(
    private recursosService: RecursosService, 
    private dialog: MatDialog,
    private router: Router,
    private toast : ToastService
  ) {}

  ngOnInit() {
    this.role = localStorage.getItem('userRole');
    const userId = Number(localStorage.getItem('userId'));
    if (this.role === 'member') {
      this.loadUserById(userId);
    } else {
      this.loadUsers();
    }
    this.loadModules();
  }

  loadUsers() {
    this.loading = true;
    this.recursosService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar usuários';
        this.loading = false;
      }
    });
  }
  
  loadUserById(id: number) {
    this.loading = true;
    this.recursosService.getUserById(id).subscribe({
      next: (user) => {
        this.users = [user];
        this.dataSource.data = [user];
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar usuário';
        this.loading = false;
      }
    });
  }

  loadModules() {
    this.recursosService.getModules().subscribe({
      next: (data) => {
        this.moduleList = data.map(m => ({ code: m.code, label: m.label }));
        this.modulosFiltrados = [...this.moduleList];
      },
      error: (err) => console.error('Erro ao carregar módulos', err)
    });
  }

  get isAdminOrManager(): boolean {
    return this.role === 'admin' || this.role === 'manager';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  visualizar(user: User) {
    if (!this.isAdminOrManager) return;
    this.dialog.open(RecursosDialog, {
      width: '600px',
      data: user,
    });
  }

  atualizar(user: User) {
    if (!this.isAdminOrManager) return;

    const dialogRef = this.dialog.open(RecursosFormDialog, {
      panelClass: 'big-dialog',
      autoFocus: false,
      width: '600px',
      data: {
        novoUser: { ...user }, // 👈 preenche com os dados do usuário
        rolesPermitidas: this.rolesPermitidas,
        modulos: this.moduleList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.novoUser) {
        this.novoUser = result.novoUser;
        this.editUser = user; // 👈 marca que é edição
        this.salvarCadastro();
      }
    });
  }


  inativar(user: User) {
    if (!this.isAdminOrManager) return;
    const atualizado = { ...user, active: user.active ? 0 : 1 };
    this.recursosService.updateUser(user.id, atualizado).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Erro ao atualizar usuário', err)
    });
  }

  abrirCadastro() {
    const dialogRef = this.dialog.open(RecursosFormDialog, {
      panelClass: 'big-dialog',
      autoFocus: false,
      width: '600px',
      data: {
        novoUser: {
          name: '',
          email: '',
          role: '',
          hourly_rate: null,
          organization_id: '1',
          active: true,
          modulos: []
        },
        rolesPermitidas: this.rolesPermitidas,
        modulos: this.moduleList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.novoUser) {
        this.novoUser = result.novoUser;
        this.editUser = null; // 👈 marca que é novo
        this.salvarCadastro();
      }
    });
  }


  salvarCadastro() {
    if (!this.novoUser.name || !this.novoUser.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    if (this.editUser) {
      this.recursosService.updateUser(this.editUser.id, this.novoUser).subscribe({
        next: () => {
          this.loadUsers();
          this.editUser = null;
          this.toast.show('Cadastro atualizado com sucesso');
        },
        error: (err) => console.error('Erro ao atualizar usuário', err)
      });
    } else {
      this.recursosService.createUser(this.novoUser).subscribe({
        next: () => {
          this.loadUsers();
          this.toast.show('Cadastro criado com sucesso');
        },
        error: (err) => console.error('Erro ao criar usuário', err)
      });
    }
  }

  abrirCalendario(user: User): void {
    sessionStorage.setItem('nameOrig', user.name);
    sessionStorage.setItem('pageOrig', 'recursos');
    this.router.navigate(['/dashboard/calendar','user',user.id]);
  }

  abrirTimesheet(user: User): void {
    if (!user.active) {
      alert('Usuário inativo não pode acessar timesheets.');
      return;
    }
    sessionStorage.setItem('timesheetUserName', user.name);
    this.router.navigate(['/dashboard/timesheet', user.id]);
  }
}
