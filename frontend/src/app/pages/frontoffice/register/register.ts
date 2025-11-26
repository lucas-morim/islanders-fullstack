import { Component } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { AuthService } from "../auth/auth.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule], // IMPORTANTE para ngModel
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  form = { name: '', email: '', username: '', password: '', passwordConfirm: '' };

  constructor(private auth: AuthService, private router: Router) {}

  async submitRegister(event: Event) {
    event.preventDefault();

    if (this.form.password !== this.form.passwordConfirm) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const { access_token } = await this.auth.register(this.form);
      localStorage.setItem('access_token', access_token);
      await this.router.navigate(['/']);
    } catch (e) {
      console.error(e);
      alert("Erro ao criar conta");
    }
  }
}