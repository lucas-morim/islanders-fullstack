import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {Header} from './components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] 
})
export class App {
  protected readonly title = signal('islanders-app');
}
