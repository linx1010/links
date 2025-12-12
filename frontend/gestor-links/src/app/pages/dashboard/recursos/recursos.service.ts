import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../environment'

export interface User {
  id: number;
  organization_id: number;
  name: string;
  email: string;
  role: string;
  hourly_rate: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  code: string;
  organization_id: number;
  label: string;
  description: string;
  active: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecursosService {

  private apiUrlUsers = environment.apiUrl+'/users';
  private apiUrlModules = environment.apiUrl+'/modules';

  constructor(private http: HttpClient) {}

  // ---------------- USERS ----------------
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrlUsers);
  }
  
  getUserById(id:number): Observable<User> {
    return this.http.get<User>(`${this.apiUrlUsers}/${id}`);
  }


  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrlUsers, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrlUsers}/${id}`, user);
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrlUsers}/${id}`);
  }

  // ---------------- MODULES ----------------
  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrlModules);
  }
}
