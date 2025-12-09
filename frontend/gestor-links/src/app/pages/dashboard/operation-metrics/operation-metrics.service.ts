import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class OperationMetricsService {

  getTotalWorkforceAllocated(): number {
    return 120; // mock
  }

  getTotalClientAgenda(): number {
    return 95; // mock
  }

  getApprovalRateData(): ChartConfiguration<'doughnut'>['data'] {
    return {
      labels: ['Approved', 'Rejected'],
      datasets: [
        {
          data: [80, 20],
          backgroundColor: ['#4CAF50', '#F44336']
        }
      ]
    };
  }

  getHoursComparisonData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Scheduled Hours',
          data: [100, 120, 110, 130],
          borderColor: '#2196F3',
          fill: false
        },
        {
          label: 'Realized Hours',
          data: [90, 115, 100, 125],
          borderColor: '#FF9800',
          fill: false
        }
      ]
    };
  }

  getResourceUtilizationData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: ['Occupied', 'Idle'],
      datasets: [
        {
          label: 'Resources',
          data: [70, 30],
          backgroundColor: ['#3F51B5', '#9E9E9E']
        }
      ]
    };
  }
}
