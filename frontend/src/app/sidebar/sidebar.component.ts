import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() apiStatus = 'checking';
  @Input() activeTab = 'overview';
  @Input() reviewCount = 0;
  @Output() tabChange = new EventEmitter<string>();
}
