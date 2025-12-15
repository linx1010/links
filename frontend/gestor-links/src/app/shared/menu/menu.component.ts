import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  isCollapsed = false;
  role: string | null = null;

  constructor(private router: Router) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.role = localStorage.getItem('userRole');
      const savedState = localStorage.getItem('menuCollapsed');
      if (savedState) this.isCollapsed = savedState === 'true';
    }
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }
  get isManager(): boolean {
    return this.role === 'manager';
  }
  get isMember(): boolean {
    return this.role === 'member';
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('menuCollapsed', String(this.isCollapsed));
    }
  }

  logout() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('menuCollapsed');
    }
    this.router.navigate(['/']);
  }
}
