import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() apiStatus = 'checking';
  @Input() activeTab = 'overview';
  @Output() tabChange = new EventEmitter<string>();
}
