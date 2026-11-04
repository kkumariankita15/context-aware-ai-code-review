import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ApiStatusService } from './api-status.service';
import { HttpLoadingService } from './http-loading.service';
import { ReviewService } from './review.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterLink, RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly themes = inject(ThemeService);
  readonly requestInProgress$ = inject(HttpLoadingService).loading$;
  readonly apiStatus$ = inject(ApiStatusService).status$;
  readonly reviewCount$ = inject(ReviewService).reviewCount$;

  currentPath = '/overview';

  private readonly pageTitles: Record<string, string> = {
    '/overview': 'Overview',
    '/review': 'New review',
    '/history': 'Review history',
    '/knowledge': 'Knowledge base',
    '/appearance': 'Appearance'
  };

  private readonly pageDescriptions: Record<string, string> = {
    '/overview': 'A clear view of your team’s code quality and latest insights.',
    '/review': 'Bring a pull request or diff. Your agents will take it from here.',
    '/history': 'Explore past reviews and revisit the findings that matter.',
    '/knowledge': 'Give your agents the project context they need to be helpful.',
    '/appearance': 'Make your review workspace feel like your own.'
  };

  get pageTitle(): string {
    return this.pageTitles[this.currentPath] || this.pageTitles['/overview'];
  }

  get pageDescription(): string {
    return this.pageDescriptions[this.currentPath] || this.pageDescriptions['/overview'];
  }

  ngOnInit(): void {
    this.themes.restore();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.currentPath = event.urlAfterRedirects.split('?')[0];
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.router.navigate(['/review']);
    }
  }
}
