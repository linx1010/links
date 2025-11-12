import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // ✅ usar email
      password: ['', Validators.required]
    });
  }

  login() {
    const { email, password } = this.form.value;

    // ✅ Lista fixa de usuários de teste com senha em branco
    const testUsers = [
      { email: 'admin', password: '', role: 'admin' },
      { email: 'manager', password: '', role: 'manager' },
      { email: 'member', password: '', role: 'member' },
      { email: 'finance', password: '', role: 'finance' }
    ];

    const user = testUsers.find(u => u.email === email && u.password === password);
    console.log(user)
    if (user) {
      localStorage.setItem('userRole', user.role);
      this.router.navigate(['/dashboard']);
    } else {
      // ✅ Consome o backend via LoginService
      this.loginService.login({ email, password }).subscribe({
        next: (res: any) => {
          if (res.status) {
            console.log(res)
            localStorage.setItem('token', res.token);
            localStorage.setItem('userRole', res.role);
            localStorage.setItem('userId', res.id);
            this.router.navigate(['/dashboard']);
          } else {
            this.error = res.message;
          }
        },
        error: () => {
          this.error = 'Erro de conexão com servidor';
        }
      });
    }
  }
}
