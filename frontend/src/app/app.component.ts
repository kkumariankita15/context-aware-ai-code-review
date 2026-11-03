import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, Review } from './review.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ReviewFormComponent, DiffReviewRequest, GithubReviewRequest } from './review-form/review-form.component';
import { ReviewMetricsComponent } from './review-metrics/review-metrics.component';
import { ReviewResultsComponent } from './review-results/review-results.component';
import { ReviewHistoryComponent } from './review-history/review-history.component';
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component';
import { HttpLoadingService } from './http-loading.service';

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  strong: string;
  soft: string;
  accent: string;
}

interface ReviewAgent {
  name: string;
  focus: string;
  description: string;
  icon: string;
  tone: string;
}

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
  private changeDetector = inject(ChangeDetectorRef);
  readonly requestInProgress$ = inject(HttpLoadingService).loading$;

  @ViewChild('reviewResults') private reviewResultsAnchor?: ElementRef<HTMLElement>;

  tab = 'overview';
  readonly themes: ThemePreset[] = [
    { id: 'violet', name: 'Iris', description: 'Creative & composed', primary: '#6d5ce8', strong: '#5746d2', soft: '#f0edff', accent: '#988cf2' },
    { id: 'blue', name: 'Ocean', description: 'Focused & calm', primary: '#3978e5', strong: '#2862c7', soft: '#eaf2ff', accent: '#83aaf2' },
    { id: 'green', name: 'Sage', description: 'Fresh & balanced', primary: '#24886b', strong: '#176d54', soft: '#e7f5ef', accent: '#72b99d' },
    { id: 'rose', name: 'Berry', description: 'Warm & expressive', primary: '#d34f76', strong: '#b63c61', soft: '#fff0f4', accent: '#e58ba5' }
  ];
  readonly reviewAgents: ReviewAgent[] = [
    { name: 'Security', focus: 'Protect the codebase', description: 'Flags risky patterns such as exposed credentials, unsafe evaluation, and insecure URLs.', icon: 'S', tone: 'security' },
    { name: 'Architecture', focus: 'Keep boundaries clear', description: 'Looks for changes that may couple application layers or leave unfinished work behind.', icon: 'A', tone: 'architecture' },
    { name: 'Standards', focus: 'Follow team conventions', description: 'Checks for debug logging, loose TypeScript types, and inconsistent coding practices.', icon: 'ST', tone: 'standards' },
    { name: 'Code quality', focus: 'Improve clarity & reliability', description: 'Surfaces readability concerns and code that may hide or swallow errors.', icon: 'Q', tone: 'quality' }
  ];
  activeThemeId = 'violet';
  customAccent = '#6d5ce8';
  reviews: Review[] = [];
  latestReview: Review | null = null;
  displayedReview: Review | null = null;
  loading = false;
  error = '';
  apiStatus = 'checking';

  get overviewReviews(): Review[] {
    if (!this.latestReview || this.reviews.some(review => review.id === this.latestReview?.id)) {
      return this.reviews;
    }

    return [this.latestReview, ...this.reviews];
  }

  get findingCount(): number {
    return this.overviewReviews.reduce((count, review) => count + review.findings.length, 0);
  }

  get highPriorityFindingCount(): number {
    return this.overviewReviews.reduce((count, review) => count + review.findings.filter(
      finding => ['critical', 'high'].includes(finding.severity.toLowerCase())
    ).length, 0);
  }

  get averageScore(): number {
    return this.overviewReviews.length
      ? Math.round(this.overviewReviews.reduce((total, review) => total + review.score, 0) / this.overviewReviews.length)
      : 0;
  }

  get recentReviews(): Review[] {
    return this.overviewReviews.slice(0, 3);
  }

  severityCount(severity: string): number {
    return this.overviewReviews.reduce((count, review) => count + review.findings.filter(
      finding => finding.severity.toLowerCase() === severity
    ).length, 0);
  }

  get pageTitle(): string {
    const titles: Record<string, string> = {
      overview: 'Overview',
      review: 'New review',
      history: 'Review history',
      knowledge: 'Knowledge base',
      appearance: 'Appearance'
    };
    return titles[this.tab] || titles['overview'];
  }

  get pageDescription(): string {
    const descriptions: Record<string, string> = {
      overview: 'A clear view of your team’s code quality and latest insights.',
      review: 'Bring a pull request or diff. Your agents will take it from here.',
      history: 'Explore past reviews and revisit the findings that matter.',
      knowledge: 'Give your agents the project context they need to be helpful.',
      appearance: 'Make your review workspace feel like your own.'
    };
    return descriptions[this.tab] || descriptions['overview'];
  }

  get activeThemeName(): string {
    return this.activeThemeId === 'custom'
      ? 'Custom accent'
      : this.themes.find(theme => theme.id === this.activeThemeId)?.name || 'Iris';
  }

  ngOnInit(): void {
    this.restoreTheme();
    this.load();
  }

  setTab(tab: string): void {
    this.tab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.setTab('review');
    }
  }

  selectTheme(theme: ThemePreset): void {
    this.activeThemeId = theme.id;
    this.customAccent = theme.primary;
    this.applyAccent(theme.primary, theme.strong, theme.soft, theme.accent);
    this.saveTheme();
  }

  setCustomAccent(color: string): void {
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      return;
    }

    this.activeThemeId = 'custom';
    this.customAccent = color;
    this.applyAccent(
      color,
      `color-mix(in srgb, ${color} 78%, #172033)`,
      `color-mix(in srgb, ${color} 10%, white)`,
      `color-mix(in srgb, ${color} 65%, white)`
    );
    this.saveTheme();
  }

  private restoreTheme(): void {
    const savedTheme = localStorage.getItem('reviewpilot-theme');
    if (!savedTheme) {
      return;
    }

    const saved = JSON.parse(savedTheme) as { id?: string; accent?: string };
    const theme = this.themes.find(item => item.id === saved.id);
    if (theme) {
      this.selectTheme(theme);
    } else if (saved.id === 'custom' && saved.accent && /^#[0-9a-f]{6}$/i.test(saved.accent)) {
      this.setCustomAccent(saved.accent);
    }
  }

  private applyAccent(primary: string, strong: string, soft: string, accent: string): void {
    const root = document.documentElement.style;
    root.setProperty('--color-primary', primary);
    root.setProperty('--color-primary-strong', strong);
    root.setProperty('--color-primary-soft', soft);
    root.setProperty('--color-accent', accent);
  }

  private saveTheme(): void {
    localStorage.setItem('reviewpilot-theme', JSON.stringify({
      id: this.activeThemeId,
      accent: this.customAccent
    }));
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
    this.displayedReview = null;
    this.api.analyze(request).subscribe({
      next: review => {
        this.showReviewResults(review);
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
    this.displayedReview = null;
    this.api.analyzePr(request.owner, request.repo, request.number, request.postComment).subscribe({
      next: review => {
        this.showReviewResults(review);
        this.load();
      },
      error: error => {
        this.error = error.error?.detail || 'GitHub analysis failed';
        this.loading = false;
      }
    });
  }

  private showReviewResults(review: Review): void {
    this.latestReview = review;
    this.displayedReview = review;
    this.loading = false;
    this.changeDetector.detectChanges();
    this.reviewResultsAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectReview(review: Review): void {
    this.latestReview = review;
    this.displayedReview = review;
    this.tab = 'review';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
