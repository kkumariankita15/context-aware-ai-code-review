import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Finding {
  id: string; agent: string; severity: string; category: string; title: string;
  file: string; line?: number; explanation: string; recommendation: string; confidence: number;
}
export interface Review {
  id: number; repository: string; pull_request?: number; title: string; status: string;
  score: number; findings: Finding[]; summary: string; created_at: string;
}
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';
  reviews(): Observable<Review[]> { return this.http.get<Review[]>(`${this.base}/reviews`); }
  analyze(payload: {repository: string; title: string; diff: string}): Observable<Review> {
    return this.http.post<Review>(`${this.base}/reviews/analyze`, payload);
  }
  knowledge(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/knowledge`); }
  upload(file: File, category: string): Observable<any> {
    const data = new FormData(); data.append('file', file); data.append('category', category);
    return this.http.post(`${this.base}/knowledge/upload`, data);
  }
  analyzePr(owner: string, repo: string, number: number, postComment: boolean) {
    return this.http.post<Review>(`${this.base}/github/pull-requests/${owner}/${repo}/${number}/analyze?post_comment=${postComment}`, {});
  }
}
