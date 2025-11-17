import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-backoffice-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  year = new Date().getFullYear();
}
