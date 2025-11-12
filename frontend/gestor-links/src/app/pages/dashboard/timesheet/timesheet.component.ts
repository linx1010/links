import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule,
  FormsModule,
  MatButtonModule,
  MatInputModule,
  MatTableModule,
  MatIconModule],
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  userId!: number;
  userName = '';
  weekStartDate = '';
  loading = false;

  diasDaSemana = [
    { key: 'mon', label: 'Seg' },
    { key: 'tue', label: 'Ter' },
    { key: 'wed', label: 'Qua' },
    { key: 'thu', label: 'Qui' },
    { key: 'fri', label: 'Sex' },
    { key: 'sat', label: 'Sáb' },
    { key: 'sun', label: 'Dom' }
  ];

  timeEntries: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.userName = sessionStorage.getItem('timesheetUserName') || 'Usuário';
    this.weekStartDate = this.getCurrentWeekStart();
    this.carregarMock();
  }

  getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  carregarMock(): void {
    this.timeEntries = [
      {
        project_name: 'Projeto Alpha',
        task_name: 'Design UI',
        horas: { mon: 2, tue: 3, wed: 4, thu: 0, fri: 2, sat: 0, sun: 0 }
      },
      {
        project_name: 'Projeto Beta',
        task_name: 'API Integração',
        horas: { mon: 1, tue: 2, wed: 2, thu: 3, fri: 1, sat: 0, sun: 0 }
      }
    ];
  }

  salvar(): void {
    console.log('Timesheet salvo:', this.timeEntries);
    alert('Mock: Timesheet salvo com sucesso!');
  }

  voltar(): void {
    this.router.navigate(['/dashboard/recursos']);
  }
}
