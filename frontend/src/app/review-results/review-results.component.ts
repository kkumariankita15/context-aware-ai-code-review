import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../review.service';

@Component({
  selector: 'app-review-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-results.component.html',
  styleUrl: './review-results.component.css'
})
export class ReviewResultsComponent {
  @Input({ required: true }) review!: Review;
}
