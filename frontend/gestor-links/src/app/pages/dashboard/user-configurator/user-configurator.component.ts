import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { UserConfiguratorService } from './user-configurator.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-user-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule, 
    MatSelectModule
  ],
  templateUrl: './user-configurator.component.html',
  styleUrls: ['./user-configurator.component.scss']
})
export class UserConfiguratorComponent implements OnInit {
  user: any = {};
  userModules: any[] = [];
  userContracts: any[] = [];
  userInvoices: any[] = [];

  // Controle de visibilidade das senhas
  hideCurrent = true;
  hideNew = true;
  hideRepeat = true;

  // Campos de senha
  currentPassword = '';
  newPassword = '';
  repeatPassword = '';

  selectedFile: File | null = null;

  constructor(private userService: UserConfiguratorService) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadModules();
    this.loadContracts();
    this.loadInvoices();
  }

  // Usuário
  loadUser(): void {
    this.userService.getUser().subscribe(data => this.user = data);
  }

  updateUser(): void {
    this.userService.updateUser(this.user).subscribe(() => {
      console.log('Usuário atualizado');
    });
  }

  // Módulos
  loadModules(): void {
    this.userService.getUserModules().subscribe(data => this.userModules = data);
  }

  addModule(moduleCode: string, score: any): void {
    const numericScore = Number(score);
    this.userService.addUserModule({ module_code: moduleCode, proficiency_score: numericScore })
      .subscribe(() => this.loadModules());
  }

  // Contratos
  loadContracts(): void {
    this.userService.getUserContracts().subscribe(data => this.userContracts = data);
  }

  addContract(contract: any): void {
    this.userService.addUserContract(contract).subscribe(() => this.loadContracts());
  }

  // Invoices
  loadInvoices(): void {
    this.userService.getUserInvoices().subscribe(data => this.userInvoices = data);
  }

  addInvoice(invoice: any): void {
    this.userService.addUserInvoice(invoice, this.selectedFile).subscribe(() => this.loadInvoices());
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // Senha
  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.repeatPassword) {
      console.error('Preencha todos os campos de senha');
      return;
    }

    if (this.newPassword !== this.repeatPassword) {
      console.error('As senhas não coincidem');
      return;
    }

    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe(response => {
      if (response.success) {
        console.log(response.message);
      } else {
        console.error(response.message);
      }
    });
  }

}
