// calendar.component.ts
import { Component, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { CalendarService } from './calendar.service';
import { RecursosService } from '../recursos/recursos.service';

@Component({
  selector: 'app-calendar',
  templateUrl: 'calendar.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  providers: [DatePipe],
  styleUrls: ['calendar.component.scss']
})
export class CalendarComponent {
  // ---------------------------
  // Variáveis principais
  // ---------------------------
  /** Formulário do evento (título, descrição e usuários) */
  formEvento = { title: '', description: '', user_id: [] as number[] };

  /** Lista de recursos carregada do backend */
  recursos: any[] = [];

  /** Data base exibida no cabeçalho do calendário */
  currentDate = new Date();

  /** Grade de dias do mês atual */
  days: any[] = [];

  /** Mapa de eventos por chave yyyy-mm-dd */
  events: { [key: string]: any[] } = {};

  /** Tipo da agenda (client | user) recebido pela rota */
  tipo: string = '';

  /** Id da agenda (cliente ou usuário) recebido pela rota */
  id: number = 0;

  /** Dia selecionado na grade para exibir detalhes */
  selectedDay: { day: number, events: any[] } | null = null;

  /** Nome da agenda exibido no topo */
  nomeAgenda: string = '';

  /** Flag se usuário é tech lead (via session roles) */
  isTechLead: boolean = false;

  // ---------------------------
  // Upload de relatórios
  // ---------------------------
  eventoUpload: any = null;
  arquivoSelecionado: File | null = null;
  uploadNotes: string = '';
  uploading: boolean = false;
  uploadProgress: number = 0;
  relatorios: any[] = [];

  // ---------------------------
  // Painel de relatórios para tech lead
  // ---------------------------
  relatorioEvento: any = null;
  mostrarRelatorios: boolean = false;

  // ---------------------------
  // Dialog de replicação em bloco
  // ---------------------------
  dataInicial: string = '';
  replicarMes: boolean = false;

  /** TemplateRef do dialog definido no HTML */
  @ViewChild('dialogReplicacao') dialogReplicacaoTemplate!: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private recursosService: RecursosService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  // ---------------------------
  // Ciclo de vida
  // ---------------------------
  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') || 'user';
    this.id = +this.route.snapshot.paramMap.get('id')! || 0;
    this.nomeAgenda = sessionStorage.getItem('nameOrig') || 'Agenda';

    const roles = (sessionStorage.getItem('roles') || '').split(',');
    this.isTechLead = roles.includes('tech_lead');

    this.carregarAgenda();
  }

  // ---------------------------
  // Navegação do calendário
  // ---------------------------
  prevMonth() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.currentDate = new Date(year, month - 1, 1);
    this.carregarAgenda();
  }

  nextMonth() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.currentDate = new Date(year, month + 1, 1);
    this.carregarAgenda();
  }

  // ---------------------------
  // Carga de dados
  // ---------------------------
  carregarAgenda() {
    this.calendarService.getAgenda(this.tipo, this.id).subscribe({
      next: (agenda: any[]) => {
        this.events = {};
        agenda.forEach(evento => {
          if (!evento.start_time) return;
          const dateKey = this.formatDateKey(evento.start_time);
          if (!this.events[dateKey]) this.events[dateKey] = [];
          this.events[dateKey].push(evento);
        });
        this.generateCalendar();
      },
      error: (err: any) => console.error('Erro ao carregar agenda:', err)
    });

    this.recursosService.getUsers().subscribe({
      next: (data: any[]) => this.recursos = data,
      error: (err: any) => console.error('Erro ao carregar recursos:', err)
    });
  }

  // ---------------------------
  // Utilitários de data
  // ---------------------------
  formatDateKey(dateTime: string): string {
    return dateTime.split(' ')[0]; // assume "YYYY-MM-DD HH:mm:ss"
  }

  generateCalendar() {
    this.days = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) this.days.push({ day: null });

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.days.push({ day, events: this.events[dateKey] || [] });
    }
  }

  onDayClick(day: any) {
    if (day.day) this.selectedDay = day;
  }

  // ---------------------------
  // Ações de eventos
  // ---------------------------
  visualizarEvento(e: any) {
    alert(`📋 Detalhes do evento:
Título: ${e.title}
Data: ${e.start_time}
Status: ${e.status}
Local: ${e.location || 'N/A'}`);
    this.carregarRelatorios(e);
  }

  concluirEvento(e: any) {
    const newStatus = e.status === 'completed' ? 'open' : 'completed';
    e.status = newStatus;
    this.calendarService.completeAgenda(e).subscribe({
      next: () => this.carregarAgenda(),
      error: (err: any) => console.error('Erro ao concluir agenda:', err)
    });
  }

  excluirEvento(e: any) {
    if (confirm(`🗑️ Deseja excluir o evento "${e.title}"?`)) {
      this.calendarService.deleteEvento('client', this.id, this.formatDateKey(e.start_time), e.title).subscribe({
        next: () => this.carregarAgenda(),
        error: (err: any) => console.error('Erro ao excluir evento:', err)
      });
    }
  }

  // ---------------------------
  // Upload de relatórios
  // ---------------------------
  abrirUpload(evento: any) {
    this.eventoUpload = evento;
    this.arquivoSelecionado = null;
    this.uploadNotes = '';
    this.relatorios = [];
    this.carregarRelatorios(evento);
  }

  cancelarUpload() {
    this.eventoUpload = null;
    this.arquivoSelecionado = null;
    this.uploadNotes = '';
    this.uploading = false;
    this.uploadProgress = 0;
  }

  selecionarArquivo(ev: any) {
    this.arquivoSelecionado = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
  }

  enviarArquivo() {
    if (!this.eventoUpload || !this.arquivoSelecionado) {
      alert('Selecione um evento e um arquivo antes de enviar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];

      const payload = {
        action: 'upload_report',
        organization_id: Number(sessionStorage.getItem('organizationId')) || 1,
        schedule_id: this.eventoUpload.id,
        user_id: Number(sessionStorage.getItem('userId')) || 0,
        report_date: this.formatDateKey(this.eventoUpload.start_time),
        file_name: this.arquivoSelecionado!.name,
        mime_type: this.arquivoSelecionado!.type,
        file_base64: base64,
        notes: this.uploadNotes
      };

      this.uploading = true;
      this.uploadProgress = 10;

      this.calendarService.uploadRelatorio(payload).subscribe({
        next: () => {
          this.uploadProgress = 100;
          setTimeout(() => {
            this.uploading = false;
            this.uploadProgress = 0;
            alert('Relatório enviado com sucesso!');
            this.eventoUpload = null;
            this.carregarAgenda();
          }, 300);
        },
        error: (err: any) => {
          console.error('Erro ao enviar relatório:', err);
          this.uploading = false;
          this.uploadProgress = 0;
          alert('Erro ao enviar relatório.');
        }
      });
    };

    reader.readAsDataURL(this.arquivoSelecionado);
  }

  // ---------------------------
  // Relatórios (carregar, baixar, aprovar)
  // ---------------------------
  carregarRelatorios(evento: any) {
    const date = this.formatDateKey(evento.start_time);
    this.calendarService.getRelatorios(evento.id, date).subscribe({
      next: (data: any) => {
        this.relatorios = data.reports || [];
      },
      error: (err: any) => {
        console.error('Erro ao carregar relatórios:', err);
        this.relatorios = [];
      }
    });
  }

  baixarRelatorio(r: any) {
    this.calendarService.downloadRelatorio(r.id).subscribe({
      next: (res: any) => {
        if (!res || !res.file_base64) {
          alert('Arquivo não encontrado no servidor.');
          return;
        }
        const b64 = res.file_base64;
        const mime = res.mime_type || 'application/octet-stream';
        const filename = res.file_name || 'relatorio.bin';

        const byteCharacters = atob(b64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Erro ao baixar relatório:', err);
        alert('Erro ao baixar relatório.');
      }
    });
  }

  abrirRelatorios(evento: any) {
    this.relatorioEvento = evento;
    this.mostrarRelatorios = true;
    this.carregarRelatorios(evento);
  }

  aprovarRelatorio(r: any, aprovar: boolean) {
    const payload = {
      action: 'approve_report',
      report_id: r.id,
      approve: aprovar
    };

    this.calendarService.approveReport(payload).subscribe({
      next: () => {
        alert(`Relatório ${aprovar ? 'aprovado' : 'rejeitado'} com sucesso.`);
        if (this.eventoUpload) {
          this.carregarRelatorios(this.eventoUpload);
        } else if (this.relatorioEvento) {
          this.carregarRelatorios(this.relatorioEvento);
        } else {
          this.carregarAgenda();
        }
      },
      error: (err: any) => {
        console.error('Erro ao processar aprovação:', err);
        alert('Erro ao processar aprovação.');
      }
    });
  }

  // ---------------------------
  // Criação de evento único via formulário
  // ---------------------------
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
        const diaAtualizado = this.days.find(d => d.day === day);
        if (diaAtualizado) this.selectedDay = diaAtualizado;
      },
      error: (err: any) => console.error('Erro ao criar agenda:', err)
    });

    this.formEvento = { title: '', description: '', user_id: [] };
  }

  // ---------------------------
  // Dialog de replicação em bloco
  // ---------------------------
  abrirDialogReplicacao() {
    if (!this.dialogReplicacaoTemplate) {
      alert('Template do diálogo não encontrado.');
      return;
    }
    // Pré-popula data inicial com hoje
    const hoje = new Date();
    this.dataInicial = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    this.replicarMes = true;

    this.dialog.open(this.dialogReplicacaoTemplate);
  }

  confirmarReplicacao() {
    if (!this.formEvento.title.trim() || !this.dataInicial) {
      alert('Preencha título e data inicial.');
      return;
    }

    const startDate = new Date(this.dataInicial);
    const diasUteis = this.replicarMes ? this.getDiasUteis(startDate) : [this.dataInicial];

    const payload = {
      type: 'client',
      id: this.id,
      title: this.formEvento.title,
      description: this.formEvento.description,
      user_id: this.formEvento.user_id,
      dates: diasUteis
    };

    this.calendarService.createAgendaBatch(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          alert('Agendas criadas com sucesso!');
          this.carregarAgenda();
        } else {
          alert('Erro ao criar agendas: ' + (res?.error || ''));
        }
      },
      error: (err: any) => {
        console.error('Erro ao replicar agendas:', err);
        alert('Erro ao replicar agendas.');
      }
    });

    // Fecha todos os dialogs abertos
    this.dialog.closeAll();
  }

  // ---------------------------
  // Util: gerar dias úteis até fim do mês
  // ---------------------------
  getDiasUteis(start: Date): string[] {
    const dias: string[] = [];
    const today = new Date();
    const year = start.getFullYear();
    const month = start.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let d = start.getDate(); d <= lastDay; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay(); // 0-dom, 1-seg, ..., 6-sáb
      if (date >= new Date(today.getFullYear(), today.getMonth(), today.getDate()) && dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dias.push(dateStr);
      }
    }
    return dias;
  }

  // ---------------------------
  // Navegar para página anterior
  // ---------------------------
  voltar(): void {
    const pageOrig = sessionStorage.getItem('pageOrig');
    if (pageOrig) {
      this.router.navigate(['/dashboard', pageOrig]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
