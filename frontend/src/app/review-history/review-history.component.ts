import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../review.service';

@Component({
  selector: 'app-review-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-history.component.html',
  styleUrl: './review-history.component.css'
})
export class ReviewHistoryComponent {
  @Input() reviews: Review[] = [];
  @Input() selectedReviewId: number | null = null;
  @Output() refresh = new EventEmitter<void>();
  @Output() reviewSelected = new EventEmitter<Review>();
}
