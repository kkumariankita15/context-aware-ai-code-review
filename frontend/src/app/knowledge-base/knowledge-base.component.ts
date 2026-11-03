import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../review.service';

interface KnowledgeItem {
  filename: string;
  category: string;
  bytes: number;
}

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.css'
})
export class KnowledgeBaseComponent implements OnInit {
  private api = inject(ReviewService);

  knowledge: KnowledgeItem[] = [];
  category = 'architecture';
  selectedFile: File | null = null;
  error = '';

  ngOnInit(): void {
    this.loadKnowledge();
  }

  loadKnowledge(): void {
    this.api.knowledge().subscribe({
      next: items => {
        this.knowledge = items;
        this.error = '';
      },
      error: error => {
        this.error = error.error?.detail || 'Could not load the knowledge base.';
      }
    });
  }

  onFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] || null;
    this.error = '';
  }

  upload(): void {
    if (!this.selectedFile) {
      return;
    }

    this.api.upload(this.selectedFile, this.category).subscribe({
      next: () => {
        this.selectedFile = null;
        this.loadKnowledge();
      },
      error: error => {
        this.error = error.error?.detail || 'Upload failed';
      }
    });
  }
}
