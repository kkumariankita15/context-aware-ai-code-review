import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-review-metrics',
  standalone: true,
  templateUrl: './review-metrics.component.html',
  styleUrl: './review-metrics.component.css'
})
export class ReviewMetricsComponent {
  @Input() reviewCount = 0;
  @Input() averageScore = 0;
  @Input() findingCount = 0;
  @Input() highPriorityFindingCount = 0;
}
