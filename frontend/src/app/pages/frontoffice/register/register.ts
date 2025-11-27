import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})

export class Register {
  form = { name: '', email: '', username: '', password: '', passwordConfirm: '' };
  private authService = inject(AuthService);
  private router = inject(Router);

  async submitRegister(event: Event) {
    event.preventDefault();
    if (this.form.password !== this.form.passwordConfirm) {
      alert('As senhas não coincidem!');
      return;
    }
    try {
      await this.authService.register(this.form);
      alert('Conta criada! Por favor faça login.');
      this.router.navigate(['/login']); // vai para login
    } catch {
      alert('Erro ao criar conta');
    }
  }
}