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
      tempoMedioExecucao: 75 // minutos
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
}
