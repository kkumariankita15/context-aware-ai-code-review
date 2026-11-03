import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, Review } from './review.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ReviewFormComponent, DiffReviewRequest, GithubReviewRequest } from './review-form/review-form.component';
import { ReviewMetricsComponent } from './review-metrics/review-metrics.component';
import { ReviewResultsComponent } from './review-results/review-results.component';
import { ReviewHistoryComponent } from './review-history/review-history.component';
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ReviewFormComponent,
    ReviewMetricsComponent,
    ReviewResultsComponent,
    ReviewHistoryComponent,
    KnowledgeBaseComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private api = inject(ReviewService);

  tab = 'overview';
  reviews: Review[] = [];
  latestReview: Review | null = null;
  loading = false;
  error = '';
  apiStatus = 'checking';

  get findingCount(): number {
    return this.reviews.reduce((count, review) => count + review.findings.length, 0);
  }

  get averageScore(): number {
    return this.reviews.length
      ? Math.round(this.reviews.reduce((total, review) => total + review.score, 0) / this.reviews.length)
      : 0;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.reviews().subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.apiStatus = 'connected';
        if (!this.latestReview && reviews.length) {
          this.latestReview = reviews[0];
        }
      },
      error: () => this.apiStatus = 'offline'
    });
  }

  runReview(request: DiffReviewRequest): void {
    this.loading = true;
    this.error = '';
    this.api.analyze(request).subscribe({
      next: review => {
        this.latestReview = review;
        this.loading = false;
        this.load();
      },
      error: error => {
        this.error = error.error?.detail || 'Could not reach the API. Is the backend running?';
        this.loading = false;
      }
    });
  }

  runGithub(request: GithubReviewRequest): void {
    this.loading = true;
    this.error = '';
    this.api.analyzePr(request.owner, request.repo, request.number, request.postComment).subscribe({
      next: review => {
        this.latestReview = review;
        this.loading = false;
        this.load();
      },
      error: error => {
        this.error = error.error?.detail || 'GitHub analysis failed';
        this.loading = false;
      }
    });
  }

  selectReview(review: Review): void {
    this.latestReview = review;
    this.tab = 'overview';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
