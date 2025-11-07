import { Component } from '@angular/core';
import { Header } from '../../components/frontoffice/header/header';
import { Footer } from '../../components/frontoffice/footer/footer';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-front-shell',
  imports: [RouterModule, Header, Footer],
  templateUrl: './front-shell.html',
  styleUrl: './front-shell.css',
})
export class FrontShell {

}
