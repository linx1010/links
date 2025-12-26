import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environment';


@Injectable({
  providedIn: 'root'
})
export class TimesheetResourcesService {

  constructor(private http: HttpClient) {}

  getTimesheet(mes: number, ano: number) {
    return this.http.get<any>(
      `${environment.apiUrl}/operational/timesheet-resources/${mes}/${ano}`
    );
  }
}


