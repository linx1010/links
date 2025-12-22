import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { UserConfiguratorService } from './user-configurator.service';
import { ToastService } from '../../../shared/toast.service';

import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';




@Component({
  selector: 'app-user-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    HttpClientModule // necessário para injetar HttpClient
  ],
  templateUrl: './user-configurator.component.html',
  styleUrls: ['./user-configurator.component.scss']
})
export class UserConfiguratorComponent implements OnInit {
  // Páginas em construção
  featureContratosReady = false;
  featureInvoicesReady = false;

  user: any = {};
  userModules: any[] = [];
  userContracts: any[] = [];
  userInvoices: any[] = [];
  userId = Number(localStorage.getItem('userId'));
  selectedTabIndex = 0;

  moduleList: any[] = []; 
  filteredModules!: Observable<any[]>; 
  moduleControl = new FormControl<string>(''); 
  selectedModuleLabel = '';

  // Controle de visibilidade das senhas
  hideCurrent = true;
  hideNew = true;
  hideRepeat = true;

  // Campos de senha
  currentPassword = '';
  newPassword = '';
  repeatPassword = '';

  selectedFile: File | null = null;

  constructor(
    private userService: UserConfiguratorService,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadModules(); // <-- você esqueceu de chamar isso aqui

    this.filteredModules = this.moduleControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterModules(value || ''))
    );
  }


  // Usuário
  loadUser(): void {
    this.userService.getUser(this.userId).subscribe({
      next: (data) => {
        (this.user = data),
        this.userModules = data.modulos || []; 
      },
      error: () => this.toast.show('Erro ao carregar usuário', 'error')
    });
  }


  loadModules() {
  this.userService.getModules().subscribe({
    next: (data) => {
      this.moduleList = data.map(m => ({
        code: m.code,
        label: m.label
      }));
    },
    error: (err) => this.toast.show('Erro ao carregar módulos'+ err,'error')
  });
}

filterModules(value: string) {
  const filterValue = value.toLowerCase();
  return this.moduleList.filter(m =>
    m.code.toLowerCase().includes(filterValue) ||
    m.label.toLowerCase().includes(filterValue)
  );
}

  onModuleSelected(code: string) {
    const mod = this.moduleList.find(m => m.code === code);
    this.selectedModuleLabel = mod?.label || '';
  }

  addModule(code: string, score: number) {
    const mod = this.moduleList.find(m => m.code === code);
    if (!mod) return;

    const novoModulo = {
      module_code: mod.code,
      label: mod.label,
      proficiency_score: score
    };

    // Atualiza o array de forma imutável → Angular detecta a mudança
    this.user.modulos = [...this.user.modulos, novoModulo];

    // Limpa campos
    this.moduleControl.setValue('');
    this.selectedModuleLabel = '';
  }
  removeModule(index: number) {
    this.user.modulos = this.user.modulos.filter((_: unknown, i: number) => i !== index);
  }





  updateUser(): void {
    this.userService.updateUser(this.user).subscribe({
      next: () => this.toast.show('Usuário atualizado com sucesso', 'sucess'),
      error: () => this.toast.show('Erro ao atualizar usuário', 'error')
    });
  }
  onTabChange(event: any) {
    this.selectedTabIndex = event.index;
    
  }
  

  // addModule(moduleCode: string, score: any): void {
  //   const numericScore = Number(score);
  //   if (!moduleCode || Number.isNaN(numericScore)) {
  //     this.toast.show('Informe módulo e proficiência válidos', 'error');
  //     return;
  //   }

  //   // Atualiza localmente
  //   this.userModules.push(moduleCode);

  //   // Envia para o backend usando updateUser()
  //   this.user.modulos = this.userModules;

  //   this.userService.updateUser(this.user).subscribe({
  //     next: () => this.toast.show('Módulo adicionado', 'sucess'),
  //     error: () => this.toast.show('Erro ao adicionar módulo', 'error')
  //   });
  // }


  // Contratos
  loadContracts(): void {
    this.userService.getUserContracts(this.userId).subscribe({
      next: (data) => (this.userContracts = data),
      error: () => this.toast.show('Erro ao carregar contratos', 'error')
    });
  }

  addContract(contract: any): void {
    this.userService.addUserContract(this.userId, contract).subscribe({
      next: () => {
        this.toast.show('Contrato adicionado', 'sucess');
        this.loadContracts();
      },
      error: () => this.toast.show('Erro ao adicionar contrato', 'error')
    });
  }

  // Invoices
  loadInvoices(): void {
    this.userService.getUserInvoices(this.userId).subscribe({
      next: (data) => (this.userInvoices = data),
      error: () => this.toast.show('Erro ao carregar invoices', 'error')
    });
  }

  addInvoice(invoice: any): void {
    if (!invoice?.invoice_number || !invoice?.amount) {
      this.toast.show('Informe número e valor da invoice', 'error');
      return;
    }
    this.userService.addUserInvoice(this.userId, invoice, this.selectedFile).subscribe({
      next: () => {
        this.toast.show('Invoice adicionada', 'sucess');
        this.selectedFile = null;
        this.loadInvoices();
      },
      error: () => this.toast.show('Erro ao adicionar invoice', 'error')
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length ? input.files[0] : null;
  }

  // CEP → ViaCEP
  buscarCep(): void {
    const rawCep = (this.user?.cep ?? '').toString();
    const cep = rawCep.replace(/\D/g, ''); // mantém só dígitos

    if (!cep) return;

    if (!/^\d{8}$/.test(cep)) {
      this.toast.show('CEP inválido. Use 8 dígitos, apenas números.', 'error');
      return;
    }

    this.userService.buscarCep(cep).subscribe({
      next: (data) => {
        if (data?.erro) {
          this.toast.show('CEP não encontrado.', 'error');
          this.limparEndereco();
          return;
        }

        this.user.street = data.logradouro || '';
        this.user.neighborhood = data.bairro || '';
        this.user.city = data.localidade || '';
        this.user.state = data.uf || '';
      },
      error: () => {
        this.toast.show('Não foi possível consultar o CEP. Tente novamente.', 'error');
        this.limparEndereco();
      }
    });
  }

  private limparEndereco(): void {
    this.user.street = '';
    this.user.neighborhood = '';
    this.user.city = '';
    this.user.state = '';
  }

  // Senha
  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.repeatPassword) {
      this.toast.show('Preencha todos os campos de senha', 'error');
      return;
    }

    if (this.newPassword !== this.repeatPassword) {
      this.toast.show('As senhas não coincidem', 'error');
      return;
    }

    this.userService.changePassword(this.userId,this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        if (response?.status) {
          this.toast.show('Senha alterada com sucesso', 'sucess');
          this.currentPassword = '';
          this.newPassword = '';
          this.repeatPassword = '';
        } else {
          this.toast.show(response?.message || 'Erro ao alterar senha', 'error');
        }
      },
      error: () => this.toast.show('Erro ao alterar senha', 'error')
    });
  }
}
