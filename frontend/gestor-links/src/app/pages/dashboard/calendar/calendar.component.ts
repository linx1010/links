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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

import { CalendarService } from './calendar.service';
import { RecursosService } from '../recursos/recursos.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastService } from '../../../shared/toast.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { error } from 'console';

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
    MatDialogModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDatepickerModule
  ],
  providers: [DatePipe,provideNativeDateAdapter()],
  styleUrls: ['calendar.component.scss']
})
export class CalendarComponent {
  // ---------------------------
  // Variáveis principais
  // ---------------------------
  /** Formulário do evento (título, descrição e usuários) */
  formEvento = { 
    title: '', 
    description: '', 
    user_id: [] as number[], 
    turno: 'integral' as 'manha' | 'tarde' | 'integral' // novo campo
  };


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
  isAdmin: boolean = false;
  canCreateAgenda = false;

  // ---------------------------
  // Upload de relatórios
  // ---------------------------
  eventoUpload: any = null;
  arquivoSelecionado: File | null = null;
  uploadNotes: string = '';
  uploading: boolean = false;
  uploadProgress: number = 0;
  relatorios: any[] = [];
  displayedColumns: string[] = [];

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
    private dialog: MatDialog,
    private toast:ToastService,
  ) {}
  // ---------------------------
  // Ciclo de vida
  // ---------------------------
  ngOnInit() {
   this.tipo = this.route.snapshot.paramMap.get('tipo') || 'user';
    this.id = +this.route.snapshot.paramMap.get('id')! || 0;
    this.nomeAgenda = sessionStorage.getItem('nameOrig') || 'Agenda';

    const roles = (sessionStorage.getItem('roles') || '').split(',');
    this.isTechLead = roles.some(r => r === 'tech_lead');
    this.isAdmin = roles.some(r => r === 'admin');
    this.canCreateAgenda = this.tipo === 'client' || this.isTechLead || this.isAdmin;
    // Definir colunas da tabela conforme tipo
    if (this.tipo === 'user') {
      this.displayedColumns = ['client_name','title','start_time','end_time','location','actions'];
    } else {
      this.displayedColumns = ['techlead_name','title','start_time','end_time','location','actions'];
    }

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
  const year = this.currentDate.getFullYear(); const month = this.currentDate.getMonth() + 1; // mês começa em 0
  
  this.calendarService.getAgenda(this.tipo, this.id, year, month).subscribe({    next: (agenda: any[]) => {
      // 1. Monta o mapa de eventos por chave YYYY-MM-DD
      this.events = {};
      agenda.forEach(evento => {
        if (!evento.start_time) return;
        const dateKey = this.formatDateKey(evento.start_time);
        if (!this.events[dateKey]) this.events[dateKey] = [];
        this.events[dateKey].push(evento);
      });

      // 2. Gera a grade do calendário
      this.generateCalendar();

      // 3. Se houver um dia selecionado, atualiza os detalhes também
      if (this.selectedDay) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // monta chave no formato YYYY-MM-DD
        const selectedDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(this.selectedDay.day).padStart(2, '0')}`;

        const eventosDoDia = this.events[selectedDateKey] || [];
        this.selectedDay = { day: this.selectedDay.day, events: eventosDoDia };
      }
    },
    error: (err: any) => this.toast.show(`Erro ao carregar agenda: ${err}`, 'error')
  });

  // 4. Carrega recursos (usuários) para seleção
  this.recursosService.getUsers().subscribe({
    next: (data: any[]) => this.recursos = data,
    error: (err: any) => this.toast.show(`Erro ao carregar recursos: ${err}`, 'error')
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
      error: (err: any) => this.toast.show(`Erro ao concluir agenda: ${err}`,'error')
    });
  }

excluirEvento(e: any) {
  if (confirm(`🗑️ Deseja excluir o evento "${e.title}"?`)) {
    this.calendarService.deleteEvento(e.id).subscribe({
      next: () => this.carregarAgenda(),
      error: (err: any) => this.toast.show(`Erro ao excluir evento: ${err}`, 'error')
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
    const file = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;

    if (file) {
      // valida pelo MIME type
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        this.arquivoSelecionado = file;
      } else {
        this.arquivoSelecionado = null;
        this.toast.show('Somente arquivos PDF são permitidos.', 'error');
        ev.target.value = ''; // limpa o input
      }
    } else {
      this.arquivoSelecionado = null;
    }
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
        user_id: Number(localStorage.getItem('userId')) || 0,
        report_date: this.formatDateKey(this.eventoUpload.start_time),
        file_name: this.arquivoSelecionado!.name,
        mime_type: this.arquivoSelecionado!.type,
        file_base64: base64,
        notes: this.uploadNotes
      };
      this.uploading = true;
      this.uploadProgress = 10;

      this.calendarService.uploadRelatorio(payload).subscribe({
        next: (res: any) => {
          // ✅ Trata sucesso/erro conforme backend
          if (res && res.status === true) {
            this.uploadProgress = 100;
            setTimeout(() => {
              this.uploading = false;
              this.uploadProgress = 0;
              this.toast.show('Relatório enviado com sucesso!', 'sucess');
              this.eventoUpload = null;
              this.carregarAgenda();
            }, 300);
          } else {
            // ❌ Falha lógica do backend (status=false)
            this.uploading = false;
            this.uploadProgress = 0;
            const msg = (res && res.message) ? res.message : 'Falha ao enviar relatório.';
            this.toast.show(`Erro no upload: ${msg}`, 'error');

          }
        },
        error: (err: any) => {
          // ❌ Erro HTTP ou exceção
          this.toast.show(`Erro ao enviar relatório: ${err}`,'error')
          this.uploading = false;
          this.uploadProgress = 0;
          const msg = err?.error?.message || 'Erro ao enviar relatório.';
          this.toast.show(msg,'error');
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
        this.toast.show(`Erro ao carregar relatórios: ${err}`,'error')
        this.relatorios = [];
      }
    });
  }

  baixarRelatorio(r: any) {
    this.calendarService.downloadRelatorio(r.id).subscribe({
      next: (res: any) => {
        if (!res || !res.file_base64) {
          this.toast.show('Arquivo não encontrado no servidor.','error');
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
        this.toast.show(`Erro ao baixar relatório: ${err}`,'error')
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
        this.toast.show(`Relatório ${aprovar ? 'aprovado' : 'rejeitado'} com sucesso.`,'sucess');
        if (this.eventoUpload) {
          this.carregarRelatorios(this.eventoUpload);
        } else if (this.relatorioEvento) {
          this.carregarRelatorios(this.relatorioEvento);
        } else {
          this.carregarAgenda();
        }
      },
      error: (err: any) => {
        this.toast.show(`Erro ao processar aprovação: ${err}`,'error')
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


  // Definir horários conforme turno
    let start_time: string | null = null;
    let end_time: string | null = null;
    switch (this.formEvento.turno) {
      case 'manha':
        start_time = `${date}T08:00:00`;
        end_time   = `${date}T12:00:00`;
        break;
      case 'tarde':
        start_time = `${date}T13:00:00`;
        end_time   = `${date}T17:00:00`;
        break;
      case 'integral':
        start_time = `${date}T09:00:00`;
        end_time   = `${date}T18:00:00`;
        break;
  }

    const payload = {
      type: this.tipo,
      id: this.id,
      date,
      title: this.formEvento.title,
      description: this.formEvento.description,
      user_id: this.formEvento.user_id,
      lead_id: localStorage.getItem('userId'),
      start_time,
      end_time 
    };

    this.calendarService.createAgenda(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          // sucesso → atualiza agenda normalmente
          this.carregarAgenda();
          const diaAtualizado = this.days.find(d => d.day === day);
          if (diaAtualizado) this.selectedDay = diaAtualizado;
          this.toast.show('Agenda criada com sucesso!', 'sucess');
        } else {
          // falha → montar mensagem usando nome do usuário
          let mensagem = res.error;
          if (res.user_id) {
            const usuario = this.recursos.find(r => r.id === res.user_id);
            console.log(res)
            console.log(this.recursos)
            if (usuario) {
              mensagem = `Usuário ${usuario.name} já possui 2 agendas neste dia.`;
            }
          }
          this.toast.show(mensagem, 'error');
        }
      },
      error: (err: any) => {
        this.toast.show(`Erro ao criar agenda: ${err}`, 'error');
      }
    });


    this.formEvento = { title: '', description: '', user_id: [],turno: 'integral' as 'manha' | 'tarde' | 'integral' };
  }


  // ---------------------------
  // Dialog de replicação em bloco
  // ---------------------------
  abrirDialogReplicacao(evento: any) {
    if (!this.dialogReplicacaoTemplate) {
      this.toast.show('Template do diálogo não encontrado.','error');
      return;
    }

    // Pré-popula os campos do formulário com os dados da linha selecionada
    this.formEvento.title = evento.title || '';
    this.formEvento.description = evento.description || '';
    this.formEvento.turno = evento.turno || 'integral'; // valor padrão se não vier
    this.formEvento.user_id = evento.participants?.map((p: any) => p.id) || [];


    this.dialog.open(this.dialogReplicacaoTemplate);
  }


  dateRange = { start: null as Date | null, end: null as Date | null };

  confirmarReplicacao() {
    if (!this.formEvento.title.trim() || !this.dateRange.start || !this.dateRange.end) {
      this.toast.show('Preencha título e intervalo de datas.','error');
      return;
    }

    // usa o método para gerar os dias úteis
    const diasUteis = this.getDiasUteisIntervalo(this.dateRange.start, this.dateRange.end);

    const payload = {
      type: 'client',
      id: this.id,
      title: this.formEvento.title,
      description: this.formEvento.description,
      user_id: this.formEvento.user_id,
      dates: diasUteis,
      lead_id: localStorage.getItem('userId')
    };

    this.calendarService.createAgendaBatch(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.toast.show('Agendas criadas com sucesso!', 'sucess');
          this.carregarAgenda(); // 🔎 atualiza grade e detalhes
        } else {
          this.toast.show('Erro ao criar agendas: ' + (res?.error || ''), 'error');
        }
      },
      error: (err: any) => {
        this.toast.show(`Erro ao replicar agendas: ${err}`, 'error');
      }
    });

    this.dialog.closeAll();
  }


getDiasUteisIntervalo(start: Date, end: Date): string[] {
  const dias: string[] = [];
  let data = new Date(start);
  while (data <= end) {
    const diaSemana = data.getDay(); // 0=domingo, 6=sábado
    if (diaSemana !== 0 && diaSemana !== 6) {
      dias.push(
        `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
      );
    }
    data.setDate(data.getDate() + 1);
  }
  return dias;
}




  // ---------------------------
  // Util: gerar dias úteis até fim do mês
  // ---------------------------
  getDiasUteis(start: Date, end?: Date): string[] {
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
