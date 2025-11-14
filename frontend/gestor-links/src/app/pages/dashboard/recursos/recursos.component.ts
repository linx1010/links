import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { RecursosService, User } from './recursos.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, FormControl } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // para o toggle
import { Router } from '@angular/router';
import { MatSelectModule, MatOption, MatSelect } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastService } from '../../../shared/toast.service';


// ⭐ Mini componente do Dialog
@Component({
  selector: 'app-recursos-dialog',
  templateUrl: './recursos.dialog.view.html', // usa o HTML separado
  standalone: true,
  imports: [CommonModule, MatDialogModule],
})
export class RecursosDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
@Component({
  selector: 'app-recursos-form-dialog',
  templateUrl: './recursos.dialog.form.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule
  ]
})
export class RecursosFormDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
) {}
}


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
    MatOption,
    MatSelect
], 
  templateUrl: './recursos.component.html', // 👈 mantém o seu HTML principal
  styleUrls: ['./recursos.component.scss']
})
export class RecursosComponent implements OnInit {
  users: User[] = [];
  editUser: User | null = null;
  usersdata: User[] = [];
  loading = false;
  showCadastro = false; // controla se o form aparece
  
  error = '';
  role: string | null = null;
  selected = '';
  // roles permitidas
  rolesPermitidas: string[] = ['admin', 'manager', 'member', 'contractor'];
  modules = new FormControl('');
  moduleList = [
    {code:'SIGAATF',label:'Ativo fixo'},
    {code:'SIGACOM',label:'Compras'}
  ];
  


  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'role',
    'active',
    'actions'
  ];
  modulosFiltrados = [...this.moduleList];
  modulosFiltro: string = '';
  
  novoUser: any = {
    name: '',
    email: '',
    role: '',
    hourly_rate: null,
    organization_id:'1',
    active: true,
    modulos: [] as { code: string, proficiency: number }[]
  };
  
  filtrarModulos() {
    const filtro = this.modulosFiltro.toLowerCase();
    this.modulosFiltrados = this.moduleList.filter(m =>
      m.code.toLowerCase().includes(filtro) || m.label.toLowerCase().includes(filtro)
    );
  }

  toggleCadastro() {
    this.showCadastro = !this.showCadastro;
    if (!this.showCadastro) {
      this.resetForm();
    }
  }

  cancelarCadastro() {
    this.showCadastro = false;
    this.resetForm();
    this.editUser = null; // reseta edição
  }


  salvarCadastro() {
    if (!this.novoUser.name || !this.novoUser.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    if (this.editUser) {
      // atualização de usuário existente
      this.recursosService.updateUser(this.editUser.id, this.novoUser).subscribe({
        next: (res:any) => {
          if (res.status===false){
            this.toast.show(res.message || 'Erro ao atualizar o usuario','error')
          }else{
            this.loadUsers();        // atualiza tabela
            this.cancelarCadastro(); // fecha formulário
            this.editUser = null;    // reseta edição
            this.toast.show('Cadastro Atualizado com sucesso ')
          }
        },
        error: (err) => {
          console.error('Erro ao atualizar usuário', err)
          this.toast.show('Erro ao atualizar usuário ', err)
        }
      });
    } else {
      // Cadastro novo
      this.recursosService.createUser(this.novoUser).subscribe({
        next: (res:any) => {
          if (res.status === false) {
            this.toast.show(res.message || 'Erro ao criar usuário', 'error');
          } else {
            this.loadUsers();        // recarrega tabela
            this.cancelarCadastro(); // fecha formulário
            this.toast.show('Cadastro criado com sucesso ')
          }
        },
        error: (err) => {
          this.toast.show('Erro ao criar usuário', err)
          console.error('Erro ao criar usuário', err)
        }
      });
    }
  }


  resetForm() {
    this.novoUser = {
      name: '',
      email: '',
      role: '',
      hourly_rate: null,
      organization_id:'1',
      active: true
    };
  }


  dataSource = new MatTableDataSource<User>([]);

  constructor(
    private recursosService: RecursosService, 
    private dialog: MatDialog,
    private router:Router,
    private toast : ToastService
  ) {}

  ngOnInit() {
    this.role = localStorage.getItem('userRole');
    const userId = Number(localStorage.getItem('userId'));
    if (this.role === 'member') {
      this.loadUserById(userId);   // só carrega o próprio usuário
      } else {
        this.loadUsers();            // carrega todos
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
      error: (err) => {
        console.error(err);
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
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar usuário';
        this.loading = false;
      }
    });
  }


  loadModules() {
    this.recursosService.getModules().subscribe({
      next: (data) => {
        // popula lista completa
        this.moduleList = data.map(m => ({
          code: m.code,
          label: m.label
        }));

        // ✅ atualiza lista filtrada também
        this.modulosFiltrados = [...this.moduleList];
      },
      error: (err) => {
        console.error('Erro ao carregar módulos', err);
      }
    });
  }


  get isAdminOrManager(): boolean {
    return this.role === 'admin' || this.role === 'manager';
  }
  get isMember(): boolean {
    return this.role === 'member';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  abrirCalendario(user:User):void{
    console.log('/dashboard/calendar','user',user.id)
    sessionStorage.setItem('nameOrig',user.name)
    sessionStorage.setItem('pageOrig','recursos')
    this.router.navigate(['/dashboard/calendar','user',user.id])
  }

  visualizar(user: User) {
    if (!this.isAdminOrManager) return;
    this.dialog.open(RecursosDialog, {
      width: '600px',
      data: user,
    });
  }

  visualizardata(user: User) {
    console.log('Visualizar detalhes de:', user);
  }

  atualizar(user: User) {
    if (!this.isAdminOrManager) return;
    this.editUser = user;            // guarda o usuário que será editado
    this.novoUser = { ...user };     // copia os dados para o formulário
    this.showCadastro = true;        // mostra o formulário
  }

  inativar(user: User) {
    if (!this.isAdminOrManager) return;
    const atualizado = { ...user, active: user.active ? 0 : 1 }; // alterna o valor
    this.recursosService.updateUser(user.id, atualizado).subscribe({
      next: () => {
        // Atualiza a lista após alteração
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário', err);
      }
    });
  }
  alerta() {
    alert('alerta');
  }
  abrirTimesheet(user: User): void {
  if (!user.active) {
    alert('Usuário inativo não pode acessar timesheets.');
  }

  sessionStorage.setItem('timesheetUserName', user.name);
  this.router.navigate(['/dashboard/timesheet', user.id]);
}
  abrirCadastro() {
  const dialogRef = this.dialog.open(RecursosFormDialog, {
    panelClass: 'big-dialog',
    autoFocus: false,
    data: { name: '', email: '', role: '', active: true }
  });

 

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('Novo usuário cadastrado:', result);
      // aqui você pode enviar para o backend
      // this.users.push(result);
      // this.dataSource.data = [...this.users]; // atualiza tabela
    }
  });
}

}
