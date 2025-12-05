
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Tipos do retorno do backend
export interface StatusCounts {
  missing: number;
  pending: number;
  approved: number;
  [key: string]: number; // permite outros status
}

export interface ReceitaUsuarioItem {
  user_id: number;
  name: string;
  contract_type: string;
  total_mes: number;
}

export interface FinancialKpisResponse {
  statusCounts: StatusCounts;
  totalAgendas: number;
  receitaPorUsuario: Record<string, ReceitaUsuarioItem[]>;
  receitaPorMes: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})

export class FinancialIndicatorsService {
  private apiUrl = 'http://localhost:3000'; // ajuste conforme porta do seu server.js

  constructor(private http: HttpClient) {}

  // Indicadores principais
  getIndicadores() {
  return this.http.get<FinancialKpisResponse>(`${this.apiUrl}/financial/kpis`);
}

  // Agendas concluídas por cliente
  getAgendasPorCliente() {
    return [
      { cliente: 'Cliente A', total: 40 },
      { cliente: 'Cliente B', total: 25 },
      { cliente: 'Cliente C', total: 55 }
    ];
  }

  // Agendas concluídas por tipo de atuação
  getAgendasPorTipoAtuacao() {
    return [
      { tipo: 'Consultor', total: 60 },
      { tipo: 'Técnico', total: 40 },
      { tipo: 'Analista', total: 20 }
    ];
  }

  // Agendas concluídas por tipo de recurso
  getAgendasPorTipoRecurso() {
    return [
      { tipo: 'hourly_full', total: 35 },
      { tipo: 'hourly_partial', total: 25 },
      { tipo: 'scope', total: 30 },
      { tipo: 'full_time', total: 20 }
    ];
  }

  // Agendas criadas nos últimos 3 meses (para gráfico stacked)
  getAgendasUltimos3Meses() {
    return [
      { mes: 'Outubro', aprovadas: 30, pendentes: 10 },
      { mes: 'Novembro', aprovadas: 40, pendentes: 15 },
      { mes: 'Dezembro', aprovadas: 50, pendentes: 20 }
    ];
  }
}
