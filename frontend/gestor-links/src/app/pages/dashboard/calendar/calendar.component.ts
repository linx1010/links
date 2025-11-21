// calendar.component.ts
// Componente standalone Angular + Angular Material
// Reescrito completo, com upload de relatórios integrado e comentários linha a linha.

import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Angular Material modules usados no template
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// Serviços (assumidos existentes)
import { CalendarService } from './calendar.service';
import { RecursosService } from '../recursos/recursos.service';

@Component({
  selector: 'app-calendar',
  templateUrl: 'calendar.component.html',
  standalone: true,
  // Importa módulos necessários para o template funcionar
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
    MatTooltipModule
  ],
  providers: [DatePipe], // DatePipe pode ser injetado se necessário
  styleUrls: ['calendar.component.scss']
})
export class CalendarComponent {
  // ---------------------------
  // Formulário para criação de novo evento (mantido do seu código)
  // ---------------------------
  formEvento = {
    title: '',
    description: '',
    user_id: [] as number[]
  };

  // lista de recursos/usuários para seleção
  recursos: any[] = [];

  // data atual do calendário (usada para navegar entre meses)
  currentDate = new Date();

  // estrutura com os dias do mês (cada item tem { day, events })
  days: any[] = [];

  // eventos agrupados por 'YYYY-MM-DD' (preenchido ao carregar a agenda)
  events: { [key: string]: any[] } = {};

  // indica se a agenda é do tipo 'client' ou 'user' (gerado pela rota)
  tipo: string = '';

  // id da agenda (cliente ou usuário) fornecido pela rota
  id: number = 0;

  // dia selecionado para exibir detalhes (ex: { day: 5, events: [...] })
  selectedDay: { day: number, events: any[] } | null = null;

  // nome exibido na página da agenda (capturado do sessionStorage)
  nomeAgenda: string = '';

  // ---------- Upload related ----------
  // evento para o qual o upload está sendo feito (quando abrir o painel de upload)
  eventoUpload: any = null;

  // arquivo selecionado pelo usuário (File)
  arquivoSelecionado: File | null = null;

  // notas opcionais para o upload
  uploadNotes: string = '';

  // flag de upload em andamento
  uploading: boolean = false;

  // progresso do upload (0..100) - simples indicador visual
  uploadProgress: number = 0;

  // lista de relatórios carregados para o dia/agenda selecionada
  relatorios: any[] = [];

  // flag simples para saber se o usuário autênticado é tech lead
  // (você deverá definir essa regra via backend / session)
  isTechLead: boolean = false;

  // variáveis relacionadas ao painel de relatórios (para abrir/fechar)
  relatorioEvento: any = null;
  mostrarRelatorios: boolean = false;

  // ---------------------------
  // Construtor: injeta serviços e ferramentas
  // ---------------------------
  constructor(
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private recursosService: RecursosService,
    private router: Router
  ) {}

  // ---------------------------
  // ciclo de vida: onInit
  // ---------------------------
  ngOnInit() {
    // pega tipo/id da rota (conforme sua rota '/dashboard/calendar/:tipo/:id')
    this.tipo = this.route.snapshot.paramMap.get('tipo') || 'user';
    this.id = +this.route.snapshot.paramMap.get('id')! || 0;

    // pega o nome da agenda salvo na sessão (caso exista)
    this.nomeAgenda = sessionStorage.getItem('nameOrig') || 'Agenda';

    // determinar se o usuário atual é tech lead (exemplo simples usando session)
    // ideal: validar via backend (payload do token / endpoint)
    const roles = sessionStorage.getItem('roles') || '';
    this.isTechLead = roles.split(',').includes('tech_lead');

    // carrega agenda e recursos
    this.carregarAgenda();
  }

  // ---------------------------
  // Navegação do calendário
  // ---------------------------
  prevMonth() {
    // decrementa mês atual e recarrega a agenda
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.currentDate = new Date(year, month - 1, 1);
    this.carregarAgenda();
  }

  nextMonth() {
    // incrementa mês atual e recarrega a agenda
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.currentDate = new Date(year, month + 1, 1);
    this.carregarAgenda();
  }

  // ---------------------------
  // Carrega a agenda do backend e recursos
  // ---------------------------
  carregarAgenda() {
    // chama service que retorna todos os eventos (deveria ser seu endpoint atual)
    this.calendarService.getAgenda(this.tipo, this.id).subscribe({
      next: (agenda: any[]) => {
        // limpa estruturas
        this.events = {};

        // organiza eventos por data (YYYY-MM-DD)
        agenda.forEach(evento => {
          if (!evento.start_time) return;
          const dateKey = this.formatDateKey(evento.start_time);

          if (!this.events[dateKey]) this.events[dateKey] = [];
          this.events[dateKey].push(evento);
        });

        // gera grid do mês com base em currentDate e eventos
        this.generateCalendar();
      },
      // tipagem explícita no handler de erro
      error: (err: any) => {
        console.error('Erro ao carregar agenda:', err);
      }
    });

    // carrega lista de recursos (para adicionar eventos/participantes)
    this.recursosService.getUsers().subscribe({
      next: (data: any[]) => {
        this.recursos = data;
      },
      error: (err: any) => {
        console.error('Erro ao carregar recursos:', err);
      }
    });
  }

  // ---------------------------
  // Util: formata 'YYYY-MM-DD' a partir de 'YYYY-MM-DD HH:MM:SS'
  // ---------------------------
  formatDateKey(dateTime: string): string {
    // assume padrão 'YYYY-MM-DD ...' (conforme seu backend)
    return dateTime.split(' ')[0];
  }

  // ---------------------------
  // Gera a lista 'days' para montar a grid do mês
  // ---------------------------
  generateCalendar() {
    this.days = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // espaços vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      this.days.push({ day: null });
    }

    // para cada dia do mês, adiciona objeto com eventos (se houver)
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.days.push({
        day,
        events: this.events[dateKey] || []
      });
    }
  }

  // ---------------------------
  // Ao clicar em um dia da grid -> seleciona para mostrar detalhes
  // ---------------------------
  onDayClick(day: any) {
    if (day.day) {
      this.selectedDay = day;
    }
  }

  // ---------------------------
  // FUNÇÕES de eventos (visualizar / concluir / excluir)
  // ---------------------------
  visualizarEvento(e: any) {
    // exibe um modal simples (alert) com detalhes e carrega relatórios do evento
    alert(`📋 Detalhes do evento:
      \nTítulo: ${e.title}
      \nData: ${e.start_time}
      \nStatus: ${e.status}
      \nLocal: ${e.location || 'N/A'}`);

    // carrega relatórios existentes para o evento selecionado
    this.carregarRelatorios(e);
  }

  concluirEvento(e: any) {
    // alterna status local e chama backend para atualizar (usando calendarService)
    const newStatus = e.status === 'completed' ? 'open' : 'completed';
    // atualiza visualmente (só após retorno idealmente)
    e.status = newStatus;

    // chama backend (método existente no seu service deve mapear)
    this.calendarService.completeAgenda(e).subscribe({
      next: () => {
        this.carregarAgenda();
      },
      error: (err: any) => {
        console.error('Erro ao concluir agenda:', err);
      }
    });
  }

  excluirEvento(e: any) {
    // aqui chama backend para excluir evento
    if (confirm(`🗑️ Deseja excluir o evento "${e.title}"?`)) {
      this.calendarService.deleteEvento('client', this.id, this.formatDateKey(e.start_time), e.title).subscribe({
        next: () => this.carregarAgenda(),
        error: (err: any) => console.error('Erro ao excluir evento:', err)
      });
    }
  }

  // ---------------------------
  // ---------- UPLOAD ----------
  // ---------------------------

  abrirUpload(evento: any) {
    // atribui o evento no qual o usuário abrir o painel de upload
    this.eventoUpload = evento;
    this.arquivoSelecionado = null;
    this.uploadNotes = '';
    this.relatorios = []; // limpa relatórios exibidos
    // carrega relatórios já enviados para esse evento/dia (se houver)
    this.carregarRelatorios(evento);
  }

  cancelarUpload() {
    // limpa variáveis relacionadas ao upload e fecha painel
    this.eventoUpload = null;
    this.arquivoSelecionado = null;
    this.uploadNotes = '';
    this.uploading = false;
    this.uploadProgress = 0;
  }

  selecionarArquivo(ev: any) {
    // pega o primeiro arquivo selecionado no input
    this.arquivoSelecionado = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
  }

  enviarArquivo() {
    // validações básicas
    if (!this.eventoUpload || !this.arquivoSelecionado) {
      alert('Selecione um evento e um arquivo antes de enviar.');
      return;
    }

    // ler arquivo como base64 para enviar via payload (simples)
    const reader = new FileReader();
    reader.onload = () => {
      // result vem no formato "data:tipo;base64,AAAA..."
      const base64 = (reader.result as string).split(',')[1];

      // constrói payload conforme handlers backend que sugeri
      const payload = {
        action: 'upload_report',                     // ação RPC / API
        organization_id: Number(sessionStorage.getItem('organizationId')) || 1, // opcional
        schedule_id: this.eventoUpload.id,           // id do schedule/evento
        user_id: Number(sessionStorage.getItem('userId')) || 0, // id do usuário atual
        report_date: this.formatDateKey(this.eventoUpload.start_time), // data do relatório
        file_name: this.arquivoSelecionado!.name,
        mime_type: this.arquivoSelecionado!.type,
        file_base64: base64,
        notes: this.uploadNotes
      };

      // inicia indicadores visuais
      this.uploading = true;
      this.uploadProgress = 10;

      // chama o service que faz o POST / RPC (integre com seu consumer_rpc)
      this.calendarService.uploadRelatorio(payload).subscribe({
        next: (res: any) => {
          // sucesso: atualiza UI, recarrega relatórios e limpa painel
          this.uploadProgress = 100;
          setTimeout(() => {
            this.uploading = false;
            this.uploadProgress = 0;
            alert('Relatório enviado com sucesso!');
            this.eventoUpload = null;
            // recarrega agenda para ver possíveis mudanças de status
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

    // inicia leitura do file como dataURL
    reader.readAsDataURL(this.arquivoSelecionado);
  }

  // ---------------------------
  // Relatórios: carregar / baixar / aprovar
  // ---------------------------

  carregarRelatorios(evento: any) {
    // monta payload e chama backend via service
    const date = this.formatDateKey(evento.start_time);
    this.calendarService.getRelatorios(evento.id, date).subscribe({
      next: (data: any) => {
        // armazena lista de relatórios obtida do backend
        this.relatorios = data.reports || [];
      },
      error: (err: any) => {
        console.error('Erro ao carregar relatórios:', err);
        this.relatorios = [];
      }
    });
  }

  baixarRelatorio(r: any) {
    // chama backend para obter base64 do arquivo e inicia download no browser
    this.calendarService.downloadRelatorio(r.id).subscribe({
      next: (res: any) => {
        if (!res || !res.file_base64) {
          alert('Arquivo não encontrado no servidor.');
          return;
        }

        // res.file_base64 é string base64, res.mime_type, res.file_name
        const b64 = res.file_base64;
        const mime = res.mime_type || 'application/octet-stream';
        const filename = res.file_name || 'relatorio.bin';

        // converte base64 para blob e cria link de download
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
    // guarda o evento atual e abre painel de relatórios
    this.relatorioEvento = evento;
    this.mostrarRelatorios = true;
    this.carregarRelatorios(evento);
  }

  aprovarRelatorio(r: any, aprovar: boolean) {
    // payload para aprovar/rejeitar
    const payload = {
      action: 'approve_report',
      report_id: r.id,
      approve: aprovar
    };

    // chama backend (o CalendarService deve mapear isso)
    this.calendarService.approveReport(payload).subscribe({
      next: (res: any) => {
        alert(`Relatório ${aprovar ? 'aprovado' : 'rejeitado'} com sucesso.`);
        // recarregar relatórios para atualizar status
        if (this.eventoUpload) {
          // se estiver visualizando painel de upload, recarrega os relatórios
          this.carregarRelatorios(this.eventoUpload);
        } else if (this.relatorioEvento) {
          // se estiver no painel de relatórios, recarrega
          this.carregarRelatorios(this.relatorioEvento);
        } else {
          // tentar recarregar agenda para refletir mudança
          this.carregarAgenda();
        }
      },
      error: (err: any) => {
        console.error('Erro ao aprovar/rejeitar:', err);
        alert('Erro ao processar aprovação.');
      }
    });
  }

  // ---------------------------
  // Criação de novo evento via formulário (mantido)
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
        if (diaAtualizado) {
          this.selectedDay = diaAtualizado;
        }
      },
      error: (err: any) => {
        console.error('Erro ao criar agenda:', err);
      }
    });

    this.formEvento = { title: '', description: '', user_id: [] };
  }

  // ---------------------------
  // Navegar para página anterior (usa sessionStorage)
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
