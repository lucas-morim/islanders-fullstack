import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginHeader } from '../../components/frontoffice/login-header/login-header';

@Component({
  selector: 'app-login-shell',
  standalone: true,
  imports: [LoginHeader, RouterModule],
  templateUrl: './login-shell.html',
  styleUrls: ['./login-shell.css'],
})
export class LoginShell {}
