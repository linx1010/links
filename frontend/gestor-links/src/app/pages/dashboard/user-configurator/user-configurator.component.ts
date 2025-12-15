import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

import { UserConfiguratorService } from './user-configurator.service';

@Component({
  selector: 'app-user-configurator',
  standalone: true, // <-- habilita standalone
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule // <-- importa o módulo de abas direto aqui
  ],
  templateUrl: './user-configurator.component.html',
  styleUrls: ['./user-configurator.component.scss']
})
export class UserConfiguratorComponent implements OnInit {
  user: any = {};
  userModules: any[] = [];
  userContracts: any[] = [];
  userInvoices: any[] = [];

  selectedFile: File | null = null;

  constructor(private userService: UserConfiguratorService) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadModules();
    this.loadContracts();
    this.loadInvoices();
  }

  loadUser() {
    this.userService.getUser().subscribe(data => this.user = data);
  }

  updateUser() {
    this.userService.updateUser(this.user).subscribe(() => {
      console.log('Usuário atualizado');
    });
  }

  loadModules() {
    this.userService.getUserModules().subscribe(data => this.userModules = data);
  }

  addModule(moduleCode: string, score: any) {
    const numericScore = Number(score);
    this.userService.addUserModule({ module_code: moduleCode, proficiency_score: numericScore })
      .subscribe(() => this.loadModules());
  }


  loadContracts() {
    this.userService.getUserContracts().subscribe(data => this.userContracts = data);
  }

  addContract(contract: any) {
    this.userService.addUserContract(contract).subscribe(() => this.loadContracts());
  }

  loadInvoices() {
    this.userService.getUserInvoices().subscribe(data => this.userInvoices = data);
  }

  addInvoice(invoice: any) {
    this.userService.addUserInvoice(invoice, this.selectedFile).subscribe(() => this.loadInvoices());
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
