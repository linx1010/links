import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RecursosComponent } from './pages/dashboard/recursos/recursos.component';
import { ClientesComponent } from './pages/dashboard/clientes/clientes.component';
import { ProjetosComponent } from './pages/dashboard/projetos/projetos.component';
import {CalendarComponent} from './pages/dashboard/calendar/calendar.component';
import { TimesheetComponent } from './pages/dashboard/timesheet/timesheet.component';
import { TasksComponent } from './pages/dashboard/tasks/tasks.component';
import { PendingSchedulesComponent } from './pages/dashboard/pending-schedules/pending-schedules.component';
import {FinancialIndicatorsComponent} from './pages/dashboard/financial-indicators/financial-indicators.component';
import {OperationMetricsComponent} from './pages/dashboard/operation-metrics/operation-metrics.component';
import{TimesheetResourcesComponent}from './pages/dashboard/operation-metrics/details/timesheet-resources/timesheet-resources.component'
import{UserConfiguratorComponent} from './pages/dashboard/user-configurator/user-configurator.component'
export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'tasks', component: TasksComponent, canActivate:[authGuard] },
      { path: 'recursos', component: RecursosComponent, canActivate:[authGuard] },
      { path: 'clientes', component: ClientesComponent, canActivate:[authGuard] },
      { path: 'projetos', component: ProjetosComponent, canActivate:[authGuard] },
      { path: 'calendar/:tipo/:id', component: CalendarComponent, canActivate:[authGuard] },
      // { path: 'timesheet/:id',component: TimesheetComponent, canActivate:[authGuard]},
      { path: 'pending-schedules',component: PendingSchedulesComponent, canActivate:[authGuard]},
      { path: 'financial-indicators',component: FinancialIndicatorsComponent, canActivate:[authGuard]},
      { path: 'operation-metrics',component: OperationMetricsComponent, canActivate:[authGuard]},
      { path: 'operation-metrics/details/timesheet-resources',component: TimesheetResourcesComponent, canActivate:[authGuard]},
      { path: 'user-configurator',component: UserConfiguratorComponent, canActivate:[authGuard]},

      { path: '', redirectTo: 'tasks', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
