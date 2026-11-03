import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review, Finding } from './review.service';

@Component({
  selector: 'app-root', standalone: true, imports: [CommonModule, FormsModule],
  template: `
  <div class="shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-icon">✳</div><div><b>ReviewPilot</b><small>AI engineering quality</small></div></div>
      <div class="nav-label">WORKSPACE</div>
      <button class="nav active">▦ &nbsp; Overview</button>
      <button class="nav" (click)="tab='review'">⌘ &nbsp; New review</button>
      <button class="nav" (click)="tab='knowledge'">◈ &nbsp; Knowledge base</button>
      <div class="sidebar-bottom"><span class="online"></span> API connection <b>{{apiStatus}}</b><small>Multi-agent review engine</small></div>
    </aside>
    <main class="main">
      <header><div><div class="eyebrow">ENGINEERING INTELLIGENCE / OVERVIEW</div><h1>Code review command center</h1><p>Project-aware feedback, consistent standards, faster pull requests.</p></div><button class="primary" (click)="tab='review'">＋ Start a review</button></header>
      <section class="metrics">
        <div class="metric"><span>Total reviews</span><strong>{{reviews.length}}</strong><small>Saved in this workspace</small></div>
        <div class="metric"><span>Average quality score</span><strong>{{averageScore}}<i>/100</i></strong><small>Higher is better</small></div>
        <div class="metric"><span>Findings detected</span><strong>{{findingCount}}</strong><small>Across completed reviews</small></div>
        <div class="metric"><span>Specialist agents</span><strong>4<span class="plus"> + AI</span></strong><small>Security · Architecture · Standards · Quality</small></div>
      </section>
      <section *ngIf="tab==='review'" class="panel">
        <div class="panel-head"><div><h2>Run a code review</h2><p>Paste a unified diff or analyze a GitHub pull request.</p></div><span class="tag">LIVE ANALYSIS</span></div>
        <div class="grid2">
          <label>Repository<input [(ngModel)]="repository" placeholder="acme/web-app"></label>
          <label>Review title<input [(ngModel)]="title" placeholder="Feature: checkout improvements"></label>
        </div>
        <label>Unified diff<textarea [(ngModel)]="diff" rows="9" placeholder="Paste git diff output here..."></textarea></label>
        <div class="actions"><button class="primary" [disabled]="loading || !diff.trim()" (click)="runReview()">{{loading ? 'Analyzing…' : '✳ Analyze changes'}}</button><span class="muted">{{error}}</span></div>
        <div class="divider"></div>
        <h3>Or analyze a GitHub pull request</h3>
        <div class="grid-github"><input [(ngModel)]="githubRepo" placeholder="GitHub PR URL or owner/repository"><input type="number" [(ngModel)]="prNumber" placeholder="PR number"><label class="check"><input type="checkbox" [(ngModel)]="postComment"> Post summary comment</label><button class="secondary" [disabled]="loading || !githubRepo" (click)="runGithub()">Analyze GitHub PR →</button></div>
      </section>
      <section *ngIf="tab==='knowledge'" class="panel">
        <div class="panel-head"><div><h2>Project knowledge base</h2><p>Give agents architecture, coding and design-system context.</p></div><span class="tag">{{knowledge.length}} SOURCES</span></div>
        <div class="upload-row"><input type="file" #fileInput (change)="onFile($event)"><select [(ngModel)]="category"><option>architecture</option><option>coding-standards</option><option>design-system</option><option>eslint-sonar</option><option>previous-review</option></select><button class="primary" [disabled]="!selectedFile" (click)="upload()">Upload context</button></div>
        <div class="source" *ngFor="let item of knowledge"><div class="file-icon">▤</div><div><b>{{item.filename}}</b><small>{{item.category}} · {{item.bytes}} bytes</small></div></div>
        <p class="hint">Tip: place documents in backend/knowledge before startup, or upload text-based files here. The demo uses keyword retrieval; see README for a vector-search upgrade path.</p>
      </section>
      <section *ngIf="latestReview && (tab==='overview' || tab==='review' || tab==='knowledge')" class="panel">
        <div class="panel-head"><div><h2>Latest review results</h2><p>{{latestReview.repository}} · {{latestReview.title}}</p></div><div class="score" [class.warn]="latestReview.score<70">{{latestReview.score}}<small>/100</small></div></div>
        <p class="summary">{{latestReview.summary}}</p>
        <div class="finding" *ngFor="let f of latestReview.findings">
          <span class="severity" [class]="f.severity">{{f.severity}}</span>
          <div class="finding-body"><b>{{f.title}}</b><small>{{f.file}}<span *ngIf="f.line"> :{{f.line}}</span> · {{f.agent}}</small><p>{{f.explanation}}</p><div class="recommend">↳ {{f.recommendation}}</div></div>
        </div>
        <div *ngIf="!latestReview.findings.length" class="empty">No findings from the configured checks. Great work.</div>
      </section>
      <section class="panel history">
        <div class="panel-head"><div><h2>Recent reviews</h2><p>Review activity in this workspace</p></div><button class="text-button" (click)="load()">Refresh ↻</button></div>
        <div class="history-row" *ngFor="let r of reviews" (click)="select(r)"><div><b>{{r.title}}</b><small>{{r.repository}} · {{r.created_at}}</small></div><span>{{r.findings.length}} findings</span><strong>{{r.score}}/100</strong></div>
        <div *ngIf="!reviews.length" class="empty">No reviews yet. Start your first review above.</div>
      </section>
      <footer>ReviewPilot · Demo build · Findings are advisory and require human verification.</footer>
    </main>
  </div>`
})
export class AppComponent implements OnInit {
  private api = inject(ReviewService);
  tab = 'overview'; reviews: Review[] = []; latestReview: Review | null = null;
  repository = 'demo/repository'; title = 'Local code review';
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
  loading = false; error = ''; apiStatus = 'checking'; knowledge: any[] = [];
  category = 'architecture'; selectedFile: File | null = null;
  githubRepo = ''; prNumber: number | null = null; postComment = false;
  get findingCount() { return this.reviews.reduce((n, r) => n + r.findings.length, 0); }
  get averageScore() { return this.reviews.length ? Math.round(this.reviews.reduce((n, r) => n + r.score, 0) / this.reviews.length) : 0; }
  ngOnInit() { this.load(); this.loadKnowledge(); }
  load() { this.api.reviews().subscribe({ next: r => { this.reviews = r; this.apiStatus = 'connected'; if (!this.latestReview && r.length) this.latestReview = r[0]; }, error: () => this.apiStatus = 'offline' }); }
  loadKnowledge() { this.api.knowledge().subscribe({ next: r => this.knowledge = r, error: () => { } }); }
  runReview() {
    this.loading = true; this.error = '';
    this.api.analyze({ repository: this.repository, title: this.title, diff: this.diff }).subscribe({
      next: r => { this.latestReview = r; this.loading = false; this.load(); },
      error: e => { this.error = e.error?.detail || 'Could not reach the API. Is the backend running?'; this.loading = false; }
    });
  }
  runGithub() {
    const prInput = this.githubRepo.trim();
    let owner = '';
    let repo = '';
    let number = this.prNumber;

    if (/^https?:\/\//i.test(prInput) || /^www\.github\.com\//i.test(prInput)) {
      try {
        const prUrl = new URL(prInput.startsWith('http') ? prInput : `https://${prInput}`);
        const pathParts = prUrl.pathname.split('/').filter(Boolean);
        if (!['github.com', 'www.github.com'].includes(prUrl.hostname) || pathParts[2] !== 'pull') {
          this.error = 'Enter a GitHub pull request URL.';
          return;
        }
        owner = pathParts[0];
        repo = pathParts[1];
        number = Number(pathParts[3]);
      } catch {
        this.error = 'Enter a valid GitHub pull request URL.';
        return;
      }
    } else {
      const repositoryParts = prInput.split('/');
      if (repositoryParts.length !== 2) {
        this.error = 'Enter a GitHub PR URL or owner/repository.';
        return;
      }
      [owner, repo] = repositoryParts;
    }

    if (!owner || !repo || !Number.isInteger(number) || !number || number < 1) {
      this.error = 'Enter a valid repository and pull request number.';
      return;
    }

    this.loading = true; this.error = '';
    this.api.analyzePr(owner, repo, number, this.postComment).subscribe({
      next: r => { this.latestReview = r; this.loading = false; this.load(); },
      error: e => { this.error = e.error?.detail || 'GitHub analysis failed'; this.loading = false; }
    });
  }
  onFile(event: Event) { this.selectedFile = (event.target as HTMLInputElement).files?.[0] || null; }
  upload() { if (!this.selectedFile) return; this.api.upload(this.selectedFile, this.category).subscribe({ next: () => { this.selectedFile = null; this.loadKnowledge(); }, error: e => this.error = e.error?.detail || 'Upload failed' }); }
  select(r: Review) { this.latestReview = r; this.tab = 'overview'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
