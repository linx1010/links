import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-recursos-form-dialog',
  templateUrl: './recursos.dialog.form.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule
  ]
})
export class RecursosFormDialog {
  modulosFiltrados: any[] = [];
  modulosFiltro: string = '';
  selectedDays: string[] = [];
  selectedHour: number = 9; // default

  constructor(
    public dialogRef: MatDialogRef<RecursosFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.modulosFiltrados = [...data.modulos];
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    this.dialogRef.close(this.data);
  }

  filtrarModulos(): void {
    const filtro = this.modulosFiltro.toLowerCase();
    this.modulosFiltrados = this.data.modulos.filter((m: any) =>
      m.code.toLowerCase().includes(filtro) || m.label.toLowerCase().includes(filtro)
    );
  }

  updateQuartz(): void {
    const days = this.selectedDays.length > 0 ? this.selectedDays.join(',') : '*';
    const hour = this.selectedHour ?? 8;

    // Monta expressão Quartz básica
    this.data.novoUser.availability_expression = `0 0 ${hour} ? * ${days}`;
  }
  onResourceTypeChange(): void {
    // Ajusta defaults conforme tipo
    if (this.data.novoUser.resource_type === 'hourly_full') {
      this.selectedHour = 8;
      this.selectedDays = ['MON','TUE','WED','THU','FRI'];
    } else if (this.data.novoUser.resource_type === 'full_time') {
      this.selectedHour = 8;
      this.selectedDays = ['MON','TUE','WED','THU','FRI'];
    }
    this.updateQuartz();
  }
}
