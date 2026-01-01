import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {

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
