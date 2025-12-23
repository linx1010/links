import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { TimesheetResourcesService } from './timesheet-resources.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-timesheet-resources',
  templateUrl: './timesheet-resources.component.html',
  styleUrls: ['./timesheet-resources.component.scss'],
  imports: [CommonModule, MatExpansionModule, MatTooltipModule]
})
export class TimesheetResourcesComponent implements OnInit {

  dias: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  recursos: any[] = [];

  constructor(private service: TimesheetResourcesService) {}

  ngOnInit(): void {
    this.service.getTimesheet(12, 2025).subscribe(res => {
      this.recursos = res.recursos;
      console.log(res)
    });
  }

  getColorClass(horas: number | null): string {
    if (!horas || horas < 4) return 'valor-vermelho';
    if (horas < 8) return 'valor-amarelo';
    if (horas === 8) return 'valor-verde';
    if (horas > 8) return 'valor-azul';
    return '';
  }

  formatTooltip(dia: any): string {
    if (!dia.agendas.length) return 'Sem agenda';

    return dia.agendas
      .map((a: any) => `${a.cliente} (${a.start_time} - ${a.end_time})`)
      .join('\n');
  }
}
