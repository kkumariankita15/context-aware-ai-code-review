import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Review, ReviewService } from '../review.service';
import { ReviewResultsComponent } from '../review-results/review-results.component';

@Component({
  selector: 'app-review-history',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewResultsComponent],
  templateUrl: './review-history.component.html',
  styleUrl: './review-history.component.css'
})
export class ReviewHistoryComponent implements OnInit {
  private readonly api = inject(ReviewService);
  private readonly route = inject(ActivatedRoute);

  reviews: Review[] = [];
  loading = true;
  error = '';
  expandedReviewId: number | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const reviewId = Number(params.get('reviewId'));
      this.expandedReviewId = Number.isInteger(reviewId) && reviewId > 0 ? reviewId : null;
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.reviews().subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.api.setReviewCount(reviews.length);
        this.loading = false;
      },
      error: error => {
        this.error = error.error?.detail || 'Could not load reviews. Check your connection and try again.';
        this.loading = false;
      }
    });
  }

  toggleReview(review: Review): void {
    this.expandedReviewId = this.expandedReviewId === review.id ? null : review.id;
  }
}
