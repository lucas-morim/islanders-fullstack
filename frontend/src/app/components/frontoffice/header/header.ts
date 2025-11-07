import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'frontoffice-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {}
