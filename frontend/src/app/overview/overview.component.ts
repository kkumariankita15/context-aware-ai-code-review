import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Review, ReviewService } from '../review.service';
import { ReviewMetricsComponent } from '../review-metrics/review-metrics.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, ReviewMetricsComponent],
  templateUrl: './overview.component.html'
})
export class OverviewComponent implements OnInit {
  private readonly api = inject(ReviewService);
  private readonly router = inject(Router);

  reviews: Review[] = [];
  loading = true;
  error = '';

  get findingCount(): number {
    return this.reviews.reduce((count, review) => count + review.findings.length, 0);
  }

  get highPriorityFindingCount(): number {
    return this.reviews.reduce((count, review) => count + review.findings.filter(
      finding => ['critical', 'high'].includes(finding.severity.toLowerCase())
    ).length, 0);
  }

  get averageScore(): number {
    return this.reviews.length
      ? Math.round(this.reviews.reduce((total, review) => total + review.score, 0) / this.reviews.length)
      : 0;
  }

  get recentReviews(): Review[] {
    return this.reviews.slice(0, 3);
  }

  ngOnInit(): void {
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

  severityCount(severity: string): number {
    return this.reviews.reduce((count, review) => count + review.findings.filter(
      finding => finding.severity.toLowerCase() === severity
    ).length, 0);
  }

  selectReview(review: Review): void {
    this.router.navigate(['/history'], { queryParams: { reviewId: review.id } });
  }
}
