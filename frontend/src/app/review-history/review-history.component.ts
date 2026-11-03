import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../review.service';
import { ReviewResultsComponent } from '../review-results/review-results.component';

@Component({
  selector: 'app-review-history',
  standalone: true,
  imports: [CommonModule, ReviewResultsComponent],
  templateUrl: './review-history.component.html',
  styleUrl: './review-history.component.css'
})
export class ReviewHistoryComponent {
  @Input() reviews: Review[] = [];
  @Output() refresh = new EventEmitter<void>();

  expandedReviewId: number | null = null;

  toggleReview(review: Review): void {
    this.expandedReviewId = this.expandedReviewId === review.id ? null : review.id;
  }
}
