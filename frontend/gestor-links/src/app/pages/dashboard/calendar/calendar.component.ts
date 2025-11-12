import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute,Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CalendarService } from './calendar.service';
import {  MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RecursosService } from '../recursos/recursos.service';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';





@Component({
  selector: 'app-root',
  templateUrl: 'calendar.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe, 
    FormsModule, 
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatTooltipModule
  ],
  styleUrls: ['calendar.component.scss']
})

export class CalendarComponent {
  formEvento = {
  title: '',
  description: '',
  user_id: [] as number[]
};

  recursos: any[] = []; // Lista de usuários disponíveis
  currentDate = new Date(); //  Data atual usada para navegação mensal
  days: any[] = [];         //  Dias do mês com eventos agrupados
  events: { [key: string]: any[] } = {}; //  Eventos agrupados por data (YYYY-MM-DD)

  tipo: string = '';        //  Tipo da agenda ('client' ou 'user')
  id: number = 0;           //  ID do cliente ou usuário
  selectedDay: { day: number, events: any[] } | null = null; // 📌 Dia selecionado para exibir detalhes
  newEvent: string = '';    //  Título do novo evento
  nomeAgenda: string = ''; 
  constructor(
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private recursosService: RecursosService,
    private router: Router
  ) {}

  ngOnInit() {
    // 🔄 Captura os parâmetros da rota
    this.tipo = this.route.snapshot.paramMap.get('tipo')!;
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.nomeAgenda = sessionStorage.getItem('nameOrig') || 'Agenda';
    this.carregarAgenda(); // 🚀 Carrega os eventos da agenda
  }
  voltar(): void {
  const pageOrig = sessionStorage.getItem('pageOrig'); // ✅ pega do sessionStorage
  if (pageOrig) {
    this.router.navigate(['/dashboard', pageOrig]);
  } else {
    this.router.navigate(['/dashboard']); // fallback
  }
}

  carregarAgenda() {
    this.calendarService.getAgenda(this.tipo, this.id).subscribe(agenda => {
      this.events = {}; //  Reseta os eventos

      agenda.forEach(evento => {
        if (!evento.start_time) return;
        const dateKey = this.formatDateKey(evento.start_time);

        if (!this.events[dateKey]) this.events[dateKey] = [];
        this.events[dateKey].push(evento); //  Salva o objeto completo
      });

      this.generateCalendar(); //  Gera os dias do mês com eventos
    });
    this.recursosService.getUsers().subscribe({
      next: (data) => {
        this.recursos = data; //  lista de usuários para seleção
      },
      error: (err) => {
        console.error('Erro ao carregar recursos:', err);
      }
    });

  }

  formatDateKey(dateTime: string): string {
    return dateTime.split(' ')[0]; // 🔧 Extrai apenas a data (YYYY-MM-DD)
  }

  generateCalendar() {
    this.days = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      this.days.push({ day: null }); // 🕳️ Espaços vazios antes do primeiro dia
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.days.push({
        day,
        events: this.events[dateKey] || [] // 📌 Eventos do dia
      });
    }
  }

  prevMonth() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.currentDate = new Date(year, month - 1, 1); // ◀ Mês anterior
    this.carregarAgenda();
  }

  nextMonth() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.currentDate = new Date(year, month + 1, 1); // ▶ Próximo mês
    this.carregarAgenda();
  }

  onDayClick(day: any) {
    if (day.day) {
      this.selectedDay = day; // 📌 Seleciona o dia para exibir detalhes
    }
  }

  
  submitEvento() {
    if (!this.selectedDay || !this.formEvento.title.trim()) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;
    const day = this.selectedDay.day;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const payload = {
      type: 'client',
      id: this.id,
      date,
      title: this.formEvento.title,
      description: this.formEvento.description,
      user_id: this.formEvento.user_id
    };

    this.calendarService.createAgenda(payload).subscribe({
      next: () => {
        this.carregarAgenda();

        // Atualiza a tabela de eventos do dia selecionado
        const diaAtualizado = this.days.find(d => d.day === day);
        if (diaAtualizado) {
          this.selectedDay = diaAtualizado;
        }
      },
      error: (err) => {
        console.error('Erro ao criar agenda:', err);
      }
    });

    this.formEvento = { title: '', description: '', user_id: [] };
  }

  concluirEvento(scheduleId: any) {
    
    scheduleId.status = scheduleId.status === 'completed' ? 'open' : 'completed';
    
    this.calendarService.completeAgenda(scheduleId).subscribe({
      next: () => {
        this.carregarAgenda(); // Atualiza visual
      },
      error: (err) => {
        console.error('Erro ao concluir agenda:', err);
      }
    });
  }

  


  visualizarEvento(e: any) {
    alert(`📋 Detalhes do evento:
      \nTítulo: ${e.title}
      \nData: ${e.start_time}
      \nStatus: ${e.status}
      \nLocal: ${e.location || 'N/A'}`);
  }

  // concluirEvento(e: any) {
  //   alert(`✅ Evento "${e.title}" marcado como concluído.`);
  //   // Aqui você pode implementar lógica para atualizar status no backend
  // }

  excluirEvento(e: any) {
  //   if (confirm(`🗑️ Deseja excluir o evento "${e.title}"?`)) {
  //     this.calendarService.deleteEvento('client', this.id, this.formatDateKey(e.start_time), e.title).subscribe({
  //       next: () => this.carregarAgenda(), // 🔄 Atualiza após exclusão
  //       error: (err) => console.error('Erro ao excluir evento:', err)
  //     });
  //   }
  console.log(e)
   alert(`✅ Evento "${e.title}" marcado para deletar.`);
   }
}
