// financial-indicators.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FinancialIndicatorsService {

  constructor() {}

  // Indicadores principais
  getIndicadores() {
    return {
      totalAgendasConcluidas: 120,
      receitaEstimada: 45000,
      taxaAprovacaoRelatorios: 87,
      percentualPendencias: 20 // % de agendas não aprovadas pelo TechLead
    };
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
