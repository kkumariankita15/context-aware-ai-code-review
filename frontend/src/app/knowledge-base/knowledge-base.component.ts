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
  loading = true;
  uploading = false;
  error = '';

  ngOnInit(): void {
    this.loadKnowledge();
  }

  loadKnowledge(): void {
    this.loading = true;
    this.error = '';
    this.api.knowledge().subscribe({
      next: items => {
        this.knowledge = items;
        this.loading = false;
      },
      error: error => {
        this.error = error.error?.detail || 'Could not load the knowledge base.';
        this.loading = false;
      }
    });
  }

  onFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] || null;
    this.error = '';
  }

  upload(fileInput: HTMLInputElement): void {
    if (!this.selectedFile) {
      return;
    }

    this.uploading = true;
    this.error = '';
    this.api.upload(this.selectedFile, this.category).subscribe({
      next: () => {
        this.selectedFile = null;
        fileInput.value = '';
        this.uploading = false;
        this.loadKnowledge();
      },
      error: error => {
        this.error = error.error?.detail || 'Upload failed';
        this.uploading = false;
      }
    });
  }
}
