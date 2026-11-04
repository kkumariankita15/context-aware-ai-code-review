import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review, ReviewService } from '../review.service';
import { DiffReviewRequest, GithubReviewRequest, ReviewFormComponent } from '../review-form/review-form.component';
import { ReviewResultsComponent } from '../review-results/review-results.component';

@Component({
  selector: 'app-review-page',
  standalone: true,
  imports: [CommonModule, ReviewFormComponent, ReviewResultsComponent],
  templateUrl: './review-page.component.html'
})
export class ReviewPageComponent {
  private readonly api = inject(ReviewService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  @ViewChild('reviewResults') private reviewResultsAnchor?: ElementRef<HTMLElement>;

  loading = false;
  error = '';
  displayedReview: Review | null = null;

  runReview(request: DiffReviewRequest): void {
    this.loading = true;
    this.error = '';
    this.displayedReview = null;
    this.api.analyze(request).subscribe({
      next: review => this.showReviewResults(review),
      error: error => {
        this.error = error.error?.detail || 'Could not reach the API. Is the backend running?';
        this.loading = false;
      }
    });
  }

  runGithub(request: GithubReviewRequest): void {
    this.loading = true;
    this.error = '';
    this.displayedReview = null;
    this.api.analyzePr(request.owner, request.repo, request.number, request.postComment).subscribe({
      next: review => this.showReviewResults(review),
      error: error => {
        this.error = error.error?.detail || 'GitHub analysis failed';
        this.loading = false;
      }
    });
  }

  private showReviewResults(review: Review): void {
    this.api.incrementReviewCount();
    this.displayedReview = review;
    this.loading = false;
    this.changeDetector.detectChanges();
    this.reviewResultsAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
