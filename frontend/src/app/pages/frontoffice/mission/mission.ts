import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mission.html',
  styleUrls: ['./mission.css'],
})
export class Mission {}
