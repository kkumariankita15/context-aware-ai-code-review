import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DiffReviewRequest {
  repository: string;
  title: string;
  diff: string;
}

export interface GithubReviewRequest {
  owner: string;
  repo: string;
  number: number;
  postComment: boolean;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css'
})
export class ReviewFormComponent {
  @Input() loading = false;
  @Input() error = '';
  @Output() diffReview = new EventEmitter<DiffReviewRequest>();
  @Output() githubReview = new EventEmitter<GithubReviewRequest>();

  repository = 'demo/repository';
  title = 'Local code review';
  diff = `diff --git a/src/auth.ts b/src/auth.ts
index 111..222 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1,3 +1,8 @@
+const API_KEY = "sk_test_123456789abcdef";
+export function login(user: any) {
+  console.log("login", user);
+  eval(user.redirect);
+  return fetch("http://api.example.com/login");
+}`;
  githubRepo = '';
  prNumber: number | null = null;
  postComment = false;
  validationError = '';

  submitDiff(): void {
    this.validationError = '';
    this.diffReview.emit({
      repository: this.repository,
      title: this.title,
      diff: this.diff
    });
  }

  submitGithub(): void {
    this.validationError = '';
    const prInput = this.githubRepo.trim();
    let owner = '';
    let repo = '';
    let number = this.prNumber;

    if (/^https?:\/\//i.test(prInput) || /^www\.github\.com\//i.test(prInput)) {
      try {
        const prUrl = new URL(prInput.startsWith('http') ? prInput : `https://${prInput}`);
        const pathParts = prUrl.pathname.split('/').filter(Boolean);
        if (!['github.com', 'www.github.com'].includes(prUrl.hostname) || pathParts[2] !== 'pull') {
          this.validationError = 'Enter a GitHub pull request URL.';
          return;
        }
        owner = pathParts[0];
        repo = pathParts[1];
        number = Number(pathParts[3]);
      } catch {
        this.validationError = 'Enter a valid GitHub pull request URL.';
        return;
      }
    } else {
      const repositoryParts = prInput.split('/');
      if (repositoryParts.length !== 2) {
        this.validationError = 'Enter a GitHub PR URL or owner/repository.';
        return;
      }
      [owner, repo] = repositoryParts;
    }

    if (!owner || !repo || !Number.isInteger(number) || !number || number < 1) {
      this.validationError = 'Enter a valid repository and pull request number.';
      return;
    }

    this.githubReview.emit({
      owner,
      repo,
      number,
      postComment: this.postComment
    });
  }
}
