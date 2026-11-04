import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review, ReviewService } from '../review.service';

@Component({
  selector: 'app-review-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-results.component.html',
  styleUrl: './review-results.component.css'
})
export class ReviewResultsComponent {
  private reviewService = inject(ReviewService);

  @Input({ required: true }) review!: Review;

  additionalComment = '';
  postingComment = false;
  commentError = '';
  postedCommentUrl = '';

  postFindingsToPr(): void {
    this.postingComment = true;
    this.commentError = '';
    this.postedCommentUrl = '';

    this.reviewService.postReviewComment(
      this.review.id,
      this.additionalComment.trim() || undefined
    ).subscribe({
      next: result => {
        this.postedCommentUrl = result.comment_url || '';
        this.postingComment = false;
      },
      error: error => {
        this.commentError = error.error?.detail || 'Could not post findings to GitHub.';
        this.postingComment = false;
      }
    });
  }
}
