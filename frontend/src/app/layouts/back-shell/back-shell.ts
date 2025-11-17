// src/app/layouts/back-shell/back-shell.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/backoffice/header/header';
import { Sidebar } from '../../components/backoffice/sidebar/sidebar';
import { Footer } from '../../components/backoffice/footer/footer';

@Component({
  standalone: true,
  selector: 'app-back-shell',
  imports: [RouterOutlet, Header, Sidebar, Footer],
  templateUrl: './back-shell.html',
  styleUrls: ['./back-shell.css'],
})
export class BackShell {}
