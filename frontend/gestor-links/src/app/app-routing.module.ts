import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RecursosComponent } from './pages/dashboard/recursos/recursos.component';
import { ClientesComponent } from './pages/dashboard/clientes/clientes.component';
import { ProjetosComponent } from './pages/dashboard/projetos/projetos.component';
import {CalendarComponent} from './pages/dashboard/calendar/calendar.component';
import { TimesheetComponent } from './pages/dashboard/timesheet/timesheet.component';
export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'recursos', component: RecursosComponent, canActivate:[authGuard] },
      { path: 'clientes', component: ClientesComponent, canActivate:[authGuard] },
      { path: 'projetos', component: ProjetosComponent, canActivate:[authGuard] },
      { path: 'calendar/:tipo/:id', component: CalendarComponent, canActivate:[authGuard] },
      { path: 'timesheet/:id',component: TimesheetComponent, canActivate:[authGuard]},

      { path: '', redirectTo: 'recursos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
