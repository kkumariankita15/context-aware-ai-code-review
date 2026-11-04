import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-appearance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appearance.component.html'
})
export class AppearanceComponent {
  readonly themeService = inject(ThemeService);
}
