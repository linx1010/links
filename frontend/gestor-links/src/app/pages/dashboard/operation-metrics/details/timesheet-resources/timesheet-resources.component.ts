import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TimesheetResourcesService } from './timesheet-resources.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';


@Component({
  selector: 'app-timesheet-resources',
  templateUrl: './timesheet-resources.component.html',
  styleUrls: ['./timesheet-resources.component.scss'],
  standalone: true,
  imports: [
  CommonModule,
  MatExpansionModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatTableModule
]

})
export class TimesheetResourcesComponent implements OnInit {

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);

  dias: number[] = [];

  mesAtual = new Date().getMonth() + 1; // 1–12
  anoAtual = new Date().getFullYear();

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private service: TimesheetResourcesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarMes();
  }

  carregarMes() {
    this.service.getTimesheet(this.mesAtual, this.anoAtual).subscribe(res => {

      // pega a quantidade real de dias do mês
      if (res.recursos.length > 0) {
        this.dias = res.recursos[0].dias.map((d: any) => d.dia);
      } else {
        this.dias = [];
      }

      const tabela = res.recursos.map((r: any) => this.transformarRecurso(r));

      this.dataSource = new MatTableDataSource(tabela);

      this.displayedColumns = [
        'nome',
        ...this.dias.map(d => 'd' + d),
        'totalPend',
        'totalConc',
        'totalHoras'
      ];
    });
  }


  transformarRecurso(recurso: any) {
    const linha: any = { nome: recurso.nome, diasOriginais: {} };

    let totalPend = 0;
    let totalConc = 0;
    let totalHoras = 0;

    recurso.dias.forEach((d: any) => {
      linha['d' + d.dia] = d.horas || '';
      linha.diasOriginais['d' + d.dia] = d; // <--- guardamos o dia original

      totalPend += d.pendente || 0;
      totalConc += d.concluido || 0;
      totalHoras += d.horas || 0;
    });

    linha.totalPend = totalPend;
    linha.totalConc = totalConc;
    linha.totalHoras = totalHoras;

    return linha;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  mesAnterior() {
    this.mesAtual--;
    if (this.mesAtual < 1) {
      this.mesAtual = 12;
      this.anoAtual--;
    }
    this.carregarMes();
  }

  proximoMes() {
    this.mesAtual++;
    if (this.mesAtual > 12) {
      this.mesAtual = 1;
      this.anoAtual++;
    }
    this.carregarMes();
  }

  voltar() {
    this.router.navigate(['/dashboard/operation-metrics']);
  }
  getColorClass(horas: number | null): string {
  if (!horas || horas < 4) return 'valor-vermelho';
  if (horas < 8) return 'valor-amarelo';
  if (horas === 8) return 'valor-verde';
  if (horas > 8) return 'valor-azul';
  return '';
}

formatTooltip(dia: any): string {
  if (!dia || !dia.agendas || dia.agendas.length === 0) {
    return 'Sem agenda';
  }

  return dia.agendas
    .map((a: any) => `${a.cliente} (${a.start_time} - ${a.end_time})`)
    .join('\n'); // quebra de linha
}

}
