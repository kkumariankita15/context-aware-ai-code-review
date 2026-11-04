import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpLoadingService {
  private activeRequests = 0;
  private readonly loadingSubject = new BehaviorSubject(false);
  readonly loading$ = this.loadingSubject.asObservable();

  startRequest(): void {
    this.activeRequests += 1;
    this.loadingSubject.next(true);
  }

  finishRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.loadingSubject.next(this.activeRequests > 0);
  }
}
